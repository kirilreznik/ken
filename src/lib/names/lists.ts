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
  return `השם ${name} יחזור לבחירה`;
}

/** The segments of "השמות שלי" (`?tab=`). */
export type ListsTab = "saved" | "matches" | "duel";

/** The tab to show for `?tab=`: "התאמות" exists only in a shared space; anything else is "שמרתי". */
export function listsTab(param: string | null, shared: boolean): ListsTab {
  if (param === "duel") return "duel";
  if (param === "matches" && shared) return "matches";
  return "saved";
}

/** A row of "שמרתי". `custom`: added with "הוספת שם", so it has no CBS data. */
export interface SavedRow {
  name: string;
  vote: "keep" | "love";
  custom: boolean;
}

/** The "שמרתי" rows (FR-W18): loved first, then kept, each the most recent first. */
export function savedRows(votes: ReadonlyMap<string, { vote: Vote; custom?: boolean }>): SavedRow[] {
  const loved: SavedRow[] = [];
  const kept: SavedRow[] = [];
  for (const [name, v] of votes) {
    if (v.vote === "love") loved.push({ name, vote: "love", custom: !!v.custom });
    else if (v.vote === "keep") kept.push({ name, vote: "keep", custom: !!v.custom });
  }
  return [...loved.reverse(), ...kept.reverse()];
}

/** Live region text after a row menu action. */
export function rowActionText(name: string, action: "remove" | "hide"): string {
  return action === "remove" ? `השם ${name} הוסר מהרשימה` : `השם ${name} הוסתר ולא יוצג יותר`;
}

/** Live region / toast text after "הוספת שם". */
export function addedText(name: string): string {
  return `השם ${name} נוסף לרשימה`;
}
