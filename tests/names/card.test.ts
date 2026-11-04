import { describe, expect, it } from "vitest";
import { bibleNote, fullName, knownPeople, positionText } from "@/lib/names/card";

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
