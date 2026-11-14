"use client";

import { useEffect, useRef } from "react";
import { Button, Glass, openSheet } from "@/components/names/ui";
import { AI_BACK, AI_END_TITLE, AI_REFINE, AI_TITLE, AI_WITH_FILTERS, picksCountText, type SavedAiDeck } from "@/lib/names/aiDeck";
import { deckPanel, deckPanelWrap } from "./EmptyDeck";
import { emptyTitleClass } from "@/components/names/ui";

/**
 * Under the header while the deck is one picked by "חיפוש לפי תיאור": the words it was picked
 * for, how many names it holds, "לדייק" (the filters sheet, where the box is) and the way back
 * to every name.
 */
export default function AiBanner({
  saved,
  total,
  filtered,
  onClear,
}: {
  saved: SavedAiDeck;
  total: number;
  filtered: boolean;
  onClear: () => void;
}) {
  const words = saved.refine ? `${saved.prompt} · ${saved.refine}` : saved.prompt;
  return (
    <section aria-label={AI_TITLE} className="px-5 pb-1 max-[22.5rem]:px-3">
      <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2.5 shadow-card">
        <p className="m-0 line-clamp-2 text-person text-ink">
          <span aria-hidden="true">✨ </span>
          <span className="sr-only">{AI_TITLE}: </span>
          <q className="font-bold">{words}</q>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="m-0 text-caption text-ink-soft tabular-nums">
            {picksCountText(total)}
            {filtered ? ` · ${AI_WITH_FILTERS}` : ""}
          </p>
          <div className="flex gap-1">
            <Button variant="link" size="md" onClick={() => openSheet("filters")}>
              {AI_REFINE}
            </Button>
            <Button variant="link" size="md" onClick={onClear}>
              {AI_BACK}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Where the card was, once every picked name is decided: refine, or go back to every name. */
export function AiDeckEnd({ takeFocus, onClear }: { takeFocus: boolean; onClear: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (takeFocus) root.current?.querySelector<HTMLElement>("button")?.focus();
  }, [takeFocus]);
  return (
    <div ref={root} className={deckPanelWrap}>
      <Glass as="section" aria-labelledby="names-ai-end-title" className={deckPanel}>
        <h2 id="names-ai-end-title" className={emptyTitleClass("glass")}>
          {AI_END_TITLE}
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="md" onClick={onClear}>
            {AI_BACK}
          </Button>
          <Button variant="secondary" size="md" onClick={() => openSheet("filters")}>
            {AI_REFINE}
          </Button>
        </div>
      </Glass>
    </div>
  );
}
