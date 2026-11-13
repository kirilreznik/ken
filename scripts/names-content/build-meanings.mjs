// Builds the meaning groups for "על שם קרוב משפחה" from content-src/meanings.json:
//   data/names/name-meanings.json   – each deck name's group ids (merged into the card content
//                                    by scripts/build-names-data.mjs, like the themes)
//   src/lib/names/meaning-groups.json – the group labels and the Yiddish/Ladino table (bundled)
//   content-src/MEANINGS-REPORT.md  – every group with its names, for the owner's spot-check
//
//   node scripts/names-content/build-meanings.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (f) => JSON.parse(readFileSync(resolve(root, f), "utf8"));

export function buildMeanings({ source, content }) {
  const errors = [];
  const names = {};
  for (const [id, group] of Object.entries(source.groups)) {
    if (!/^[a-z_]+$/.test(id)) errors.push(`group id ${id}: lowercase letters only`);
    const seen = new Set();
    for (const name of group.names) {
      if (!content[name]) errors.push(`${id}: ${name} is not in the deck`);
      if (seen.has(name)) errors.push(`${id}: ${name} listed twice`);
      seen.add(name);
      (names[name] ??= []).push(id);
    }
  }
  const spellings = new Set();
  for (const r of source.relatives) {
    for (const g of r.groups) if (!source.groups[g]) errors.push(`relative ${r.spellings[0]}: no group ${g}`);
    for (const s of r.spellings) {
      if (spellings.has(s)) errors.push(`relative spelling ${s} listed twice`);
      spellings.add(s);
    }
  }
  const groups = Object.fromEntries(Object.entries(source.groups).map(([id, g]) => [id, g.label]));
  return { names, groups, relatives: source.relatives, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const source = read("data/names/content-src/meanings.json");
  const content = read("data/names/name-content.json").names;
  const { names, groups, relatives, errors } = buildMeanings({ source, content });
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  writeFileSync(
    resolve(root, "data/names/name-meanings.json"),
    JSON.stringify({ _about: "Meaning group ids per deck name. Built by scripts/names-content/build-meanings.mjs from content-src/meanings.json; do not edit by hand.", names }, null, 1) + "\n",
  );
  writeFileSync(
    resolve(root, "src/lib/names/meaning-groups.json"),
    JSON.stringify({ _about: "Built by scripts/names-content/build-meanings.mjs from data/names/content-src/meanings.json; do not edit by hand.", groups, relatives }, null, 1) + "\n",
  );
  const lines = [
    "# Meaning groups report",
    "",
    `Built by \`scripts/names-content/build-meanings.mjs\`. ${Object.keys(groups).length} groups, ${Object.keys(names).length} of ${Object.keys(content).length} deck names in at least one. A name is listed only when its card intro states that meaning. "על שם קרוב משפחה" offers the names that share a group with the relative's name, plus the name's other forms.`,
    "",
    "## Groups",
    "",
    ...Object.entries(source.groups).map(([id, g]) => `- **${g.label}** (\`${id}\`, ${g.names.length}): ${g.names.join(", ")}`),
    "",
    "## Older names that aren't in the deck",
    "",
    "Yiddish and Ladino names a grandparent may carry, with the meaning that links them to a group (traditional pairs such as צבי־הירש, זאב־וולף, דב־בער, אריה־לייב, מנחם־מענדל). For the owner to check.",
    "",
    "| Spellings | Language | Means | Group |",
    "| --- | --- | --- | --- |",
    ...relatives.map((r) => `| ${r.spellings.join(", ")} | ${r.lang} | ${r.means} | ${r.groups.map((g) => groups[g]).join(", ")} |`),
    "",
  ];
  writeFileSync(resolve(root, "data/names/content-src/MEANINGS-REPORT.md"), lines.join("\n"));
  console.log(`meanings: ${Object.keys(groups).length} groups, ${Object.keys(names).length} names, ${relatives.length} older names`);
}
