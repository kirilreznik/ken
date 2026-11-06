"use client";

import { openSheet } from "@/components/names/ui";
import { track } from "@/lib/names/track";

/**
 * "על הנתונים" in the current card's top corner (FR-W30): opens ?sheet=about, where the report
 * is about this card. A small "i" so it doesn't take a row of its own under the numbers; the
 * hit area still reaches 44 px. It keeps the CBS attribution one tap away.
 */
export default function AboutLink() {
  return (
    <button
      type="button"
      aria-label="על הנתונים"
      title="על הנתונים"
      onClick={() => {
        openSheet("about");
        track("about_opened");
      }}
      className="relative -me-1.5 inline-flex size-8 flex-none items-center justify-center rounded-pill text-ink-soft before:absolute before:-inset-1.5 before:content-[''] in-data-[names-bg=none]:text-stone"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-none">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8v.5" />
      </svg>
    </button>
  );
}
