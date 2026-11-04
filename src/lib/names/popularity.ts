import { FIRST_TREND_YEAR, LAST_YEAR } from "./data";
import type { NameStats, PopularityBand, TrendWord } from "./types";

/** Rank 1..TOP_COMMON is "נפוץ", up to TOP_MEDIUM is "בינוני" (E16 §2). */
export const TOP_COMMON = 100;
export const TOP_MEDIUM = 500;
/** Trend compares the last 3 years with the 3 years five years earlier, ±25%. */
export const TREND_WINDOW = 3;
export const TREND_GAP = 5;
export const TREND_CHANGE = 0.25;
/** Below this average in the earlier window a percent change is noise, so no trend is shown. */
export const TREND_MIN_BASE = 5;

type YearCounts = Pick<NameStats, "y">;

const fmt = new Intl.NumberFormat("he-IL");

/**
 * 2024 rank of every name with 2024 births, competition style (ties share a rank).
 * Names with no recent years or no births in 2024 have no rank.
 */
export function rankByLastYear(names: Iterable<NameStats>): Map<string, number> {
  const counted = [...names]
    .filter((s) => s.y && s.y[s.y.length - 1] > 0)
    .map((s) => ({ name: s.name, n: s.y![s.y!.length - 1] }))
    .sort((a, b) => b.n - a.n);
  const ranks = new Map<string, number>();
  counted.forEach(({ name, n }, i) => {
    const prev = counted[i - 1];
    ranks.set(name, prev && prev.n === n ? ranks.get(prev.name)! : i + 1);
  });
  return ranks;
}

/** "נפוץ" top 100, "בינוני" 101–500, else "נדיר" (also names with no 2024 rank). */
export function popularityBand(rank: number | undefined | null): PopularityBand {
  if (rank == null) return "נדיר";
  if (rank <= TOP_COMMON) return "נפוץ";
  if (rank <= TOP_MEDIUM) return "בינוני";
  return "נדיר";
}

/** Births in the latest year that has any, or null for names with no recent births. */
export function latestCount({ y }: YearCounts): { n: number; year: number } | null {
  if (!y) return null;
  for (let i = y.length - 1; i >= 0; i--) {
    if (y[i] > 0) return { n: y[i], year: FIRST_TREND_YEAR + i };
  }
  return null;
}

/** Two significant digits, for the approximate all-time line. */
export function roughly(n: number): number {
  if (n < 100) return n;
  const step = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.round(n / step) * step;
}

/** "ניתן ל־1,189 תינוקות ב־2024", or "ניתן לכ־55,000 תינוקות מאז 1949" with no recent births. */
export function countLine(stats: NameStats): string {
  const latest = latestCount(stats);
  if (latest) return `ניתן ל־${fmt.format(latest.n)} תינוקות ב־${latest.year}`;
  return `ניתן לכ־${fmt.format(roughly(stats.m + stats.f))} תינוקות מאז 1949`;
}

const ARROWS: Record<TrendWord, string> = { בעלייה: "↗", בירידה: "↘", יציב: "→" };

export interface Trend {
  word: TrendWord;
  arrow: string;
  /** Relative change of the recent average against the earlier one. */
  change: number;
}

/** Average of the last 3 years vs the 3 years five years earlier; null when data is too thin. */
export function trend({ y }: YearCounts): Trend | null {
  if (!y || y.length < TREND_WINDOW + TREND_GAP) return null;
  const avg = (end: number) => y.slice(end - TREND_WINDOW, end).reduce((a, b) => a + b, 0) / TREND_WINDOW;
  const recent = avg(y.length);
  const base = avg(y.length - TREND_GAP);
  if (base < TREND_MIN_BASE) return null;
  const change = recent / base - 1;
  const word: TrendWord = change >= TREND_CHANGE ? "בעלייה" : change <= -TREND_CHANGE ? "בירידה" : "יציב";
  return { word, arrow: ARROWS[word], change };
}

/** Sparkline viewBox, the same as the demo's `<svg viewBox="0 0 132 36">`. */
export const SPARK_VIEWBOX = "0 0 132 36";

/** Points for FIRST_TREND_YEAR..LAST_YEAR in SPARK_VIEWBOX, the demo's spark() math. */
export function sparkPoints({ y }: YearCounts): [number, number][] {
  if (!y || y.length !== LAST_YEAR - FIRST_TREND_YEAR + 1) return [];
  const max = Math.max(...y);
  const min = Math.min(...y);
  return y.map((v, i) => [
    +(4 + i * (124 / (y.length - 1))).toFixed(1),
    +(32 - ((v - min) / (max - min || 1)) * 28).toFixed(1),
  ]);
}

/** The `points` attribute of the sparkline polyline, or null when the name has no recent years. */
export function sparkline(stats: YearCounts): string | null {
  const pts = sparkPoints(stats);
  return pts.length ? pts.map((p) => p.join(",")).join(" ") : null;
}
