/** "על הנתונים" (FR-W30, E16 FR-14) and the mistake report (PRD 3.2.18). */

import { normalizeName } from "./custom";
import type { ClientLogReport } from "./clientLog";

/** CBS attribution, as the licence asks: the release, the file, the access date and links. */
export const CBS_FILE = "11_25_391t1.xlsx";
export const CBS_FILE_URL = "https://www.cbs.gov.il/he/mediarelease/DocLib/2025/391/11_25_391t1.xlsx";
export const CBS_LICENCE_URL = "https://www.cbs.gov.il/en/Pages/Enduser-license.aspx";
export const CBS_ACCESSED = "3 בנובמבר 2026";

export const REPORT_AREA = "names-report";
export const REPORT_MAX = 1000;
export const REPORT_SENT = "תודה, הדיווח נשלח";
export const REPORT_OFFLINE = "אין חיבור לאינטרנט. אפשר לשלוח כשהחיבור יחזור.";
export const REPORT_FAILED = "הדיווח לא נשלח. אפשר לנסות שוב.";

export type ReportError = "empty" | "too-long";

export const REPORT_ERRORS: Record<ReportError, string> = {
  empty: "צריך לכתוב מה לא נכון",
  "too-long": `עד ${REPORT_MAX} תווים`,
};

/** The report sheet's title: with the card's name, or general on /names/about. */
export function reportTitle(name: string | null | undefined): string {
  return name ? `דיווח על טעות בשם ${name}` : "דיווח על טעות";
}

/** The about button's label: the board's wording over a card, FR-W30's on the page. */
export function reportButtonLabel(hasName: boolean): string {
  return hasName ? "דיווח על טעות בשם הזה" : "יש טעות? אפשר לדווח";
}

export function validateReport(message: string): ReportError | null {
  const text = message.trim();
  if (!text) return "empty";
  if (text.length > REPORT_MAX) return "too-long";
  return null;
}

/**
 * The client-log body for a report: the area, the name (when there is one) and the user's text.
 * Nothing about the user; client-log adds only the path and appVersion.
 */
export function buildReport(name: string | null | undefined, message: string): ClientLogReport {
  const clean = name ? normalizeName(name).slice(0, 40) : "";
  return { area: REPORT_AREA, ...(clean ? { name: clean } : {}), message: message.trim().slice(0, REPORT_MAX) };
}
