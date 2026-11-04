import type { NameContent, NamePerson } from "@/lib/names/types";

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
