import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import contentFile from "./fixtures/name-content-sample.json";
import { contentNames, parseContent, parseNames, type RawContentFile, type RawNamesFile } from "@/lib/names/data";
import { buildDeck, deckCount, deckProgress, deckSlot, hiddenCount, hashSeed, mulberry32, shuffle } from "@/lib/names/deck";
import { defaultFilters, type FilterableCard } from "@/lib/names/filters";
import { popularityBand, rankByLastYear, trend } from "@/lib/names/popularity";
import { sexTag } from "@/lib/names/sex";
import type { Vote } from "@/lib/names/types";

const names = parseNames(namesFile as RawNamesFile);
const ranks = rankByLastYear(names.values());
const cards: FilterableCard[] = contentNames(parseContent(contentFile as RawContentFile)).map((name) => {
  const stats = names.get(name)!;
  return { stats, derived: { sexTag: sexTag(stats), band: popularityBand(ranks.get(name)), trend: trend(stats) } };
});

const none = new Map<string, Vote>();
const order = (seed: number, votes = none, f = defaultFilters(), top?: string) =>
  buildDeck(cards, votes, f, seed, { top }).cards.map((c) => c.stats.name);

const seed1 = hashSeed("11111111-1111-4111-8111-111111111111");
const seed2 = hashSeed("22222222-2222-4222-8222-222222222222");

describe("seed and PRNG", () => {
  it("hashSeed is a stable unsigned 32-bit number", () => {
    expect(hashSeed("abc")).toBe(hashSeed("abc"));
    expect(hashSeed("abc")).not.toBe(hashSeed("abd"));
    expect(Number.isInteger(seed1) && seed1 >= 0 && seed1 < 2 ** 32).toBe(true);
  });

  it("mulberry32 repeats for a seed and stays in [0, 1)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x >= 0 && x < 1).toBe(true);
    }
  });
});

describe("buildDeck", () => {
  it("has all 10 names when nothing is decided", () => {
    const deck = buildDeck(cards, none, defaultFilters(), seed1);
    expect(deck.state).toBe("ok");
    expect(new Set(deck.cards.map((c) => c.stats.name))).toEqual(new Set(cards.map((c) => c.stats.name)));
  });

  it("same seed gives the same order, whatever the input order", () => {
    expect(order(seed1)).toEqual(order(seed1));
    expect(shuffle([...cards].reverse(), seed1)).toEqual(shuffle(cards, seed1));
  });

  it("different seeds give different orders", () => {
    expect(order(seed1)).not.toEqual(order(seed2));
  });

  it("excludes decided and hidden names without reordering the rest", () => {
    const full = order(seed1);
    const votes = new Map<string, Vote>([
      [full[0], "keep"],
      [full[3], "love"],
      [full[5], "skip"],
      [full[7], "hidden"],
    ]);
    expect(order(seed1, votes)).toEqual(full.filter((n) => !votes.has(n)));
  });

  it("respects filters", () => {
    const f = { ...defaultFilters(), letter: "א" };
    expect(new Set(order(seed1, none, f))).toEqual(new Set(["אריאל", "אביגיל", "אלה"]));
  });

  it("puts the name an undo restored on top", () => {
    const full = order(seed1);
    const restored = full[6];
    expect(order(seed1, none, defaultFilters(), restored)).toEqual([
      restored,
      ...full.filter((n) => n !== restored),
    ]);
    // A top name that isn't in the deck changes nothing.
    const votes = new Map<string, Vote>([[restored, "skip"]]);
    expect(order(seed1, votes, defaultFilters(), restored)).toEqual(full.filter((n) => n !== restored));
  });

  it("is 'empty-filter' when undecided names exist but none match", () => {
    // No name starts with a final letter: nothing matches, decided or not.
    const f = { ...defaultFilters(), letter: "ץ" };
    expect(cards.some((c) => c.stats.name.startsWith("ץ"))).toBe(false);
    expect(buildDeck(cards, none, f, seed1)).toEqual({ state: "empty-filter", cards: [] });
    const votes = new Map<string, Vote>(cards.filter((c) => c.stats.name !== "אלה").map((c) => [c.stats.name, "keep"]));
    expect(buildDeck(cards, votes, f, seed1)).toEqual({ state: "empty-filter", cards: [] });
  });

  it("is 'filter-done' when names match the filters but all of them are decided", () => {
    const f = { ...defaultFilters(), letter: "א" };
    const inFilter = cards.filter((c) => c.stats.name.startsWith("א")).map((c) => c.stats.name);
    expect(inFilter.length).toBeGreaterThan(0);
    const votes = new Map<string, Vote>(inFilter.map((n, i) => [n, i % 2 ? "hidden" : "keep"]));
    expect(buildDeck(cards, votes, f, seed1)).toEqual({ state: "filter-done", cards: [] });
    // One undecided name in the filter: the deck has a card again.
    votes.delete(inFilter[0]);
    expect(buildDeck(cards, votes, f, seed1).state).toBe("ok");
  });

  it("is 'all-decided' when every name has a vote, filters or not", () => {
    const votes = new Map<string, Vote>(cards.map((c, i) => [c.stats.name, i % 2 ? "skip" : "hidden"]));
    expect(buildDeck(cards, votes, defaultFilters(), seed1)).toEqual({ state: "all-decided", cards: [] });
    expect(buildDeck(cards, votes, { ...defaultFilters(), letter: "ת" }, seed1).state).toBe("all-decided");
  });

  it("is 'all-decided' for an empty card set", () => {
    expect(buildDeck([], none, defaultFilters(), seed1).state).toBe("all-decided");
  });
});

describe("deckProgress", () => {
  const f = defaultFilters();
  it("counts from 1 of all names before any vote", () => {
    expect(deckProgress(cards, none, f, cards.length)).toEqual({ position: 1, total: cards.length });
  });

  it("moves on with each decision and leaves hidden names out of the total", () => {
    const [a, b, c] = cards.map((x) => x.stats.name);
    const votes = new Map<string, Vote>([[a, "keep"], [b, "skip"], [c, "hidden"]]);
    const left = buildDeck(cards, votes, f, seed1).cards.length;
    expect(deckProgress(cards, votes, f, left)).toEqual({ position: 3, total: cards.length - 1 });
  });

  it("counts only names that pass the filters", () => {
    const girls = { ...f, sex: ["בת" as const] };
    const deck = buildDeck(cards, none, girls, seed1);
    expect(deckProgress(cards, none, girls, deck.cards.length)).toEqual({ position: 1, total: deck.cards.length });
  });
});

describe("deckCount and hiddenCount", () => {
  it("counts undecided names that match, the same as the deck", () => {
    const votes = new Map<string, Vote>([[cards[0].stats.name, "keep"], [cards[1].stats.name, "hidden"]]);
    const girls = { ...defaultFilters(), sex: ["בת" as const] };
    for (const f of [defaultFilters(), girls]) {
      expect(deckCount(cards, votes, f)).toBe(buildDeck(cards, votes, f, seed1).cards.length);
    }
    expect(deckCount(cards, none, defaultFilters())).toBe(cards.length);
    expect(hiddenCount(votes)).toBe(1);
    expect(hiddenCount(none)).toBe(0);
  });
});

describe("deckSlot", () => {
  const base = { paused: false, hasCard: false, deckState: null, loadError: false } as const;
  it("shows the skeleton until the deck is built", () => {
    expect(deckSlot(base)).toBe("loading");
  });
  it("shows the load error with its retry when the names data failed", () => {
    expect(deckSlot({ ...base, loadError: true })).toBe("error");
  });
  it("keeps the pause, the card and the end states ahead of loading and errors", () => {
    expect(deckSlot({ ...base, paused: true, hasCard: true, loadError: true })).toBe("pause");
    expect(deckSlot({ ...base, hasCard: true, deckState: "ok" })).toBe("card");
    expect(deckSlot({ ...base, deckState: "all-decided" })).toBe("empty");
    expect(deckSlot({ ...base, deckState: "empty-filter" })).toBe("empty");
    expect(deckSlot({ ...base, deckState: "filter-done" })).toBe("empty");
  });
});
