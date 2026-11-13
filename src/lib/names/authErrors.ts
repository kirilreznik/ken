import { reportClientLog } from "./clientLog";

/** FR-W5: Supabase auth errors in Hebrew; raw English never reaches the screen. */
export const WRONG_CODE_MESSAGE =
  "הקוד לא נכון או שפג תוקפו. אפשר להקליד שוב או לבקש קוד חדש כשהשליחה החוזרת תיפתח.";
export const RATE_LIMIT_MESSAGE = "נשלחו יותר מדי קודים. אפשר לנסות שוב בעוד כמה דקות.";
export const OFFLINE_MESSAGE = "אין חיבור לאינטרנט. אפשר להיכנס כשהחיבור יחזור.";
export const GENERIC_MESSAGE = "משהו השתבש. אפשר לנסות שוב.";

export type AuthErrorKind = "wrong-code" | "rate-limit" | "signups-closed" | "offline" | "other";

interface ErrorLike {
  name?: string;
  message?: string;
  status?: number;
  code?: string;
}

const NETWORK_MESSAGE = /failed to fetch|fetch failed|load failed|networkerror|network request failed/i;

/**
 * Sorts an error from supabase-js (or a thrown fetch error) into one of the FR-W5 cases.
 * Shapes seen live on Nest (EU): closed sign-ups AuthApiError 422 signup_disabled
 * "Signups not allowed for this instance"; wrong code 403 otp_expired "Token has expired or is
 * invalid"; no network AuthRetryableFetchError status 0. A 5xx is also an AuthRetryableFetchError
 * but with its status, and counts as "other".
 */
export function authErrorKind(error: unknown): AuthErrorKind {
  const e = (error ?? {}) as ErrorLike;
  const message = typeof e.message === "string" ? e.message : "";
  if (error instanceof TypeError || (e.name === "AuthRetryableFetchError" && !e.status) || NETWORK_MESSAGE.test(message)) {
    return "offline";
  }
  if (e.code === "signup_disabled" || /signups? not allowed/i.test(message)) return "signups-closed";
  if (e.code === "over_email_send_rate_limit" || e.code === "over_request_rate_limit" || e.status === 429) {
    return "rate-limit";
  }
  if (e.code === "otp_expired" || /token has expired or is invalid|invalid otp|otp has expired/i.test(message)) {
    return "wrong-code";
  }
  return "other";
}

/**
 * The error Supabase puts on the OAuth callback URL (query for PKCE, hash for the implicit form):
 * error / error_code / error_description. Null when there is none.
 */
export function urlAuthError(search: string, hash: string): ErrorLike | null {
  for (const raw of [search, hash.replace(/^#/, "")]) {
    const params = new URLSearchParams(raw);
    const error = params.get("error");
    const code = params.get("error_code");
    const description = params.get("error_description");
    if (error || code || description) {
      return { name: error ?? "oauth_error", code: code ?? undefined, message: description ?? error ?? code ?? "" };
    }
  }
  return null;
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
  const token = (v: unknown) => (typeof v === "string" && /^[\w.-]{1,64}$/.test(v) ? v : undefined);
  const label = token(e.code) ?? token(e.name) ?? "unknown";
  const status = typeof e.status === "number" ? ` ${e.status}` : "";
  void reportClientLog({ area, message: `auth error ${label}${status}` });
}

/**
 * One place for every sign-in error: the kind, the Hebrew line to show (null for closed
 * sign-ups, which go to welcome?closed=1) and a client-log report for unexpected ones.
 */
export function handleAuthError(area: string, error: unknown): { kind: AuthErrorKind; message: string | null } {
  const kind = authErrorKind(error);
  if (kind === "other") reportAuthError(area, error);
  return { kind, message: kind === "signups-closed" ? null : authErrorMessage(kind) };
}

/**
 * After a failed verify, a code known to be wrong is cleared so a new one can be typed or pasted
 * (the field keeps only the first six digits). A network or server failure keeps it: it may be right.
 */
export function clearsCode(kind: AuthErrorKind): boolean {
  return kind === "wrong-code";
}

/** True when the browser says it's offline (checked before any sign-in request). */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * The error line for the sign-in screens. While offline ConnectionNote already says
 * OFFLINE_MESSAGE, so it isn't repeated; a network failure while the phone says it's
 * online (status 0, captive portal, DNS) has no note, so the line shows it (BREAK-G1-01).
 */
export function visibleSignInError(error: string | null, online: boolean): string | null {
  return error === OFFLINE_MESSAGE && !online ? null : error;
}

/** A light check before sending: something@domain.tld, no spaces. */
export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(raw.trim());
}

export const INVALID_EMAIL_MESSAGE = "צריך כתובת אימייל, למשל name@example.com";
