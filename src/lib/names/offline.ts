// FR-W29: the swipe footer's sync line. Offline it always shows ("לא מחובר", plus the
// queued count); online it only shows when queued votes are stuck, so a normal flush
// (a few hundred ms after each swipe) doesn't flash it.

/** How long queued votes wait online before the footer mentions them. */
export const SYNC_STUCK_MS = 5000;

export const OFFLINE_TEXT = "לא מחובר";

/** "בחירה אחת ממתינה לסנכרון" / "3 בחירות ממתינות לסנכרון". */
export function pendingText(pending: number): string {
  return pending === 1 ? "בחירה אחת ממתינה לסנכרון" : `${pending} בחירות ממתינות לסנכרון`;
}

/**
 * The footer's sync line, or null when there is nothing to say. `stuck` = queued votes
 * have waited online for SYNC_STUCK_MS.
 */
export function syncStatusText(online: boolean, pending: number, stuck = false): string | null {
  const count = Math.max(0, Math.floor(pending));
  if (!online) return count > 0 ? `${OFFLINE_TEXT} · ${pendingText(count)}` : OFFLINE_TEXT;
  return count > 0 && stuck ? pendingText(count) : null;
}
