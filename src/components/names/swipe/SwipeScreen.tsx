"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { withSex } from "@/lib/names/filters";
import { getPref, setPref, subscribePrefs } from "@/lib/names/prefs";
import type { SexTag } from "@/lib/names/types";
import QuickChips from "./QuickChips";
import SwipeHeader from "./SwipeHeader";

/** The saved sex filter, following changes from the chips and the filters sheet. */
function useSexFilter(userId: string | null): SexTag | null {
  return useSyncExternalStore(
    subscribePrefs,
    () => (userId ? getPref(userId, "filters").sex : null),
    () => null,
  );
}

// The swipe screen (FR-W10). US-045 adds the stack, actions, footer and the saved count.
export default function SwipeScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const sex = useSexFilter(userId);
  const setSex = (next: SexTag | null) => {
    if (userId) setPref(userId, "filters", withSex(getPref(userId, "filters"), next));
  };
  return (
    <>
      <SwipeHeader saved={0} />
      <QuickChips sex={sex} onChange={setSex} />
      <main className="flex min-h-0 flex-1 flex-col" />
    </>
  );
}
