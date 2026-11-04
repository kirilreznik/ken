import { reportClientLog } from "./clientLog";

/** FR-W5: Supabase auth errors in Hebrew; raw English never reaches the screen. */
export const WRONG_CODE_MESSAGE = "הקוד לא נכון או שפג תוקפו. אפשר לבקש קוד חדש.";
export const RATE_LIMIT_MESSAGE = "נשלחו יותר מדי קודים. אפשר לנסות שוב בעוד כמה דקות.";
export const OFFLINE_MESSAGE = "אין חיבור לאינטרנט. הכניסה צריכה חיבור.";
export const GENERIC_MESSAGE = "משהו השתבש. אפשר לנסות שוב.";

export type AuthErrorKind = "wrong-code" | "rate-limit" | "signups-closed" | "offline" | "other";

interface ErrorLike {
  name?: string;
  message?: string;
  status?: number;
  code?: string;
}

/** Sorts an error from supabase-js (or a thrown fetch error) into one of the FR-W5 cases. */
export function authErrorKind(error: unknown): AuthErrorKind {
  const e = (error ?? {}) as ErrorLike;
  const message = typeof e.message === "string" ? e.message : "";
  if (e.name === "AuthRetryableFetchError" || error instanceof TypeError || /failed to fetch|network/i.test(message)) {
    return "offline";
  }
  if (e.code === "signup_disabled" || /signups? not allowed/i.test(message)) return "signups-closed";
  if (e.code === "over_email_send_rate_limit" || e.code === "over_request_rate_limit" || e.status === 429) {
    return "rate-limit";
  }
  if (e.code === "otp_expired" || /token has expired or is invalid|invalid otp/i.test(message)) return "wrong-code";
  return "other";
}

/** The Hebrew line for an error kind ("signups-closed" goes to welcome?closed=1 instead). */
export function authErrorMessage(kind: AuthErrorKind): string {
  switch (kind) {
    case "wrong-code":
      return WRONG_CODE_MESSAGE;
    case "rate-limit":
      return RATE_LIMIT_MESSAGE;
    case "offline":
      return OFFLINE_MESSAGE;
    default:
      return GENERIC_MESSAGE;
  }
}

/** Reports an unexpected error by its code/status only (no email, no message text with personal data). */
export function reportAuthError(area: string, error: unknown): void {
  const e = (error ?? {}) as ErrorLike;
  void reportClientLog({ area, message: `auth error ${e.code ?? e.name ?? "unknown"} ${e.status ?? ""}`.trim() });
}

/** A light check before sending: something@domain.tld, no spaces. */
export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(raw.trim());
}

export const INVALID_EMAIL_MESSAGE = "צריך כתובת אימייל, למשל name@example.com";
