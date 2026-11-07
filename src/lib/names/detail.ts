import { FIRST_TREND_YEAR, LAST_YEAR } from "./data";
import { rankByLastYear } from "./popularity";
import type { NameStats } from "./types";

/** Pure logic for the name detail sheet (tasks/prd-name-detail.md §3.2.8). */

const fmt = new Intl.NumberFormat("he-IL");

/** Both years need at least this many births before the 2000 comparison is shown. */
export const COMPARE_MIN = 20;
/** b/a at or above this is "פי…", at or below COMPARE_LESS is "…% פחות", in between "בערך כמו". */
export const COMPARE_MORE = 1.1;
export const COMPARE_LESS = 0.9;

export const ALL_TIME_LABEL = "תינוקות מאז 1949";

const rankCache = new WeakMap<object, Map<string, number>>();

/**
 * 2024 rank of every CBS name (both sexes together), ties share a rank (1, 2, 2, 4);
 * names with no births in 2024 are absent. Memoised per names collection.
 */
export function rankMap(allNames: Map<string, NameStats> | readonly NameStats[]): Map<string, number> {
  let ranks = rankCache.get(allNames);
  if (!ranks) {
    ranks = rankByLastYear(allNames.values());
    rankCache.set(allNames, ranks);
  }
  return ranks;
}

/** The name's 2024 rank, or null when it had no births in 2024. */
export function rank2024(name: string, map: Map<string, number>): number | null {
  return map.get(name) ?? null;
}

/** "#2 בשנת 2024". */
export function rankText(rank: number): string {
  return `#${fmt.format(rank)} בשנת ${LAST_YEAR}`;
}

export interface Compare2000 {
  kind: "times" | "less" | "same";
  text: string;
}

/** 2024 births against 2000 births, or null unless both years have at least COMPARE_MIN. */
export function compare2000({ y }: Pick<NameStats, "y">): Compare2000 | null {
  if (!y || y.length !== LAST_YEAR - FIRST_TREND_YEAR + 1) return null;
  const a = y[0];
  const b = y[y.length - 1];
  if (a < COMPARE_MIN || b < COMPARE_MIN) return null;
  const ratio = b / a;
  if (ratio >= COMPARE_MORE) return { kind: "times", text: `פי ${ratio.toFixed(1)} מבשנת ${FIRST_TREND_YEAR}` };
  if (ratio <= COMPARE_LESS) {
    return { kind: "less", text: `${Math.round((1 - ratio) * 100)}% פחות מבשנת ${FIRST_TREND_YEAR}` };
  }
  return { kind: "same", text: `בערך כמו בשנת ${FIRST_TREND_YEAR}` };
}

/** All-time births (m + f) with thousands separators, shown with ALL_TIME_LABEL. */
export function allTimeBirths({ m, f }: Pick<NameStats, "m" | "f">): string {
  return fmt.format(m + f);
}
