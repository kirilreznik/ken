// One toast at a time (role status): undo hints, "עדכון זמין" with "רענון", save errors.
// A module store read with useSyncExternalStore by <ToastRegion>; a new toast replaces
// the current one.

export type ToastAction = { label: string; onAction: () => void };
/** A link after the action, to the screen where the result can be found ("לשמות שהסתרתי"). */
export type ToastLink = { label: string; href: string };
/** sticky: shown until dismissed, so it sits clear of more controls (toastLift, NP-BUG-011). */
/** leaving: dismissed, fading out for TOAST_EXIT ms before it unmounts (NP-096). */
export type Toast = {
  id: number;
  message: string;
  action?: ToastAction;
  link?: ToastLink;
  sticky: boolean;
  leaving?: boolean;
};
export type ToastOptions = {
  action?: ToastAction;
  link?: ToastLink;
  /** ms; 0 keeps it until dismissed. */
  duration?: number;
};

export const TOAST_DURATION = 4000;
// A toast with an action stays longer so there is time to reach the button.
export const TOAST_ACTION_DURATION = 8000;
// The exit (names.css .names-toast[data-leaving], --nest-duration-fade).
export const TOAST_EXIT = 160;

let current: Toast | null = null;
// Shown until dismissed ("עדכון זמין"): it outlives the screen it came up on.
let sticky = false;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;
let exitTimer: ReturnType<typeof setTimeout> | undefined;
// The timer pauses while the page is hidden (NP-096): a toast shown as the person switches
// apps is still up when they come back. remaining is the time left when it paused.
let deadline = 0;
let remaining = 0;
let watchingVisibility = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToast(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToast(): Toast | null {
  return current;
}

function startTimer(id: number, ms: number) {
  clearTimeout(timer);
  remaining = ms;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  deadline = Date.now() + ms;
  timer = setTimeout(() => dismissToast(id), ms);
}

function onVisibilityChange() {
  if (!current || current.leaving || current.sticky) return;
  if (document.visibilityState === "hidden") {
    clearTimeout(timer);
    remaining = Math.max(0, deadline - Date.now());
  } else {
    startTimer(current.id, remaining);
  }
}

export function showToast(message: string, options: ToastOptions = {}): number {
  clearTimeout(timer);
  clearTimeout(exitTimer);
  if (!watchingVisibility && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibilityChange);
    watchingVisibility = true;
  }
  const id = nextId++;
  const duration = options.duration ?? (options.action || options.link ? TOAST_ACTION_DURATION : TOAST_DURATION);
  sticky = duration <= 0;
  current = { id, message, action: options.action, link: options.link, sticky };
  if (duration > 0) startTimer(id, duration);
  emit();
  return id;
}

/** Dismisses the toast `id`, or whichever is showing when no id is given: it fades out, then goes. */
export function dismissToast(id?: number): void {
  if (!current || current.leaving || (id !== undefined && current.id !== id)) return;
  clearTimeout(timer);
  const leaving = { ...current, leaving: true };
  current = leaving;
  emit();
  exitTimer = setTimeout(() => {
    if (current === leaving) {
      current = null;
      emit();
    }
  }, TOAST_EXIT);
}

/**
 * A sheet opening ends the toast of the screen under it (NP-BUG-006): its moment, and its "ביטול",
 * have passed once another layer is on top, and it would sit on the sheet's fields. A toast that
 * stays until dismissed is kept.
 */
export function dismissScreenToast(): void {
  if (!sticky) dismissToast();
}
