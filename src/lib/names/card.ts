/** "שם {n} מתוך {total}": where the card sits in the filtered deck (FR-W12, the demo's wording). */
export function positionText(n: number, total: number): string {
  return `שם ${n} מתוך ${total}`;
}

/** The name with the user's surname, or null when no surname is set (E16 FR-5). */
export function fullName(name: string, surname: string | null | undefined): string | null {
  const last = surname?.trim().replace(/\s+/gu, " ") ?? "";
  return last ? `${name} ${last}` : null;
}
