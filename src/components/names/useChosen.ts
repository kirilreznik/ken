"use client";

import { useCallback, useSyncExternalStore } from "react";
import { openSheet } from "@/components/names/ui";
import { getPref, removePref, setPref, subscribePrefs } from "@/lib/names/prefs";
import { track } from "@/lib/names/track";

export type ChooseFrom = "duel" | "saved" | "matches";

/**
 * The name marked "בחרנו" in the current space (device only), and the actions on it.
 * Choosing opens the decision moment (?sheet=decision).
 */
export function useChosen(userId: string | null, spaceId: string | null, shared: boolean) {
  const json = useSyncExternalStore(
    subscribePrefs,
    () => (userId ? JSON.stringify(getPref(userId, "chosen")) : "null"),
    () => "null",
  );
  const stored = JSON.parse(json) as { spaceId: string; name: string } | null;
  const chosen = stored && spaceId && stored.spaceId === spaceId ? stored.name : null;

  const choose = useCallback(
    (name: string, from: ChooseFrom, extra: { custom?: boolean; rank?: number } = {}) => {
      if (!userId || !spaceId) return;
      setPref(userId, "chosen", { spaceId, name });
      track("decision_made", { from, shared, custom: extra.custom ?? false, rank: extra.rank ?? null });
      openSheet("decision");
    },
    [userId, spaceId, shared],
  );

  const clear = useCallback(
    (from: "sheet" | "lists") => {
      if (!userId) return;
      removePref(userId, "chosen");
      track("decision_cleared", { from });
    },
    [userId],
  );

  return { chosen, choose, clear };
}
