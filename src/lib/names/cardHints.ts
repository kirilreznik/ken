import type { NameContent } from "./types";

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
