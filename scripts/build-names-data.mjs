// Builds the static names data served at /names/data/ from data/names/*.json.
// Runs before every `npm run build` (prebuild) and with `npm run names:data`.
//
// Writes minified, content-hashed copies (names.<hash>.json, content.<hash>.json,
// details.<hash>.json) so they can be cached forever, plus manifest.json pointing at them (read by
// src/lib/names/data.ts). Hashed files from earlier builds are removed.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HASHED = /^(names|content|details)\.[0-9a-f]+\.json$/;

function minified(file) {
  return JSON.stringify(JSON.parse(readFileSync(file, "utf8")));
}

/**
 * The card content with each name's theme tags (name-themes.json, when present) added as
 * `themes`, so the app loads one file.
 */
function contentWithThemes(srcDir) {
  const content = JSON.parse(readFileSync(resolve(srcDir, "name-content.json"), "utf8"));
  const themesFile = resolve(srcDir, "name-themes.json");
  if (!existsSync(themesFile)) return JSON.stringify(content);
  const themes = JSON.parse(readFileSync(themesFile, "utf8")).names;
  for (const [name, ids] of Object.entries(themes)) {
    if (content.names[name]) content.names[name].themes = ids;
  }
  return JSON.stringify(content);
}

/** The sheet's stories and similar names (name-details.json); empty when not written yet. */
function details(srcDir) {
  const file = resolve(srcDir, "name-details.json");
  return existsSync(file) ? minified(file) : JSON.stringify({ names: {} });
}

function hashed(prefix, body) {
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 12);
  return `${prefix}.${hash}.json`;
}

/**
 * @param {{ srcDir: string, outDir: string, now?: Date }} options
 * @returns {{ names: string, content: string, details: string, builtAt: string }} the manifest written
 */
export function buildNamesData({ srcDir, outDir, now = new Date() }) {
  const files = {
    names: minified(resolve(srcDir, "names.json")),
    content: contentWithThemes(srcDir),
    details: details(srcDir),
  };
  const manifest = {
    names: hashed("names", files.names),
    content: hashed("content", files.content),
    details: hashed("details", files.details),
    builtAt: now.toISOString(),
  };

  mkdirSync(outDir, { recursive: true });
  const current = new Set([manifest.names, manifest.content, manifest.details]);
  for (const file of readdirSync(outDir)) {
    if (HASHED.test(file) && !current.has(file)) rmSync(resolve(outDir, file));
  }
  writeFileSync(resolve(outDir, manifest.names), files.names);
  writeFileSync(resolve(outDir, manifest.content), files.content);
  writeFileSync(resolve(outDir, manifest.details), files.details);
  writeFileSync(resolve(outDir, "manifest.json"), JSON.stringify(manifest));
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const manifest = buildNamesData({
    srcDir: resolve(root, "data/names"),
    outDir: resolve(root, "public/names/data"),
  });
  console.log(`names data: ${manifest.names}, ${manifest.content}, ${manifest.details}`);
}
