import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import contentFile from "./fixtures/name-content-sample.json";
import {
  bibleNote,
  buildCards,
  countTile,
  deriveCard,
  fullName,
  knownPeople,
  positionText,
  sparkEnd,
  trendLabel,
} from "@/lib/names/card";
import { parseContent, parseNames, type RawContentFile, type RawNamesFile } from "@/lib/names/data";
import { sparkline } from "@/lib/names/popularity";
import type { NameStats } from "@/lib/names/types";

describe("positionText", () => {
  it("uses the demo's wording", () => {
    expect(positionText(1, 10)).toBe("שם 1 מתוך 10");
    expect(positionText(3, 4)).toBe("שם 3 מתוך 4");
  });
});

describe("fullName", () => {
  it("adds the surname after the name", () => {
    expect(fullName("זיו", "לוי")).toBe("זיו לוי");
  });

  it("trims and collapses spaces in the surname", () => {
    expect(fullName("יעל", "  בן   דוד ")).toBe("יעל בן דוד");
  });

  it("is null without a surname", () => {
    expect(fullName("זיו", "")).toBeNull();
    expect(fullName("זיו", "   ")).toBeNull();
    expect(fullName("זיו", null)).toBeNull();
    expect(fullName("זיו", undefined)).toBeNull();
  });
});

describe("knownPeople", () => {
  it("keeps at most two people, with an initial", () => {
    const people = [
      { name: "נועם גרשוני", what: "טניסאי" },
      { name: "נועם חומסקי", what: "בלשן" },
      { name: "נועם שלישי", what: "אחר" },
    ];
    expect(knownPeople(people)).toEqual([
      { name: "נועם גרשוני", what: "טניסאי", initial: "נ" },
      { name: "נועם חומסקי", what: "בלשן", initial: "נ" },
    ]);
  });
  it("is empty for no people and skips blank rows", () => {
    expect(knownPeople([])).toEqual([]);
    expect(knownPeople([{ name: " ", what: "x" }, { name: "יעל ארד", what: "" }])).toEqual([]);
  });
});

describe("bibleNote", () => {
  it("returns the trimmed note", () => {
    expect(bibleNote({ text: " תמר ", ref: " בראשית לח " })).toEqual({ text: "תמר", ref: "בראשית לח" });
  });
  it("is null when missing or blank", () => {
    expect(bibleNote(undefined)).toBeNull();
    expect(bibleNote({ text: "  ", ref: "שופטים" })).toBeNull();
  });
});

const years = (last: number[]) => [...Array(25 - last.length).fill(0), ...last];

describe("countTile", () => {
  it("shows the latest year and its count", () => {
    const stats: NameStats = { name: "זיו", m: 9000, f: 3000, s: "J", y: years([280, 302]) };
    expect(countTile(stats)).toEqual({ label: "ב־2024", value: "302" });
  });

  it("formats thousands", () => {
    const stats: NameStats = { name: "תמר", m: 0, f: 40000, s: "J", y: years([1090]) };
    expect(countTile(stats).value).toBe("1,090");
  });

  it("falls back to the last year with births", () => {
    const stats: NameStats = { name: "א", m: 50, f: 0, s: "J", y: years([7, 0, 0]) };
    expect(countTile(stats)).toEqual({ label: "ב־2022", value: "7" });
  });

  it("uses the all-time line for a name with no recent births", () => {
    expect(countTile({ name: "ב", m: 54_712, f: 300, s: "J" })).toEqual({ label: "מאז 1949", value: "כ־55,000" });
    expect(countTile({ name: "ג", m: 40, f: 2, s: "J", y: years([]) })).toEqual({ label: "מאז 1949", value: "כ־42" });
  });
});

describe("sparkEnd", () => {
  it("is the last point of the polyline", () => {
    const spark = sparkline({ y: years([1, 2, 3]) });
    expect(sparkEnd(spark)).toEqual({ x: 128, y: 4 });
    expect(sparkEnd("4,32 66,10.5 128,20")).toEqual({ x: 128, y: 20 });
  });

  it("is null without a sparkline", () => {
    expect(sparkEnd(null)).toBeNull();
    expect(sparkEnd("")).toBeNull();
    expect(sparkEnd("x,y")).toBeNull();
  });
});

describe("trendLabel", () => {
  it("names the trend and the first year", () => {
    expect(trendLabel("יציב")).toBe("מגמה יציב מאז 2000");
    expect(trendLabel("בעלייה")).toBe("מגמה בעלייה מאז 2000");
  });
});

describe("deriveCard", () => {
  it("combines the E16 §2 rules", () => {
    const stats: NameStats = { name: "א", m: 10, f: 30, s: "J", y: Array(25).fill(4) };
    expect(deriveCard(stats, 50)).toEqual({
      sexTag: "בת",
      boysShare: 0.25,
      boysLabel: "25%",
      girlsLabel: "75%",
      band: "נפוץ",
      countLine: "ניתן ל־4 תינוקות ב־2024",
      trend: null,
      spark: sparkline(stats),
    });
  });

  it("has no sparkline or trend without recent years, and is rare without a rank", () => {
    const d = deriveCard({ name: "ב", m: 900, f: 100, s: "J" }, undefined);
    expect(d).toMatchObject({ sexTag: "בן", band: "נדיר", trend: null, spark: null });
  });
});

describe("buildCards", () => {
  const cards = buildCards(
    parseNames(namesFile as RawNamesFile),
    parseContent(contentFile as RawContentFile),
  );

  it("builds the 10 content names in content order", () => {
    expect(cards.map((c) => c.stats.name)).toEqual(["זיו", "נועם", "יעל", "לביא", "תמר", "שקד", "אריאל", "אביגיל", "עמית", "אלה"]);
    for (const c of cards) {
      expect(c.derived.spark).not.toBeNull();
      expect(c.content.niqqud).toBeTruthy();
    }
  });

  it("skips content names with no births", () => {
    const names = parseNames(namesFile as RawNamesFile);
    const content = parseContent({ names: { חדש: { niqqud: "חָדָשׁ", intro: "x", people: [] } } });
    expect(buildCards(names, content)).toEqual([]);
  });
});
