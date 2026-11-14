import { DEVICE_ID_RE } from "./aiDeck";

/**
 * A random id for this browser, so a guest's one "חיפוש לפי תיאור" try can be counted without
 * an account. It says nothing about the person; the server keeps only a hash of it. Kept in
 * localStorage, or for this page only when storage is blocked. Separate from the analytics
 * device id (track.ts), so the AI counters can't be joined to the event log.
 */
const KEY = "nest-names-ai-device";
let memo: string | null = null;

function fresh(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function deviceId(): string {
  if (memo) return memo;
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && DEVICE_ID_RE.test(stored)) return (memo = stored);
  } catch {
    // Storage blocked: an id for this page only.
  }
  memo = fresh();
  try {
    localStorage.setItem(KEY, memo);
  } catch {
    // Same as above.
  }
  return memo;
}
