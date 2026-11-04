import { latestCount, roughly, trend } from "./popularity";
import { sexTag } from "./sex";
import type { NameStats, SexTag, TrendWord, Vote } from "./types";

const fmt = new Intl.NumberFormat("he-IL");

/** The facts under a name in a list row (board 5): "בת · ניתן ל־1,090 ב־2024 · → יציב". */
export interface RowMeta {
  sexTag: SexTag;
  /** "ניתן ל־1,090 ב־2024", or "ניתן לכ־55,000 מאז 1949" with no recent births. */
  count: string;
  trend: { word: TrendWord; arrow: string } | null;
}

/** The row facts for a name, or null for a name with no CBS data (a custom name). */
export function rowMeta(stats: NameStats | null | undefined): RowMeta | null {
  if (!stats) return null;
  const latest = latestCount(stats);
  const count = latest
    ? `ניתן ל־${fmt.format(latest.n)} ב־${latest.year}`
    : `ניתן לכ־${fmt.format(roughly(stats.m + stats.f))} מאז 1949`;
  const t = trend(stats);
  return { sexTag: sexTag(stats), count, trend: t && { word: t.word, arrow: t.arrow } };
}

/** The row facts as one line for screen readers, without the arrow. */
export function rowMetaText(meta: RowMeta): string {
  return [meta.sexTag, meta.count, meta.trend?.word].filter(Boolean).join(" · ");
}

/** The hidden names (FR-W22), the most recently hidden first. */
export function hiddenNames(votes: ReadonlyMap<string, Vote>): string[] {
  const hidden: string[] = [];
  for (const [name, vote] of votes) if (vote === "hidden") hidden.push(name);
  return hidden.reverse();
}

/** Live region text after "החזרה". */
export function restoredText(name: string): string {
  return `${name} יחזור לבחירה`;
}
