import type { SupabaseClient } from "@supabase/supabase-js";
import { createStore, delMany, get, keys, set, type UseStore } from "idb-keyval";
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
  let state: MatchesState = { ready: false, matches: [], fetchedAt: null };
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
      if (error || !Array.isArray(data) || disposed) return;
      const matches = toMatches(data as MatchRow[]);
      const fetchedAt = now();
      setState({ ready: true, matches, fetchedAt });
      const store = matchesIdb();
      if (store) {
        const entry: CachedMatches = { matches, fetchedAt };
        persistChain = persistChain.then(() => set(cacheKey(userId, spaceId), entry, store)).catch(() => {
          // IndexedDB can be unavailable (private mode); the store keeps working in memory.
        });
      }
    } catch {
      // Offline: keep the last result.
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
