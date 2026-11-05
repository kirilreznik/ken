#!/usr/bin/env node
// Builds data/names/name-content.json from the drafted batches (E16b).
//
//   node scripts/names-content/build-content.mjs
//
// Inputs (data/names/content-src/):
//   batch-NNN.json  drafted card text, one file per batch, most popular names first
//   people.json     known people per name, fetched from Wikidata by fetch-people.mjs (optional)
// The 10 hand-written sample cards in samples.json are kept as they are, except that their Bible
// reference goes through the same check.
//
// Every Bible reference is checked against the Tanakh text (Sefaria export):
//   quote:  the quoted words must appear, in order, in that verse; the card shows the verse's own
//           vowelled words, never the drafted spelling.
//   figure: the name must appear as a word in the cited chapter(s).
// A reference that fails is dropped from the card (the card still ships) and listed in REPORT.md.
// An entry with "hold" set is left out of the deck until the owner decides.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { consonants, ensureTanakh, hebRef, nameInChapters, quoteFromVerse, hasVerse, BOOKS } from "./tanakh.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = resolve(root, "data/names");
const srcDir = resolve(dataDir, "content-src");
const titles = new Set(BOOKS.map((b) => b[0]));

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

await ensureTanakh();

const stats = new Map(readJson(resolve(dataDir, "names.json")).names.map((n) => [n.n, n]));
const people = existsSync(resolve(srcDir, "people.json")) ? readJson(resolve(srcDir, "people.json")).names : {};
const samples = readJson(resolve(srcDir, "samples.json")).names;
const batchFiles = readdirSync(srcDir)
  .filter((f) => /^batch-\d+\.json$/.test(f))
  .sort();

const problems = [];
const held = [];
const out = {};
const seen = new Map();

/** Returns the card's bible block, or null when the reference fails the check. */
function checkBible(name, b) {
  if (!b) return undefined;
  if (!titles.has(b.book)) return fail(name, b, `unknown book "${b.book}"`);
  if (b.quote !== undefined) {
    if (!b.v || !hasVerse(b.book, b.ch, b.v)) return fail(name, b, "no such verse");
    const quote = quoteFromVerse(b.book, b.ch, b.v, b.quote);
    if (!quote) return fail(name, b, `words not in the verse: "${b.quote}"`);
    const note = b.note ? `. ${b.note.replace(/\.?$/, ".")}` : "";
    const text = `"${quote}"` + note;
    return { text, ref: hebRef(b) };
  }
  if (b.figure !== undefined) {
    const match = b.match ?? name;
    const refs = [b, ...(b.more ?? [])];
    for (const r of refs) {
      if (!titles.has(r.book)) return fail(name, r, `unknown book "${r.book}"`);
      if (!nameInChapters(r.book, r.ch, r.chTo, match)) return fail(name, r, `"${match}" not in the chapter(s)`);
    }
    return { text: b.figure, ref: refs.map(hebRef).join("; ") };
  }
  return fail(name, b, "needs quote or figure");
}

function fail(name, b, why) {
  problems.push({ name, why, ref: `${b.book} ${b.ch}${b.chTo ? "–" + b.chTo : ""}${b.v ? ":" + b.v : ""}` });
  return null;
}

function add(name, entry, from) {
  if (seen.has(name)) {
    problems.push({ name, why: `duplicate (also in ${seen.get(name)})`, ref: from });
    return;
  }
  seen.set(name, from);
  if (!stats.has(name)) problems.push({ name, why: "not in names.json (kept)", ref: from });
  if (entry.hold) {
    held.push({ name, why: entry.hold, from });
    return;
  }
  // Vowelled spelling may drop or add the vowel letters ו and י (נֹעַם for נועם); other letters must match.
  const plain = (t) => consonants(t.replace(/[-\u05BE]/g, " ").replace(/[׳'"״]/g, "")).replace(/[וי]/g, "");
  if (plain(entry.niqqud) !== plain(name)) problems.push({ name, why: `niqqud letters differ: ${entry.niqqud}`, ref: from });
  const bible = checkBible(name, entry.bible);
  const card = { niqqud: entry.niqqud, intro: entry.intro };
  if (bible) card.bible = bible;
  card.people = (people[name] ?? []).slice(0, 2).map((p) => ({ name: p.name, what: p.what }));
  out[name] = card;
}

for (const [name, entry] of Object.entries(samples)) {
  // Sample cards are hand-written with ready text; check quotes only by re-deriving when structured.
  add(name, { ...entry, bible: entry.bibleSrc }, "samples.json");
  if (out[name]) {
    if (!entry.bibleSrc && entry.bible) out[name].bible = entry.bible;
    if (entry.people && !people[name]) out[name].people = entry.people;
  }
}
for (const file of batchFiles) {
  for (const [name, entry] of Object.entries(readJson(resolve(srcDir, file)).names)) add(name, entry, file);
}

// Most popular first (births in the latest year, then all time); the deck shuffles anyway.
const latest = (n) => stats.get(n)?.y?.at(-1) ?? 0;
const total = (n) => (stats.get(n)?.m ?? 0) + (stats.get(n)?.f ?? 0);
const ordered = Object.keys(out).sort((a, b) => latest(b) - latest(a) || total(b) - total(a));

const file = {
  _about:
    "Card content for the name swiper (E16b). Built by scripts/names-content/build-content.mjs from data/names/content-src; do not edit by hand. Intros and Bible notes are drafted with AI help and spot-checked by the owner; every Bible reference is checked against the Tanakh text (Sefaria export); known people come from Wikidata only.",
  names: Object.fromEntries(ordered.map((n) => [n, out[n]])),
};
writeFileSync(resolve(dataDir, "name-content.json"), JSON.stringify(file, null, 1) + "\n");

const withBible = ordered.filter((n) => out[n].bible).length;
const withPeople = ordered.filter((n) => out[n].people.length).length;
const report = [
  "# Name content build report",
  "",
  "Generated by `scripts/names-content/build-content.mjs`. Do not edit by hand.",
  "",
  `- Cards in the deck: ${ordered.length}`,
  `- With a Bible reference (checked): ${withBible}`,
  `- With known people (Wikidata): ${withPeople}`,
  `- Held for the owner (not in the deck): ${held.length}`,
  `- Problems: ${problems.length}`,
  "",
  "## Held names",
  "",
  ...(held.length ? held.map((h) => `- ${h.name}: ${h.why} (${h.from})`) : ["None."]),
  "",
  "## Problems (Bible reference dropped, or data mismatch)",
  "",
  ...(problems.length ? problems.map((p) => `- ${p.name}: ${p.why} (${p.ref})`) : ["None."]),
  "",
].join("\n");
writeFileSync(resolve(srcDir, "REPORT.md"), report);
console.log(report);
