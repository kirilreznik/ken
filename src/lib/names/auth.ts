import { clearInviteCache } from "./invite";
import { clearAll } from "./prefs";
import { clearMatchesCache } from "./matches";
import { deleteOwnPhoto } from "./photo";
import { clearSpaceCache } from "./space";
import { clearVoteCache } from "./voteStore";

export const WELCOME_PATH = "/names/welcome";
export const APP_PATH = "/names";

/** Query flag on welcome after a rejected refresh token (FR-W8): shows "צריך להיכנס שוב". */
export const EXPIRED_PARAM = "expired";
export const EXPIRED_MESSAGE = "צריך להיכנס שוב";

/** Query flag on welcome when Supabase refuses a new account (PRD 3.2.2, FR-W5). */
export const CLOSED_PARAM = "closed";
export const SIGNUPS_CLOSED_MESSAGE = "ההרשמה עוד לא פתוחה. אפשר להשאיר אימייל בעמוד הבית ונעדכן כשנפתח.";
export const WAITLIST_HREF = "/#waitlist";

/** Routes that never need a session (PRD 3.2.11). Everything else under /names is an app page. */
const PUBLIC_PATHS = [
  "/names/welcome",
  "/names/sign-in",
  "/names/auth/callback",
  "/names/privacy",
  "/names/terms",
  "/names/about",
  "/names/join",
];

function stripTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export function isPublicPath(pathname: string): boolean {
  const path = stripTrailingSlash(pathname);
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

export function isJoinPath(pathname: string): boolean {
  return /^\/names\/join\/[^/]+\/?$/.test(pathname);
}

/**
 * Only a same-site /names path may be a ?next= target (no open redirects):
 * absolute URLs, protocol-relative "//x" and backslash tricks are rejected.
 */
export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  const path = next.split(/[?#]/)[0];
  if (path !== APP_PATH && !path.startsWith(`${APP_PATH}/`)) return null;
  if (path.split("/").some((seg) => seg === "..")) return null;
  return next;
}

/** Where the guard sends a signed-out visitor: welcome, with ?next= for join links and ?expired=1 after FR-W8. */
export function welcomeUrl(pathname: string, opts: { expired?: boolean } = {}): string {
  const params = new URLSearchParams();
  if (isJoinPath(pathname)) params.set("next", pathname);
  if (opts.expired) params.set(EXPIRED_PARAM, "1");
  const q = params.toString();
  return q ? `${WELCOME_PATH}?${q}` : WELCOME_PATH;
}

/** Removes everything this user left on the device: prefs, the own photo, the votes cache with its outbox and the cached matches. */
export async function clearLocalData(userId: string): Promise<void> {
  clearAll(userId);
  clearSpaceCache();
  clearInviteCache();
  try {
    await Promise.all([deleteOwnPhoto(userId), clearVoteCache(userId), clearMatchesCache(userId)]);
  } catch {
    // IndexedDB can be unavailable (private mode); nothing to clear then.
  }
}
