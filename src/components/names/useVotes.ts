"use client";

import { useEffect, useState } from "react";
import { createVoteStore, type VoteStore, type VoteStoreState } from "@/lib/names/voteStore";

interface Snapshot {
  key: string;
  store: VoteStore;
  state: VoteStoreState;
}

/**
 * The user's vote store for a space (PRD 3.2.9): reads the cache and the server, flushes
 * the outbox and follows other devices while mounted, and is disposed on unmount. `store`
 * is null until the space is known and the store has its first state.
 */
export function useVotes(spaceId: string | null, userId: string | null): { store: VoteStore | null; state: VoteStoreState | null } {
  const key = spaceId && userId ? `${userId}:${spaceId}` : null;
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!key || !spaceId || !userId) return;
    const store = createVoteStore({ spaceId, userId });
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
  return { store: current?.store ?? null, state: current?.state ?? null };
}
