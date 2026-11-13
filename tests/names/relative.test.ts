import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { matches, defaultFilters } from "@/lib/names/filters";
import { getPref, setPref } from "@/lib/names/prefs";
import { matchRelative, matchesRelative, readRelative, relativeFilter, relativeSummary } from "@/lib/names/relative";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, String(v)),
  };
}
beforeEach(() => vi.stubGlobal("localStorage", memoryStorage()));
afterEach(() => vi.unstubAllGlobals());


const card = (name: string, meanings: string[] = []) => ({ stats: { name }, content: { meanings } });
const cards = [card("צבי", ["deer"]), card("איילה", ["deer"]), card("יעל", ["deer"]), card("רבקה"), card("רותם", ["flower"]), card("רבקי")];

describe("matchRelative", () => {
  it("links a deck name to its meaning group and its forms", () => {
    const m = matchRelative("רבקה", cards, (n) => (n === "רבקה" ? ["רבקי"] : []));
    expect(m.letter).toBe("ר");
    expect(m.groups).toEqual([]);
    expect(m.names.sort()).toEqual(["רבקה", "רבקי"].sort());
  });
  it("finds an older Yiddish name through the table", () => {
    const m = matchRelative("הירש", cards);
    expect(m.older?.means).toBe("צבי");
    expect(m.names.sort()).toEqual(["איילה", "יעל", "צבי"].sort());
    expect(relativeSummary(m)).toBe("הירש ביידיש פירושו צבי.");
  });
  it("has only the letter for an unknown name", () => {
    const m = matchRelative("זלמנה", cards);
    expect(m.names).toEqual([]);
    expect(relativeFilter(m, true, true)).toEqual({ name: "זלמנה", letter: true, meaning: false, names: [] });
    expect(relativeFilter(m, false, true)).toBeNull();
  });
});

describe("the relative filter", () => {
  const filter = relativeFilter(matchRelative("צבי", cards), true, true)!;
  it("passes names with the same first letter or meaning", () => {
    expect(matchesRelative("צליל", filter)).toBe(true);
    expect(matchesRelative("יעל", filter)).toBe(true);
    expect(matchesRelative("רותם", filter)).toBe(false);
  });
  it("narrows the deck with the other filters", () => {
    const f = { ...defaultFilters(), relative: filter };
    const c = (name: string) => ({ stats: { name }, derived: { sexTag: "בת" as const, band: "נפוץ" as const, trend: null } });
    expect(matches(c("איילה"), f)).toBe(true);
    expect(matches(c("רותם"), f)).toBe(false);
  });
  it("reads back from prefs and drops a malformed one", () => {
    expect(readRelative({ name: "צבי", letter: false, meaning: true, names: [] })).toBeNull();
    expect(readRelative({ name: "", letter: true })).toBeNull();
    setPref("u1", "filters", { ...defaultFilters(), relative: filter });
    expect(getPref("u1", "filters").relative).toEqual(filter);
  });
});
