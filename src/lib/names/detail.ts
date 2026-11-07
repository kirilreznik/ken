import { FIRST_TREND_YEAR, LAST_YEAR } from "./data";
import { matchSheetLine, type Match } from "./matches";
import { rankByLastYear } from "./popularity";
import type { Card, NameContent, NameDetail, NameStats, SexTag } from "./types";

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

const YEARS = LAST_YEAR - FIRST_TREND_YEAR + 1;
/** Years labelled under the chart (PRD §3.2.9). */
export const CHART_X_YEARS = [FIRST_TREND_YEAR, 2012, LAST_YEAR] as const;

/** Room around the plot. The SVG is always LTR, so `start` is the low-x side (the y labels). */
export interface ChartPad {
  top: number;
  end: number;
  bottom: number;
  start: number;
}

export interface ChartPoint {
  year: number;
  value: number;
  x: number;
  y: number;
}

export interface ChartModel {
  /** One point per year, FIRST_TREND_YEAR..LAST_YEAR, left to right. */
  points: ChartPoint[];
  /** The `points` attribute of the line. */
  line: string;
  /** The `points` attribute of the area under the line, closed along the 0 gridline. */
  area: string;
  /** 0 and two round values, the top one at or above the max, bottom to top. */
  yTicks: { value: number; y: number; label: string }[];
  xLabels: { year: number; x: number; label: string }[];
  /** The LAST_YEAR point, where the clay dot sits. */
  last: ChartPoint;
  /** The year whose point is closest to x (in chart units), clamped to the range. */
  nearestYear: (x: number) => number;
}

const round1 = (n: number) => +n.toFixed(1);

/** The smallest 1/2/5 × 10^k step (at least 1) whose double reaches max. */
export function niceStep(max: number): number {
  const need = Math.max(max / 2, 1);
  let pow = 10 ** Math.floor(Math.log10(need));
  for (;;) {
    for (const m of [1, 2, 5]) if (m * pow >= need) return m * pow;
    pow *= 10;
  }
}

/**
 * Geometry for the year chart in a `width × height` box: x runs left to right from
 * FIRST_TREND_YEAR to LAST_YEAR, y from 0 (bottom) to the top tick. Null without a full series.
 */
export function chartModel(
  y: readonly number[] | undefined | null,
  { width, height, pad }: { width: number; height: number; pad: number | ChartPad },
): ChartModel | null {
  if (!y || y.length !== YEARS) return null;
  const p = typeof pad === "number" ? { top: pad, end: pad, bottom: pad, start: pad } : pad;
  const x0 = p.start;
  const xSpan = width - p.start - p.end;
  const base = height - p.bottom;
  const ySpan = base - p.top;
  const step = niceStep(Math.max(...y));
  const top = step * 2;
  const xAt = (i: number) => round1(x0 + (i * xSpan) / (YEARS - 1));
  const yAt = (v: number) => round1(base - (v / top) * ySpan);

  const points = y.map((value, i) => ({ year: FIRST_TREND_YEAR + i, value, x: xAt(i), y: yAt(value) }));
  const line = points.map((pt) => `${pt.x},${pt.y}`).join(" ");
  const area = `${line} ${points[YEARS - 1].x},${round1(base)} ${points[0].x},${round1(base)}`;
  const yTicks = [0, step, top].map((value) => ({ value, y: yAt(value), label: fmt.format(value) }));
  const xLabels = CHART_X_YEARS.map((year) => ({ year, x: xAt(year - FIRST_TREND_YEAR), label: String(year) }));
  const nearestYear = (x: number) => {
    const i = Math.round(((x - x0) / xSpan) * (YEARS - 1));
    return FIRST_TREND_YEAR + Math.min(YEARS - 1, Math.max(0, Number.isFinite(i) ? i : 0));
  };
  return { points, line, area, yTicks, xLabels, last: points[YEARS - 1], nearestYear };
}

const babies = (n: number) => (n === 1 ? "תינוק אחד" : `${fmt.format(n)} תינוקות`);

/** The chart's aria-label: range, first and last values, and the peak year (the first one, on ties). */
export function chartLabel({ y }: Pick<NameStats, "y">): string {
  if (!y || y.length !== YEARS) return `אין נתונים לשנים ${FIRST_TREND_YEAR}–${LAST_YEAR}`;
  const parts = [
    `מספר התינוקות בכל שנה, ${FIRST_TREND_YEAR} עד ${LAST_YEAR}`,
    `ב־${FIRST_TREND_YEAR}: ${babies(y[0])}, ב־${LAST_YEAR}: ${babies(y[YEARS - 1])}`,
  ];
  const max = Math.max(...y);
  if (max > 0) parts.push(`השיא ב־${FIRST_TREND_YEAR + y.indexOf(max)}`);
  return `${parts.join(". ")}.`;
}

/** At most this many similar names are shown. */
export const SIMILAR_MAX = 6;

export interface SimilarName {
  name: string;
  sexTag: SexTag;
}

const cardCache = new WeakMap<readonly Card[], Map<string, Card>>();

function cardIndex(cards: ReadonlyMap<string, Card> | readonly Card[]): ReadonlyMap<string, Card> {
  if (!Array.isArray(cards)) return cards as ReadonlyMap<string, Card>;
  const list = cards as readonly Card[];
  let index = cardCache.get(list);
  if (!index) {
    index = new Map(list.map((c) => [c.stats.name, c]));
    cardCache.set(list, index);
  }
  return index;
}

/**
 * The similar names the sheet shows for `name`: deck names only, never one the user hid
 * or the name itself, in the build's order (2024 births), at most SIMILAR_MAX.
 */
export function similarForDisplay(
  name: string,
  details: ReadonlyMap<string, NameDetail> | null | undefined,
  cards: ReadonlyMap<string, Card> | readonly Card[],
  hiddenNames: ReadonlySet<string> | readonly string[],
): SimilarName[] {
  const similar = details?.get(name)?.similar;
  if (!similar?.length) return [];
  const index = cardIndex(cards);
  const hidden = Array.isArray(hiddenNames) ? new Set(hiddenNames) : (hiddenNames as ReadonlySet<string>);
  const out: SimilarName[] = [];
  for (const other of similar) {
    if (other === name || hidden.has(other)) continue;
    const card = index.get(other);
    if (!card || out.some((s) => s.name === other)) continue;
    out.push({ name: other, sexTag: card.derived.sexTag });
    if (out.length === SIMILAR_MAX) break;
  }
  return out;
}

export interface Together {
  text: string;
}

/**
 * The match badge (§3.1.5, FR-D12): null unless `name` is a match of a shared space. Takes
 * only the matches, never a partner's votes, so a lone save, skip or hide can't leak. The
 * wording is the Lists match line ("שניכם שמרתם…" / "{n} שמרו…") after "התאמה · ".
 */
export function togetherFor(name: string, matches: readonly Match[], memberCount: number): Together | null {
  if (memberCount < 2) return null;
  const match = matches.find((m) => m.name === name);
  if (!match) return null;
  return { text: `התאמה · ${matchSheetLine(match).replace(/\.$/, "")}` };
}

/**
 * The card's hint chips (§3.1.2, FR-D19): what the sheet holds, from the card's own content
 * so they never wait for the details file. A verse first, then the known people.
 */
export function cardHints(content: Pick<NameContent, "bible" | "people">): string[] {
  const hints: string[] = [];
  if (content.bible) hints.push("מהתנ״ך");
  const n = content.people.length;
  if (n === 1) hints.push("אדם מוכר אחד");
  else if (n > 1) hints.push(`${n} אנשים מוכרים`);
  return hints;
}
