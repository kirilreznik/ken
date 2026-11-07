#!/usr/bin/env node
// Builds data/names/name-details.json (stories and similar names for the name sheet) from the
// drafted details batches, and writes DETAILS-REPORT.md (PRD name-detail §6.1, §6.4).
//
//   node scripts/names-content/build-details.mjs
//
// Inputs (data/names/content-src/): details-NNN.json, shape
//   { "_about": "...", "names": { "<name>": { "story": "<text>" | null, "storyNote"?: "...", "similar": [...] } } }
//
// Fails (exit 1) on: a story outside 140–480 chars; "!" or "?" in a story; a quote mark, a
// chapter/verse reference or a digit other than a 4-digit year in a story; a similar name that is
// the name itself or not a known name at all; a details name that isn't a deck name; a name in two
// batches. Warns on: a deck name with no entry; a Bible mention when the card has no checked verse;
// a story that shares more than 60% of its words with the intro.
// A similar name that is a known name (names.json) but has no card in the deck is dropped with a
// report line, since the user can't open it. Then symmetry: if A lists B, B lists A; every list is
// re-sorted by 2024 births (most first) and capped at 6.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS } from "./tanakh.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const STORY_MIN = 140;
export const STORY_MAX = 480;
export const SIMILAR_MAX = 6;
export const OVERLAP_MAX = 0.6;

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

/** Every details-NNN.json in dir, in file order: [{ file, data }]. */
export function readBatches(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^details-\d+\.json$/.test(f))
    .sort()
    .map((file) => ({ file, data: readJson(resolve(dir, file)) }));
}

const HEB = "א-ת";
// ״ between two Hebrew letters is an abbreviation (תנ״ך); anywhere else it's a quote mark.
const QUOTE = new RegExp(`["“”„«»]|(?<![${HEB}])״|״(?![${HEB}])`);
const BOOK_NAMES = BOOKS.map((b) => b[2]).sort((a, b) => b.length - a.length);
const HEB_NUM = `[${HEB}]{1,3}[׳'״"]?[${HEB}]?`;
const CHAPTER_VERSE = new RegExp(
  `(?:^|[^${HEB}])(?:פרק|פרקים|פסוק|פסוקים)(?![${HEB}])|\\d+\\s*:\\s*\\d+|(?:${BOOK_NAMES.join("|")})\\s+${HEB_NUM}\\s*,\\s*${HEB_NUM}(?![${HEB}])`,
);
const BIBLE_WORDS = /תנ["״]ך|בספר|בתורה|בנביאים/;

/** The failure rules a story breaks (empty when it's fine). */
export function storyProblems(story) {
  const problems = [];
  const len = [...story].length;
  if (len < STORY_MIN || len > STORY_MAX) problems.push(`story is ${len} chars (needs ${STORY_MIN}–${STORY_MAX})`);
  if (/[!?]/.test(story)) problems.push('story has "!" or "?"');
  if (QUOTE.test(story)) problems.push("story has a quote mark");
  if (CHAPTER_VERSE.test(story)) problems.push("story has a chapter/verse reference");
  if ((story.match(/\d+/g) ?? []).some((d) => d.length !== 4)) problems.push("story has a digit that isn't a 4-digit year");
  return problems;
}

const words = (text) =>
  text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

/** Share of the story's distinct words that also appear in the intro (0..1). */
export function introOverlap(story, intro) {
  const own = new Set(words(story));
  if (!own.size) return 0;
  const theirs = new Set(words(intro ?? ""));
  let shared = 0;
  for (const w of own) if (theirs.has(w)) shared++;
  return shared / own.size;
}

/**
 * Validates and merges the batches.
 * @param {{ batches: { file: string, data: any }[], cards: Record<string, any>, births: Map<string, number>, known: Set<string> }} input
 *   cards: the deck (name-content.json `names`); known: every name in names.json.
 * @returns {{ names: Record<string, { story: string | null, similar: string[] }>, failures: string[], warnings: string[], drops: string[], capped: string[], nullStories: { name: string, note: string }[], covered: number, deckSize: number }}
 */
export function buildDetails({ batches, cards, births, known }) {
  const failures = [];
  const warnings = [];
  const drops = [];
  const capped = [];
  const nullStories = [];
  let symmetryFills = 0;
  const seen = new Map();
  const entries = new Map();
  const count = (name) => births.get(name) ?? 0;
  const byBirths = (a, b) => count(b) - count(a) || a.localeCompare(b, "he");
  const deck = Object.keys(cards).sort(byBirths);

  for (const { file, data } of batches) {
    const names = data?.names;
    if (!names || typeof names !== "object") {
      failures.push(`${file}: no "names" object`);
      continue;
    }
    for (const [name, entry] of Object.entries(names)) {
      const at = `${file} ${name}`;
      if (seen.has(name)) {
        failures.push(`${at}: duplicate (also in ${seen.get(name)})`);
        continue;
      }
      seen.set(name, file);
      if (!cards[name]) {
        failures.push(`${at}: not a deck name`);
        continue;
      }
      const story = entry?.story ?? null;
      if (story !== null && typeof story !== "string") {
        failures.push(`${at}: story must be text or null`);
        continue;
      }
      if (story === null) nullStories.push({ name, note: entry?.storyNote ?? "(no note)" });
      else {
        for (const p of storyProblems(story)) failures.push(`${at}: ${p}`);
        if (BIBLE_WORDS.test(story) && !cards[name].bible) warnings.push(`${name}: story mentions the Bible but the card has no checked verse`);
        const overlap = introOverlap(story, cards[name].intro);
        if (overlap > OVERLAP_MAX) warnings.push(`${name}: story shares ${Math.round(overlap * 100)}% of its words with the intro`);
      }
      const similar = [];
      for (const other of Array.isArray(entry?.similar) ? entry.similar : []) {
        if (other === name) failures.push(`${at}: lists itself as similar`);
        else if (!cards[other] && !known.has(other)) failures.push(`${at}: similar "${other}" is not a deck name`);
        else if (!cards[other]) drops.push(`${name} → ${other}: no card in the deck`);
        else if (!similar.includes(other)) similar.push(other);
      }
      entries.set(name, { story, similar });
    }
  }

  // Symmetry: if A lists B, B lists A (B gets an entry with no story if it has none).
  for (const [name, entry] of [...entries]) {
    for (const other of entry.similar) {
      const back = entries.get(other) ?? { story: null, similar: [] };
      if (!back.similar.includes(name)) {
        back.similar.push(name);
        symmetryFills++;
      }
      entries.set(other, back);
    }
  }

  const names = {};
  for (const name of deck) {
    const entry = entries.get(name);
    if (!entry) continue;
    const sorted = [...entry.similar].sort(byBirths);
    if (sorted.length > SIMILAR_MAX) capped.push(`${name}: kept ${SIMILAR_MAX} of ${sorted.length}, cut ${sorted.slice(SIMILAR_MAX).join(", ")}`);
    names[name] = { story: entry.story, similar: sorted.slice(0, SIMILAR_MAX) };
  }

  const missing = deck.filter((name) => !seen.has(name));
  if (missing.length) warnings.unshift(`${missing.length} deck names have no details entry${missing.length <= 100 ? `: ${missing.join(", ")}` : ""}`);

  return { names, failures, warnings, drops, capped, nullStories, symmetryFills, covered: deck.length - missing.length, deckSize: deck.length };
}

/** DETAILS-REPORT.md text. */
export function report(result, batchFiles) {
  const stories = Object.values(result.names).filter((e) => e.story).length;
  const withSimilar = Object.values(result.names).filter((e) => e.similar.length).length;
  const list = (items) => (items.length ? items.map((i) => `- ${i}`).join("\n") : "None.");
  return `# Name details report

Generated by \`scripts/names-content/build-details.mjs\`; don't edit.

## Coverage

- Batches: ${batchFiles.length ? batchFiles.join(", ") : "none yet"}
- ${result.covered} of ${result.deckSize} deck names covered
- ${stories} stories, ${result.nullStories.length} null stories
- ${withSimilar} names with similar names (after the symmetry fill)
- ${result.symmetryFills} similar links added by the symmetry fill (A lists B, so B lists A)

## Null stories

${list(result.nullStories.map(({ name, note }) => `${name}: ${note}`))}

## Warnings

${list(result.warnings)}

## Dropped similar names

${list(result.drops)}

## Capped similar lists

${list(result.capped)}
`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const srcDir = resolve(root, "data/names/content-src");
  const cards = readJson(resolve(root, "data/names/name-content.json")).names;
  const rows = readJson(resolve(root, "data/names/names.json")).names;
  const births = new Map(rows.map((r) => [r.n, r.y?.[24] ?? 0]));
  const known = new Set(rows.map((r) => r.n));
  const batches = readBatches(srcDir);
  const result = buildDetails({ batches, cards, births, known });
  if (result.failures.length) {
    console.error(`build-details: ${result.failures.length} problem(s), nothing written:`);
    for (const f of result.failures) console.error(`  ${f}`);
    process.exit(1);
  }
  const file = {
    _about:
      "Stories and similar names for the name sheet (PRD name-detail §6). Generated by scripts/names-content/build-details.mjs from content-src/details-NNN.json; don't edit.",
    names: result.names,
  };
  writeFileSync(resolve(root, "data/names/name-details.json"), JSON.stringify(file, null, 1) + "\n");
  writeFileSync(resolve(srcDir, "DETAILS-REPORT.md"), report(result, batches.map((b) => b.file)));
  console.log(
    `build-details: ${result.covered} of ${result.deckSize} covered, ${result.warnings.length} warning(s), ${result.drops.length} drop(s)`,
  );
}
