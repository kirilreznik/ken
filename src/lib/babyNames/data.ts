/**
 * Build-time data for the public name pages (/baby-names). Reads the same files the swiper
 * ships (data/names/*.json) from disk, so the pages never drift from the cards. Server only:
 * every page is statically generated, so this runs at build time.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseContent, parseDetails, parseNames, type RawContentFile, type RawDetailsFile, type RawNamesFile } from "@/lib/names/data";
import { countLine, lastYearCount, rankByLastYear, trend, type Trend } from "@/lib/names/popularity";
import { sexSplit, sexTag, type SexSplit } from "@/lib/names/sex";
import type { NameContent, NameDetail, NameStats, SexTag } from "@/lib/names/types";

/**
 * Pilot cutoff (SEO plan, owner approved 2026-11-13): a name page is open to search engines
 * when at least this many babies got the name in 2024. That is 288 of the 1,937 deck names;
 * the rest are "noindex, follow" until we decide to open more.
 */
export const INDEX_MIN_2024 = 100;

export interface NamePage {
  name: string;
  stats: NameStats;
  content: NameContent;
  detail: NameDetail;
  /** 2024 rank among all CBS names (both sexes), or null with no 2024 births. */
  rank: number | null;
  count2024: number;
  countLine: string;
  sexTag: SexTag;
  split: SexSplit;
  trend: Trend | null;
  /** Open to search engines (INDEX_MIN_2024). */
  indexed: boolean;
}

interface PerNameFile<T> {
  names: Record<string, T>;
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "data/names", file), "utf8")) as T;
}

let cache: { pages: NamePage[]; byName: Map<string, NamePage> } | null = null;

function load() {
  if (cache) return cache;
  const names = parseNames(readJson<RawNamesFile>("names.json"));
  const content = parseContent(readJson<RawContentFile>("name-content.json"));
  const details = parseDetails(readJson<RawDetailsFile>("name-details.json"));
  const latin = readJson<PerNameFile<{ he?: string; intl?: string }>>("name-latin.json").names;
  const themes = readJson<PerNameFile<string[]>>("name-themes.json").names;
  const ranks = rankByLastYear(names.values());

  const pages: NamePage[] = [];
  for (const [name, c] of content) {
    const stats = names.get(name);
    if (!stats) continue;
    const count2024 = lastYearCount(stats);
    pages.push({
      name,
      stats,
      content: { ...c, latin: latin[name], themes: themes[name] },
      detail: details.get(name) ?? { story: null, similar: [] },
      rank: ranks.get(name) ?? null,
      count2024,
      countLine: countLine(stats),
      sexTag: sexTag(stats),
      split: sexSplit(stats),
      trend: trend(stats),
      indexed: count2024 >= INDEX_MIN_2024,
    });
  }
  // Most given in 2024 first, then all-time, then alphabetical: the order every list uses.
  pages.sort(
    (a, b) =>
      b.count2024 - a.count2024 ||
      b.stats.m + b.stats.f - (a.stats.m + a.stats.f) ||
      a.name.localeCompare(b.name, "he"),
  );
  cache = { pages, byName: new Map(pages.map((p) => [p.name, p])) };
  return cache;
}

/** Every deck name with a page, most given in 2024 first. */
export function allNamePages(): NamePage[] {
  return load().pages;
}

export function namePage(name: string): NamePage | undefined {
  return load().byName.get(name);
}

export function indexedNamePages(): NamePage[] {
  return allNamePages().filter((p) => p.indexed);
}

/** Similar names that have their own page, in the order the details file gives them. */
export function similarPages(page: NamePage): NamePage[] {
  return page.detail.similar.map((n) => namePage(n)).filter((p): p is NamePage => Boolean(p));
}

/** Deck names grouped by first letter (final forms folded into their letter), in alef-bet order. */
export function namesByLetter(): { letter: string; pages: NamePage[] }[] {
  const FINALS: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };
  const groups = new Map<string, NamePage[]>();
  for (const p of allNamePages()) {
    const first = Array.from(p.name)[0];
    const letter = FINALS[first] ?? first;
    const list = groups.get(letter) ?? [];
    list.push(p);
    groups.set(letter, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "he"))
    .map(([letter, list]) => ({ letter, pages: list.sort((a, b) => a.name.localeCompare(b.name, "he")) }));
}
