// Builds data/names/name-latin.json: each deck name in Latin letters.
//   he   – the Academy of the Hebrew Language's simplified rules, from the card's niqqud
//          (scripts/names-content/latin.mjs), or content-src/latin-overrides.json.
//   intl – the international form, from the hand-made content-src/latin-international.json.
//          Bible forms are checked word by word against the King James Bible text.
// Names whose niqqud has no vowel points get no `he` (the rules can't read them); the report
// lists them. Writes content-src/LATIN-REPORT.md.
//
//   node scripts/names-content/build-latin.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { latin } from "./latin.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const src = resolve(root, "data/names/content-src");
const read = (f) => JSON.parse(readFileSync(f, "utf8"));

const KJV_URL = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/txt/KJV.txt";
const KJV_CACHE = resolve(root, ".cache/kjv/KJV.txt");

async function kjvWords() {
  if (!existsSync(KJV_CACHE)) {
    const res = await fetch(KJV_URL);
    if (!res.ok) throw new Error(`KJV download: ${res.status}`);
    mkdirSync(dirname(KJV_CACHE), { recursive: true });
    writeFileSync(KJV_CACHE, await res.text());
  }
  return new Set(readFileSync(KJV_CACHE, "utf8").match(/[A-Za-z]+/g));
}

// Vowel points, or a shuruk or dagesh alone (רוּת).
const POINTS = /[\u05B0-\u05BC\u05C7]/;

export function buildLatin({ content, overrides, international, kjv }) {
  const names = {};
  const unpointed = [];
  const failures = [];
  const dropped = [];
  for (const [name, entry] of Object.entries(content)) {
    const over = overrides[name];
    const he = over ? over.he : POINTS.test(entry.niqqud) ? latin(entry.niqqud) : null;
    if (!he) unpointed.push(name);
    const out = {};
    if (he) out.he = he;
    const intl = international[name];
    if (intl) {
      if (intl.source === "bible" && !intl.form.split(/\s+/).every((w) => kjv.has(w))) failures.push(`${name} → ${intl.form}: not found in the KJV text`);
      else if (he && intl.form.toLowerCase() === he.toLowerCase()) dropped.push(name);
      else out.intl = intl.form;
    }
    if (out.he || out.intl) names[name] = out;
  }
  for (const name of Object.keys(international)) if (!content[name]) failures.push(`${name}: in latin-international.json but not in the deck`);
  for (const name of Object.keys(overrides)) if (!content[name]) failures.push(`${name}: in latin-overrides.json but not in the deck`);
  return { names, unpointed, failures, dropped };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const content = read(resolve(root, "data/names/name-content.json")).names;
  const overrides = read(resolve(src, "latin-overrides.json")).names;
  const international = read(resolve(src, "latin-international.json")).names;
  const { names, unpointed, failures, dropped } = buildLatin({ content, overrides, international, kjv: await kjvWords() });
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  writeFileSync(
    resolve(root, "data/names/name-latin.json"),
    JSON.stringify(
      {
        _about:
          "Latin spellings for the name swiper. Built by scripts/names-content/build-latin.mjs; do not edit by hand. `he`: the Academy of the Hebrew Language's simplified transliteration rules, derived from the card's niqqud (exceptions in content-src/latin-overrides.json). `intl`: the international form from content-src/latin-international.json (Bible forms checked against the KJV text).",
        names,
      },
      null,
      1,
    ) + "\n",
  );
  const intlCount = Object.values(names).filter((n) => n.intl).length;
  const heCount = Object.values(names).filter((n) => n.he).length;
  const lines = [
    "# Latin spellings report",
    "",
    `Built by \`scripts/names-content/build-latin.mjs\`. ${heCount} of ${Object.keys(content).length} deck names have an Academy spelling; ${intlCount} also have an international form.`,
    "",
    "## How the Academy spelling is made",
    "",
    "The rules of the Academy of the Hebrew Language for transliteration, simplified version: no diacritics, no mark for א or ע, no doubled letters. The script reads the card's niqqud, so a dagesh decides b/v, k/kh and p/f. A shva is written as e only where modern Hebrew says it (at the start before י ל מ נ ר, before א ה ע, or when the two consonants can't start a syllable). Exceptions are in `latin-overrides.json`, each with a reason.",
    "",
    "## International forms",
    "",
    "From the hand-made `latin-international.json`: `bible` forms are the English (King James) Bible form, checked against the KJV text; `borrowed:<lang>` forms are the spelling in the language the name came from. Forms equal to the Academy spelling are not shown:",
    "",
    dropped.join(", ") || "none",
    "",
    "## Overrides",
    "",
    ...Object.entries(overrides).map(([n, o]) => `- ${n} → ${o.he}: ${o.reason}`),
    "",
    `## No spelling (${unpointed.length} names without vowel points)`,
    "",
    "The rules can't read a name without niqqud, so these show no Academy spelling until their niqqud is written:",
    "",
    unpointed.join(", "),
    "",
    "## All spellings",
    "",
    "| Name | Academy | International |",
    "| --- | --- | --- |",
    ...Object.entries(names).map(([n, v]) => `| ${n} | ${v.he ?? ""} | ${v.intl ?? ""} |`),
    "",
  ];
  writeFileSync(resolve(src, "LATIN-REPORT.md"), lines.join("\n"));
  console.log(`latin: ${heCount} Academy, ${intlCount} international, ${unpointed.length} without niqqud`);
}
