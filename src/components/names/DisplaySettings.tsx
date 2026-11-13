"use client";

import { useId } from "react";
import BackgroundSheet from "@/components/names/BackgroundSheet";
import { openSheet } from "@/components/names/ui";
import { usePrefJson } from "@/components/names/usePrefJson";
import { setPref } from "@/lib/names/prefs";
import { track } from "@/lib/names/track";

const card = "m-0 list-none rounded-lg bg-surface p-0 shadow-card";
const row = "border-b border-line first:rounded-t-lg last:rounded-b-lg last:border-b-0";

/**
 * Settings "תצוגה": the background picker (moved here from the swipe header, where "חיפוש שם"
 * took its place) and "מצפים לתאומים", which adds pair suggestions to the name sheet and a
 * "זוגות" tab to the lists. Both are device-only prefs.
 */
export default function DisplaySettings({ userId }: { userId: string | null }) {
  const headingId = useId();
  const twinsHintId = useId();
  const twins = usePrefJson(userId, "twins") === "true";

  const toggleTwins = () => {
    if (!userId) return;
    setPref(userId, "twins", !twins);
    track("twins_changed", { twins: !twins });
  };

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 id={headingId} className="m-0 px-1 text-label text-stone">
        תצוגה
      </h2>
      <ul className={card}>
        <li className={row}>
          <button type="button" onClick={() => openSheet("background")} aria-haspopup="dialog" className="flex min-h-14 w-full items-center gap-3 rounded-[inherit] px-4 py-3 text-start text-body font-bold text-ink">
            רקע למסך הבחירה
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ms-auto shrink-0 text-stone ltr:-scale-x-100">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        </li>
        <li className={row}>
          <button
            type="button"
            role="switch"
            aria-checked={twins}
            aria-describedby={twinsHintId}
            onClick={toggleTwins}
            className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-start"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-body font-bold text-ink">מצפים לתאומים</span>
              <span id={twinsHintId} className="text-caption text-stone">
                {twins ? "פעיל" : "כבוי"} · הצעות לזוגות של שמות שהולכים טוב ביחד
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`relative inline-flex h-8 w-13 shrink-0 items-center rounded-pill border-2 transition-colors duration-(--nest-duration-press) ease-out ${twins ? "border-ink bg-ink" : "border-stone bg-sand"}`}
            >
              <span className={`absolute start-0.5 size-6 rounded-full bg-surface shadow-card transition-transform duration-(--nest-duration-press) ease-out ${twins ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
            </span>
          </button>
        </li>
      </ul>
      <BackgroundSheet />
    </section>
  );
}
