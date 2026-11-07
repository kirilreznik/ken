import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import { parseNames, type RawNamesFile } from "@/lib/names/data";
import { allTimeBirths, compare2000, rank2024, rankMap, rankText } from "@/lib/names/detail";
import type { NameStats } from "@/lib/names/types";

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
