#!/usr/bin/env node
// Adds the theme tags drafted in each batch ("themes": [...]) to content-src/themes.json.
// Only appends: names already in a list stay where they are, and the owner's edits are kept.
//
//   node scripts/names-content/apply-themes.mjs && node scripts/names-content/build-themes.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const srcDir = resolve(root, "data/names/content-src");
const file = resolve(srcDir, "themes.json");
const themes = JSON.parse(readFileSync(file, "utf8"));
const byId = new Map(themes.themes.filter((t) => !t.derived).map((t) => [t.id, t]));

let added = 0;
for (const f of readdirSync(srcDir).filter((x) => /^batch-\d+\.json$/.test(x)).sort()) {
  for (const [name, entry] of Object.entries(JSON.parse(readFileSync(resolve(srcDir, f), "utf8")).names)) {
    for (const id of entry.themes ?? []) {
      const theme = byId.get(id);
      if (!theme) throw new Error(`${f}: ${name} has unknown theme "${id}"`);
      if (!theme.names.includes(name)) {
        theme.names.push(name);
        added++;
      }
    }
  }
}
writeFileSync(file, JSON.stringify(themes, null, 1) + "\n");
console.log(`apply-themes: ${added} tags added`);
