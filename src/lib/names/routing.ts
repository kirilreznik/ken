import { APP_PATH } from "./auth";
import { callbackUrl, normalizeJoinCode } from "./join";

export const ONBOARDING_PATH = "/names/onboarding";
export const INTRO_PATH = "/names/intro";
/** The intro opened from the name sheet's "הוספת שם משפחה" (FR-D8); it returns with Back. */
export const SURNAME_PATH = `${INTRO_PATH}?from=name`;

/** Whether the intro was opened from the name sheet (its search string, with or without "?"). */
export function introFromSheet(search: string): boolean {
  return new URLSearchParams(search).get("from") === "name";
}

export const GOOGLE_FAILED_MESSAGE = "הכניסה עם Google לא הצליחה";

export function joinPath(code: string): string {
  return `/names/join/${encodeURIComponent(code)}`;
}

interface UserLike {
  user_metadata?: Record<string, unknown> | null;
}

/** Onboarding is done once user_metadata.terms_accepted_at holds a timestamp (FR-W7). */
export function hasAcceptedTerms(user: UserLike | null | undefined): boolean {
  const accepted = user?.user_metadata?.terms_accepted_at;
  return typeof accepted === "string" && accepted !== "";
}

/**
 * FR-W6, where a signed-in user goes next: onboarding until the terms are accepted, then a
 * pending invite, then the intro (once per device), then the swipe screen.
 */
export function nextRoute(user: UserLike, prefs: { introSeen: boolean }, pendingJoin: string | null): string {
  if (!hasAcceptedTerms(user)) return ONBOARDING_PATH;
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
