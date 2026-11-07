import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import { parseNames, type RawNamesFile } from "@/lib/names/data";
import {
  allTimeBirths,
  cardHints,
  chartLabel,
  chartModel,
  compare2000,
  niceStep,
  rank2024,
  rankMap,
  rankText,
  SIMILAR_MAX,
  similarForDisplay,
  togetherFor,
} from "@/lib/names/detail";
import type { Card, NameDetail, NameStats, SexTag } from "@/lib/names/types";
import type { Match } from "@/lib/names/matches";

const names = parseNames(namesFile as RawNamesFile);
const stats = (name: string) => names.get(name)!;

/** A series of 25 years with `a` in 2000 and `b` in 2024. */
const years = (a: number, b: number) => [a, ...Array<number>(23).fill(50), b];

describe("rankMap / rank2024", () => {
  it("builds the 19,884-name map in under 50 ms and memoises it", () => {
    const fresh = parseNames(namesFile as RawNamesFile);
    expect(fresh.size).toBe(19884);
    const t0 = performance.now();
    const map = rankMap(fresh);
    const ms = performance.now() - t0;
    expect(ms).toBeLessThan(50);
    expect(rankMap(fresh)).toBe(map);
  });

  it("ranks מוחמד first and אריאל second", () => {
    const map = rankMap(names);
    expect(rank2024("מוחמד", map)).toBe(1);
    expect(rank2024("אריאל", map)).toBe(2);
    expect(rankText(2)).toBe("#2 בשנת 2024");
  });

  it("gives tied names the same rank and skips the next one", () => {
    const map = rankMap(names);
    expect(stats("מלכה").y![24]).toBe(stats("רומי").y![24]);
    expect(rank2024("מלכה", map)).toBe(rank2024("רומי", map));

    const tiny: NameStats[] = [
      { name: "א", m: 1, f: 0, s: "", y: years(1, 30) },
      { name: "ב", m: 1, f: 0, s: "", y: years(1, 20) },
      { name: "ג", m: 1, f: 0, s: "", y: years(1, 20) },
      { name: "ד", m: 1, f: 0, s: "", y: years(1, 10) },
      { name: "ה", m: 1, f: 0, s: "", y: years(1, 0) },
    ];
    const tinyMap = rankMap(tiny);
    expect(["א", "ב", "ג", "ד"].map((n) => rank2024(n, tinyMap))).toEqual([1, 2, 2, 4]);
    expect(rank2024("ה", tinyMap)).toBeNull();
  });

  it("has no rank for a name with no years or no 2024 births", () => {
    const map = rankMap(names);
    expect(stats("אינה").y).toBeUndefined();
    expect(rank2024("אינה", map)).toBeNull();
    expect(stats("שרון").y![24]).toBe(0);
    expect(rank2024("שרון", map)).toBeNull();
  });
});

describe("compare2000", () => {
  it("אריאל: פי 3.3", () => {
    expect(compare2000(stats("אריאל"))).toEqual({ kind: "times", text: "פי 3.3 מבשנת 2000" });
  });

  it("a falling name: whole percent less", () => {
    // מוחמד: 3,210 in 2000, 2,257 in 2024 → 29.7% less.
    expect(compare2000(stats("מוחמד"))).toEqual({ kind: "less", text: "30% פחות מבשנת 2000" });
  });

  it("about the same between 0.9 and 1.1", () => {
    // מיכל: 576 → 583.
    expect(compare2000(stats("מיכל"))).toEqual({ kind: "same", text: "בערך כמו בשנת 2000" });
  });

  it("uses the boundaries 1.1 and 0.9 inclusively", () => {
    expect(compare2000({ y: years(100, 110) })?.kind).toBe("times");
    expect(compare2000({ y: years(100, 109) })?.kind).toBe("same");
    expect(compare2000({ y: years(100, 90) })).toEqual({ kind: "less", text: "10% פחות מבשנת 2000" });
    expect(compare2000({ y: years(100, 91) })?.kind).toBe("same");
  });

  it("is null under 20 births in either year", () => {
    expect(stats("אגם").y![0]).toBeLessThan(20);
    expect(compare2000(stats("אגם"))).toBeNull();
    expect(compare2000({ y: years(100, 19) })).toBeNull();
    expect(compare2000({ y: years(20, 20) })?.kind).toBe("same");
  });

  it("is null with no years", () => {
    expect(compare2000(stats("אינה"))).toBeNull();
  });
});

describe("allTimeBirths", () => {
  it("adds boys and girls with thousands separators", () => {
    expect(allTimeBirths(stats("אריאל"))).toBe("48,793");
    expect(allTimeBirths(stats("מוחמד"))).toBe("130,529");
    expect(allTimeBirths({ m: 3, f: 4 })).toBe("7");
  });
});

describe("chartModel", () => {
  const box = { width: 300, height: 140, pad: { top: 10, end: 8, bottom: 24, start: 40 } };
  const base = box.height - box.pad.bottom;

  it("gives אריאל 0 and two round ticks, the top one covering 2,099", () => {
    const model = chartModel(stats("אריאל").y, box)!;
    const values = model.yTicks.map((t) => t.value);
    expect(values[0]).toBe(0);
    expect(values).toHaveLength(3);
    expect(values[2]).toBeGreaterThanOrEqual(2099);
    expect(values[2]).toBe(values[1] * 2);
    expect(model.yTicks.map((t) => t.label)).toEqual(["0", "1,200", "2,400"]);
    expect(model.yTicks[0].y).toBe(base);
    expect(model.yTicks[2].y).toBe(box.pad.top);
  });

  it("uses whole round steps whose double covers the max", () => {
    expect([1, 2, 3, 10, 11, 99, 100, 101, 2099, 9000, 12000].map(niceStep)).toEqual([
      1, 1, 2, 5, 6, 50, 50, 60, 1200, 5000, 6000,
    ]);
  });

  it("places 25 points left to right with the 2024 point last", () => {
    const y = stats("אריאל").y!;
    const model = chartModel(y, box)!;
    expect(model.points).toHaveLength(25);
    expect(model.points[0]).toMatchObject({ year: 2000, value: y[0], x: box.pad.start });
    expect(model.last).toMatchObject({ year: 2024, value: 2099, x: box.width - box.pad.end });
    expect(model.last.y).toBeCloseTo(base - (2099 / 2400) * (base - box.pad.top), 1);
    expect(model.line.split(" ")).toHaveLength(25);
    expect(model.area.split(" ")).toHaveLength(27);
    expect(model.area.endsWith(`${box.width - box.pad.end},${base} ${box.pad.start},${base}`)).toBe(true);
    expect(model.xLabels.map((l) => [l.year, l.label])).toEqual([
      [2000, "2000"],
      [2012, "2012"],
      [2024, "2024"],
    ]);
    expect(model.xLabels[1].x).toBe(model.points[12].x);
  });

  it("finds the nearest year at both ends, the middle and outside the plot", () => {
    const model = chartModel(stats("אריאל").y, box)!;
    expect(model.nearestYear(box.pad.start)).toBe(2000);
    expect(model.nearestYear(box.width - box.pad.end)).toBe(2024);
    expect(model.nearestYear(model.points[12].x)).toBe(2012);
    expect(model.nearestYear(model.points[12].x + 4)).toBe(2012);
    expect(model.nearestYear(model.points[12].x + 6)).toBe(2013);
    expect(model.nearestYear(-50)).toBe(2000);
    expect(model.nearestYear(10_000)).toBe(2024);
    expect(model.nearestYear(Number.NaN)).toBe(2000);
  });

  it("draws a flat series on the top gridline", () => {
    const model = chartModel(Array<number>(25).fill(50), box)!;
    expect(model.yTicks.map((t) => t.value)).toEqual([0, 25, 50]);
    expect(new Set(model.points.map((p) => p.y))).toEqual(new Set([model.yTicks[2].y]));
  });

  it("draws an all-zero series on the 0 line", () => {
    const model = chartModel(Array<number>(25).fill(0), box)!;
    expect(model.yTicks.map((t) => t.value)).toEqual([0, 1, 2]);
    expect(model.points.every((p) => p.y === base)).toBe(true);
  });

  it("returns null without a full series and accepts a single pad number", () => {
    expect(chartModel(undefined, box)).toBeNull();
    expect(chartModel([1, 2, 3], box)).toBeNull();
    const model = chartModel(Array<number>(25).fill(5), { width: 100, height: 50, pad: 5 })!;
    expect(model.points[0].x).toBe(5);
    expect(model.last.x).toBe(95);
    expect(model.yTicks[0].y).toBe(45);
    expect(model.yTicks[2].y).toBe(5);
  });
});

describe("chartLabel", () => {
  it("summarises range, first and last values and the peak year", () => {
    expect(chartLabel(stats("אריאל"))).toBe(
      "מספר התינוקות בכל שנה, 2000 עד 2024. ב־2000: 637 תינוקות, ב־2024: 2,099 תינוקות. השיא ב־2024.",
    );
  });

  it("uses the first peak year, the singular, and skips the peak for zeros", () => {
    expect(chartLabel({ y: [1, 3, ...Array<number>(21).fill(2), 3, 1] })).toBe(
      "מספר התינוקות בכל שנה, 2000 עד 2024. ב־2000: תינוק אחד, ב־2024: תינוק אחד. השיא ב־2001.",
    );
    expect(chartLabel({ y: Array<number>(25).fill(0) })).toBe(
      "מספר התינוקות בכל שנה, 2000 עד 2024. ב־2000: 0 תינוקות, ב־2024: 0 תינוקות.",
    );
  });

  it("says there is no data without years", () => {
    expect(chartLabel(stats("אינה"))).toBe("אין נתונים לשנים 2000–2024");
  });
});

describe("similarForDisplay", () => {
  const card = (name: string, sexTag: SexTag) => ({ stats: { name }, derived: { sexTag } }) as unknown as Card;
  const cards = [
    card("אריאל", "מתאים לכולם"),
    card("אריאלה", "בת"),
    card("אראל", "בן"),
    card("ארי", "בן"),
    card("אריה", "בן"),
    card("אוריאל", "בן"),
    card("אריאה", "בת"),
    card("אורי", "מתאים לכולם"),
  ];
  const details = new Map<string, NameDetail>([
    ["אריאל", { story: null, similar: ["אריאלה", "אראל", "ארי", "לא-בחפיסה", "אריה"] }],
    ["אורי", { story: null, similar: [] }],
    ["ארי", { story: null, similar: ["אריאל", "אריאלה", "אראל", "אריה", "אוריאל", "אריאה", "אורי"] }],
  ]);

  it("keeps the build order and the sex tags", () => {
    expect(similarForDisplay("אריאל", details, cards, [])).toEqual([
      { name: "אריאלה", sexTag: "בת" },
      { name: "אראל", sexTag: "בן" },
      { name: "ארי", sexTag: "בן" },
      { name: "אריה", sexTag: "בן" },
    ]);
  });

  it("drops a name that isn't in the deck", () => {
    const shown = similarForDisplay("אריאל", details, cards, []).map((s) => s.name);
    expect(shown).not.toContain("לא-בחפיסה");
  });

  it("drops names the user hid (array or set)", () => {
    expect(similarForDisplay("אריאל", details, cards, ["אראל"]).map((s) => s.name)).toEqual(["אריאלה", "ארי", "אריה"]);
    expect(similarForDisplay("אריאל", details, new Map(cards.map((c) => [c.stats.name, c])), new Set(["אריאלה", "ארי"])))
      .toEqual([
        { name: "אראל", sexTag: "בן" },
        { name: "אריה", sexTag: "בן" },
      ]);
  });

  it("returns [] for an empty list, an unknown name, missing details or everything hidden", () => {
    expect(similarForDisplay("אורי", details, cards, [])).toEqual([]);
    expect(similarForDisplay("לא-קיים", details, cards, [])).toEqual([]);
    expect(similarForDisplay("אריאל", null, cards, [])).toEqual([]);
    expect(similarForDisplay("אריאל", details, cards, ["אריאלה", "אראל", "ארי", "אריה"])).toEqual([]);
  });

  it("shows at most SIMILAR_MAX names, and the first ones", () => {
    const shown = similarForDisplay("ארי", details, cards, []).map((s) => s.name);
    expect(shown).toHaveLength(SIMILAR_MAX);
    expect(shown).toEqual(["אריאל", "אריאלה", "אראל", "אריה", "אוריאל", "אריאה"]);
  });
});

describe("togetherFor", () => {
  const match = (name: string, keptByCount: number): Match => ({
    name,
    keptByCount,
    lovedByCount: 0,
    matchedAt: "2026-11-07T00:00:00Z",
  });

  it("is null in a solo space, even for a name in the list", () => {
    expect(togetherFor("נועם", [match("נועם", 2)], 1)).toBeNull();
    expect(togetherFor("נועם", [], 1)).toBeNull();
  });

  it("is null for a name that isn't a match", () => {
    expect(togetherFor("נועם", [], 2)).toBeNull();
    expect(togetherFor("נועם", [match("יעל", 2)], 2)).toBeNull();
  });

  it("uses the Lists wording for two members", () => {
    expect(togetherFor("נועם", [match("יעל", 2), match("נועם", 2)], 2)).toEqual({
      text: "התאמה · שניכם שמרתם את השם הזה",
    });
  });

  it("counts the keepers with three or more members", () => {
    expect(togetherFor("נועם", [match("נועם", 3)], 3)).toEqual({ text: "התאמה · 3 שמרו את השם הזה" });
    expect(togetherFor("נועם", [match("נועם", 4)], 4)).toEqual({ text: "התאמה · 4 שמרו את השם הזה" });
  });

  it("takes only matches, no partner votes", () => {
    expect(togetherFor.length).toBe(3);
  });
});

describe("cardHints", () => {
  const verse = { text: "ויקרא את שמו", ref: "בראשית ל׳ כד" };
  const person = (name: string) => ({ name, what: "שחקנית" });

  it("is empty with no verse and no people", () => {
    expect(cardHints({ people: [] })).toEqual([]);
  });

  it("shows only the verse", () => {
    expect(cardHints({ bible: verse, people: [] })).toEqual(["מהתנ״ך"]);
  });

  it("says one known person in words", () => {
    expect(cardHints({ people: [person("א")] })).toEqual(["אדם מוכר אחד"]);
    expect(cardHints({ bible: verse, people: [person("א")] })).toEqual(["מהתנ״ך", "אדם מוכר אחד"]);
  });

  it("counts two or more people, after the verse", () => {
    expect(cardHints({ people: [person("א"), person("ב")] })).toEqual(["2 אנשים מוכרים"]);
    expect(cardHints({ bible: verse, people: [person("א"), person("ב")] })).toEqual(["מהתנ״ך", "2 אנשים מוכרים"]);
  });
});
