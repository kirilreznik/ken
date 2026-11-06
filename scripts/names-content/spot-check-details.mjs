#!/usr/bin/env node
// Writes a random sample of a details batch for the owner's spot-check (PRD name-detail §6.1).
//
//   node scripts/names-content/spot-check-details.mjs 1 [count=10]
//
// Reads the built data/names/name-details.json (after symmetry), so run build-details.mjs first.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const srcDir = resolve(root, "data/names/content-src");
const batch = Number(process.argv[2]);
const count = Number(process.argv[3] ?? 10);
if (!batch) throw new Error("usage: spot-check-details.mjs <batch> [count]");
const tag = String(batch).padStart(3, "0");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const drafted = readJson(resolve(srcDir, `details-${tag}.json`)).names;
const built = readJson(resolve(root, "data/names/name-details.json")).names;
const cards = readJson(resolve(root, "data/names/name-content.json")).names;
const pool = Object.keys(drafted).filter((n) => built[n]);

// Seeded shuffle (same generator as spot-check.mjs), so the sample is the same every time for a batch.
let seed = batch * 2654435761;
const random = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(random() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}
const sample = pool.slice(0, count);
const cell = (s) => (s ?? "").replace(/\|/g, "\\|");

const lines = [
  `# Details spot-check, batch ${batch}`,
  "",
  `${sample.length} random entries out of ${pool.length} in this batch. Mark each row OK or write what to change.`,
  "Story: does it fit the intro, and is every fact one you'd stand behind? Similar: is each one really a form of the same name?",
  "",
  "| # | Name | Intro | Story | Similar | OK? |",
  "|---|---|---|---|---|---|",
  ...sample.map((n, i) => {
    const d = built[n];
    const story = d.story ?? `(no story: ${drafted[n].storyNote ?? ""})`;
    return `| ${i + 1} | ${cell(cards[n].niqqud ?? n)} | ${cell(cards[n].intro)} | ${cell(story)} | ${cell(d.similar.join(", "))} | |`;
  }),
  "",
];
writeFileSync(resolve(srcDir, `spot-check-details-${tag}.md`), lines.join("\n"));
console.log(`Wrote spot-check-details-${tag}.md (${sample.length} entries)`);
