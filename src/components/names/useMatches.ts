"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createMatchesStore, type MatchesState, type MatchesStore } from "@/lib/names/matches";
import { getPref, setPref, subscribePrefs } from "@/lib/names/prefs";

interface Snapshot {
  key: string;
  store: MatchesStore;
  state: MatchesState;
}

/**
 * The shared space's matches (PRD 3.2.10): the cache first, then `name_matches`, refetched on
 * focus, every 60 s while visible and 2 s after `votes` (the user's own votes) changes.
 * Null in a space of one.
 */
export function useMatches(
  spaceId: string | null,
  userId: string | null,
  shared: boolean,
  votes: unknown,
): MatchesState | null {
  const key = spaceId && userId && shared ? `${userId}:${spaceId}` : null;
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!key || !spaceId || !userId) return;
    const store = createMatchesStore({ spaceId, userId, shared: true });
    const unsubscribe = store.subscribe(() => setSnapshot({ key, store, state: store.getState() }));
    const stop = store.start();
    void store.load();
    return () => {
      unsubscribe();
      stop();
      void store.dispose();
    };
  }, [key, spaceId, userId]);

  const current = snapshot?.key === key ? snapshot : null;
  const store = current?.store ?? null;

  useEffect(() => {
    if (store && votes) store.votesChanged();
  }, [store, votes]);

  return current?.state ?? null;
}

const noSubscribe = () => () => {};

function subscribeOnline(listener: () => void) {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

/** False while the browser reports no network. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    typeof window === "undefined" ? noSubscribe : subscribeOnline,
    () => navigator.onLine !== false,
    () => true,
  );
}

/** The match names already shown on this device (as JSON, a stable snapshot) and a setter. */
export function useSeenMatches(userId: string | null): { seen: string[]; setSeen: (names: string[]) => void } {
  const json = useSyncExternalStore(
    subscribePrefs,
    () => (userId ? JSON.stringify(getPref(userId, "seenMatches")) : "[]"),
    () => "[]",
  );
  const seen = useMemo(() => JSON.parse(json) as string[], [json]);
  return {
    seen,
    setSeen: (names) => {
      if (userId) setPref(userId, "seenMatches", names);
    },
  };
}
