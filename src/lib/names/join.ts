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
