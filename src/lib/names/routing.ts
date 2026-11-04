import { APP_PATH } from "./auth";
import { callbackUrl, normalizeJoinCode } from "./join";

export const ONBOARDING_PATH = "/names/onboarding";
export const INTRO_PATH = "/names/intro";

export const GOOGLE_FAILED_MESSAGE = "הכניסה עם Google לא הצליחה";

export function joinPath(code: string): string {
  return `/names/join/${encodeURIComponent(code)}`;
}

interface UserLike {
  user_metadata?: Record<string, unknown> | null;
}

/**
 * FR-W6, where a signed-in user goes next: onboarding until the terms are accepted, then a
 * pending invite, then the intro (once per device), then the swipe screen.
 */
export function nextRoute(user: UserLike, prefs: { introSeen: boolean }, pendingJoin: string | null): string {
  const accepted = user.user_metadata?.terms_accepted_at;
  if (typeof accepted !== "string" || accepted === "") return ONBOARDING_PATH;
  const code = normalizeJoinCode(pendingJoin);
  if (code) return joinPath(code);
  if (!prefs.introSeen) return INTRO_PATH;
  return APP_PATH;
}

/** OAuth redirectTo (FR-W2): NEXT_PUBLIC_SITE_URL when set, else this origin, plus ?join= when pending. */
export function oauthRedirectTo(siteUrl: string | undefined, origin: string, join: string | null): string {
  const base = siteUrl?.trim() || origin;
  return callbackUrl(base, join);
}

/**
 * The provider's error on the callback URL (query, or hash for the implicit form), or null.
 * Supabase sends error / error_code / error_description when Google or the exchange fails.
 */
export function callbackError(search: string, hash: string): string | null {
  for (const raw of [search, hash.replace(/^#/, "")]) {
    const params = new URLSearchParams(raw);
    const msg = params.get("error_description") ?? params.get("error_code") ?? params.get("error");
    if (msg) return msg;
  }
  return null;
}
