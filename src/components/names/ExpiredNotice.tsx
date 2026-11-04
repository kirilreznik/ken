"use client";

import { useSyncExternalStore } from "react";
import { EXPIRED_MESSAGE, EXPIRED_PARAM } from "@/lib/names/auth";

const noSubscribe = () => () => {};
const readExpired = () => new URLSearchParams(window.location.search).get(EXPIRED_PARAM) === "1";
const serverExpired = () => false;

/** "צריך להיכנס שוב" on welcome after a rejected refresh token (FR-W8). */
export default function ExpiredNotice() {
  // Read on the client only so the page stays static (no useSearchParams Suspense boundary).
  const show = useSyncExternalStore(noSubscribe, readExpired, serverExpired);

  return (
    <p role="status" className="text-body text-ink-soft empty:hidden">
      {show ? EXPIRED_MESSAGE : null}
    </p>
  );
}
