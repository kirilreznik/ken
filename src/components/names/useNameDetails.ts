"use client";

import { useEffect, useSyncExternalStore } from "react";
import { loadDetails } from "@/lib/names/data";
import type { NameDetail } from "@/lib/names/types";

export type DetailsState = "idle" | "loading" | "ready" | "error";

export interface DetailsSnapshot {
  details: Map<string, NameDetail> | null;
  state: DetailsState;
}

let snapshot: DetailsSnapshot = { details: null, state: "idle" };
const listeners = new Set<() => void>();

function set(next: DetailsSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

export function subscribeDetails(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDetailsSnapshot(): DetailsSnapshot {
  return snapshot;
}

const SERVER_SNAPSHOT: DetailsSnapshot = { details: null, state: "idle" };

/** Starts the details load unless it is loading or loaded; after an error it tries again. */
export function startDetails(): Promise<void> {
  if (snapshot.state === "loading" || snapshot.state === "ready") return Promise.resolve();
  set({ details: null, state: "loading" });
  return loadDetails().then(
    (details) => set({ details, state: "ready" }),
    () => set({ details: null, state: "error" }),
  );
}

/**
 * Name details (stories, similar names) for the detail sheet. Nothing loads until the
 * hook is first called with `enabled: true`; a failed load is retried the next time it is enabled.
 */
export function useNameDetails({ enabled }: { enabled: boolean }): DetailsSnapshot {
  const current = useSyncExternalStore(subscribeDetails, getDetailsSnapshot, () => SERVER_SNAPSHOT);
  useEffect(() => {
    if (enabled) void startDetails();
  }, [enabled]);
  return current;
}
