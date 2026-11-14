/**
 * What led to a sign-in, for `signin_completed {after}`: a guest's sign-in card ("nudge"), the
 * wall at 100 decisions ("wall") or the AI search box ("ai"). Kept in sessionStorage for an hour,
 * so it survives the Google redirect but not a later, unrelated sign-in.
 */

export type SigninFrom = "nudge" | "wall" | "ai";

const KEY = "nest-names-signin-from";
const MAX_AGE_MS = 60 * 60 * 1000;

function store(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function markSigninFrom(from: SigninFrom, now = Date.now()): void {
  try {
    store()?.setItem(KEY, JSON.stringify({ from, at: now }));
  } catch {
    // Storage blocked: the sign-in is counted as "welcome".
  }
}

/**
 * The `after` token for signin_completed, and forgets it: the marked prompt when it is recent,
 * else "invite" on an invite link, else "welcome".
 */
export function takeSigninFrom(joining: boolean, now = Date.now()): SigninFrom | "invite" | "welcome" {
  let from: SigninFrom | null = null;
  try {
    const raw = store()?.getItem(KEY);
    store()?.removeItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as { from?: unknown; at?: unknown }) : null;
    if (
      parsed &&
      (parsed.from === "nudge" || parsed.from === "wall" || parsed.from === "ai") &&
      typeof parsed.at === "number" &&
      now - parsed.at >= 0 &&
      now - parsed.at < MAX_AGE_MS
    ) {
      from = parsed.from;
    }
  } catch {
    from = null;
  }
  return from ?? (joining ? "invite" : "welcome");
}

/** The analytics token for a sign-in error kind. */
export function failureKind(kind: string): string {
  switch (kind) {
    case "signups-closed":
      return "closed";
    case "wrong-code":
      return "wrong_code";
    case "rate-limit":
      return "rate_limit";
    case "offline":
      return "offline";
    default:
      return "other";
  }
}
