"use client";

import { openSheet } from "@/components/names/ui";
import { relativeChipLabel, type RelativeFilter } from "@/lib/names/relative";

/**
 * Under the header while "על שם קרוב משפחה" filters the deck: says whose name the deck follows
 * (and how), opens the filters to change it, and clears it with its X.
 */
export default function RelativeChip({ filter, onClear }: { filter: RelativeFilter; onClear: () => void }) {
  const how = filter.letter && filter.meaning ? "אות ומשמעות" : filter.letter ? "אותה אות" : "אותה משמעות";
  return (
    <div className="flex px-5 pb-1 max-[22.5rem]:px-3">
      <div className="flex min-w-0 items-center rounded-pill border border-line bg-surface ps-3.5 text-person font-bold text-ink shadow-card">
        <button type="button" onClick={() => openSheet("filters")} className="min-h-11 min-w-0 truncate py-2 text-start" aria-label={`${relativeChipLabel(filter)}, ${how}. שינוי בסינון`}>
          {relativeChipLabel(filter)}
          <span className="font-normal text-ink-soft"> · {how}</span>
        </button>
        <button type="button" onClick={onClear} aria-label={`ביטול הסינון ${relativeChipLabel(filter)}`} className="grid size-11 shrink-0 place-items-center rounded-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
