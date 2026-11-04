import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import contentFile from "../../data/names/name-content.json";
import { contentNames, parseContent, parseNames, type RawContentFile, type RawNamesFile } from "@/lib/names/data";
import { sexSplit, sexTag } from "@/lib/names/sex";

const names = parseNames(namesFile as RawNamesFile);
const stats = (name: string) => names.get(name)!;

describe("sexTag", () => {
  it("tags the 10 content names", () => {
    const expected: Record<string, string> = {
      זיו: "מתאים לכולם",
      נועם: "מתאים לכולם",
      שקד: "מתאים לכולם",
      אריאל: "מתאים לכולם",
      עמית: "מתאים לכולם",
      יעל: "בת",
      תמר: "בת",
      אביגיל: "בת",
      אלה: "בת",
      לביא: "בן",
    };
    const content = contentNames(parseContent(contentFile as RawContentFile));
    expect(content.slice().sort()).toEqual(Object.keys(expected).sort());
    for (const name of content) expect(sexTag(stats(name)), name).toBe(expected[name]);
  });

  it("uses 90% inclusive for names with 200 or more births", () => {
    expect(sexTag({ m: 180, f: 20 })).toBe("בן");
    expect(sexTag({ m: 20, f: 180 })).toBe("בת");
    expect(sexTag({ m: 179, f: 21 })).toBe("מתאים לכולם");
    expect(sexTag({ m: 0, f: 500 })).toBe("בת");
    expect(sexTag({ m: 500, f: 0 })).toBe("בן");
  });

  it("uses the majority sex below 200 births", () => {
    expect(sexTag({ m: 110, f: 89 })).toBe("בן");
    expect(sexTag({ m: 89, f: 110 })).toBe("בת");
    expect(sexTag({ m: 0, f: 5 })).toBe("בת");
    expect(sexTag({ m: 5, f: 0 })).toBe("בן");
    // the same split at 200 births is unisex
    expect(sexTag({ m: 111, f: 89 })).toBe("מתאים לכולם");
  });

  it("keeps a tie below 200 births unisex", () => {
    expect(sexTag({ m: 7, f: 7 })).toBe("מתאים לכולם");
  });
});

describe("sexSplit", () => {
  it("rounds to whole numbers that add up to 100", () => {
    expect(sexSplit(stats("זיו"))).toMatchObject({ boysLabel: "71%", girlsLabel: "29%" });
    expect(sexSplit(stats("נועם"))).toMatchObject({ boysLabel: "77%", girlsLabel: "23%" });
    expect(sexSplit(stats("שקד"))).toMatchObject({ boysLabel: "31%", girlsLabel: "69%" });
    expect(sexSplit({ m: 1, f: 1 })).toMatchObject({ boysLabel: "50%", girlsLabel: "50%" });
    expect(sexSplit({ m: 905, f: 95 })).toMatchObject({ boysLabel: "91%", girlsLabel: "9%" });
  });

  it("returns the exact boys share for the bar", () => {
    const ziv = stats("זיו");
    expect(sexSplit(ziv).boysShare).toBe(ziv.m / (ziv.m + ziv.f));
    expect(sexSplit({ m: 180, f: 20 }).boysShare).toBe(0.9);
  });

  it("says under 1% / over 99% at the extremes", () => {
    expect(sexSplit({ m: 0, f: 300 })).toEqual({ boysShare: 0, boysLabel: "פחות מ־1%", girlsLabel: "מעל 99%" });
    expect(sexSplit({ m: 300, f: 0 })).toEqual({ boysShare: 1, boysLabel: "מעל 99%", girlsLabel: "פחות מ־1%" });
    expect(sexSplit(stats("אביגיל"))).toMatchObject({ boysLabel: "פחות מ־1%", girlsLabel: "מעל 99%" });
    expect(sexSplit(stats("יעל"))).toMatchObject({ boysLabel: "פחות מ־1%", girlsLabel: "מעל 99%" });
    expect(sexSplit(stats("לביא"))).toMatchObject({ boysLabel: "מעל 99%", girlsLabel: "פחות מ־1%" });
  });

  it("switches to the extreme labels exactly past 1% and 99%", () => {
    expect(sexSplit({ m: 1, f: 99 })).toMatchObject({ boysLabel: "1%", girlsLabel: "99%" });
    expect(sexSplit({ m: 99, f: 1 })).toMatchObject({ boysLabel: "99%", girlsLabel: "1%" });
    expect(sexSplit({ m: 9, f: 991 })).toMatchObject({ boysLabel: "פחות מ־1%" });
    expect(sexSplit({ m: 991, f: 9 })).toMatchObject({ boysLabel: "מעל 99%" });
  });
});
