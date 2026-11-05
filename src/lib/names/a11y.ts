import type { Card, CardDerived } from "./types";

/** The intro ends with a full stop; drop it so the label doesn't read ".,". */
const clause = (text: string) => text.trim().replace(/[.。]+$/u, "");

type LabelCard = {
  stats: Pick<Card["stats"], "name">;
  content: Pick<Card["content"], "intro">;
  derived: Pick<CardDerived, "sexTag" | "countLine" | "trend">;
};

/** Screen reader label for a card: "{name}, {sex tag}, {intro}, {count line}, {trend}" (E16 acceptance #5). */
export function cardLabel({ stats, content, derived }: LabelCard): string {
  const parts = [stats.name, derived.sexTag, clause(content.intro), derived.countLine];
  if (derived.trend) parts.push(derived.trend.word);
  return parts.join(", ");
}

/** "71%" -> "71 אחוז", "פחות מ־1%" -> "פחות מ־1 אחוז". */
const spoken = (label: string) => label.replace(/%$/u, " אחוז");

/** The boys/girls bar as one element (E16 FR-5b), using sexSplit()'s labels and extreme rules. */
export function barLabel({ boysLabel, girlsLabel }: Pick<CardDerived, "boysLabel" | "girlsLabel">): string {
  return `מאז 1949 ניתן ל־${spoken(boysLabel)} בנים ול־${spoken(girlsLabel)} בנות`;
}

export type StatusKind = "keep" | "love" | "skip" | "hidden" | "undo";

/** Live region text after a vote or an undo, the demo's wording. */
export function statusText(kind: StatusKind, name: string): string {
  switch (kind) {
    case "keep":
      return `${name} נשמר`;
    case "love":
      return `${name} נשמר, ראשון ברשימה`;
    case "skip":
      return `דילגת על ${name}`;
    case "hidden":
      return `${name} לא יוצג שוב`;
    case "undo":
      return `בוטל: ${name}`;
  }
}

/** aria-label of the "השמות שלי" pill in the swipe header (FR-W10). */
export function savedLabel(count: number): string {
  return `השמות שלי: ${count} נשמרו`;
}
