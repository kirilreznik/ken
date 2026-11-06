import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseDetails, type RawDetailsFile } from "@/lib/names/data";
// @ts-expect-error plain .mjs script without types
import { buildDetails, readBatches, report, storyProblems } from "../../scripts/names-content/build-details.mjs";

describe("parseDetails", () => {
  it("keeps a normal entry as written", () => {
    const details = parseDetails({
      _about: "Stories and similar names",
      names: { אריאל: { story: "סיפור קצר על השם.", similar: ["אריאלה", "ארי"] } },
    });
    expect(details.size).toBe(1);
    expect(details.get("אריאל")).toEqual({ story: "סיפור קצר על השם.", similar: ["אריאלה", "ארי"] });
  });

  it("fills missing fields: no similar is [], a missing or non-string story is null", () => {
    const details = parseDetails({
      names: {
        נועה: { story: "סיפור." },
        יעל: { similar: ["יעלי"] },
        טל: { story: 12, storyNote: "unsure", similar: "תל" },
        דן: { story: null, similar: ["דני", 7, null] },
      },
    });
    expect(details.get("נועה")).toEqual({ story: "סיפור.", similar: [] });
    expect(details.get("יעל")).toEqual({ story: null, similar: ["יעלי"] });
    expect(details.get("טל")).toEqual({ story: null, similar: [] });
    expect(details.get("דן")).toEqual({ story: null, similar: ["דני"] });
  });

  it("drops entries that aren't objects and ignores _about", () => {
    const details = parseDetails({
      _about: "top-level note",
      names: { _about: { story: "x" }, a: null, b: "story", c: 3, d: ["x"], e: true, ok: { story: "s" } },
    });
    expect([...details.keys()]).toEqual(["ok"]);
  });

  it("returns an empty map for an empty or broken file", () => {
    expect(parseDetails({}).size).toBe(0);
    expect(parseDetails({ names: {} }).size).toBe(0);
    expect(parseDetails({ names: null } as unknown as RawDetailsFile).size).toBe(0);
    expect(parseDetails(null as unknown as RawDetailsFile).size).toBe(0);
  });
});

type Built = {
  names: Record<string, { story: string | null; similar: string[] }>;
  failures: string[];
  warnings: string[];
  drops: string[];
  capped: string[];
  nullStories: { name: string; note: string }[];
  covered: number;
  deckSize: number;
};

const fixtures = "tests/names/fixtures";
const deck = JSON.parse(readFileSync(`${fixtures}/details-deck.json`, "utf8"));
const build = (dir: string): Built =>
  buildDetails({
    batches: dir ? readBatches(`${fixtures}/${dir}`) : [],
    cards: deck.cards,
    births: new Map(Object.entries(deck.births)),
    known: new Set(deck.known),
  });

describe("build-details", () => {
  it("passes a clean batch set, fills symmetry, sorts by 2024 births and caps at 6", () => {
    const out = build("details-ok");
    expect(out.failures).toEqual([]);
    expect(out.names["אריאל"].similar).toEqual(["אריאלה", "ארי", "a1"]);
    expect(out.names["אריאלה"]).toEqual({ story: null, similar: ["אריאל"] });
    expect(out.names["נויה"]).toEqual({ story: null, similar: ["נוי"] });
    expect(out.names["טליה"].similar).toEqual(["טל"]);
    expect(out.names["a1"].similar).toEqual(["אריאל", "a2", "a3", "a4", "a5", "a6"]);
    expect(out.capped).toEqual(["a1: kept 6 of 7, cut a7"]);
    expect(out.names["a7"].similar).toEqual(["a1"]);
    expect(Object.keys(out.names)[0]).toBe("אריאל");
  });

  it("drops a similar name that has no card in the deck, with a report line", () => {
    const out = build("details-ok");
    expect(out.drops).toEqual(["אריאל → אראל: no card in the deck"]);
    expect(out.names["אריאל"].similar).not.toContain("אראל");
  });

  it("warns on missing entries, Bible mentions without a checked verse and intro overlap", () => {
    const out = build("details-ok");
    expect(out.covered).toBe(5);
    expect(out.deckSize).toBe(16);
    expect(out.warnings[0]).toMatch(/^11 deck names have no details entry: /);
    expect(out.warnings).toContain("טל: story mentions the Bible but the card has no checked verse");
    expect(out.warnings.some((w) => w.startsWith("נועה: story shares 100%"))).toBe(true);
    expect(out.warnings.some((w) => w.startsWith("אריאל:"))).toBe(false);
    expect(out.nullStories).toEqual([
      { name: "נוי", note: "Not sure enough about the origin." },
      { name: "a1", note: "Fixture." },
    ]);
  });

  it("fails on every story, similar and name rule", () => {
    const f = build("details-bad").failures.join("\n");
    const at = (name: string, why: string) => expect(f).toContain(`details-001.json ${name}: ${why}`);
    at("אריאל", "story is 8 chars (needs 140–480)");
    at("טליה", "story is");
    at("אריאלה", 'story has "!" or "?"');
    at("a5", 'story has "!" or "?"');
    at("ארי", "story has a quote mark");
    at("יעל", "story has a quote mark");
    at("נועה", "story has a chapter/verse reference");
    at("a3", "story has a chapter/verse reference");
    at("a4", "story has a chapter/verse reference");
    at("a2", "story has a digit that isn't a 4-digit year");
    at("נויה", "lists itself as similar");
    at("טל", 'similar "טום" is not a deck name');
    at("דוד", "not a deck name");
  });

  it("fails on a name in two batches", () => {
    expect(build("details-dup").failures).toEqual(["details-002.json נוי: duplicate (also in details-001.json)"]);
  });

  it("allows abbreviations with ״ and 4-digit years", () => {
    const story = "השם מופיע בתנ״ך ובשירה העברית, והוא מוכר בישראל מאז 1948 ועד היום. ".repeat(3);
    expect(storyProblems(story.trim())).toEqual([]);
  });

  it("with no batches writes nothing and reports 0 of N covered", () => {
    const out = build("");
    expect(out.failures).toEqual([]);
    expect(out.names).toEqual({});
    expect(report(out, [])).toContain("0 of 16 deck names covered");
  });
});
