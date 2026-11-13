/** Births per name from CBS (data/names/names.json). */
export interface NameStats {
  name: string;
  /** All-time births, boys (since 1949). */
  m: number;
  /** All-time births, girls (since 1949). */
  f: number;
  /** Sectors the name is common in, one letter each (J, M, C, D). */
  s: string;
  /** Births per year, FIRST_TREND_YEAR..LAST_YEAR; missing when the name has no recent years. */
  y?: number[];
}

export interface NamePerson {
  name: string;
  what: string;
}

/** Hand-written card content (data/names/name-content.json). */
export interface NameContent {
  niqqud: string;
  intro: string;
  bible?: { text: string; ref: string };
  people: NamePerson[];
  /** Theme ids from data/names/name-themes.json, added at build time (see themes.ts). */
  themes?: string[];
  /**
   * Latin spellings from data/names/name-latin.json, added at build time: `he` by the Academy
   * of the Hebrew Language's rules, `intl` the international form. Either can be missing.
   */
  latin?: { he?: string; intl?: string };
  /** Meaning group ids from data/names/name-meanings.json, added at build time (see relative.ts). */
  meanings?: string[];
}

/** Details shown in the name sheet (data/names/name-details.json), loaded lazily. */
export interface NameDetail {
  /** A short story about the name; null when none was written. */
  story: string | null;
  /** Other forms of the same name, deck names only, most given in 2024 first. */
  similar: string[];
}

export type SexTag = "בן" | "בת" | "מתאים לכולם";
export type PopularityBand = "נפוץ" | "בינוני" | "נדיר";
export type TrendWord = "בעלייה" | "בירידה" | "יציב";

/** Values computed from NameStats with the E16 §2 rules. */
export interface CardDerived {
  sexTag: SexTag;
  /** Share of births that are boys, 0..1, for the bar width. */
  boysShare: number;
  boysLabel: string;
  girlsLabel: string;
  band: PopularityBand;
  countLine: string;
  trend: { word: TrendWord; arrow: string } | null;
  /** Sparkline polyline points; null for names with no recent years. */
  spark: string | null;
}

export interface Card {
  stats: NameStats;
  content: NameContent;
  derived: CardDerived;
}

export type Vote = "keep" | "love" | "skip" | "hidden";
