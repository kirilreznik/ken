import { FIRST_TREND_YEAR } from "@/lib/names/data";
import { latestCount, roughly } from "@/lib/names/popularity";
import type { NameContent, NamePerson, NameStats, TrendWord } from "@/lib/names/types";

/** "שם {n} מתוך {total}": where the card sits in the filtered deck (FR-W12, the demo's wording). */
export function positionText(n: number, total: number): string {
  return `שם ${n} מתוך ${total}`;
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

const fmt = new Intl.NumberFormat("he-IL");

/**
 * The births tile: "ב־2024" and the latest year's count, or, for a name with no recent
 * births, the all-time line's "מאז 1949" and "כ־{n}" (E16 FR-5).
 */
export function countTile(stats: NameStats): { label: string; value: string } {
  const latest = latestCount(stats);
  if (latest) return { label: `ב־${latest.year}`, value: fmt.format(latest.n) };
  return { label: "מאז 1949", value: `כ־${fmt.format(roughly(stats.m + stats.f))}` };
}

/** The sparkline's last point, where the clay dot sits, or null without a sparkline. */
export function sparkEnd(spark: string | null): { x: number; y: number } | null {
  const last = spark?.trim().split(/\s+/u).at(-1);
  if (!last) return null;
  const [x, y] = last.split(",").map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

/** The sparkline's label for screen readers, "מגמה יציב מאז 2000" (as in Main.dc.html). */
export function trendLabel(word: TrendWord): string {
  return `מגמה ${word} מאז ${FIRST_TREND_YEAR}`;
}
