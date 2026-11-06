"use client";

import { useEffect } from "react";
import { clarityAllowed, clarityProjectId, loadClarity } from "@/lib/names/clarity";

/**
 * Microsoft Clarity session recordings for /names, when NEXT_PUBLIC_CLARITY_PROJECT_ID is set.
 * It loads on the first page whose URL is safe to record (not an invite link, not the sign-in
 * callback, no invite code in the query). The names layout marks the whole app
 * data-clarity-mask, so names, display names and emails show as blocks in recordings.
 */
export default function Clarity({ pathname }: { pathname: string }) {
  useEffect(() => {
    const id = clarityProjectId(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
    if (!id || !clarityAllowed(pathname, window.location.search)) return;
    loadClarity(id);
  }, [pathname]);
  return null;
}
