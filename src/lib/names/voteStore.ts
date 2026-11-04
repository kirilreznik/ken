import type { SupabaseClient } from "@supabase/supabase-js";
import { createStore, delMany, getMany, keys, setMany, type UseStore } from "idb-keyval";
import { reportClientLog } from "./clientLog";
import { getSupabase } from "./supabase";
import type { Vote } from "./types";

/**
 * The user's own votes for one space (PRD 3.2.9): read from `name_votes`, cached in
 * IndexedDB, written through an IndexedDB outbox that flushes in order.
 */

export const VOTES_DB = "nest-names-votes";
const STORE = "kv";

/** How often the outbox retries on its own. */
export const FLUSH_INTERVAL_MS = 30_000;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 5 * 60_000;

/** Postgres errors a retry can't fix: RLS (not a member), missing membership FK, bad value. */
const PERMANENT_CODES = new Set(["42501", "23503", "23514", "22P02"]);

export interface StoredVote {
  name: string;
  vote: Vote;
  custom: boolean;
  /** ISO time of the change. */
  updatedAt: string;
}

export interface OutboxItem {
  id: string;
  op: "upsert" | "delete";
  name: string;
  vote?: Vote;
  custom?: boolean;
  updatedAt: string;
  attempts: number;
  /** Epoch ms before which the item isn't retried (unless forced). */
  retryAt: number;
}

export interface VoteStoreState {
  /** False until the cache (or the server) has been read. */
  ready: boolean;
  /** In the order the votes were made: a changed vote moves to the end. */
  votes: ReadonlyMap<string, StoredVote>;
  pendingCount: number;
}

export interface VoteStore {
  getState(): VoteStoreState;
  subscribe(listener: () => void): () => void;
  /** Reads the cache, then the server; resolves once both were tried. */
  load(): Promise<void>;
  setVote(name: string, vote: Vote, custom?: boolean): void;
  removeVote(name: string): void;
  /** Sends queued changes in order; `force` ignores the backoff (on `online`). */
  flush(opts?: { force?: boolean }): Promise<void>;
  /** Flushes on online, focus and every 30 s; returns the stop function. */
  start(): () => void;
  /** Stops all writes, sends and listeners (before clearLocalData on sign-out); resolves after the last write. */
  dispose(): Promise<void>;
}

export interface VoteStoreOptions {
  spaceId: string;
  userId: string;
  client?: SupabaseClient | null;
  now?: () => number;
  report?: typeof reportClientLog;
}

interface VoteRow {
  name: string;
  vote: Vote;
  custom: boolean | null;
  updated_at: string;
}

let idbStore: UseStore | null = null;

function votesIdb(): UseStore | null {
  if (typeof indexedDB === "undefined") return null;
  idbStore ??= createStore(VOTES_DB, STORE);
  return idbStore;
}

const votesKey = (userId: string, spaceId: string) => `${userId}:${spaceId}:votes`;
const outboxKey = (userId: string, spaceId: string) => `${userId}:${spaceId}:outbox`;

/** Removes every cached vote and queued change of this user (sign-out, account deletion). */
export async function clearVoteCache(userId: string): Promise<void> {
  const store = votesIdb();
  if (!store) return;
  const all = await keys<string>(store);
  await delMany(
    all.filter((k) => typeof k === "string" && k.startsWith(`${userId}:`)),
    store,
  );
}

export function backoffMs(attempts: number): number {
  return Math.min(BACKOFF_BASE_MS * 2 ** Math.max(0, attempts - 1), BACKOFF_MAX_MS);
}

/**
 * Appends a change, dropping an earlier queued change to the same name (the latest wins).
 * The item being sent right now is never touched.
 */
export function enqueue(outbox: readonly OutboxItem[], item: OutboxItem, inFlightId: string | null = null): OutboxItem[] {
  return [...outbox.filter((o) => o.name !== item.name || o.id === inFlightId), item];
}

/** Applies queued changes on top of a set of votes, in queue order. */
export function applyOutbox(
  votes: ReadonlyMap<string, StoredVote>,
  outbox: readonly OutboxItem[],
): Map<string, StoredVote> {
  const next = new Map(votes);
  for (const item of outbox) {
    next.delete(item.name);
    if (item.op === "upsert" && item.vote) {
      next.set(item.name, { name: item.name, vote: item.vote, custom: item.custom ?? false, updatedAt: item.updatedAt });
    }
  }
  return next;
}

type SendResult = "ok" | "permanent" | "retry";

function classify(error: { code?: string } | null): SendResult {
  if (!error) return "ok";
  return error.code && PERMANENT_CODES.has(error.code) ? "permanent" : "retry";
}

let seq = 0;
function newId(now: number): string {
  seq += 1;
  return `${now.toString(36)}-${seq.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createVoteStore({
  spaceId,
  userId,
  client = getSupabase(),
  now = Date.now,
  report = reportClientLog,
}: VoteStoreOptions): VoteStore {
  let votes: ReadonlyMap<string, StoredVote> = new Map();
  let outbox: OutboxItem[] = [];
  let ready = false;
  let inFlightId: string | null = null;
  let flushing: Promise<void> | null = null;
  let again = false;
  let againForced = false;
  let state: VoteStoreState = { ready, votes, pendingCount: 0 };
  const listeners = new Set<() => void>();
  let persistChain: Promise<void> = Promise.resolve();
  let disposed = false;
  let lastChangeAt = 0;
  const stops = new Set<() => void>();

  function emit() {
    state = { ready, votes, pendingCount: outbox.length };
    for (const listener of listeners) listener();
  }

  /** Writes the cache and the outbox; writes run one after another so the last one wins. */
  function persist() {
    const store = votesIdb();
    if (!store || disposed) return;
    const snapshot: [string, unknown][] = [
      [votesKey(userId, spaceId), [...votes.values()]],
      [outboxKey(userId, spaceId), outbox],
    ];
    persistChain = persistChain.then(() => setMany(snapshot, store)).catch(() => {
      // IndexedDB can be unavailable (private mode); the store keeps working in memory.
    });
  }

  /** Change times strictly increase, so two votes in the same millisecond keep their order. */
  function tick(): number {
    lastChangeAt = Math.max(now(), lastChangeAt + 1);
    return lastChangeAt;
  }

  function change(item: OutboxItem) {
    if (disposed) return;
    outbox = enqueue(outbox, item, inFlightId);
    votes = applyOutbox(votes, [item]);
    persist();
    emit();
    void flush();
  }

  async function send(item: OutboxItem): Promise<{ result: SendResult; code?: string }> {
    if (!client) return { result: "retry" };
    try {
      const table = client.from("name_votes");
      const { error } =
        item.op === "upsert"
          ? await table.upsert(
              {
                space_id: spaceId,
                user_id: userId,
                name: item.name,
                vote: item.vote,
                custom: item.custom ?? false,
                updated_at: item.updatedAt,
              },
              { onConflict: "space_id,user_id,name" },
            )
          : await table.delete().eq("space_id", spaceId).eq("user_id", userId).eq("name", item.name);
      return { result: classify(error), code: error?.code };
    } catch {
      return { result: "retry" };
    }
  }

  async function drain(force: boolean) {
    while (outbox.length > 0 && !disposed) {
      const item = outbox[0];
      if (!force && item.retryAt > now()) return;
      inFlightId = item.id;
      const { result, code } = await send(item);
      inFlightId = null;
      const superseded = outbox.some((o) => o.name === item.name && o.id !== item.id);
      if (result === "retry" && superseded) {
        // A newer change to the same name is queued; it replaces this one.
        outbox = outbox.filter((o) => o.id !== item.id);
        persist();
        emit();
        continue;
      }
      if (result === "retry") {
        outbox = outbox.map((o) =>
          o.id === item.id ? { ...o, attempts: o.attempts + 1, retryAt: now() + backoffMs(o.attempts + 1) } : o,
        );
        persist();
        emit();
        return;
      }
      outbox = outbox.filter((o) => o.id !== item.id);
      if (result === "permanent") {
        // No name, vote or user: only what went wrong.
        void report({ area: "names-votes", message: `vote ${item.op} dropped: ${code ?? "unknown"}` });
      }
      persist();
      emit();
    }
  }

  function flush({ force = false } = {}): Promise<void> {
    if (disposed || (typeof navigator !== "undefined" && navigator.onLine === false)) return Promise.resolve();
    if (flushing) {
      again = true;
      againForced ||= force;
      return flushing;
    }
    flushing = (async () => {
      let forced = force;
      do {
        again = false;
        await drain(forced);
        forced = againForced;
        againForced = false;
      } while (again);
    })().finally(() => {
      flushing = null;
    });
    return flushing;
  }

  async function load() {
    const store = votesIdb();
    if (store) {
      try {
        const [cachedVotes, cachedOutbox] = await getMany<unknown>(
          [votesKey(userId, spaceId), outboxKey(userId, spaceId)],
          store,
        );
        const fromCache = new Map<string, StoredVote>();
        for (const v of Array.isArray(cachedVotes) ? (cachedVotes as StoredVote[]) : []) fromCache.set(v.name, v);
        // Changes made while the cache was loading stay after the stored ones.
        let merged: OutboxItem[] = [];
        for (const item of [...(Array.isArray(cachedOutbox) ? (cachedOutbox as OutboxItem[]) : []), ...outbox]) {
          merged = enqueue(merged, item, inFlightId);
        }
        outbox = merged;
        votes = applyOutbox(fromCache, outbox);
      } catch {
        // No cache: the server read below fills the state.
      }
    }
    ready = true;
    emit();

    if (client) {
      try {
        const { data, error } = await client
          .from("name_votes")
          .select("name, vote, custom, updated_at")
          .eq("space_id", spaceId)
          .eq("user_id", userId)
          .order("updated_at", { ascending: true });
        if (!error && data && !disposed) {
          const remote = new Map<string, StoredVote>();
          for (const row of data as VoteRow[]) {
            remote.set(row.name, { name: row.name, vote: row.vote, custom: row.custom ?? false, updatedAt: row.updated_at });
          }
          // Queued changes are newer than the server copy.
          votes = applyOutbox(remote, outbox);
          persist();
          emit();
        }
      } catch {
        // Offline: keep the cache.
      }
    }
    void flush();
  }

  function start() {
    if (typeof window === "undefined") return () => {};
    const onOnline = () => void flush({ force: true });
    const onFocus = () => void flush();
    const onVisible = () => {
      if (document.visibilityState === "visible") void flush();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(() => void flush(), FLUSH_INTERVAL_MS);
    const stop = () => {
      window.removeEventListener("online", onOnline);
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
    setVote(name, vote, custom = false) {
      const t = tick();
      change({ id: newId(t), op: "upsert", name, vote, custom, updatedAt: new Date(t).toISOString(), attempts: 0, retryAt: 0 });
    },
    removeVote(name) {
      const t = tick();
      change({ id: newId(t), op: "delete", name, updatedAt: new Date(t).toISOString(), attempts: 0, retryAt: 0 });
    },
    flush,
    start,
    async dispose() {
      disposed = true;
      for (const stop of [...stops]) stop();
      listeners.clear();
      await persistChain;
    },
  };
}
