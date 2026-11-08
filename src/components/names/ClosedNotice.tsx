"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CLOSED_PARAM, SIGNUPS_CLOSED_MESSAGE, WAITLIST_HREF } from "@/lib/names/auth";
import PanelNote from "./auth/PanelNote";

const noSubscribe = () => () => {};
const readClosed = () => new URLSearchParams(window.location.search).get(CLOSED_PARAM) === "1";
const serverClosed = () => false;

/** "ההרשמה עוד לא פתוחה…" on welcome when Supabase refused a new account (PRD 3.2.2, ?closed=1). */
export default function ClosedNotice() {
  const show = useSyncExternalStore(noSubscribe, readClosed, serverClosed);

  return (
    // display: contents, so the empty region adds no flex gap.
    <div role="status" className="contents">
      {show ? (
        <PanelNote icon="info">
          {SIGNUPS_CLOSED_MESSAGE}{" "}
          <Link href={WAITLIST_HREF} className="-my-3 inline-flex min-h-11 items-center font-bold underline underline-offset-2">
            להשארת אימייל
          </Link>
        </PanelNote>
      ) : null}
    </div>
  );
}
