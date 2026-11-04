import { matches, type FilterableCard, type Filters } from "./filters";
import type { Vote } from "./types";

/**
 * "ok": there are cards to swipe. "empty-filter": undecided names exist but none match the
 * filters. "all-decided": every name has a vote (keep, love, skip or hidden).
 */
export type DeckState = "ok" | "empty-filter" | "all-decided";

export interface Deck<T extends FilterableCard> {
  state: DeckState;
  cards: T[];
}

export interface DeckOptions {
  /** A name to show first if it is in the deck: the card an undo just restored. */
  top?: string | null;
}

/** 32-bit FNV-1a hash of a string, used as the deck seed (seed = hash of the user id). */
export function hashSeed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates with a seeded PRNG. Sorts by name first so the input order doesn't matter. */
export function shuffle<T extends FilterableCard>(cards: readonly T[], seed: number): T[] {
  const out = [...cards].sort((a, b) => (a.stats.name < b.stats.name ? -1 : a.stats.name > b.stats.name ? 1 : 0));
  const random = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The cards left to swipe, in the user's stable order. The whole set is shuffled before
 * anything is removed, so a vote or a filter change never reorders the rest.
 */
export function buildDeck<T extends FilterableCard>(
  cards: readonly T[],
  votes: ReadonlyMap<string, Vote>,
  filters: Filters,
  seed: number,
  options: DeckOptions = {},
): Deck<T> {
  const undecided = shuffle(cards, seed).filter((c) => !votes.has(c.stats.name));
  const remaining = undecided.filter((c) => matches(c, filters));
  const top = options.top ?? null;
  if (top !== null) {
    const i = remaining.findIndex((c) => c.stats.name === top);
    if (i > 0) remaining.unshift(...remaining.splice(i, 1));
  }
  const state: DeckState =
    remaining.length > 0 ? "ok" : undecided.length > 0 ? "empty-filter" : "all-decided";
  return { state, cards: remaining };
}

/**
 * The numbers in "שם {n} מתוך {total}" (the demo's count): `total` is every name that passes
 * the filters except hidden ones, `position` is how many of them are decided, plus one.
 */
export function deckProgress(
  cards: readonly FilterableCard[],
  votes: ReadonlyMap<string, Vote>,
  filters: Filters,
  remaining: number,
): { position: number; total: number } {
  const total = cards.filter((c) => votes.get(c.stats.name) !== "hidden" && matches(c, filters)).length;
  return { position: Math.max(1, Math.min(total, total - remaining + 1)), total };
}
