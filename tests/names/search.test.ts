import { describe, expect, it } from "vitest";
import { hebrewKey, latinKey, queryScript, searchCards, skeletonKey } from "@/lib/names/search";

const card = (name: string, latin: { he?: string; intl?: string } = {}, last = 0) => ({
  stats: { name, m: 1, f: 1, y: [last] },
  content: { latin },
});

const cards = [
  card("מיכאל", { he: "Mikhael", intl: "Michael" }, 900),
  card("מיכל", { he: "Mikhal", intl: "Michal" }, 500),
  card("נועה", { he: "Noa" }, 2000),
  card("נועם", { he: "Noam" }, 1800),
  card("נעמי", { he: "Naomi" }, 300),
  card("חנה", { he: "Hana", intl: "Hannah" }, 400),
  card("צבי", { he: "Tsvi" }, 100),
];

describe("search keys", () => {
  it("drops niqqud and final forms", () => {
    expect(hebrewKey("נוֹעַם")).toBe("נועמ");
    expect(skeletonKey("נועמי")).toBe(skeletonKey("נעמי"));
  });
  it("folds Latin spellings that sound alike", () => {
    expect(latinKey("Hannah")).toBe(latinKey("Hana"));
    expect(latinKey("Tzvi")).toBe(latinKey("Tsvi"));
    expect(latinKey("Michael")).toBe("mihael");
  });
  it("tells the script apart", () => {
    expect(queryScript("נוע")).toBe("hebrew");
    expect(queryScript("noa")).toBe("latin");
    expect(queryScript("  ")).toBe("none");
  });
});

describe("searchCards", () => {
  it("puts the exact name first, then prefixes by births", () => {
    expect(searchCards(cards, "נועה").map((c) => c.stats.name)[0]).toBe("נועה");
    // Prefixes first (by births), then names that match without their ו/י (נעמי).
    expect(searchCards(cards, "נוע").map((c) => c.stats.name)).toEqual(["נועה", "נועם", "נעמי"]);
  });
  it("finds a name written without its ו or י", () => {
    expect(searchCards(cards, "נעם").map((c) => c.stats.name)).toContain("נועם");
  });
  it("matches Latin by either spelling", () => {
    expect(searchCards(cards, "michael")[0].stats.name).toBe("מיכאל");
    expect(searchCards(cards, "Hannah")[0].stats.name).toBe("חנה");
    expect(searchCards(cards, "Zvi").map((c) => c.stats.name)).toEqual([]);
    expect(searchCards(cards, "Tzvi")[0].stats.name).toBe("צבי");
  });
  it("returns nothing for a blank query and caps the list", () => {
    expect(searchCards(cards, "")).toEqual([]);
    expect(searchCards(cards, "מ", 1)).toHaveLength(1);
  });
});
