"use client";

import { BottomSheet, IconButton, closeSheet, openSheet } from "@/components/names/ui";
import AboutContent from "./AboutContent";

/**
 * "על הנתונים" over the swipe screen (?sheet=about, board 7). The report button swaps it for
 * ?sheet=report about the card behind; Back from the report comes back here.
 */
export default function AboutSheet({ hasName }: { hasName: boolean }) {
  return (
    <BottomSheet
      name="about"
      title="על הנתונים"
      headerEnd={
        <IconButton aria-label="סגירה" onClick={() => closeSheet("about")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </IconButton>
      }
    >
      <AboutContent hasName={hasName} onReport={() => openSheet("report")} />
    </BottomSheet>
  );
}
