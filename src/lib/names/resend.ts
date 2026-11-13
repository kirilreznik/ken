/** FR-W4: "שליחה חוזרת" opens after a 60 s countdown that is shown in words. */
export const RESEND_SECONDS = 60;

/** Seconds left until a resend is allowed, never negative. */
export function secondsLeft(startedAt: number, now: number, total = RESEND_SECONDS): number {
  return Math.max(0, Math.ceil(total - (now - startedAt) / 1000));
}

/** The visible wait line, e.g. "אפשר לשלוח שוב בעוד 45 שניות". */
export function resendWaitText(seconds: number): string {
  if (seconds <= 0) return RESEND_READY_TEXT;
  if (seconds === 1) return "אפשר לשלוח שוב בעוד שנייה";
  return `אפשר לשלוח שוב בעוד ${seconds} שניות`;
}

export const RESEND_READY_TEXT = "אפשר לשלוח קוד חדש";

/** Shown and announced after a resend: a new code replaces the one sent before (INT-G1-01). */
export const CODE_RESENT_TEXT = "שלחנו קוד חדש. הקוד הקודם כבר לא עובד.";

/**
 * Screen readers hear the countdown at the start, every 15 s and when it's done, not every
 * second (a polite live region that changes each second is noise).
 */
export function resendAnnouncement(seconds: number, total = RESEND_SECONDS, sentNote?: string): string | null {
  if (seconds <= 0) return RESEND_READY_TEXT;
  // A resend's note rides on the restart announcement, so one live region says it once.
  if (seconds === total && sentNote) return `${sentNote} ${resendWaitText(seconds)}`;
  if (seconds === total || seconds % 15 === 0) return resendWaitText(seconds);
  return null;
}

/** Keeps only digits (also from pasted "123 456" or "123-456"), up to the code length. */
export function cleanCode(raw: string, length = 6): string {
  return raw.replace(/\D+/g, "").slice(0, length);
}
