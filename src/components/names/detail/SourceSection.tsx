"use client";

import { openSheet } from "@/components/names/ui";
import { track } from "@/lib/names/track";

// Text links like the about sheet's; -my-1.5 keeps the board's tight lines while each hit area is 44 px.
const link = "-my-1.5 inline-flex min-h-11 items-center text-person font-bold text-ink underline underline-offset-2";

/**
 * FR-D17 (board 14): the CBS source line, "על הנתונים" (the about sheet, as the card's corner
 * button opens it) and "דיווח על טעות" (the report sheet). Both keep `n` in the URL, so the
 * report is about this name and Back, or closing them, comes back to the name sheet.
 */
export default function SourceSection() {
  return (
    <footer className="flex flex-col items-start gap-1">
      <p className="m-0 flex flex-wrap items-center gap-x-1.5 text-caption text-stone">
        <span>מקור: הלשכה המרכזית לסטטיסטיקה</span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          className={link}
          onClick={() => {
            openSheet("about");
            track("about_opened");
          }}
        >
          על הנתונים
        </button>
      </p>
      <button type="button" className={link} onClick={() => openSheet("report")}>
        דיווח על טעות
      </button>
    </footer>
  );
}
