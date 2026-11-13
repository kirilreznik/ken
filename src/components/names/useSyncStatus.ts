"use client";

import { useEffect, useState } from "react";
import { SYNC_STUCK_MS, syncStatusText } from "@/lib/names/offline";
import { useOnline } from "./useMatches";

/**
 * The swipe footer's sync line (FR-W29): offline at once, online only once queued votes are
 * stuck, or while the votes couldn't be read (NP-073).
 */
export function useSyncStatus(pending: number, loadFailed = false): string | null {
  const online = useOnline();
  const waiting = online && pending > 0;
  // The time queued votes started waiting online; a new value means "still waiting".
  const [stuckSince, setStuckSince] = useState<number | null>(null);
  useEffect(() => {
    if (!waiting) return;
    const timer = setTimeout(() => setStuckSince(Date.now()), SYNC_STUCK_MS);
    return () => {
      clearTimeout(timer);
      setStuckSince(null);
    };
  }, [waiting]);
  return syncStatusText(online, pending, waiting && stuckSince !== null, loadFailed);
}
