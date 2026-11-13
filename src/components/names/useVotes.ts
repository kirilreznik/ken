"use client";

import { useEffect, useState } from "react";
import { GUEST_ID, createGuestVoteStore, importGuestVotes } from "@/lib/names/guest";
import { track } from "@/lib/names/track";
import { createVoteStore, type VoteStore, type VoteStoreState } from "@/lib/names/voteStore";

interface Snapshot {
  key: string;
  store: VoteStore;
  state: VoteStoreState;
}

/**
 * The user's vote store for a space (PRD 3.2.9): reads the cache and the server, flushes
 * the outbox and follows other devices while mounted, and is disposed on unmount. `store`
 * is null until the space is known and the store has its first state. A guest
 * (userId GUEST_ID) gets the device-only store; once signed in, the guest's votes move
 * into the account after its server copy was read.
 */
export function useVotes(spaceId: string | null, userId: string | null): { store: VoteStore | null; state: VoteStoreState | null } {
  const key = spaceId && userId ? `${userId}:${spaceId}` : null;
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!key || !spaceId || !userId) return;
    const store = userId === GUEST_ID ? createGuestVoteStore() : createVoteStore({ spaceId, userId });
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

  // Guest votes join the account only once its own votes are known, so they never replace one.
  const importable = !!current && userId !== GUEST_ID && current.state.ready && !current.state.loadFailed;
  const importStore = importable ? current.store : null;
  useEffect(() => {
    if (!importStore) return;
    void importGuestVotes(importStore, importStore.getState().votes).then((count) => {
      if (count > 0) track("guest_votes_imported", { votes: count });
    });
  }, [importStore]);

  return { store: current?.store ?? null, state: current?.state ?? null };
}
