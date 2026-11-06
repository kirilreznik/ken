/**
 * Leaving a shared space (product review step 6). `names_leave` (migration 0011 in
 * kirilreznik/pregnancy-manager) gives the user a new solo space with their own votes; the
 * others keep the shared one, without the user's votes.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { clearInviteCache } from "./invite";
import { removePref, setPref } from "./prefs";
import { clearSpaceCache } from "./space";

export const LEAVE_DIALOG = "leave-space";
export const LEAVE_TITLE = "לצאת מהבחירה המשותפת?";
export const LEAVE_DONE = "יצאת מהבחירה המשותפת. השמות ששמרת איתך.";
export const LEAVE_OFFLINE = "אין חיבור לאינטרנט. אפשר לנסות שוב כשהחיבור יחזור.";
export const LEAVE_FAILED = "היציאה לא הצליחה. אפשר לנסות שוב.";

/** The dialog body, naming the others when their names are known. */
export function leaveBody(others: readonly string[]): string {
  const who = others.filter(Boolean);
  const them = who.length === 1 ? who[0] : who.length > 1 ? who.join(", ") : "מי שבוחר איתך";
  return `השמות ששמרת יישארו אצלך, ברשימה נפרדת. ההתאמות עם ${them} יימחקו, והבחירה המשותפת תימשך בלעדיך. כדי לחזור צריך קישור הזמנה חדש.`;
}

export type LeaveResult = { kind: "left"; spaceId: string } | { kind: "not-shared" } | { kind: "offline" } | { kind: "error"; reason: string };

/** Error text of names_leave → a short reason token for analytics. */
export function leaveReason(err: unknown): string {
  const e = err as { message?: unknown; code?: unknown } | null;
  const message = typeof e?.message === "string" ? e.message : "";
  if (message.includes("not_shared")) return "not_shared";
  if (message.includes("not_names_space")) return "not_names_space";
  if (message.includes("no_space")) return "no_space";
  // PGRST202: the function doesn't exist (0011 not applied yet).
  if (e?.code === "PGRST202") return "missing_rpc";
  return "error";
}

export async function leaveSpace(client: SupabaseClient): Promise<LeaveResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return { kind: "offline" };
  try {
    const { data, error } = await client.rpc("names_leave");
    if (error) {
      const reason = leaveReason(error);
      return reason === "not_shared" ? { kind: "not-shared" } : { kind: "error", reason };
    }
    if (typeof data !== "string" || !data) return { kind: "error", reason: "no_id" };
    return { kind: "left", spaceId: data };
  } catch {
    return { kind: "offline" };
  }
}

/** After leaving: every cached space, member list and invite is stale, and the old space's device state goes. */
export function afterLeave(userId: string): void {
  clearSpaceCache();
  clearInviteCache();
  setPref(userId, "lastSpace", null);
  removePref(userId, "seenMatches");
  removePref(userId, "duelState");
  removePref(userId, "chosen");
}
