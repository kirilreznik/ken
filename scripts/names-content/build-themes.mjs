// Builds the theme tags for the swiper's "נושאים" filter.
//
// Input:  data/names/content-src/themes.json  hand-kept lists, one per theme (owner reviews them)
// Output: data/names/name-themes.json         { names: { name: [themeId, ...] } }, read by
//                                              scripts/build-names-data.mjs into the content file
//         data/names/content-src/THEMES.md    review report: every theme's names, untagged names
//
// Checks: every listed name has a card in name-content.json, no name twice in a theme, and a
// name in "bible" must carry a checked Bible reference on its card. Themes with `derived`
// (unisex) have no list: the app computes them from the CBS numbers.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = resolve(root, "data/names");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

const src = readJson(resolve(dataDir, "content-src/themes.json"));
const content = readJson(resolve(dataDir, "name-content.json")).names;
// Names the Jewish-sector rule left out of the deck (build-content.mjs) stay on the lists but are skipped.
const excluded = new Set(readJson(resolve(dataDir, "content-src/sector-excluded.json")).names);
const stats = new Map(readJson(resolve(dataDir, "names.json")).names.map((n) => [n.n, n]));

// Same rule as src/lib/names/sex.ts, for the report only.
function unisex({ m, f }) {
  const total = m + f;
  if (total < 200) return m === f;
  return m / total < 0.9 && f / total < 0.9;
}

const errors = [];
const tags = new Map(Object.keys(content).map((n) => [n, []]));
for (const theme of src.themes) {
  if (theme.derived) continue;
  const seen = new Set();
  for (const name of theme.names) {
    if (seen.has(name)) errors.push(`${theme.id}: ${name} listed twice`);
    seen.add(name);
    if (!content[name] && excluded.has(name)) continue;
    if (!content[name]) {
      errors.push(`${theme.id}: ${name} has no card in name-content.json`);
      continue;
    }
    if (theme.id === "bible" && !content[name].bible) errors.push(`bible: ${name} has no checked Bible reference`);
    tags.get(name).push(theme.id);
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const names = {};
for (const [name, ids] of tags) if (ids.length) names[name] = ids;
writeFileSync(
  resolve(dataDir, "name-themes.json"),
  JSON.stringify(
    {
      _about: "Theme tags per name. Built by scripts/names-content/build-themes.mjs from content-src/themes.json; do not edit by hand.",
      names,
    },
    null,
    1,
  ) + "\n",
);

const lines = [
  "# Theme tags: review report",
  "",
  "Built by `scripts/names-content/build-themes.mjs` from `themes.json`. Edit the lists in `themes.json`, never this file.",
  "",
  `Cards: ${tags.size}. With at least one theme (unisex included): ${
    [...tags].filter(([n, ids]) => ids.length || (stats.get(n) && unisex(stats.get(n)))).length
  }.`,
  "",
];
for (const theme of src.themes) {
  const list = theme.derived
    ? Object.keys(content).filter((n) => stats.get(n) && unisex(stats.get(n)))
    : theme.names.filter((n) => content[n]);
  lines.push(`## ${theme.label} (\`${theme.id}\`, ${list.length})`, "", `_${theme.rule}_`, "", list.join(", "), "");
}
const untagged = [...tags].filter(([n, ids]) => !ids.length && !(stats.get(n) && unisex(stats.get(n)))).map(([n]) => n);
lines.push(`## No theme (${untagged.length})`, "", untagged.join(", ") || "None.", "");
writeFileSync(resolve(dataDir, "content-src/THEMES.md"), lines.join("\n"));
console.log(`themes: ${Object.keys(names).length} names tagged, ${untagged.length} with no theme`);
