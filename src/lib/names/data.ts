import type { NameContent, NameDetail, NameStats } from "./types";

/** First and last year in each NameStats.y array. */
export const FIRST_TREND_YEAR = 2000;
export const LAST_YEAR = 2024;

/** Written by scripts/build-names-data.mjs: file names of the hashed data files. */
export interface DataManifest {
  names: string;
  content: string;
  builtAt: string;
}

/** names.json as stored: the name is under `n`. */
export interface RawNamesFile {
  firstTrendYear: number;
  lastYear: number;
  names: { n: string; m: number; f: number; s: string; y?: number[] }[];
}

export interface RawContentFile {
  names: Record<string, NameContent>;
}

/** name-details.json as stored; entries are checked by parseDetails, not trusted. */
export interface RawDetailsFile {
  _about?: string;
  names?: Record<string, unknown>;
}

export const DATA_BASE = "/names/data/";
const FALLBACK: DataManifest = { names: "names.json", content: "content.json", builtAt: "" };

export function parseNames(raw: RawNamesFile): Map<string, NameStats> {
  if (raw.firstTrendYear !== FIRST_TREND_YEAR || raw.lastYear !== LAST_YEAR) {
    throw new Error(`Unexpected names data years ${raw.firstTrendYear}-${raw.lastYear}`);
  }
  const map = new Map<string, NameStats>();
  for (const { n, m, f, s, y } of raw.names) {
    map.set(n, y ? { name: n, m, f, s, y } : { name: n, m, f, s });
  }
  return map;
}

export function parseContent(raw: RawContentFile): Map<string, NameContent> {
  return new Map(Object.entries(raw.names));
}

/** Details keyed by name; drops entries that aren't objects and fills missing fields. */
export function parseDetails(raw: RawDetailsFile): Map<string, NameDetail> {
  const map = new Map<string, NameDetail>();
  const names = raw && typeof raw === "object" ? raw.names : undefined;
  if (!names || typeof names !== "object") return map;
  for (const [name, entry] of Object.entries(names)) {
    if (name === "_about" || !entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const { story, similar } = entry as { story?: unknown; similar?: unknown };
    map.set(name, {
      story: typeof story === "string" ? story : null,
      similar: Array.isArray(similar) ? similar.filter((s): s is string => typeof s === "string") : [],
    });
  }
  return map;
}

/** Names that have a content entry, in file order. */
export function contentNames(content: Map<string, NameContent>): string[] {
  return [...content.keys()];
}

let manifestPromise: Promise<DataManifest> | null = null;

function loadManifest(): Promise<DataManifest> {
  manifestPromise ??= fetch(`${DATA_BASE}manifest.json`, { cache: "no-cache" })
    .then((res) => (res.ok ? (res.json() as Promise<DataManifest>) : FALLBACK))
    .catch(() => FALLBACK);
  return manifestPromise;
}

async function fetchJson<T>(file: string): Promise<T> {
  const res = await fetch(DATA_BASE + file);
  if (!res.ok) throw new Error(`Names data ${file}: ${res.status}`);
  return (await res.json()) as T;
}

/** All names with their births, keyed by name. */
export async function loadNames(): Promise<Map<string, NameStats>> {
  const manifest = await loadManifest();
  return parseNames(await fetchJson<RawNamesFile>(manifest.names));
}

/** Card content for the names that have it, keyed by name, in file order. */
export async function loadContent(): Promise<Map<string, NameContent>> {
  const manifest = await loadManifest();
  return parseContent(await fetchJson<RawContentFile>(manifest.content));
}
