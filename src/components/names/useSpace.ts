"use client";

import { useCallback, useEffect, useState } from "react";
import { clearSpaceCache, ensureSpace, isSharedSpace, members, type SpaceMember } from "@/lib/names/space";
import { useAuth } from "./AuthProvider";

export interface SpaceState {
  /** The space all votes go to; null until loaded, before onboarding, or after an error. */
  spaceId: string | null;
  members: SpaceMember[];
  /** Two or more members: matches and the shared copy show. */
  isShared: boolean;
  loading: boolean;
  /** The last load failed (offline, server error); `refresh()` retries. */
  error: boolean;
  /** Refetches the space id and members (after a join, on focus). */
  refresh: () => Promise<void>;
}

interface Loaded {
  key: string;
  spaceId: string | null;
  members: SpaceMember[];
  error: boolean;
}

function displayNameOf(metadata: Record<string, unknown> | undefined): string {
  const value = metadata?.display_name;
  return typeof value === "string" ? value.trim() : "";
}

async function fetchSpace(key: string, displayName: string, force: boolean): Promise<Loaded> {
  try {
    const spaceId = await ensureSpace(displayName);
    return { key, spaceId, members: await members(spaceId, { force }), error: false };
  } catch {
    return { key, spaceId: null, members: [], error: true };
  }
}

/**
 * The signed-in user's space (PRD §3.2.4). Waits for onboarding: without a display
 * name there is no `names_space` call, so `spaceId` stays null.
 */
export function useSpace(): SpaceState {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const displayName = displayNameOf(user?.user_metadata);
  const key = userId && displayName ? `${userId}:${displayName}` : null;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    void fetchSpace(key, displayName, false).then((next) => {
      if (alive) setLoaded(next);
    });
    return () => {
      alive = false;
    };
  }, [key, displayName]);

  const refresh = useCallback(async () => {
    if (!key) return;
    clearSpaceCache();
    setLoaded(await fetchSpace(key, displayName, true));
  }, [key, displayName]);

  const current = loaded?.key === key ? loaded : null;
  const list = current?.members ?? [];
  return {
    spaceId: current?.spaceId ?? null,
    members: list,
    isShared: isSharedSpace(list),
    loading: key !== null && current === null,
    error: current?.error ?? false,
    refresh,
  };
}
