// One toast at a time (role status): undo hints, "עדכון זמין" with "רענון", save errors.
// A module store read with useSyncExternalStore by <ToastRegion>; a new toast replaces
// the current one.

export type ToastAction = { label: string; onAction: () => void };
/** A link after the action, to the screen where the result can be found ("לשמות שהסתרתי"). */
export type ToastLink = { label: string; href: string };
export type Toast = { id: number; message: string; action?: ToastAction; link?: ToastLink };
export type ToastOptions = {
  action?: ToastAction;
  link?: ToastLink;
  /** ms; 0 keeps it until dismissed. */
  duration?: number;
};

export const TOAST_DURATION = 4000;
// A toast with an action stays longer so there is time to reach the button.
export const TOAST_ACTION_DURATION = 8000;

let current: Toast | null = null;
let nextId = 1;
let timer: ReturnType<typeof setTimeout> | undefined;
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

export function showToast(message: string, options: ToastOptions = {}): number {
  clearTimeout(timer);
  const id = nextId++;
  current = { id, message, action: options.action, link: options.link };
  const duration = options.duration ?? (options.action || options.link ? TOAST_ACTION_DURATION : TOAST_DURATION);
  if (duration > 0) timer = setTimeout(() => dismissToast(id), duration);
  emit();
  return id;
}

/** Dismisses the toast `id`, or whichever is showing when no id is given. */
export function dismissToast(id?: number): void {
  if (!current || (id !== undefined && current.id !== id)) return;
  clearTimeout(timer);
  current = null;
  emit();
}
