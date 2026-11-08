"use client";

import { useSyncExternalStore } from "react";
import { EXPIRED_MESSAGE, EXPIRED_PARAM } from "@/lib/names/auth";
import PanelNote from "./auth/PanelNote";

const noSubscribe = () => () => {};
const readExpired = () => new URLSearchParams(window.location.search).get(EXPIRED_PARAM) === "1";
const serverExpired = () => false;

/** "החיבור לחשבון הסתיים…" on welcome after a rejected refresh token (FR-W8). */
export default function ExpiredNotice() {
  // Read on the client only so the page stays static (no useSearchParams Suspense boundary).
  const show = useSyncExternalStore(noSubscribe, readExpired, serverExpired);

  return (
    // display: contents, so the empty region adds no flex gap.
    <div role="status" className="contents">
      {show ? <PanelNote icon="clock">{EXPIRED_MESSAGE}</PanelNote> : null}
    </div>
  );
}
