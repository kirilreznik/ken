import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import contentFile from "./fixtures/name-content-sample.json";
import { contentNames, parseContent, parseNames, type RawContentFile, type RawNamesFile } from "@/lib/names/data";
import {
  applyLabel,
  count,
  DEFAULT_FILTERS,
  defaultFilters,
  firstLetter,
  isDefault,
  lengthValue,
  letterOptions,
  letterValue,
  matches,
  nameLength,
  hasFilters,
  sexToken,
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

  it("popularity and length", () => {
    expect(pick({ popularity: "נפוץ" })).toEqual(cards.filter((c) => c.derived.band === "נפוץ").map((c) => c.stats.name));
    expect(pick({ length: "קצר" })).toEqual(["זיו", "יעל", "תמר", "שקד", "אלה"]);
    expect(pick({ length: "ארוך" })).toEqual(["אריאל", "אביגיל"]);
  });

  it("combines filters with AND", () => {
    expect(pick({ sex: "בת", letter: "א" })).toEqual(["אביגיל", "אלה"]);
    expect(pick({ sex: "בת", letter: "א", length: "קצר" })).toEqual(["אלה"]);
    expect(pick({ sex: "בן", length: "ארוך" })).toEqual([]);
  });

  it("reset brings back every name", () => {
    let f: Filters = { sex: "בת", popularity: "נדיר", trend: "בירידה", letter: "ת", length: "ארוך", themes: null, letterRange: null };
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

describe("filter state", () => {
  it("hasFilters is true once any group is set, sex included", () => {
    expect(hasFilters(null)).toBe(false);
    expect(hasFilters(defaultFilters())).toBe(false);
    expect(hasFilters({ ...defaultFilters(), sex: "בת" })).toBe(true);
    expect(hasFilters({ ...defaultFilters(), letter: "א" })).toBe(true);
  });

  it("sexToken gives ASCII tokens for analytics", () => {
    expect(["בן", "בת", "מתאים לכולם", null].map((s) => sexToken(s as never))).toEqual(["boy", "girl", "unisex", "all"]);
  });
});

describe("filters sheet labels", () => {
  it("letterOptions lists each first letter once, in alphabet order", () => {
    expect(letterOptions(["תמר", "אלה", "אריאל", "נֹעַם", "יעל"])).toEqual(["א", "י", "נ", "ת"]);
    const all = letterOptions(cards.map((c) => c.stats.name));
    expect(all).toContain("א");
    expect(new Set(all).size).toBe(all.length);
  });

  it("button values and the apply label", () => {
    expect(letterValue(null)).toBe("כל האותיות");
    expect(letterValue("א")).toBe("א");
    expect(lengthValue(null)).toBe("קצר וארוך");
    expect(lengthValue("קצר")).toContain("עד 3");
    expect(applyLabel(4)).toBe("הצגת 4 שמות");
    expect(applyLabel(0)).toBe("הצגת 0 שמות");
    expect(applyLabel(1)).toBe("הצגת שם אחד");
  });
});
