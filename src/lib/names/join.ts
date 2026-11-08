/**
 * Pending invite code (PRD 3.2.5). Opening /names/join/{code} signed out keeps the code in
 * sessionStorage and in the OAuth redirectTo (?join=), so it survives every sign-in path and
 * the join completes after sign-in and onboarding.
 */

export const JOIN_STORAGE_KEY = "nest-names-join";
export const JOIN_PARAM = "join";
export const CALLBACK_PATH = "/names/auth/callback";

/** Invite codes are short and URL-safe (names_invite() returns 8 characters). Anything else is ignored. */
export function normalizeJoinCode(raw: string | null | undefined): string | null {
  const code = raw?.trim() ?? "";
  return /^[A-Za-z0-9_-]{4,64}$/.test(code) ? code : null;
}

type SessionLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function sessionStore(): SessionLike | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

/** Stores the code for the rest of this tab's sign-in. */
export function rememberJoinCode(raw: string, storage: SessionLike | null = sessionStore()): string | null {
  const code = normalizeJoinCode(raw);
  if (!code || !storage) return code;
  try {
    storage.setItem(JOIN_STORAGE_KEY, code);
  } catch {
    // Storage can be full or blocked; the ?join= param still carries the code.
  }
  return code;
}

/**
 * The pending code: ?join= in the current URL wins (and is stored, so a later page without the
 * param still knows it), otherwise sessionStorage.
 */
export function readPendingJoin(search: string, storage: SessionLike | null = sessionStore()): string | null {
  const fromUrl = normalizeJoinCode(new URLSearchParams(search).get(JOIN_PARAM));
  if (fromUrl) return rememberJoinCode(fromUrl, storage);
  try {
    return normalizeJoinCode(storage?.getItem(JOIN_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** After names_join succeeds or the code is rejected. */
export function clearPendingJoin(storage: SessionLike | null = sessionStore()): void {
  try {
    storage?.removeItem(JOIN_STORAGE_KEY);
  } catch {
    // Nothing stored then.
  }
}

/** Appends ?join={code} to a same-site path (sign-in links, the OAuth callback). */
export function withJoin(path: string, code: string | null): string {
  if (!code) return path;
  const [base, hash = ""] = path.split("#");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${JOIN_PARAM}=${encodeURIComponent(code)}${hash ? `#${hash}` : ""}`;
}

/** OAuth redirectTo (FR-W2): {origin}/names/auth/callback[?join=CODE]. */
export function callbackUrl(origin: string, code: string | null): string {
  return withJoin(`${origin.replace(/\/+$/, "")}${CALLBACK_PATH}`, code);
}

/** FR-W24 copy. Each message is a short title (no period, like every screen title) plus its second sentence as the lead. */
export const JOIN_INVITED_TITLE = "קיבלת הזמנה לבחור שם ביחד ב־Nest";
export const JOIN_INVITED_LEAD = "הבחירה נעשית בנפרד, בכל טלפון. שם שנשמר אצל שניים או יותר יופיע בהתאמות.";
export const JOIN_COPY = {
  joined: { title: "הצטרפת", lead: "מעכשיו שמות שנשמרו אצל שניים או יותר יופיעו בהתאמות." },
  already: { title: "כבר משתתפים בבחירה הזו", lead: "אפשר להמשיך לבחור." },
  invalid: { title: "הקישור כבר לא בתוקף, או שכבר השתמשו בו", lead: "אפשר לבקש קישור חדש ממי ששלח את ההזמנה." },
  offline: { title: "אין חיבור לאינטרנט", lead: "אפשר לנסות שוב כשהחיבור יחזור." },
  error: { title: "ההצטרפות לא הצליחה", lead: "אפשר לנסות שוב." },
} as const;
export const VOTES_MOVE_TEXT = "השמות ששמרת עברו איתך לבחירה המשותפת.";

export type JoinOutcome =
  | { kind: "joined"; spaceId: string; votesMoved: boolean }
  | { kind: "already"; spaceId: string }
  | { kind: "invalid" }
  | { kind: "offline" }
  | { kind: "error" };

/** names_join raises `invalid_code` for an unknown, used or expired code. */
export function isInvalidCodeError(err: unknown): boolean {
  const message = (err as { message?: unknown } | null)?.message;
  return typeof message === "string" && message.includes("invalid_code");
}

/**
 * Reads a names_join result against the space the user was in before. The same space back
 * means the user already belonged to it (their own link, or a second click); then nothing moved.
 */
export function joinOutcome(before: { spaceId: string | null; solo: boolean; saved: number }, joinedSpaceId: string): JoinOutcome {
  if (before.spaceId === joinedSpaceId) return { kind: "already", spaceId: joinedSpaceId };
  return { kind: "joined", spaceId: joinedSpaceId, votesMoved: before.solo && before.saved > 0 };
}
