export type SwipeKey = "keep" | "love" | "skip" | "undo";

/** The shortcuts (FR-W11), read aloud through the swipe area's aria-describedby hint. */
export const SWIPE_KEYS_HINT =
  "קיצורי מקלדת: K שמירה, L אהבתי מאוד, S דילוג, Z ביטול. על דילוג, מקש התפריט או Shift+F10: דילוג ולא להציג שוב. על הכרטיס, Enter או רווח: פרטי השם";

const BY_CODE: Record<string, SwipeKey> = { KeyK: "keep", KeyL: "love", KeyS: "skip", KeyZ: "undo", Backspace: "undo" };
const BY_KEY: Record<string, SwipeKey> = { k: "keep", l: "love", s: "skip", z: "undo", backspace: "undo" };

type KeyInput = { key: string; code?: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; repeat?: boolean };

/**
 * The swipe shortcut for a keydown, or null: K keep, L love, S skip, Z or Backspace undo.
 * Matched by physical key first, so they work with the Hebrew layout too (K is ל there).
 * Shift is fine; Ctrl, Cmd and Alt combinations and held-down repeats are left alone.
 */
export function swipeKey(e: KeyInput): SwipeKey | null {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return null;
  return (e.code && BY_CODE[e.code]) || BY_KEY[e.key.toLowerCase()] || null;
}

/** The context-menu key or Shift+F10 (US-046: opens "דילוג ולא להציג שוב" on "דילוג"). */
export function isMenuKey(e: Pick<KeyInput, "key" | "ctrlKey" | "metaKey" | "altKey"> & { shiftKey?: boolean }): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return e.key === "ContextMenu" || (e.key === "F10" && !!e.shiftKey);
}

/** Enter or Space on the focused card (US-059: opens the name sheet). Held-down repeats don't reopen it. */
export function isOpenKey(e: Pick<KeyInput, "key" | "ctrlKey" | "metaKey" | "altKey" | "repeat"> & { shiftKey?: boolean }): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.repeat) return false;
  return e.key === "Enter" || e.key === " " || e.key === "Spacebar";
}

/** Keys typed into a text field are text, not shortcuts. */
export function isTextTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).closest !== "function") return false;
  return !!(target as Element).closest("input, textarea, select, [contenteditable]:not([contenteditable=false])");
}
