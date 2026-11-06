import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs script without types
import { isCandidate, normalize } from "../../scripts/names-content/similar-rules.mjs";

const candidate = isCandidate as (a: string, b: string) => boolean;
const norm = normalize as (name: string) => string;

// Forms of the same name the rules must propose (PRD name-detail §6.3).
const MATCH: [string, string][] = [
  ["אריאל", "אריאלה"], // feminine ־ה
  ["דניאל", "דניאלה"],
  ["מיכאל", "מיכאלה"],
  ["יונתן", "יהונתן"], // יו־ / יהו־ spellings meet at נתן
  ["אליה", "אלייה"], // doubled י
  ["דניאל", "דנייאל"],
  ["אור", "אורי"], // same word
  ["אור", "אוריה"],
  ["אורי", "אוריאל"], // plus ־אל
  ["ארי", "אריאל"],
  ["נתן", "נתנאל"],
  ["נוי", "נויה"],
  ["טל", "טליה"], // plus ־יה
  ["עדי", "עדיה"],
  ["הלל", "הללי"],
  // Decided: רון/רוני stays a candidate. רוני is built on רון, and the same consonants
  // rule can't tell it apart anyway.
  ["רון", "רוני"],
];

// Names that only sound or look alike. שירה/שרה is not here: after removing matres and
// the final ה both are שר, so the rules propose it and the content batch rejects it.
const NO_MATCH: [string, string][] = [
  ["נוי", "נועה"],
  ["טל", "טום"],
  ["ים", "יאיר"],
  ["אור", "אורן"],
  ["יואב", "יובל"],
  ["ליה", "לאה"],
  ["מיכל", "מיכאל"],
  ["שקד", "שחר"],
];

describe("similar-name candidate rules", () => {
  it("normalize final letters, a final ה/א and the matres ו/י", () => {
    expect(norm("יונתן")).toBe("ינתנ");
    expect(norm("אלייה")).toBe("אל");
    expect(norm("דנייאל")).toBe(norm("דניאל"));
    expect(norm("אור")).toBe("אר");
  });

  it.each(MATCH)("propose %s and %s", (a, b) => {
    expect(candidate(a, b)).toBe(true);
    expect(candidate(b, a)).toBe(true);
  });

  it.each(NO_MATCH)("don't propose %s and %s", (a, b) => {
    expect(candidate(a, b)).toBe(false);
    expect(candidate(b, a)).toBe(false);
  });

  it("never propose a name for itself", () => {
    expect(candidate("אריאל", "אריאל")).toBe(false);
  });

  it("check every pair of deck names in under 5 s", () => {
    const deck = Object.keys(JSON.parse(readFileSync("data/names/name-content.json", "utf8")).names);
    const start = performance.now();
    for (const a of deck) for (const b of deck) candidate(a, b);
    expect(performance.now() - start).toBeLessThan(5000);
  });
});
