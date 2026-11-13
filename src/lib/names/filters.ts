import { matchesRelative, type RelativeFilter } from "./relative";
import { hasAnyTheme, type ThemeId } from "./themes";
import type { CardDerived, NameStats, PopularityBand, SexTag, TrendWord } from "./types";

export type NameLength = "קצר" | "ארוך";
/** Up to this many letters is "קצר". */
export const SHORT_MAX = 3;
/** This many letters or more is "ארוך". */
export const LONG_MIN = 5;

/** A custom number of letters, both ends included. */
export interface LetterRange {
  min: number;
  max: number;
}

/** The custom range slider's ends. The top end means "this many or more". */
export const RANGE_MIN = 2;
export const RANGE_MAX = 7;

/** E16 FR-10. `null` in a group means "all" (the default). */
export interface Filters {
  sex: SexTag | null;
  popularity: PopularityBand | null;
  trend: TrendWord | null;
  letter: string | null;
  length: NameLength | null;
  /** Any of these themes; never an empty list (that is `null`). */
  themes: ThemeId[] | null;
  /** "מספר אותיות מותאם": when set, `length` is null. */
  letterRange: LetterRange | null;
  /** "על שם קרוב משפחה" (relative.ts). */
  relative: RelativeFilter | null;
}

export const DEFAULT_FILTERS: Readonly<Filters> = Object.freeze({
  sex: null,
  popularity: null,
  trend: null,
  letter: null,
  length: null,
  themes: null,
  letterRange: null,
  relative: null,
});

export function defaultFilters(): Filters {
  return { ...DEFAULT_FILTERS };
}

export function isDefault(filters: Filters): boolean {
  return (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).every((k) => filters[k] === null);
}

/** Any filter is set (the filter button shows a dot then). */
export function hasFilters(filters: Filters | null): boolean {
  return !!filters && !isDefault(filters);
}

/** The sex filter as an ASCII token for analytics (the tags themselves are Hebrew). */
export function sexToken(sex: SexTag | null): string {
  return sex === "בן" ? "boy" : sex === "בת" ? "girl" : sex === "מתאים לכולם" ? "unisex" : "all";
}

/** The fields of a card the filters read. */
export interface FilterableCard {
  stats: Pick<NameStats, "name">;
  derived: Pick<CardDerived, "sexTag" | "band" | "trend">;
  content?: { themes?: readonly string[] };
}

/** Letters only: niqqud, geresh, gershayim, apostrophes, hyphens and spaces don't count. */
export function letters(name: string): string[] {
  return name.match(/\p{L}/gu) ?? [];
}

export function nameLength(name: string): NameLength | null {
  const n = letters(name).length;
  if (n <= SHORT_MAX) return "קצר";
  if (n >= LONG_MIN) return "ארוך";
  return null;
}

export function firstLetter(name: string): string | null {
  return letters(name)[0] ?? null;
}

export function matches(card: FilterableCard, filters: Filters): boolean {
  const { stats, derived } = card;
  if (filters.sex !== null && derived.sexTag !== filters.sex) return false;
  if (filters.popularity !== null && derived.band !== filters.popularity) return false;
  if (filters.trend !== null && derived.trend?.word !== filters.trend) return false;
  if (filters.letter !== null && firstLetter(stats.name) !== filters.letter) return false;
  if (filters.length !== null && nameLength(stats.name) !== filters.length) return false;
  if (filters.themes !== null && !hasAnyTheme(card, filters.themes)) return false;
  if (filters.letterRange !== null) {
    const n = letters(stats.name).length;
    const { min, max } = filters.letterRange;
    if (n < min || (max < RANGE_MAX && n > max)) return false;
  }
  if (filters.relative !== null && !matchesRelative(stats.name, filters.relative)) return false;
  return true;
}

export function count(cards: Iterable<FilterableCard>, filters: Filters): number {
  let n = 0;
  for (const card of cards) if (matches(card, filters)) n++;
  return n;
}

/** Board 3's first-letter picker: the first letters of the given names, in alphabet order. */
export function letterOptions(names: Iterable<string>): string[] {
  const set = new Set<string>();
  for (const name of names) {
    const l = firstLetter(name);
    if (l) set.add(l);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "he"));
}

/** The value shown on board 3's "אות ראשונה" and "אורך" buttons. */
export function letterValue(letter: string | null): string {
  return letter ?? "כל האותיות";
}

export function lengthValue(length: NameLength | null, range: LetterRange | null = null): string {
  if (range) return rangeValue(range);
  return length === "קצר" ? "קצר, עד 3 אותיות" : length === "ארוך" ? "ארוך, 5 אותיות ומעלה" : "קצר וארוך";
}

/** "בין 3 ל־5 אותיות", "4 אותיות", "5 אותיות ומעלה" for the custom range. */
export function rangeValue({ min, max }: LetterRange): string {
  const open = max >= RANGE_MAX;
  if (min <= RANGE_MIN && open) return "כל האורכים";
  if (open) return `${min} אותיות ומעלה`;
  if (min === max) return `${min} אותיות`;
  return `בין ${min} ל־${max} אותיות`;
}

/** Clamps a range to the slider's ends and keeps min ≤ max. */
export function clampRange(min: number, max: number): LetterRange {
  const lo = Math.max(RANGE_MIN, Math.min(RANGE_MAX, Math.round(min)));
  const hi = Math.max(RANGE_MIN, Math.min(RANGE_MAX, Math.round(max)));
  return lo <= hi ? { min: lo, max: hi } : { min: hi, max: lo };
}

/** The filters sheet's apply button (FR-W16). */
export function applyLabel(n: number): string {
  return n === 1 ? "הצגת שם אחד" : `הצגת ${n} שמות`;
}
