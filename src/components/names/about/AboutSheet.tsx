"use client";

import { BottomSheet, openSheet } from "@/components/names/ui";
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
      closeButton
    >
      <AboutContent hasName={hasName} onReport={() => openSheet("report")} />
    </BottomSheet>
  );
}
