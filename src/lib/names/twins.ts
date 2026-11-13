// "מצפים לתאומים": names that go well together, scored from the data only (no AI): the same
// first letter, endings that rhyme, the same meaning, the same theme, both from the Bible, and
// a similar length. A pair needs one of the first three. Each pair says why, in words.
import { firstLetter, letters } from "./filters";
import { meaningLabel } from "./relative";
import { skeletonKey } from "./search";
import { THEME_LABELS, isThemeId } from "./themes";
import type { SexTag, Vote } from "./types";

/** Up to this many partners in the name sheet. */
export const TWIN_LIMIT = 6;
/** Up to this many pairs in the "זוגות" tab. */
export const PAIR_LIMIT = 20;

export interface TwinCard {
  stats: { name: string };
  content: { latin?: { he?: string }; meanings?: readonly string[]; themes?: readonly string[]; bible?: unknown };
  derived: { sexTag: SexTag };
}

export interface Pairing {
  score: number;
  /** Why the two go together, strongest first ("אותה אות ראשונה", "מתחרזים", "אותה משמעות: אור"). */
  reasons: string[];
}

// Themes too broad to make a pair on their own.
const WEAK_THEMES = new Set(["international", "unisex", "bible"]);

/** The end that rhymes: the last vowel run with the consonant before it and what follows (Maya → "ya", Ariel → "iel"). */
export function rhymeTail(latin: string): string | null {
  const m = latin.toLowerCase().match(/[^aeiou]?[aeiou]+[^aeiou]*$/);
  return m && m[0].length >= 2 ? m[0] : null;
}

/** How well two names go together, or null when they don't make a pair. `forms`: the other forms of a name. */
export function pairing(a: TwinCard, b: TwinCard, forms: (name: string) => readonly string[] = () => []): Pairing | null {
  const na = a.stats.name;
  const nb = b.stats.name;
  if (na === nb || skeletonKey(na) === skeletonKey(nb)) return null;
  if (forms(na).includes(nb) || forms(nb).includes(na)) return null;
  const reasons: string[] = [];
  let score = 0;
  let strong = false;
  if (firstLetter(na) === firstLetter(nb)) {
    reasons.push("אותה אות ראשונה");
    score += 3;
    strong = true;
  }
  const ta = a.content.latin?.he ? rhymeTail(a.content.latin.he) : null;
  const tb = b.content.latin?.he ? rhymeTail(b.content.latin.he) : null;
  if (ta && ta === tb) {
    reasons.push("מתחרזים");
    score += 3;
    strong = true;
  }
  const meaning = a.content.meanings?.find((g) => b.content.meanings?.includes(g));
  const meaningName = meaning ? meaningLabel(meaning) : null;
  if (meaningName) {
    reasons.push(`אותה משמעות: ${meaningName}`);
    score += 3;
    strong = true;
  }
  if (!strong) return null;
  const theme = a.content.themes?.find((t) => !WEAK_THEMES.has(t) && b.content.themes?.includes(t));
  if (theme && isThemeId(theme)) {
    reasons.push(`אותו נושא: ${THEME_LABELS[theme]}`);
    score += 1;
  }
  if (a.content.bible && b.content.bible) {
    reasons.push("שניהם מהתנ״ך");
    score += 1;
  }
  if (Math.abs(letters(na).length - letters(nb).length) <= 1) score += 1;
  return { score, reasons };
}

export interface TwinSuggestion {
  name: string;
  sexTag: SexTag;
  reasons: string[];
}

/**
 * Names that pair well with `card`, best first: deck names only, never hidden or skipped ones,
 * and only of `sex` when the sex filter is on.
 */
export function twinsFor<T extends TwinCard>(
  card: T,
  cards: readonly T[],
  options: { votes?: ReadonlyMap<string, Vote>; sex?: SexTag | null; forms?: (name: string) => readonly string[]; limit?: number } = {},
): TwinSuggestion[] {
  const { votes, sex = null, forms, limit = TWIN_LIMIT } = options;
  const out: (TwinSuggestion & { score: number })[] = [];
  for (const other of cards) {
    const vote = votes?.get(other.stats.name);
    if (vote === "hidden" || vote === "skip") continue;
    if (sex !== null && other.derived.sexTag !== sex) continue;
    const p = pairing(card, other, forms);
    if (p) out.push({ name: other.stats.name, sexTag: other.derived.sexTag, reasons: p.reasons, score: p.score });
  }
  out.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name, "he"));
  return out.slice(0, limit).map(({ name, sexTag, reasons }) => ({ name, sexTag, reasons }));
}

export interface TwinPair {
  names: [string, string];
  reasons: string[];
}

/** Pairs made from the given names (the saved ones), best first. */
export function pairsAmong<T extends TwinCard>(cards: readonly T[], forms?: (name: string) => readonly string[], limit = PAIR_LIMIT): TwinPair[] {
  const out: (TwinPair & { score: number })[] = [];
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const p = pairing(cards[i], cards[j], forms);
      if (p) out.push({ names: [cards[i].stats.name, cards[j].stats.name], reasons: p.reasons, score: p.score });
    }
  }
  out.sort((x, y) => y.score - x.score || x.names[0].localeCompare(y.names[0], "he"));
  return out.slice(0, limit).map(({ names, reasons }) => ({ names, reasons }));
}
