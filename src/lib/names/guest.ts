import { createStore, del, delMany, get, getMany, setMany, type UseStore } from "idb-keyval";
import { getPref, prefKey, removePref, setPref, type PrefKey } from "./prefs";
import type { Vote } from "./types";
import { VOTES_DB, type StoredVote, type VoteStore, type VoteStoreState } from "./voteStore";

/**
 * Guest mode: a visitor without an account swipes the normal deck with every vote kept on
 * this device only (nothing reaches the server but anonymous analytics). After GUEST_LIMIT
 * decisions the swipe screen asks them to sign in; on sign-in the guest votes move into
 * their account (importGuestVotes) and the device copy is removed.
 */

/** Stands in for the user id in device-only data (prefs, the vote cache) while signed out. */
export const GUEST_ID = "guest";
/** The guest's "space": a key for device data, never sent to the server. */
export const GUEST_SPACE = "local";
/** Decisions a guest can make before signing in. */
export const GUEST_LIMIT = 100;

const VOTES_KEY = `${GUEST_ID}:${GUEST_SPACE}:votes`;
/** Every name a guest decided on, ever (undo doesn't give a decision back). */
const DECIDED_KEY = `${GUEST_ID}:decided`;
/** The same count in localStorage too, so clearing one store alone doesn't reset it. */
const COUNT_STORAGE_KEY = "nest-names-guest-count";

let idbStore: UseStore | null = null;

function guestIdb(): UseStore | null {
  if (typeof indexedDB === "undefined") return null;
  // Same database as the signed-in vote cache: one place to clear, one origin quota.
  idbStore ??= createStore(VOTES_DB, "kv");
  return idbStore;
}

function readStoredCount(): number {
  try {
    const n = Number(localStorage.getItem(COUNT_STORAGE_KEY));
    return Number.isInteger(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeStoredCount(n: number): void {
  try {
    localStorage.setItem(COUNT_STORAGE_KEY, String(n));
  } catch {
    // Blocked storage: IndexedDB still keeps the decided names.
  }
}

/** Whether a guest with `count` decisions has reached the sign-in wall. */
export function atGuestLimit(count: number): boolean {
  return count >= GUEST_LIMIT;
}

/** Decisions left before the wall (0 at or past it). */
export function guestLeft(count: number): number {
  return Math.max(0, GUEST_LIMIT - count);
}

export interface GuestVoteStore extends VoteStore {
  /** Decisions made as a guest on this device, counting each name once. */
  decidedCount(): number;
}

/**
 * The guest's votes: the same interface as the signed-in store (voteStore.ts), kept in
 * IndexedDB only. There is no outbox, so nothing is ever pending.
 */
export function createGuestVoteStore({ now = Date.now }: { now?: () => number } = {}): GuestVoteStore {
  let votes: ReadonlyMap<string, StoredVote> = new Map();
  const decided = new Set<string>();
  let storedCount = readStoredCount();
  let ready = false;
  let disposed = false;
  let lastChangeAt = 0;
  let state: VoteStoreState = { ready, loadFailed: false, votes, pendingCount: 0 };
  const listeners = new Set<() => void>();
  let persistChain: Promise<void> = Promise.resolve();

  // The larger of both copies, plus one for every name decided since.
  const count = () => storedCount;
  const countName = (name: string) => {
    if (decided.has(name)) return;
    decided.add(name);
    storedCount = Math.max(storedCount + 1, decided.size);
  };

  function emit() {
    state = { ready, loadFailed: false, votes, pendingCount: 0 };
    for (const listener of listeners) listener();
  }

  function persist() {
    const store = guestIdb();
    if (disposed) return;
    writeStoredCount(count());
    if (!store) return;
    const snapshot: [string, unknown][] = [
      [VOTES_KEY, [...votes.values()]],
      [DECIDED_KEY, [...decided]],
    ];
    persistChain = persistChain.then(() => setMany(snapshot, store)).catch(() => {
      // Private mode without IndexedDB: the votes live in memory for this visit.
    });
  }

  function tick(): string {
    lastChangeAt = Math.max(now(), lastChangeAt + 1);
    return new Date(lastChangeAt).toISOString();
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async load() {
      const store = guestIdb();
      if (store) {
        try {
          const [cachedVotes, cachedDecided] = await getMany<unknown>([VOTES_KEY, DECIDED_KEY], store);
          const fromCache = new Map<string, StoredVote>();
          for (const v of Array.isArray(cachedVotes) ? (cachedVotes as StoredVote[]) : []) {
            if (v && typeof v.name === "string") fromCache.set(v.name, v);
          }
          // Votes made while the cache was loading stay on top.
          for (const [name, v] of votes) {
            fromCache.delete(name);
            fromCache.set(name, v);
          }
          votes = fromCache;
          for (const name of Array.isArray(cachedDecided) ? cachedDecided : []) {
            if (typeof name === "string") decided.add(name);
          }
        } catch {
          // Unreadable cache: start empty.
        }
      }
      storedCount = Math.max(storedCount, readStoredCount(), decided.size);
      for (const name of votes.keys()) countName(name);
      ready = true;
      emit();
    },
    setVote(name: string, vote: Vote, custom = false) {
      if (disposed) return;
      const next = new Map(votes);
      next.delete(name);
      next.set(name, { name, vote, custom, updatedAt: tick() });
      votes = next;
      if (!custom) countName(name);
      persist();
      emit();
    },
    removeVote(name: string) {
      if (disposed || !votes.has(name)) return;
      const next = new Map(votes);
      next.delete(name);
      votes = next;
      persist();
      emit();
    },
    flush: () => Promise.resolve(),
    applyRemote: () => {},
    reconcile: () => Promise.resolve(),
    start: () => () => {},
    async dispose() {
      disposed = true;
      listeners.clear();
      await persistChain;
    },
    decidedCount: count,
  };
}

/** The guest votes kept on this device, in the order they were made. */
export async function readGuestVotes(): Promise<StoredVote[]> {
  const store = guestIdb();
  if (!store) return [];
  try {
    const raw = await get<unknown>(VOTES_KEY, store);
    if (!Array.isArray(raw)) return [];
    return (raw as StoredVote[]).filter(
      (v) => v && typeof v.name === "string" && v.name !== "" && typeof v.vote === "string",
    );
  } catch {
    return [];
  }
}

/** Removes the guest votes (after they moved into an account). The decision count stays. */
export async function clearGuestVotes(): Promise<void> {
  const store = guestIdb();
  if (!store) return;
  try {
    await del(VOTES_KEY, store);
  } catch {
    // Nothing to remove.
  }
}

/** Removes everything guest mode left on the device, the count too (tests, never the app). */
export async function resetGuestForTests(): Promise<void> {
  const store = guestIdb();
  try {
    localStorage.removeItem(COUNT_STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
  if (store) await delMany([VOTES_KEY, DECIDED_KEY], store);
}

/** Device prefs a guest set that carry over into the account when it has none of its own. */
const CARRIED_PREFS = ["filters", "surname", "background", "twins", "seenMatches"] as const satisfies readonly PrefKey[];

function hasOwnPref(userId: string, key: PrefKey): boolean {
  try {
    return localStorage.getItem(prefKey(userId, key)) !== null;
  } catch {
    return true;
  }
}

/** Moves the guest's device prefs to the signed-in user (never over the user's own). */
export function carryGuestPrefs(userId: string): void {
  if (userId === GUEST_ID) return;
  for (const key of CARRIED_PREFS) {
    if (!hasOwnPref(GUEST_ID, key)) continue;
    if (!hasOwnPref(userId, key)) setPref(userId, key, getPref(GUEST_ID, key));
    removePref(GUEST_ID, key);
  }
}

/** Where importGuestVotes writes: the signed-in user's vote store. */
export interface ImportTarget {
  setVote(name: string, vote: Vote, custom?: boolean, at?: string): void;
}

/**
 * The guest votes to write into an account, oldest first: names the account already has a
 * vote on keep the account's vote.
 */
export function votesToImport(guest: readonly StoredVote[], account: ReadonlyMap<string, unknown>): StoredVote[] {
  const time = (iso: string) => {
    const t = Date.parse(iso);
    return Number.isNaN(t) ? 0 : t;
  };
  return [...guest].filter((v) => !account.has(v.name)).sort((a, b) => time(a.updatedAt) - time(b.updatedAt));
}

let importing: Promise<number> | null = null;

/**
 * Moves the guest votes into the signed-in user's store (once its server copy was read),
 * then removes them from the device. Returns how many were written.
 */
export function importGuestVotes(target: ImportTarget, account: ReadonlyMap<string, unknown>): Promise<number> {
  importing ??= (async () => {
    try {
      const guest = await readGuestVotes();
      if (guest.length === 0) return 0;
      const toWrite = votesToImport(guest, account);
      // The guest's own time, so analytics sees when each decision was made, not the sign-in.
      for (const v of toWrite) target.setVote(v.name, v.vote, v.custom, v.updatedAt);
      await clearGuestVotes();
      return toWrite.length;
    } finally {
      importing = null;
    }
  })();
  return importing;
}

/** A sign-in card joins a guest's deck after every this many decisions (before the wall). */
export const GUEST_NUDGE_EVERY = 20;
const NUDGE_STORAGE_KEY = "nest-names-guest-nudge";

export type GuestPrompt = "nudge" | "wall";

/**
 * What a guest with `count` decisions sees in place of the next card: the wall at
 * GUEST_LIMIT (sign-in only), a sign-in card at each GUEST_NUDGE_EVERY step not yet
 * answered (`lastNudgeAt`, the step answered last), or nothing.
 */
export function guestPrompt(count: number, lastNudgeAt: number): GuestPrompt | null {
  if (atGuestLimit(count)) return "wall";
  const step = Math.floor(count / GUEST_NUDGE_EVERY) * GUEST_NUDGE_EVERY;
  return step > 0 && step > lastNudgeAt ? "nudge" : null;
}

/** The decision count at which the guest last put a sign-in card aside. */
export function readGuestNudge(): number {
  try {
    const n = Number(localStorage.getItem(NUDGE_STORAGE_KEY));
    return Number.isInteger(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeGuestNudge(count: number): void {
  try {
    localStorage.setItem(NUDGE_STORAGE_KEY, String(count));
  } catch {
    // Blocked storage: the card comes back on the next visit, which is harmless.
  }
}

/** The line under a sign-in card: how many decisions are left before signing in is needed. */
export function guestLeftLine(count: number): string {
  const left = guestLeft(count);
  return left === 1 ? "נשארה עוד החלטה אחת לפני שצריך להתחבר." : `נשארו עוד ${left} החלטות לפני שצריך להתחבר.`;
}
