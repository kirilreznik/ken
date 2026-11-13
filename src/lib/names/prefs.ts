import { readDuelSaves, type DuelSaves } from "./duel";
import { SECTOR_LABELS, clampRange, defaultFilters, type Filters, type NameLength, type Sector } from "./filters";
import { isThemeId } from "./themes";
import type { SpaceMember } from "./space";
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
  /** One duel per source (duel.ts `DuelSaves`). */
  duelState: DuelSaves | null;
  installHintDismissed: boolean;
  /** The last space loaded online, so the app still opens offline (FR-W29). */
  lastSpace: { spaceId: string; members: SpaceMember[] } | null;
  /** The one-time "choose together" prompt after the 5th save was shown (launch.ts). */
  invitePromptShown: boolean;
  /** The analytics session the round recap was last shown in (once per session). */
  recapSession: string | null;
  /** Sessions this user had on this device: the last session id and how many. */
  sessions: { last: string | null; count: number };
  /** The beta survey: answered, or turned down from the prompt. */
  survey: "done" | "dismissed" | null;
  /** The name marked "בחרנו", per space (device only). */
  chosen: { spaceId: string; name: string } | null;
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
  if (Array.isArray(r.themes)) {
    const themes = [...new Set(r.themes.filter(isThemeId))];
    out.themes = themes.length ? themes : null;
  }
  const range = r.letterRange as Record<string, unknown> | null | undefined;
  if (range && Number.isFinite(range.min) && Number.isFinite(range.max)) {
    out.letterRange = clampRange(range.min as number, range.max as number);
    out.length = null;
  }
  return out;
}

const bool = (v: unknown) => v === true;

function readLastSpace(raw: unknown): Prefs["lastSpace"] {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.spaceId !== "string" || !r.spaceId || !Array.isArray(r.members)) return null;
  const members = r.members.filter(
    (m): m is SpaceMember =>
      typeof m === "object" &&
      m !== null &&
      typeof m.userId === "string" &&
      typeof m.displayName === "string" &&
      typeof m.joinedAt === "string",
  );
  return { spaceId: r.spaceId, members };
}

/** Turns a parsed value into a valid pref, falling back to the default. */
const readers: { [K in PrefKey]: (raw: unknown) => Prefs[K] } = {
  surname: (v) => (typeof v === "string" ? v : ""),
  filters: readFilters,
  background: (v) => oneOf(BACKGROUNDS)(v) ?? "fabric",
  introSeen: bool,
  seenMatches: (v) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []),
  duelState: readDuelSaves,
  installHintDismissed: bool,
  lastSpace: readLastSpace,
  invitePromptShown: bool,
  recapSession: (v) => (typeof v === "string" && v ? v : null),
  sessions: (v) => {
    const r = (typeof v === "object" && v !== null ? v : {}) as Record<string, unknown>;
    const count = typeof r.count === "number" && Number.isInteger(r.count) && r.count > 0 ? r.count : 0;
    return { last: typeof r.last === "string" && r.last ? r.last : null, count };
  },
  survey: (v) => (v === "done" || v === "dismissed" ? v : null),
  chosen: (v) => {
    const r = (typeof v === "object" && v !== null ? v : {}) as Record<string, unknown>;
    return typeof r.spaceId === "string" && r.spaceId && typeof r.name === "string" && r.name
      ? { spaceId: r.spaceId, name: r.name }
      : null;
  },
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

/**
 * Users signed out on this page. A fetch that started before sign-out can resolve after
 * clearAll; its write is dropped so nothing of theirs is left behind. openPrefs undoes it.
 */
const closed = new Set<string>();

/** Allows pref writes for a user again (they signed in). */
export function openPrefs(userId: string): void {
  closed.delete(userId);
}

/** Returns false when the value couldn't be stored (no storage, quota, user signed out). */
export function setPref<K extends PrefKey>(userId: string, key: K, value: Prefs[K]): boolean {
  const s = storage();
  if (!s || closed.has(userId)) return false;
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

/** Removes every nest-names:{userId}:* key and drops later writes until openPrefs (sign-out). */
export function clearAll(userId: string): void {
  closed.add(userId);
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
