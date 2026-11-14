"use client";

import { forwardRef } from "react";
import { ChevronIcon, ROW_PRESS } from "@/components/names/ui";
import { AI_ROW_ACTIVE, AI_ROW_LEAD, AI_TITLE } from "@/lib/names/aiDeck";

/**
 * "חיפוש לפי תיאור" as one row at the top of "סינון": it opens the search as its own step in the
 * sheet, so the box no longer pushes the filters below the fold. While a picked deck is on, the
 * row shows the words it was picked for.
 */
const AiEntryRow = forwardRef<HTMLButtonElement, { active: string | null; onOpen: () => void }>(function AiEntryRow(
  { active, onOpen },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className={`flex min-h-16 w-full items-center gap-3 rounded-lg bg-canvas px-3.5 py-3 text-start ${ROW_PRESS}`}
    >
      <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-pill bg-surface text-card-title">
        ✨
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-card-title text-ink">{AI_TITLE}</span>
        <span className="truncate text-caption text-ink-soft">
          {active ? (
            <>
              {AI_ROW_ACTIVE} <q>{active}</q>
            </>
          ) : (
            AI_ROW_LEAD
          )}
        </span>
      </span>
      <ChevronIcon dir="forward" size={20} />
    </button>
  );
});

export default AiEntryRow;
