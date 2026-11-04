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
  spark: string;
}

export interface Card {
  stats: NameStats;
  content: NameContent;
  derived: CardDerived;
}

export type Vote = "keep" | "love" | "skip" | "hidden";
