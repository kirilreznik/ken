import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import contentFile from "../../data/names/name-content.json";
import { contentNames, parseContent, parseNames, type RawContentFile, type RawNamesFile } from "@/lib/names/data";
import { buildDeck, hashSeed, mulberry32, shuffle } from "@/lib/names/deck";
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
    const votes = new Map<string, Vote>(cards.filter((c) => c.stats.name !== "אלה").map((c) => [c.stats.name, "keep"]));
    const deck = buildDeck(cards, votes, { ...defaultFilters(), letter: "ת" }, seed1);
    expect(deck).toEqual({ state: "empty-filter", cards: [] });
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
