"use client";

import { useSyncExternalStore } from "react";
import { getPref, subscribePrefs } from "@/lib/names/prefs";

/**
 * A pref as a JSON string, so useSyncExternalStore gets a stable snapshot (getPref returns a
 * new object on every call).
 */
export function usePrefJson(
  userId: string | null,
  key: "filters" | "surname" | "surnameAsked" | "sessions" | "survey" | "invitePromptShown" | "recapSession" | "twins" | "aiDeck",
): string | null {
  return useSyncExternalStore(
    subscribePrefs,
    () => (userId ? JSON.stringify(getPref(userId, key)) : null),
    () => null,
  );
}
