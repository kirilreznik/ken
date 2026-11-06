import type { SexTag } from "./types";

/**
 * The "נושאים" filter's themes, in the order the chips show. Every theme but "unisex" is a
 * hand-kept list in data/names/content-src/themes.json (built into each card's
 * `content.themes`); "unisex" is the CBS boy/girl split, the same rule as "מתאים לכולם".
 */
export const THEME_IDS = [
  "israel",
  "poetry",
  "fire",
  "unisex",
  "special",
  "strength",
  "land",
  "water",
  "bible",
  "animals",
  "beauty",
  "joy",
  "international",
  "nature",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_LABELS: Record<ThemeId, string> = {
  israel: "מדינת ישראל",
  poetry: "שירה",
  fire: "אש ואור",
  unisex: "יוניסקס",
  special: "מיוחדים",
  strength: "כוח",
  land: "אדמה/יבשה",
  water: "ים ומים",
  bible: "שמות מהתנ״ך",
  animals: "בעלי חיים",
  beauty: "יופי",
  joy: "שמחה ורגשות",
  international: "בינלאומי",
  nature: "טבע",
};

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

/** The fields of a card the theme filter reads. */
export interface ThemedCard {
  content?: { themes?: readonly string[] };
  derived: { sexTag: SexTag };
}

export function hasTheme(card: ThemedCard, theme: ThemeId): boolean {
  if (theme === "unisex") return card.derived.sexTag === "מתאים לכולם";
  return card.content?.themes?.includes(theme) ?? false;
}

/** A name passes when it has any of the chosen themes. */
export function hasAnyTheme(card: ThemedCard, themes: readonly ThemeId[]): boolean {
  return themes.some((t) => hasTheme(card, t));
}

/** The value the "נושאים" summary shows: "כל הנושאים", one label, or "{n} נושאים". */
export function themesValue(themes: readonly ThemeId[] | null): string {
  if (!themes?.length) return "כל הנושאים";
  return themes.length === 1 ? THEME_LABELS[themes[0]] : `${themes.length} נושאים`;
}
