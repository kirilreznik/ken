#!/usr/bin/env node
// Writes data/names/content-src/sectors.json: births per name in the Jewish sector vs all sectors,
// from the same CBS data as names.json (release 391/2025 via babynamesIL, pinned commit).
// build-content.mjs reads it to keep the deck to names in use among Jewish Israelis (sector.mjs).
//
//   node scripts/names-content/build-sectors.mjs [path/to/babynamesIL/data-raw]
//
// Per name: [jewishAllTime, allAllTime, jewishSince2000, allSince2000]. The "since 2000" numbers
// come from the yearly table, which only has years with 5+ babies per sector, sex and name.
// Names given only in the Jewish sector are left out (they always pass).
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PINNED_COMMIT = "63b88aac07e49a81bec5da9b9303b39439f7604c";
const RAW_BASE = `https://raw.githubusercontent.com/aviezerl/babynamesIL/${PINNED_COMMIT}/data-raw`;
const SINCE = 2000;
const SECTORS = new Set(["Jewish", "Muslim", "Christian-Arab", "Druze"]);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(root, "data/names/content-src/sectors.json");

async function load(file) {
  const dir = process.argv[2];
  if (dir) return readFile(join(dir, file), "utf8");
  const res = await fetch(`${RAW_BASE}/${file}`);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  return res.text();
}

/** The CSVs have no commas inside fields except quoted ones like "ש""י"; a tiny RFC 4180 parser. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const [yearly, totals] = await Promise.all([load("babynamesIL.csv").then(parseCsv), load("babynamesIL_totals.csv").then(parseCsv)]);
const by = new Map();
const entry = (name) => {
  let e = by.get(name);
  if (!e) by.set(name, (e = [0, 0, 0, 0]));
  return e;
};
for (const r of totals) {
  if (!SECTORS.has(r.sector)) continue;
  const e = entry(r.name.trim());
  const n = Number(r.total);
  if (r.sector === "Jewish") e[0] += n;
  e[1] += n;
}
for (const r of yearly) {
  if (!SECTORS.has(r.sector) || Number(r.year) < SINCE) continue;
  const e = entry(r.name.trim());
  const n = Number(r.n);
  if (r.sector === "Jewish") e[2] += n;
  e[3] += n;
}
const names = Object.fromEntries(
  [...by].filter(([, e]) => e[0] < e[1] || e[2] < e[3]).sort(([a], [b]) => a.localeCompare(b, "he")),
);
const file = {
  _about:
    "Births per name: [Jewish sector all time, all sectors all time, Jewish since 2000, all since 2000]. CBS release 391/2025 via babynamesIL. Names given only in the Jewish sector are left out. Built by scripts/names-content/build-sectors.mjs; do not edit by hand.",
  via: `https://github.com/aviezerl/babynamesIL/tree/${PINNED_COMMIT}`,
  since: SINCE,
  names,
};
await writeFile(OUT, JSON.stringify(file) .replace(/\],"/g, '],\n"') + "\n");
console.log(`build-sectors: ${Object.keys(names).length} names with births outside the Jewish sector`);
