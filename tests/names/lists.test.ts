import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import { parseNames, type RawNamesFile } from "@/lib/names/data";
import { trend } from "@/lib/names/popularity";
import { addedText, hiddenNames, listsTab, restoredText, rowActionText, rowMeta, rowMetaText, savedRows } from "@/lib/names/lists";
import type { NameStats, Vote } from "@/lib/names/types";

const names = parseNames(namesFile as RawNamesFile);

describe("rowMeta", () => {
  it("matches board 5's rows for the demo names", () => {
    expect(rowMeta(names.get("תמר"))).toEqual({ sexTag: "בת", count: "ניתן ל־1,090 ב־2024", trend: { word: "יציב", arrow: "→" } });
    // The board's "בעלייה" for לביא is sample data; the trend comes from the CBS numbers.
    const t = trend(names.get("לביא")!)!;
    expect(rowMeta(names.get("לביא"))).toEqual({ sexTag: "בן", count: "ניתן ל־1,523 ב־2024", trend: { word: t.word, arrow: t.arrow } });
    expect(rowMeta(names.get("אריאל"))?.sexTag).toBe("מתאים לכולם");
  });

  it("uses the all-time line for a name with no recent births", () => {
    const old: NameStats = { name: "ישן", m: 54_321, f: 12, s: "J" };
    expect(rowMeta(old)).toEqual({ sexTag: "בן", count: "ניתן לכ־54,000 מאז 1949", trend: null });
  });

  it("is null for a custom name", () => {
    expect(rowMeta(undefined)).toBeNull();
    expect(rowMeta(null)).toBeNull();
  });

  it("reads as one line without the arrow", () => {
    expect(rowMetaText(rowMeta(names.get("לביא"))!)).toBe(`בן · ניתן ל־1,523 ב־2024 · ${trend(names.get("לביא")!)!.word}`);
    expect(rowMetaText({ sexTag: "בת", count: "ניתן לכ־100 מאז 1949", trend: null })).toBe("בת · ניתן לכ־100 מאז 1949");
  });
});

describe("hiddenNames", () => {
  it("lists hidden names only, the latest first", () => {
    const votes = new Map<string, Vote>([
      ["נועם", "hidden"],
      ["תמר", "keep"],
      ["לביא", "skip"],
      ["אלה", "hidden"],
      ["שקד", "love"],
    ]);
    expect(hiddenNames(votes)).toEqual(["אלה", "נועם"]);
    expect(hiddenNames(new Map())).toEqual([]);
  });
});

it("restoredText", () => {
  expect(restoredText("אלה")).toBe("אלה יחזור לבחירה");
});

describe("listsTab", () => {
  it("defaults to saved and shows matches only when shared", () => {
    expect(listsTab(null, false)).toBe("saved");
    expect(listsTab("saved", true)).toBe("saved");
    expect(listsTab("matches", true)).toBe("matches");
    expect(listsTab("matches", false)).toBe("saved");
    expect(listsTab("duel", false)).toBe("duel");
    expect(listsTab("other", true)).toBe("saved");
  });
});

describe("savedRows", () => {
  it("lists loved first, then kept, the latest first, without skips or hidden", () => {
    const votes = new Map<string, { vote: Vote; custom?: boolean }>([
      ["תמר", { vote: "keep" }],
      ["אריאל", { vote: "love" }],
      ["נועם", { vote: "skip" }],
      ["לביא", { vote: "keep" }],
      ["אלה", { vote: "hidden" }],
      ["שקד", { vote: "love" }],
      ["אוריה", { vote: "keep", custom: true }],
    ]);
    expect(savedRows(votes)).toEqual([
      { name: "שקד", vote: "love", custom: false },
      { name: "אריאל", vote: "love", custom: false },
      { name: "אוריה", vote: "keep", custom: true },
      { name: "לביא", vote: "keep", custom: false },
      { name: "תמר", vote: "keep", custom: false },
    ]);
  });

  it("is empty with no saved names", () => {
    expect(savedRows(new Map([["נועם", { vote: "skip" as Vote }]]))).toEqual([]);
  });
});

describe("list texts", () => {
  it("says what happened to the name", () => {
    expect(rowActionText("תמר", "remove")).toBe("תמר הוסר מהרשימה");
    expect(rowActionText("תמר", "hide")).toBe("תמר הוסתר ולא יוצג יותר");
    expect(addedText("אוריה")).toBe("אוריה נוסף לרשימה");
  });
});
