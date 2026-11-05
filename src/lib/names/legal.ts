import { isEmail } from "./email";

/**
 * Legal pages (FR-W31): the shape of the drafts in src/content/names-legal/ and the operator
 * details from PREGNANCY_OPERATOR_NAME / PREGNANCY_CONTACT_EMAIL. Texts mark where those go with
 * {operator} and {contact}; legalParts splits a text so the page can render the email as a link.
 */

export const LEGAL_DRAFT_BANNER = "טיוטה, ממתינה לבדיקה משפטית";
export const LEGAL_PLACEHOLDER = "יעודכן לפני ההשקה";

export type LegalSection = { title: string; paragraphs?: string[]; items?: string[] };

export type LegalDoc = {
  title: string;
  description: string;
  version: string;
  /** Hebrew date the text was last changed. */
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalContacts = { operator: string | null; contact: string | null };

export type LegalPart = { kind: "text"; text: string } | { kind: "operator" } | { kind: "contact" };

/** Reads the operator details, treating blank values (and a malformed email) as unset. */
export function legalContacts(env: { PREGNANCY_OPERATOR_NAME?: string; PREGNANCY_CONTACT_EMAIL?: string }): LegalContacts {
  const operator = env.PREGNANCY_OPERATOR_NAME?.trim() || null;
  const contact = env.PREGNANCY_CONTACT_EMAIL?.trim() || null;
  return { operator, contact: contact && isEmail(contact) ? contact : null };
}

/** Splits a text on {operator} and {contact}; other braces stay text. */
export function legalParts(text: string): LegalPart[] {
  const parts: LegalPart[] = [];
  for (const piece of text.split(/(\{operator\}|\{contact\})/)) {
    if (piece === "{operator}") parts.push({ kind: "operator" });
    else if (piece === "{contact}") parts.push({ kind: "contact" });
    else if (piece) parts.push({ kind: "text", text: piece });
  }
  return parts;
}

/** Every text of a document, in reading order (for tests and checks). */
export function legalTexts(doc: LegalDoc): string[] {
  return [doc.intro, ...doc.sections.flatMap((s) => [s.title, ...(s.paragraphs ?? []), ...(s.items ?? [])])];
}
