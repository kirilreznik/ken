"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CLOSED_PARAM, SIGNUPS_CLOSED_MESSAGE, WAITLIST_HREF } from "@/lib/names/auth";

const noSubscribe = () => () => {};
const readClosed = () => new URLSearchParams(window.location.search).get(CLOSED_PARAM) === "1";
const serverClosed = () => false;

/** "ההרשמה עוד לא פתוחה…" on welcome when Supabase refused a new account (PRD 3.2.2, ?closed=1). */
export default function ClosedNotice() {
  const show = useSyncExternalStore(noSubscribe, readClosed, serverClosed);
  if (!show) return null;

  return (
    <p role="status" className="rounded-md bg-peach-pale p-3 text-body text-ink">
      {SIGNUPS_CLOSED_MESSAGE}{" "}
      <Link href={WAITLIST_HREF} className="font-bold underline underline-offset-2">
        להשארת אימייל
      </Link>
    </p>
  );
}
