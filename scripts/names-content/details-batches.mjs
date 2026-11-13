#!/usr/bin/env node
// The fixed split of deck names into the 20 details content batches (PRD name-detail §6.5).
//
//   node scripts/names-content/details-batches.mjs 3
//
// Deck order: names in data/names/name-content.json, by 2024 births (names.json `y[24]`,
// missing = 0) descending, ties by Hebrew name. Batch n = 65 names; batch 20 takes the rest.
// The split was fixed when the batches were drafted, so it still counts the cards the Jewish-sector
// rule later left out (content-src/sector-excluded.json `cards`); build-details skips those.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const BATCHES = 20;
export const BATCH_SIZE = 65;

const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), "utf8"));

/** 2024 births per name (names.json `y[24]`). */
export function births2024() {
  const births = new Map();
  for (const row of readJson("data/names/names.json").names) births.set(row.n, row.y?.[24] ?? 0);
  return births;
}

/** Every deck name, most given in 2024 first. */
export function deckOrder() {
  const births = births2024();
  const count = (name) => births.get(name) ?? 0;
  const left = readJson("data/names/content-src/sector-excluded.json").cards ?? [];
  return [...Object.keys(readJson("data/names/name-content.json").names), ...left].sort(
    (a, b) => count(b) - count(a) || a.localeCompare(b, "he"),
  );
}

/** The names of batch n (1..20). */
export function batch(n, order = deckOrder()) {
  if (!Number.isInteger(n) || n < 1 || n > BATCHES) throw new Error(`batch must be 1..${BATCHES}, got ${n}`);
  return order.slice(BATCH_SIZE * (n - 1), n === BATCHES ? undefined : BATCH_SIZE * n);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const n = Number(process.argv[2]);
  if (!n) {
    console.error("usage: details-batches.mjs <1..20>");
    process.exit(1);
  }
  const births = births2024();
  for (const name of batch(n)) console.log(`${name}\t${births.get(name) ?? 0}`);
}
