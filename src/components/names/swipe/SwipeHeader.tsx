"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { IconButton, openSheet } from "@/components/names/ui";
import { savedLabel } from "@/lib/names/a11y";

function Icon({ size = 20, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-none"
    >
      {children}
    </svg>
  );
}

// Board 2/8 header (FR-W10): settings sits where the board has "חזרה" (the swipe screen is
// the app's root), then the title, search (in the background button's place), filters and the "השמות שלי" pill. Below
// 320 px (200% zoom on a phone) the row wraps; under 360 px the title is visually hidden.
// `saved` is null while the votes couldn't be read (NP-073): the pill shows no count then.
export default function SwipeHeader({ saved, filtered = false }: { saved: number | null; filtered?: boolean }) {
  return (
    <header data-clarity-unmask="true" className="flex items-center gap-2 px-5 pt-4 pb-2 max-[20rem]:flex-wrap max-[22.5rem]:px-3">
      {/* A gear, not a hamburger: the button opens the settings page, not a menu. */}
      <IconButton href="/names/settings" aria-label="הגדרות">
        <Icon>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Icon>
      </IconButton>
      {/* Under 360 px the four controls leave no room for the title: it stays for screen readers only. */}
      <h1 className="m-0 min-w-0 flex-1 text-title whitespace-nowrap max-[22.5rem]:sr-only">בחירת שם</h1>
      <span aria-hidden="true" className="hidden flex-1 max-[22.5rem]:block" />
      {/* "חיפוש שם" took the background button's place; the background moved to settings. */}
      <IconButton aria-label="חיפוש שם" onClick={() => openSheet("search")}>
        <Icon>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20l-4.2-4.2" />
        </Icon>
      </IconButton>
      {/* A clay dot (and the label) says sheet filters are on, so a short deck explains itself (NP-UX-004). */}
      <IconButton aria-label={filtered ? "סינון, פעיל" : "סינון"} onClick={() => openSheet("filters")} className="relative">
        <Icon>
          <path d="M4 6h16M7 12h10M10 18h4" />
        </Icon>
        {filtered ? (
          <span aria-hidden="true" className="absolute top-1.5 end-1.5 size-2.5 rounded-full bg-clay ring-2 ring-surface" />
        ) : null}
      </IconButton>
      <Link
        href="/names/lists"
        aria-label={savedLabel(saved)}
        data-control
        className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-pill bg-ink px-3.5 text-person font-bold text-surface transition-transform duration-(--nest-duration-press) motion-safe:active:scale-95"
      >
        <Icon size={18}>
          <path d="M6 4h12v16l-6-4-6 4z" />
        </Icon>
        {saved === null ? null : <bdi>{saved}</bdi>}
      </Link>
    </header>
  );
}
