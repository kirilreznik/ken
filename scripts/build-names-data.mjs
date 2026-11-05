// Builds the static names data served at /names/data/ from data/names/*.json.
// Runs before every `npm run build` (prebuild) and with `npm run names:data`.
//
// Writes minified, content-hashed copies (names.<hash>.json, content.<hash>.json) so
// they can be cached forever, plus manifest.json pointing at them (read by
// src/lib/names/data.ts). Hashed files from earlier builds are removed.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HASHED = /^(names|content)\.[0-9a-f]+\.json$/;

function minified(file) {
  return JSON.stringify(JSON.parse(readFileSync(file, "utf8")));
}

function hashed(prefix, body) {
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 12);
  return `${prefix}.${hash}.json`;
}

/**
 * @param {{ srcDir: string, outDir: string, now?: Date }} options
 * @returns {{ names: string, content: string, builtAt: string }} the manifest written
 */
export function buildNamesData({ srcDir, outDir, now = new Date() }) {
  const files = {
    names: minified(resolve(srcDir, "names.json")),
    content: minified(resolve(srcDir, "name-content.json")),
  };
  const manifest = {
    names: hashed("names", files.names),
    content: hashed("content", files.content),
    builtAt: now.toISOString(),
  };

  mkdirSync(outDir, { recursive: true });
  for (const file of readdirSync(outDir)) {
    if (HASHED.test(file) && file !== manifest.names && file !== manifest.content) {
      rmSync(resolve(outDir, file));
    }
  }
  writeFileSync(resolve(outDir, manifest.names), files.names);
  writeFileSync(resolve(outDir, manifest.content), files.content);
  writeFileSync(resolve(outDir, "manifest.json"), JSON.stringify(manifest));
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const manifest = buildNamesData({
    srcDir: resolve(root, "data/names"),
    outDir: resolve(root, "public/names/data"),
  });
  console.log(`names data: ${manifest.names}, ${manifest.content}`);
}
