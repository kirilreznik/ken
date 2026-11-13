/** Client side of account deletion (FR-W25): the API call and the "just deleted" flag for the goodbye screen. */

export const ACCOUNT_PATH = "/api/names/account";
export const GOODBYE_PATH = "/names/goodbye";

export const DELETE_TITLE = "למחוק את החשבון?";
export const DELETE_BODY = "כל השמות ששמרת, דילגת עליהם והסתרת יימחקו, ואי אפשר יהיה לשחזר אותם. אם בחרת עם מישהו, הבחירה המשותפת תימשך בלעדיך.";
export const DELETED_TITLE = "החשבון נמחק";
export const DELETED_LEAD = "כל הבחירות שלך נמחקו מ־Nest ומהמכשיר הזה.";
export const DELETE_ERROR_TEXT = "לא הצלחנו למחוק את החשבון. אפשר לנסות שוב.";
export const DELETE_OFFLINE_TEXT = "אין חיבור לאינטרנט. אפשר למחוק כשהחיבור יחזור.";
export const DELETE_SIGNIN_TEXT = "צריך להתחבר מחדש כדי למחוק את החשבון.";
export const DELETE_WAIT_TEXT = "החשבון עוד לא נמחק, כי היו כמה ניסיונות ברצף. אפשר לנסות שוב בעוד דקה.";

/** A stalled request gives up after this and reads as "error" (NP-156). */
export const REQUEST_TIMEOUT_MS = 15000;

export type DeleteResult = "deleted" | "unauthorized" | "rate_limited" | "error";

/** DELETE /api/names/account with the access token (PRD §6). Network failures and the 15 s deadline read as "error". */
export async function requestAccountDeletion(accessToken: string, fetchImpl: typeof fetch = fetch): Promise<DeleteResult> {
  try {
    const res = await fetchImpl(ACCOUNT_PATH, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (res.status === 204) return "deleted";
    if (res.status === 401) return "unauthorized";
    if (res.status === 429) return "rate_limited";
    return "error";
  } catch {
    return "error";
  }
}

/** The message for a failed deletion; null when it worked. */
export function deleteErrorText(result: DeleteResult): string | null {
  if (result === "deleted") return null;
  if (result === "unauthorized") return DELETE_SIGNIN_TEXT;
  if (result === "rate_limited") return DELETE_WAIT_TEXT;
  return DELETE_ERROR_TEXT;
}

// Set once the server confirms, so the settings route shows the goodbye screen instead of the
// sign-in guard's redirect while the session is cleared.
let deleted = false;
const listeners = new Set<() => void>();

export function markAccountDeleted(): void {
  deleted = true;
  for (const l of listeners) l();
}

export function wasAccountDeleted(): boolean {
  return deleted;
}

export function subscribeAccountDeleted(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
