// FR-W29: the swipe footer's sync line. Offline it always shows ("אין חיבור", plus the
// queued count); online it only shows when queued votes are stuck, so a normal flush
// (a few hundred ms after each swipe) doesn't flash it.

import { formatCount } from "./card";

/** How long queued votes wait online before the footer mentions them. */
export const SYNC_STUCK_MS = 5000;

export const OFFLINE_TEXT = "אין חיבור";

/** The start of a caption-size offline line (name sheet details, matches list), after the wifi-off mark. */
export const OFFLINE_LINE = "אין חיבור לאינטרנט.";

/**
 * NP-078: what happens to queued votes, in the undo button's word ("החלטה"). Offline:
 * "החלטה אחת תישלח כשהחיבור יחזור" / "3 החלטות יישלחו כשהחיבור יחזור"; online (stuck):
 * "החלטה אחת עוד לא נשלחה" / "3 החלטות עוד לא נשלחו".
 */
export function pendingText(pending: number, offline = true): string {
  if (offline) {
    return pending === 1 ? "החלטה אחת תישלח כשהחיבור יחזור" : `${formatCount(pending)} החלטות יישלחו כשהחיבור יחזור`;
  }
  return pending === 1 ? "החלטה אחת עוד לא נשלחה" : `${formatCount(pending)} החלטות עוד לא נשלחו`;
}

/** NP-073: online, nothing cached and the votes read failed; the store retries every 30 s. */
export const VOTES_LOAD_FAILED_TEXT = "לא הצלחנו לטעון את הבחירות. מנסים שוב.";

/** The same failure where a list would be (saved, hidden): in place of its empty state. */
export const LIST_LOAD_FAILED = { title: "לא הצלחנו לטעון את הרשימה.", lead: "מנסים שוב מעצמנו בעוד רגע." } as const;

/** NP-074: the "התאמות" tab when `name_matches` failed and there's no cache. */
export const MATCHES_LOAD_FAILED_TITLE = "לא הצלחנו לטעון את ההתאמות.";

/**
 * The footer's sync line, or null when there is nothing to say. `stuck` = queued votes
 * have waited online for SYNC_STUCK_MS; `loadFailed` = the votes couldn't be read (NP-073).
 */
export function syncStatusText(online: boolean, pending: number, stuck = false, loadFailed = false): string | null {
  const count = Math.max(0, Math.floor(pending));
  if (!online) return count > 0 ? `${OFFLINE_TEXT} · ${pendingText(count)}` : OFFLINE_TEXT;
  if (loadFailed) return VOTES_LOAD_FAILED_TEXT;
  return count > 0 && stuck ? pendingText(count, false) : null;
}
