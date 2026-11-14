"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { refOf, screenOf, setInternalDevice, sourceOf, track, utmOf } from "@/lib/names/track";
import Clarity from "./Clarity";

function displayMode(): "standalone" | "browser" {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia?.("(display-mode: standalone)").matches ? "standalone" : "browser";
}

/** How this page load arrived, read on the first render, before any redirect drops the query. */
function arrival() {
  if (typeof window === "undefined") return null;
  const { search, hostname } = window.location;
  const internal = new URLSearchParams(search).get("internal");
  if (internal === "1" || internal === "0") setInternalDevice(internal === "1");
  return { source: sourceOf(search), ref: refOf(document.referrer, hostname), ...utmOf(search) };
}

/**
 * The swiper's analytics (src/lib/names/track.ts): app_open once per page load, page_view on
 * every screen change, and Microsoft Clarity when it is configured.
 */
export default function NamesAnalytics() {
  const { session, loading } = useAuth();
  const pathname = usePathname();
  const opened = useRef(false);
  const [arrived] = useState(arrival);

  useEffect(() => {
    if (loading || opened.current) return;
    opened.current = true;
    track("app_open", { ...(arrived ?? { source: sourceOf(window.location.search) }), display: displayMode(), signed_in: !!session });
  }, [loading, session, arrived]);

  useEffect(() => {
    track("page_view", { screen: screenOf(pathname) });
  }, [pathname]);

  return <Clarity pathname={pathname} />;
}
