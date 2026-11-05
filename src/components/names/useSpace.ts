"use client";

import { useCallback, useEffect, useState } from "react";
import { getPref, setPref } from "@/lib/names/prefs";
import { MATCHES_INTERVAL_MS } from "@/lib/names/matches";
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

/**
 * Loads the space and keeps a copy on the device. When the load fails (offline),
 * the last copy still gives the screens a space id, with `error` set.
 */
async function fetchSpace(key: string, userId: string, displayName: string, force: boolean): Promise<Loaded> {
  try {
    const spaceId = await ensureSpace(displayName);
    const list = await members(spaceId, { force });
    setPref(userId, "lastSpace", { spaceId, members: list });
    return { key, spaceId, members: list, error: false };
  } catch {
    const last = getPref(userId, "lastSpace");
    return { key, spaceId: last?.spaceId ?? null, members: last?.members ?? [], error: true };
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
    if (!key || !userId) return;
    let alive = true;
    void fetchSpace(key, userId, displayName, false).then((next) => {
      if (alive) setLoaded(next);
    });
    return () => {
      alive = false;
    };
  }, [key, userId, displayName]);

  const refresh = useCallback(async () => {
    if (!key || !userId) return;
    clearSpaceCache();
    setLoaded(await fetchSpace(key, userId, displayName, true));
  }, [key, userId, displayName]);

  const current = loaded?.key === key ? loaded : null;
  const list = current?.members ?? [];
  const soloSpace = current && !current.error && !isSharedSpace(current.members) ? current.spaceId : null;

  // While solo, re-read the members on focus and every minute (the matches cadence, PRD 3.2.10),
  // so a screen left open learns that a partner joined without a reload.
  useEffect(() => {
    if (!soloSpace || !userId || !key) return;
    let alive = true;
    const recheck = async () => {
      try {
        const list = await members(soloSpace, { force: true });
        if (!alive || !isSharedSpace(list)) return;
        setPref(userId, "lastSpace", { spaceId: soloSpace, members: list });
        setLoaded({ key, spaceId: soloSpace, members: list, error: false });
      } catch {
        // Offline or a server error: the next focus or tick tries again.
      }
    };
    const onFocus = () => void recheck();
    const onVisible = () => {
      if (document.visibilityState === "visible") void recheck();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void recheck();
    }, MATCHES_INTERVAL_MS);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, [soloSpace, userId, key]);

  return {
    spaceId: current?.spaceId ?? null,
    members: list,
    isShared: isSharedSpace(list),
    loading: key !== null && current === null,
    error: current?.error ?? false,
    refresh,
  };
}
