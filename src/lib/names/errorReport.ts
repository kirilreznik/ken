/** The render error boundary's copy and its `client-log` report (FR-W33). */

import type { ClientLogReport } from "./clientLog";

export const ERROR_AREA = "names-render";
export const ERROR_TITLE = "משהו השתבש";
export const ERROR_LEAD = "אפשר לנסות שוב, או לחזור לבחירת שם.";
export const ERROR_RETRY = "ניסיון חוזר";

/**
 * The report for a render error: the error's type and Next's digest only. The message is left
 * out, since it can carry a name, an email or a vote from the screen that failed.
 */
export function renderErrorReport(error: { name?: unknown; digest?: unknown } | null | undefined): ClientLogReport {
  const type = typeof error?.name === "string" && /^[A-Za-z]{1,40}$/.test(error.name) ? error.name : "Error";
  const digest = typeof error?.digest === "string" && /^[\w-]{1,64}$/.test(error.digest) ? error.digest : null;
  return { area: ERROR_AREA, message: digest ? `render ${type} (${digest})` : `render ${type}` };
}
