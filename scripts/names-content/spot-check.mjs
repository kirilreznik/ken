#!/usr/bin/env node
// Writes a random sample of a batch's built cards for the owner's spot-check (E16b QA).
//
//   node scripts/names-content/spot-check.mjs 1 [count=25]
//
// Reads the built data/names/name-content.json, so run build-content.mjs first.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const srcDir = resolve(root, "data/names/content-src");
const batch = Number(process.argv[2]);
const count = Number(process.argv[3] ?? 25);
if (!batch) throw new Error("usage: spot-check.mjs <batch> [count]");
const tag = String(batch).padStart(3, "0");

const drafted = JSON.parse(readFileSync(resolve(srcDir, `batch-${tag}.json`), "utf8")).names;
const built = JSON.parse(readFileSync(resolve(root, "data/names/name-content.json"), "utf8")).names;
const pool = Object.keys(drafted).filter((n) => built[n]);

// Seeded shuffle, so the sample is the same every time for a batch.
let seed = batch * 2654435761;
const random = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(random() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}
const sample = pool.slice(0, count);
const cell = (s) => (s ?? "").replace(/\|/g, "\\|");

const lines = [
  `# Spot-check, batch ${batch}`,
  "",
  `${sample.length} random cards out of ${pool.length} in this batch. Mark each row OK or write what to change.`,
  "Bible quotes were matched word by word against the Tanakh text, so check only that the verse fits the name.",
  "",
  "| # | Name | Intro | From the Bible | Ref | People | OK? |",
  "|---|---|---|---|---|---|---|",
  ...sample.map((n, i) => {
    const c = built[n];
    const people = c.people.map((p) => `${p.name} (${p.what})`).join("; ");
    return `| ${i + 1} | ${cell(c.niqqud)} | ${cell(c.intro)} | ${cell(c.bible?.text)} | ${cell(c.bible?.ref)} | ${cell(people)} | |`;
  }),
  "",
];
writeFileSync(resolve(srcDir, `spot-check-${tag}.md`), lines.join("\n"));
console.log(`Wrote spot-check-${tag}.md (${sample.length} cards)`);
