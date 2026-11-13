import type { SupabaseClient } from "@supabase/supabase-js";
import { createStore, delMany, get, keys, set, type UseStore } from "idb-keyval";
import { formatCount } from "./card";
import { getSupabase } from "./supabase";

/**
 * Names everyone in a shared space kept (PRD 3.2.10): `rpc('name_matches')`, refetched on
 * focus, 2 s after the user's own votes change and every 60 s while a screen that shows
 * them is visible. The last result is cached in IndexedDB. A space of one makes no calls.
 */

export const MATCHES_DB = "nest-names-matches";
const STORE = "kv";

export const MATCHES_INTERVAL_MS = 60_000;
export const VOTE_DEBOUNCE_MS = 2_000;

export interface Match {
  name: string;
  keptByCount: number;
  lovedByCount: number;
  matchedAt: string;
}

export interface MatchesState {
  /** False until the cache (or the server) has been read. */
  ready: boolean;
  /** Newest first. */
  matches: readonly Match[];
  /** Epoch ms of the last successful fetch; null when never fetched. */
  fetchedAt: number | null;
  /** The last request failed (error or no network); cleared by the next successful one (NP-074). */
  failed: boolean;
}

export interface MatchesStore {
  getState(): MatchesState;
  subscribe(listener: () => void): () => void;
  /** Reads the cache, then the server. */
  load(): Promise<void>;
  /** Fetches now (no-op for a space of one). */
  refresh(): Promise<void>;
  /** Call on each change of the user's own votes; fetches 2 s after the last one. */
  votesChanged(): void;
  /** Refetches on focus and every 60 s while the page is visible; returns the stop function. */
  start(): () => void;
  dispose(): Promise<void>;
}

export interface MatchesStoreOptions {
  spaceId: string;
  userId: string;
  /** Two or more members; a space of one has no matches and makes no calls. */
  shared: boolean;
  client?: SupabaseClient | null;
  now?: () => number;
}

interface MatchRow {
  name: string;
  kept_by_count: number | null;
  loved_by_count: number | null;
  matched_at: string;
}

interface CachedMatches {
  matches: Match[];
  fetchedAt: number;
}

let idbStore: UseStore | null = null;

function matchesIdb(): UseStore | null {
  if (typeof indexedDB === "undefined") return null;
  idbStore ??= createStore(MATCHES_DB, STORE);
  return idbStore;
}

const cacheKey = (userId: string, spaceId: string) => `${userId}:${spaceId}:matches`;

/** Removes this user's cached matches (sign-out, account deletion). */
export async function clearMatchesCache(userId: string): Promise<void> {
  const store = matchesIdb();
  if (!store) return;
  const all = await keys<string>(store);
  await delMany(
    all.filter((k) => typeof k === "string" && k.startsWith(`${userId}:`)),
    store,
  );
}

/** Rows from `name_matches`, newest match first. */
export function toMatches(rows: readonly MatchRow[]): Match[] {
  return rows
    .filter((row) => typeof row.name === "string" && row.name !== "")
    .map((row) => ({
      name: row.name,
      keptByCount: row.kept_by_count ?? 0,
      lovedByCount: row.loved_by_count ?? 0,
      matchedAt: row.matched_at,
    }))
    .sort((a, b) => (Date.parse(b.matchedAt) || 0) - (Date.parse(a.matchedAt) || 0));
}

/** Matches the user hasn't seen yet (the match sheet shows them once). */
export function newMatches(matches: readonly Match[], seenMatches: Iterable<string>): Match[] {
  const seen = new Set(seenMatches);
  return matches.filter((m) => !seen.has(m.name));
}

function isCached(value: unknown): value is CachedMatches {
  const v = value as CachedMatches | undefined;
  return !!v && Array.isArray(v.matches) && typeof v.fetchedAt === "number";
}

export function createMatchesStore({
  spaceId,
  userId,
  shared,
  client = getSupabase(),
  now = Date.now,
}: MatchesStoreOptions): MatchesStore {
  let state: MatchesState = { ready: false, matches: [], fetchedAt: null, failed: false };
  const listeners = new Set<() => void>();
  let disposed = false;
  let fetching: Promise<void> | null = null;
  let again = false;
  let debounce: ReturnType<typeof setTimeout> | null = null;
  let persistChain: Promise<void> = Promise.resolve();
  const stops = new Set<() => void>();

  function setState(next: Partial<MatchesState>) {
    state = { ...state, ...next };
    for (const listener of listeners) listener();
  }

  async function fetchOnce() {
    if (!client || disposed) return;
    try {
      const { data, error } = await client.rpc("name_matches", { p_space: spaceId });
      if (disposed) return;
      if (error || !Array.isArray(data)) {
        if (!state.failed) setState({ failed: true });
        return;
      }
      const matches = toMatches(data as MatchRow[]);
      const fetchedAt = now();
      setState({ ready: true, matches, fetchedAt, failed: false });
      const store = matchesIdb();
      if (store) {
        const entry: CachedMatches = { matches, fetchedAt };
        persistChain = persistChain.then(() => set(cacheKey(userId, spaceId), entry, store)).catch(() => {
          // IndexedDB can be unavailable (private mode); the store keeps working in memory.
        });
      }
    } catch {
      // Offline: keep the last result.
      if (!disposed && !state.failed) setState({ failed: true });
    }
  }

  /** One request at a time; a request during a fetch runs one more after it. */
  function refresh(): Promise<void> {
    if (!shared || disposed) return Promise.resolve();
    if (fetching) {
      again = true;
      return fetching;
    }
    // Cleared inside the loop's own task, so a request right after the last pass starts a new fetch.
    fetching = (async () => {
      try {
        do {
          again = false;
          await fetchOnce();
        } while (again && !disposed);
      } finally {
        fetching = null;
      }
    })();
    return fetching;
  }

  async function load() {
    const store = matchesIdb();
    if (shared && store) {
      try {
        const cached = await get<unknown>(cacheKey(userId, spaceId), store);
        // A fetch that finished first is newer than the cache.
        if (isCached(cached) && !disposed && state.fetchedAt === null) {
          setState({ matches: cached.matches, fetchedAt: cached.fetchedAt });
        }
      } catch {
        // No cache: the fetch below fills the state.
      }
    }
    if (!disposed) setState({ ready: true });
    await refresh();
  }

  function votesChanged() {
    if (!shared || disposed) return;
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      debounce = null;
      void refresh();
    }, VOTE_DEBOUNCE_MS);
  }

  function start() {
    if (typeof window === "undefined" || !shared) return () => {};
    const visible = () => document.visibilityState === "visible";
    const onFocus = () => void refresh();
    const onVisible = () => {
      if (visible()) void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(() => {
      if (visible()) void refresh();
    }, MATCHES_INTERVAL_MS);
    const stop = () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
      stops.delete(stop);
    };
    stops.add(stop);
    return stop;
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    refresh,
    votesChanged,
    start,
    async dispose() {
      disposed = true;
      if (debounce) clearTimeout(debounce);
      for (const stop of [...stops]) stop();
      listeners.clear();
      await persistChain;
    },
  };
}

/** "{n} שמרו" for a match kept by 3 or more (FR-W19); null for two, the usual case. */
export function keptByText(match: Match): string | null {
  return match.keptByCount >= 3 ? `${formatCount(match.keptByCount)} שמרו` : null;
}

/** The line under the name on the match sheet (board 4). */
export function matchSheetLine(match: Match): string {
  return match.keptByCount >= 3 ? `${match.keptByCount} שמרו את השם הזה.` : "שניים שמרו את השם הזה.";
}

/** The explainer above the "התאמות" list (board 5); never says who skipped what. */
export function matchesIntro(memberCount: number): string {
  if (memberCount < 2) return "התאמות יופיעו כשמישהו נוסף יבחר איתך. הדילוגים נשארים פרטיים.";
  return "שמות שנשמרו אצל שניים או יותר. על דילוגים אף אחד לא יודע.";
}

/** The newest match the user hasn't been shown on this device, or null. */
export function matchToShow(matches: readonly Match[], seenMatches: Iterable<string>): Match | null {
  return newMatches(matches, seenMatches)[0] ?? null;
}

/** `seen` plus every name in `matches`, without duplicates (after the sheet or the list showed them). */
export function withSeen(seen: readonly string[], matches: readonly Match[]): string[] {
  const out = [...seen];
  const have = new Set(seen);
  for (const m of matches) {
    if (!have.has(m.name)) {
      have.add(m.name);
      out.push(m.name);
    }
  }
  return out;
}

const timeFmt = new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const dayFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric" });

/** "עודכן לאחרונה ב־14:05" (today) or "עודכן לאחרונה ב־3.11, 14:05", in the device's time zone. */
export function updatedText(fetchedAt: number, now: number): string {
  const at = new Date(fetchedAt);
  const sameDay = at.toDateString() === new Date(now).toDateString();
  const time = timeFmt.format(at);
  return sameDay ? `עודכן לאחרונה ב־${time}` : `עודכן לאחרונה ב־${dayFmt.format(at)}, ${time}`;
}
