import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs script without types
import { latin } from "../../scripts/names-content/latin.mjs";
// @ts-expect-error plain .mjs script without types
import { buildLatin } from "../../scripts/names-content/build-latin.mjs";
// @ts-expect-error plain .mjs script without types
import { buildMeanings } from "../../scripts/names-content/build-meanings.mjs";

const toLatin = latin as (niqqud: string) => string;

describe("Academy transliteration", () => {
  it.each([
    ["אֲרִיאֵל", "Ariel"],
    ["יַעֲקֹב", "Yaakov"],
    ["פְּנִינָה", "Pnina"],
    ["דְּבוֹרָה", "Dvora"],
    ["תְּהִלָּה", "Tehila"],
    ["יְהוּדָה", "Yehuda"],
    ["שַׁבְּתַאי", "Shabtai"],
    ["חַיִּים", "Hayim"],
    ["מִיכָאֵל", "Mikhael"],
    ["אֵיתָן", "Eitan"],
    ["עָמְרִי", "Omri"],
    ["זִיו", "Ziv"],
    ["נֹחַ", "Noah"],
    ["גַּיְא", "Gai"],
    ["פְרִידָא", "Frida"],
    ["שִׁי־לִי", "Shi-Li"],
  ])("%s → %s", (niqqud, expected) => {
    expect(toLatin(niqqud)).toBe(expected);
  });
});

describe("build-latin", () => {
  const kjv = new Set(["Michael", "Sarah"]);
  const content = { "מיכאל": { niqqud: "מִיכָאֵל" }, "שרה": { niqqud: "שָׂרָה" }, "אלין": { niqqud: "אלין" } };
  it("adds the international form, drops it when it equals the Academy one, and skips unpointed names", () => {
    const out = buildLatin({
      content,
      overrides: {},
      international: { "מיכאל": { form: "Michael", source: "bible" }, "שרה": { form: "Sara", source: "borrowed:en" } },
      kjv,
    });
    expect(out.names["מיכאל"]).toEqual({ he: "Mikhael", intl: "Michael" });
    expect(out.names["שרה"]).toEqual({ he: "Sara" });
    expect(out.unpointed).toEqual(["אלין"]);
    expect(out.failures).toEqual([]);
  });
  it("fails a Bible form that isn't in the KJV text", () => {
    const out = buildLatin({ content, overrides: {}, international: { "שרה": { form: "Sarai", source: "bible" } }, kjv });
    expect(out.failures[0]).toMatch(/KJV/);
  });
  it("keeps the data in step with the deck", () => {
    const data = JSON.parse(readFileSync("data/names/name-latin.json", "utf8")).names;
    expect(data["מיכאל"]).toEqual({ he: "Mikhael", intl: "Michael" });
    expect(data["נועה"].he).toBe("Noa");
  });
});

describe("build-meanings", () => {
  it("reports names that aren't in the deck and unknown groups", () => {
    const out = buildMeanings({
      source: { groups: { light: { label: "אור", names: ["אור", "זיו"] } }, relatives: [{ spellings: ["x"], lang: "יידיש", means: "y", groups: ["nope"] }] },
      content: { "אור": {} },
    });
    expect(out.names).toEqual({ "אור": ["light"], "זיו": ["light"] });
    expect(out.errors).toEqual(["light: זיו is not in the deck", "relative x: no group nope"]);
  });
});
