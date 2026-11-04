import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import contentFile from "../../data/names/name-content.json";
import { contentNames, parseContent, parseNames, type RawContentFile, type RawNamesFile } from "@/lib/names/data";
import {
  count,
  DEFAULT_FILTERS,
  defaultFilters,
  firstLetter,
  isDefault,
  matches,
  nameLength,
  type FilterableCard,
  type Filters,
} from "@/lib/names/filters";
import { popularityBand, rankByLastYear, trend } from "@/lib/names/popularity";
import { sexTag } from "@/lib/names/sex";

const names = parseNames(namesFile as RawNamesFile);
const ranks = rankByLastYear(names.values());
const cards: FilterableCard[] = contentNames(parseContent(contentFile as RawContentFile)).map((name) => {
  const stats = names.get(name)!;
  return { stats, derived: { sexTag: sexTag(stats), band: popularityBand(ranks.get(name)), trend: trend(stats) } };
});

const pick = (f: Partial<Filters>) =>
  cards.filter((c) => matches(c, { ...defaultFilters(), ...f })).map((c) => c.stats.name);

describe("filters on the 10 content names", () => {
  it("defaults show all 10", () => {
    expect(pick({})).toHaveLength(10);
    expect(count(cards, defaultFilters())).toBe(10);
  });

  it("'בת' gives girls only", () => {
    expect(pick({ sex: "בת" })).toEqual(["יעל", "תמר", "אביגיל", "אלה"]);
  });

  it("'בן' and 'מתאים לכולם' split the rest", () => {
    expect(pick({ sex: "בן" })).toEqual(["לביא"]);
    expect(pick({ sex: "מתאים לכולם" })).toEqual(["זיו", "נועם", "שקד", "אריאל", "עמית"]);
  });

  it("'בעלייה' gives rising names only", () => {
    // None of the 10 is rising in the 2024 data (9 stable, עמית falling), so the deck is empty.
    expect(pick({ trend: "בעלייה" })).toEqual([]);
    expect(pick({ trend: "בירידה" })).toEqual(["עמית"]);
    expect(pick({ trend: "יציב" })).toHaveLength(9);
    const rising: FilterableCard = {
      stats: { name: "אור", s: "J" },
      derived: { sexTag: "מתאים לכולם", band: "נפוץ", trend: { word: "בעלייה", arrow: "↗" } },
    };
    const noTrend: FilterableCard = { stats: { name: "רז", s: "J" }, derived: { ...rising.derived, trend: null } };
    const withRising = [...cards, rising, noTrend];
    expect(withRising.filter((c) => matches(c, { ...defaultFilters(), trend: "בעלייה" }))).toEqual([rising]);
    expect(count(withRising, { ...defaultFilters(), trend: "יציב" })).toBe(9);
    expect(count(withRising, defaultFilters())).toBe(12);
  });

  it("first letter 'א' gives אריאל, אביגיל, אלה", () => {
    expect(pick({ letter: "א" })).toEqual(["אריאל", "אביגיל", "אלה"]);
  });

  it("popularity, length and origin", () => {
    expect(pick({ popularity: "נפוץ" })).toEqual(cards.filter((c) => c.derived.band === "נפוץ").map((c) => c.stats.name));
    expect(pick({ length: "קצר" })).toEqual(["זיו", "יעל", "תמר", "שקד", "אלה"]);
    expect(pick({ length: "ארוך" })).toEqual(["אריאל", "אביגיל"]);
    expect(pick({ origin: "C" })).toEqual(["תמר", "אביגיל"]);
    expect(pick({ origin: "D" })).toEqual(["נועם", "תמר", "עמית"]);
    expect(pick({ origin: "J" })).toHaveLength(10);
    expect(pick({ origin: "M" })).toEqual(["זיו", "נועם", "יעל", "תמר", "עמית"]);
  });

  it("combines filters with AND", () => {
    expect(pick({ sex: "בת", letter: "א" })).toEqual(["אביגיל", "אלה"]);
    expect(pick({ sex: "בת", letter: "א", length: "קצר" })).toEqual(["אלה"]);
    expect(pick({ sex: "בן", origin: "M" })).toEqual([]);
    const f: Filters = { ...defaultFilters(), sex: "מתאים לכולם", origin: "D" };
    expect(count(cards, f)).toBe(2);
  });

  it("reset brings back every name", () => {
    let f: Filters = { sex: "בת", popularity: "נדיר", trend: "בירידה", letter: "ת", length: "ארוך", origin: "D" };
    expect(count(cards, f)).toBe(0);
    expect(isDefault(f)).toBe(false);
    f = defaultFilters();
    expect(isDefault(f)).toBe(true);
    expect(count(cards, f)).toBe(10);
    expect(Object.isFrozen(DEFAULT_FILTERS)).toBe(true);
  });
});

describe("length and first letter", () => {
  it("ignore niqqud, geresh and punctuation", () => {
    expect(nameLength("זִיו")).toBe("קצר");
    expect(nameLength("ג׳ק")).toBe("קצר");
    expect(nameLength("ג׳ורג׳")).toBe(null);
    expect(nameLength("ג'וני")).toBe(null);
    expect(nameLength("בת-אל")).toBe(null);
    expect(nameLength("אֲבִיגַיִל")).toBe("ארוך");
    expect(firstLetter("ג׳ורג׳")).toBe("ג");
    expect(firstLetter("אֲבִיגַיִל")).toBe("א");
  });

  it("4 letters is neither short nor long", () => {
    expect(nameLength("נועם")).toBe(null);
    expect(nameLength("לביא")).toBe(null);
  });
});
