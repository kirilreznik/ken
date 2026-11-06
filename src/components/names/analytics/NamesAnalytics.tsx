"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { screenOf, sourceOf, track } from "@/lib/names/track";
import Clarity from "./Clarity";

function displayMode(): "standalone" | "browser" {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia?.("(display-mode: standalone)").matches ? "standalone" : "browser";
}

/**
 * The swiper's analytics (src/lib/names/track.ts): app_open once per page load, page_view on
 * every screen change, and Microsoft Clarity when it is configured.
 */
export default function NamesAnalytics() {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const opened = useRef(false);

  useEffect(() => {
    if (loading || opened.current) return;
    opened.current = true;
    track("app_open", { source: sourceOf(window.location.search), display: displayMode(), signed_in: !!session });
  }, [loading, session]);

  useEffect(() => {
    track("page_view", { screen: screenOf(pathname) });
  }, [pathname]);

  return <Clarity pathname={pathname} />;
}
