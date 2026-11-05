"use client";

import { openSheet } from "@/components/names/ui";

/**
 * "על הנתונים" at the end of the current card (FR-W30): opens ?sheet=about, where the report
 * is about this card. Board 2 has no entry point; this keeps the CBS attribution one tap away.
 */
export default function AboutLink() {
  return (
    <button
      type="button"
      onClick={() => openSheet("about")}
      className="-mb-2 inline-flex min-h-11 items-center gap-1.5 self-center rounded-pill px-2 text-caption font-bold text-ink-soft underline underline-offset-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-none">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8v.5" />
      </svg>
      על הנתונים
    </button>
  );
}
