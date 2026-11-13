import { FIRST_TREND_YEAR, LAST_YEAR } from "@/lib/names/data";
import {
  countLine,
  lastYearAmount,
  popularityBand,
  rankByLastYear,
  sparkline,
  trend,
} from "@/lib/names/popularity";
import { sexSplit, sexTag } from "@/lib/names/sex";
import type { Card, CardDerived, NameContent, NamePerson, NameStats, TrendWord } from "@/lib/names/types";

/** Everything a card shows that is computed from the CBS numbers (E16 §2). `rank` is the 2024 rank. */
export function deriveCard(stats: NameStats, rank: number | undefined): CardDerived {
  const t = trend(stats);
  return {
    sexTag: sexTag(stats),
    ...sexSplit(stats),
    band: popularityBand(rank),
    countLine: countLine(stats),
    trend: t && { word: t.word, arrow: t.arrow },
    spark: sparkline(stats),
  };
}

/** Cards for the names that have content and births, in content order; ranks come from all names. */
export function buildCards(names: Map<string, NameStats>, content: Map<string, NameContent>): Card[] {
  const ranks = rankByLastYear(names.values());
  const cards: Card[] = [];
  for (const [name, c] of content) {
    const stats = names.get(name);
    if (stats) cards.push({ stats, content: c, derived: deriveCard(stats, ranks.get(name)) });
  }
  return cards;
}

const fmt = new Intl.NumberFormat("he-IL");

/** A count as the app shows it everywhere, with thousands separators ("1,284"; NP-079). */
export function formatCount(n: number): string {
  return fmt.format(n);
}

/** "שם {n} מתוך {total}": where the card sits in the filtered deck (FR-W12, the demo's wording). */
export function positionText(n: number, total: number): string {
  return `שם ${formatCount(n)} מתוך ${formatCount(total)}`;
}

/** The name with the user's surname, or null when no surname is set (E16 FR-5). */
export function fullName(name: string, surname: string | null | undefined): string | null {
  const last = surname?.trim().replace(/\s+/gu, " ") ?? "";
  return last ? `${name} ${last}` : null;
}

/** At most this many known people show on a card (E16 FR-5a). */
export const MAX_PEOPLE = 2;

/** The known people a card shows, each with the initial for its avatar. */
export function knownPeople(people: readonly NamePerson[]): (NamePerson & { initial: string })[] {
  return people
    .filter((p) => p.name.trim() && p.what.trim())
    .slice(0, MAX_PEOPLE)
    .map((p) => ({ ...p, initial: Array.from(p.name.trim())[0] }));
}

/** The Bible block, or null when the name has none or it is blank. */
export function bibleNote(bible: NameContent["bible"]): { text: string; ref: string } | null {
  const text = bible?.text.trim() ?? "";
  return text ? { text, ref: bible?.ref.trim() ?? "" } : null;
}

/**
 * The births tile: always "ב־2024" with its count, or "פחות מ־5" when CBS published none
 * (owner decision 2026-11-13; the count line adds the all-time count).
 */
export function countTile(stats: NameStats): { label: string; value: string } {
  return { label: `ב־${LAST_YEAR}`, value: lastYearAmount(stats) };
}

/** The sparkline's last point, where the clay dot sits, or null without a sparkline. */
export function sparkEnd(spark: string | null): { x: number; y: number } | null {
  const last = spark?.trim().split(/\s+/u).at(-1);
  if (!last) return null;
  const [x, y] = last.split(",").map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

/** The sparkline's label for screen readers, "מגמה יציב מאז 2000" (as in Main.dc.html). */
/** The trend tile's caption: the years the sparkline covers (the word only reads the last few). */
export const TREND_RANGE = `${FIRST_TREND_YEAR}–${LAST_YEAR}`;

export function trendLabel(word: TrendWord): string {
  return `מספר התינוקות בכל שנה, ${FIRST_TREND_YEAR} עד ${LAST_YEAR}. בשנים האחרונות: ${word}`;
}
