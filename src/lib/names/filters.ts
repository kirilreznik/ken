import type { CardDerived, NameStats, PopularityBand, SexTag, TrendWord } from "./types";

export type NameLength = "קצר" | "ארוך";
/** Sector codes in names.json `s`. */
export type Sector = "J" | "M" | "C" | "D";

/** Board 3 labels for the origin group ("נפוץ בקרב"). */
export const SECTOR_LABELS: Record<Sector, string> = {
  J: "יהודים",
  M: "מוסלמים",
  C: "נוצרים",
  D: "דרוזים",
};

/** Up to this many letters is "קצר". */
export const SHORT_MAX = 3;
/** This many letters or more is "ארוך". */
export const LONG_MIN = 5;

/** E16 FR-10. `null` in a group means "all" (the default). */
export interface Filters {
  sex: SexTag | null;
  popularity: PopularityBand | null;
  trend: TrendWord | null;
  letter: string | null;
  length: NameLength | null;
  origin: Sector | null;
}

export const DEFAULT_FILTERS: Readonly<Filters> = Object.freeze({
  sex: null,
  popularity: null,
  trend: null,
  letter: null,
  length: null,
  origin: null,
});

export function defaultFilters(): Filters {
  return { ...DEFAULT_FILTERS };
}

export function isDefault(filters: Filters): boolean {
  return (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).every((k) => filters[k] === null);
}

/** The fields of a card the filters read. */
export interface FilterableCard {
  stats: Pick<NameStats, "name" | "s">;
  derived: Pick<CardDerived, "sexTag" | "band" | "trend">;
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
  if (filters.origin !== null && !stats.s.includes(filters.origin)) return false;
  return true;
}

export function count(cards: Iterable<FilterableCard>, filters: Filters): number {
  let n = 0;
  for (const card of cards) if (matches(card, filters)) n++;
  return n;
}

/** The swipe screen's quick chips (PRD 3.2.14): each sets only the sex filter. */
export const QUICK_CHIPS: readonly { label: string; sex: SexTag | null }[] = [
  { label: "כל השמות", sex: null },
  { label: "מתאים לכולם", sex: "מתאים לכולם" },
  { label: "בת", sex: "בת" },
  { label: "בן", sex: "בן" },
];

/** Filters with the sex group set from a quick chip; the other groups stay. */
export function withSex(filters: Filters, sex: SexTag | null): Filters {
  return { ...filters, sex };
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

export function lengthValue(length: NameLength | null): string {
  return length === "קצר" ? "קצר, עד 3 אותיות" : length === "ארוך" ? "ארוך, 5 אותיות ומעלה" : "קצר וארוך";
}

/** The filters sheet's apply button (FR-W16). */
export function applyLabel(n: number): string {
  return n === 1 ? "הצגת שם אחד" : `הצגת ${n} שמות`;
}
