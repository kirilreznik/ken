import { deserialize as deserializeDuel, type DuelState } from "./duel";
import { SECTOR_LABELS, defaultFilters, type Filters, type NameLength, type Sector } from "./filters";
import type { PopularityBand, SexTag, TrendWord } from "./types";

/** FR-W17. "own" is the user's photo in IndexedDB (photo.ts). */
export type Background = "none" | "fabric" | "notebook" | "nursery" | "own";

export const BACKGROUNDS: readonly Background[] = ["none", "fabric", "notebook", "nursery", "own"];

/** Device-only preferences (PRD 3.2.8). Each lives in localStorage as JSON. */
export interface Prefs {
  surname: string;
  filters: Filters;
  background: Background;
  introSeen: boolean;
  /** Match names the user has already been shown. */
  seenMatches: string[];
  duelState: DuelState | null;
  installHintDismissed: boolean;
}

export type PrefKey = keyof Prefs;

const PREFIX = "nest-names:";

export function prefKey(userId: string, key: PrefKey): string {
  return `${PREFIX}${userId}:${key}`;
}

const SEX_TAGS: readonly SexTag[] = ["בן", "בת", "מתאים לכולם"];
const BANDS: readonly PopularityBand[] = ["נפוץ", "בינוני", "נדיר"];
const TRENDS: readonly TrendWord[] = ["בעלייה", "בירידה", "יציב"];
const LENGTHS: readonly NameLength[] = ["קצר", "ארוך"];
const SECTORS = Object.keys(SECTOR_LABELS) as Sector[];

const oneOf =
  <T extends string>(allowed: readonly T[]) =>
  (v: unknown): T | null =>
    allowed.includes(v as T) ? (v as T) : null;

/** Keeps every valid group, resets the rest to "all". */
function readFilters(raw: unknown): Filters {
  const out = defaultFilters();
  if (typeof raw !== "object" || raw === null) return out;
  const r = raw as Record<string, unknown>;
  out.sex = oneOf(SEX_TAGS)(r.sex);
  out.popularity = oneOf(BANDS)(r.popularity);
  out.trend = oneOf(TRENDS)(r.trend);
  out.letter = typeof r.letter === "string" && /^\p{L}$/u.test(r.letter) ? r.letter : null;
  out.length = oneOf(LENGTHS)(r.length);
  out.origin = oneOf(SECTORS)(r.origin);
  return out;
}

const bool = (v: unknown) => v === true;

/** Turns a parsed value into a valid pref, falling back to the default. */
const readers: { [K in PrefKey]: (raw: unknown) => Prefs[K] } = {
  surname: (v) => (typeof v === "string" ? v : ""),
  filters: readFilters,
  background: (v) => oneOf(BACKGROUNDS)(v) ?? "fabric",
  introSeen: bool,
  seenMatches: (v) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []),
  duelState: (v) => (v == null ? null : deserializeDuel(JSON.stringify(v))),
  installHintDismissed: bool,
};

export function defaultPref<K extends PrefKey>(key: K): Prefs[K] {
  return readers[key](undefined);
}

/** localStorage, or null on the server or when the browser blocks it. */
function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function getPref<K extends PrefKey>(userId: string, key: K): Prefs[K] {
  const read = readers[key];
  let text: string | null = null;
  try {
    text = storage()?.getItem(prefKey(userId, key)) ?? null;
  } catch {
    // Blocked storage reads as "not set".
  }
  if (text === null) return read(undefined);
  try {
    return read(JSON.parse(text));
  } catch {
    return read(undefined);
  }
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/**
 * Calls the listener after any pref changes, in this tab (setPref, removePref, clearAll)
 * or in another one (storage event). For useSyncExternalStore; returns the unsubscribe.
 */
export function subscribePrefs(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(PREFIX)) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Returns false when the value couldn't be stored (no storage, quota). */
export function setPref<K extends PrefKey>(userId: string, key: K, value: Prefs[K]): boolean {
  const s = storage();
  if (!s) return false;
  try {
    s.setItem(prefKey(userId, key), JSON.stringify(value));
  } catch {
    return false;
  }
  notify();
  return true;
}

export function removePref(userId: string, key: PrefKey): void {
  try {
    storage()?.removeItem(prefKey(userId, key));
  } catch {
    // Nothing to remove.
  }
  notify();
}

/** Removes every nest-names:{userId}:* key (sign-out of a deleted account). */
export function clearAll(userId: string): void {
  const s = storage();
  if (!s) return;
  const prefix = `${PREFIX}${userId}:`;
  try {
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k?.startsWith(prefix)) keys.push(k);
    }
    for (const k of keys) s.removeItem(k);
  } catch {
    // Blocked storage has nothing of ours in it.
  }
  notify();
}
