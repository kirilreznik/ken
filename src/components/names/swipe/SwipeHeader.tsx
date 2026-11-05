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
// the app's root), then the title, background, filters and the "השמות שלי" pill. Below
// 320 px (200% zoom on a phone) the row wraps instead of squeezing the title.
export default function SwipeHeader({ saved }: { saved: number }) {
  return (
    <header className="flex items-center gap-2 px-5 pt-4 pb-2 max-[20rem]:flex-wrap max-[20rem]:px-3">
      <IconButton href="/names/settings" aria-label="הגדרות">
        <Icon>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </Icon>
      </IconButton>
      <h1 className="m-0 min-w-0 flex-1 text-title max-[20rem]:min-w-max">בחירת שם</h1>
      <IconButton aria-label="בחירת רקע" onClick={() => openSheet("background")}>
        <Icon>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M21 16l-5-5-8 8" />
        </Icon>
      </IconButton>
      <IconButton aria-label="סינון" onClick={() => openSheet("filters")}>
        <Icon>
          <path d="M4 6h16M7 12h10M10 18h4" />
        </Icon>
      </IconButton>
      <Link
        href="/names/lists"
        aria-label={savedLabel(saved)}
        className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-pill bg-ink px-3.5 text-person font-bold text-surface transition-transform duration-150 motion-safe:active:scale-95"
      >
        <Icon size={18}>
          <path d="M6 4h12v16l-6-4-6 4z" />
        </Icon>
        <bdi>{saved}</bdi>
      </Link>
    </header>
  );
}
