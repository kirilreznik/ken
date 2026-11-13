import { formatCount } from "./card";
import type { Card, CardDerived } from "./types";

/** The intro ends with a full stop; drop it so the label doesn't read ".,". */
const clause = (text: string) => text.trim().replace(/[.。]+$/u, "");

type LabelCard = {
  stats: Pick<Card["stats"], "name">;
  content: Pick<Card["content"], "intro">;
  derived: Pick<CardDerived, "sexTag" | "countLine" | "trend">;
};

/** The card opens the name sheet (FR-D19); the label says so last. */
export const DETAILS_HINT = "לפרטים נוספים: הקשה";

/**
 * Screen reader label for a card: "{name}, {sex tag}, {intro}, {count line}, {trend}, {details hint}"
 * (E16 acceptance #5, FR-D19).
 */
export function cardLabel({ stats, content, derived }: LabelCard): string {
  const parts = [stats.name, derived.sexTag, clause(content.intro), derived.countLine];
  if (derived.trend) parts.push(derived.trend.word);
  parts.push(DETAILS_HINT);
  return parts.join(", ");
}

/** "71%" -> "71 אחוז", "פחות מ־1%" -> "פחות מ־1 אחוז". */
const spoken = (label: string) => label.replace(/%$/u, " אחוז");

/** The boys/girls bar as one element (E16 FR-5b), using sexSplit()'s labels and extreme rules. */
export function barLabel({ boysLabel, girlsLabel }: Pick<CardDerived, "boysLabel" | "girlsLabel">): string {
  return `מאז 1949 ניתן ל־${spoken(boysLabel)} בנים ול־${spoken(girlsLabel)} בנות`;
}

export type StatusKind = "keep" | "love" | "skip" | "hidden" | "undo";

/**
 * Live region text after a vote or an undo. "השם {name}" keeps the verb in agreement with
 * the masculine noun, so a girl's name never reads with a mismatched verb.
 */
export function statusText(kind: StatusKind, name: string): string {
  switch (kind) {
    case "keep":
      return `השם ${name} נשמר`;
    case "love":
      return `השם ${name} נשמר, ראשון ברשימה`;
    case "skip":
      return `דילוג על ${name}`;
    case "hidden":
      return `השם ${name} לא יוצג שוב`;
    case "undo":
      return `בוטל: ${name}`;
  }
}

/**
 * The toast after a decision in the name sheet on a name that isn't the current card (PRD
 * 3.2.5): "נשמר: {name}", "אהבתי מאוד: {name}", "דילוג: {name}". A hidden name reads as "דילוג".
 */
export function sheetVoteText(kind: Exclude<StatusKind, "undo">, name: string): string {
  switch (kind) {
    case "keep":
      return `נשמר: ${name}`;
    case "love":
      return `אהבתי מאוד: ${name}`;
    case "skip":
    case "hidden":
      return `דילוג: ${name}`;
  }
}

/** aria-label of the "השמות שלי" pill in the swipe header (FR-W10). */
export function savedLabel(count: number | null): string {
  // null: the votes couldn't be read (NP-073), so there is no count to say.
  return count === null ? "השמות שלי" : count === 1 ? "השמות שלי: שם אחד נשמר" : `השמות שלי: ${formatCount(count)} נשמרו`;
}
