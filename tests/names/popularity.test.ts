import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import { parseNames, type RawNamesFile } from "@/lib/names/data";
import {
  countLine,
  latestCount,
  popularityBand,
  rankByLastYear,
  sparkline,
  sparkPoints,
  trend,
} from "@/lib/names/popularity";

const names = parseNames(namesFile as RawNamesFile);
const ranks = rankByLastYear(names.values());
const stats = (name: string) => names.get(name)!;

// The demo keeps its 10 sample names as one JSON object per line, and spark() as a closure.
const demoSource = readFileSync("src/lib/pregnancy-names-demo.mjs", "utf8");
const demoNames = demoSource
  .split("\n")
  .filter((line) => line.trimStart().startsWith('{"n":'))
  .map((line) => JSON.parse(line.trim().replace(/,$/, "")) as { n: string; rank: number; band: string; trend: string; y: number[] });
const demoSpark = new Function(
  `return ${demoSource.match(/const spark = (y => \{[\s\S]*?\n {2}\});/)![1]}`,
)() as (y: number[]) => string;
const DEMO_TREND: Record<string, string> = { up: "בעלייה", down: "בירידה", flat: "יציב" };

describe("against the demo's hard-coded values", () => {
  it("has the 10 demo names", () => {
    expect(demoNames).toHaveLength(10);
  });

  it.each(demoNames.map((d) => [d.n, d] as const))("%s: rank, band and trend", (name, demo) => {
    expect(ranks.get(name)).toBe(demo.rank);
    expect(popularityBand(ranks.get(name))).toBe(demo.band);
    expect(trend(stats(name))?.word).toBe(DEMO_TREND[demo.trend]);
    expect(stats(name).y).toEqual(demo.y);
  });

  it.each(demoNames.map((d) => [d.n, d] as const))("%s: sparkline points", (name, demo) => {
    const polyline = demoSpark(demo.y).match(/points="([^"]+)"/)![1];
    expect(sparkline(stats(name))).toBe(polyline);
  });
});

describe("rankByLastYear", () => {
  it("ranks by 2024 births with shared ranks for ties", () => {
    const r = rankByLastYear([
      { name: "א", m: 0, f: 0, s: "", y: [1, 50] },
      { name: "ב", m: 0, f: 0, s: "", y: [1, 80] },
      { name: "ג", m: 0, f: 0, s: "", y: [1, 50] },
      { name: "ד", m: 0, f: 0, s: "", y: [1, 10] },
      { name: "ה", m: 0, f: 0, s: "", y: [5, 0] },
      { name: "ו", m: 5, f: 5, s: "" },
    ]);
    expect(Object.fromEntries(r)).toEqual({ ב: 1, א: 2, ג: 2, ד: 4 });
  });
});

describe("popularityBand", () => {
  it("uses top 100 and 101–500", () => {
    expect(popularityBand(1)).toBe("נפוץ");
    expect(popularityBand(100)).toBe("נפוץ");
    expect(popularityBand(101)).toBe("בינוני");
    expect(popularityBand(500)).toBe("בינוני");
    expect(popularityBand(501)).toBe("נדיר");
  });

  it("is rare for names with no 2024 rank", () => {
    expect(popularityBand(undefined)).toBe("נדיר");
    expect(popularityBand(null)).toBe("נדיר");
    const noYears = [...names.values()].find((s) => !s.y)!;
    expect(popularityBand(ranks.get(noYears.name))).toBe("נדיר");
  });
});

describe("countLine", () => {
  it("uses the 2024 count with he-IL grouping", () => {
    expect(countLine(stats("נועם"))).toBe("ניתן ל־1,189 תינוקות ב־2024");
    expect(countLine(stats("זיו"))).toBe("ניתן ל־302 תינוקות ב־2024");
    expect(latestCount(stats("אריאל"))).toEqual({ n: 2099, year: 2024 });
  });

  it("falls back to the latest year with births", () => {
    const y = Array(25).fill(0);
    y[20] = 7;
    expect(countLine({ name: "x", m: 30, f: 0, s: "", y })).toBe("ניתן ל־7 תינוקות ב־2020");
  });

  it("uses the rounded all-time line with no recent year", () => {
    expect(countLine({ name: "x", m: 42517, f: 12945, s: "" })).toBe("ניתן לכ־55,000 תינוקות מאז 1949");
    expect(countLine({ name: "x", m: 1234, f: 0, s: "" })).toBe("ניתן לכ־1,200 תינוקות מאז 1949");
    expect(countLine({ name: "x", m: 37, f: 0, s: "" })).toBe("ניתן לכ־37 תינוקות מאז 1949");
    expect(countLine({ name: "x", m: 3, f: 0, s: "", y: Array(25).fill(0) })).toBe("ניתן לכ־3 תינוקות מאז 1949");
  });
});

describe("trend", () => {
  // 25 years; the last 3 are 2022–2024, the earlier window is 2017–2019.
  const years = (base: number, recent: number) => {
    const y = Array(25).fill(100);
    y.splice(17, 3, base, base, base);
    y.splice(22, 3, recent, recent, recent);
    return { y };
  };

  it("is up at +25% or more and down at −25% or more", () => {
    expect(trend(years(100, 125))).toMatchObject({ word: "בעלייה", arrow: "↗" });
    expect(trend(years(100, 124))).toMatchObject({ word: "יציב", arrow: "→" });
    expect(trend(years(100, 75))).toMatchObject({ word: "בירידה", arrow: "↘" });
    expect(trend(years(100, 76))).toMatchObject({ word: "יציב", arrow: "→" });
  });

  it("is null when the data is too thin", () => {
    expect(trend({})).toBeNull();
    expect(trend(years(0, 50))).toBeNull();
    expect(trend(years(4, 50))).toBeNull();
    expect(trend(years(5, 50))).toMatchObject({ word: "בעלייה" });
  });

  it("reads עמית as falling", () => {
    expect(trend(stats("עמית"))?.change).toBeCloseTo(-0.403, 3);
  });
});

describe("sparkline", () => {
  it("spans 2000–2024 in the 132 × 36 box", () => {
    const pts = sparkPoints(stats("לביא"));
    expect(pts).toHaveLength(25);
    expect(pts[0]).toEqual([4, 32]);
    expect(pts[24]).toEqual([128, 4]);
  });

  it("draws a flat line for a constant series and nothing without years", () => {
    expect(new Set(sparkPoints({ y: Array(25).fill(9) }).map((p) => p[1]))).toEqual(new Set([32]));
    expect(sparkline({})).toBeNull();
  });
});
