"use client";

import { useEffect, useRef } from "react";
import { Button, Glass, emptyTitleClass } from "@/components/names/ui";
import { DECK_LOAD_ERROR, DECK_LOADING_TEXT } from "@/lib/names/deck";
import { deckPanel, deckPanelWrap } from "./EmptyDeck";

const line = "rounded-pill bg-sand";

/**
 * Where the card will be while the names data loads: the card's glass outline with quiet sand
 * lines for the sex tag and count, the name and intro, the boys/girls bar and the two number tiles
 * (like detail/DetailsPending). It sits in CardStack's box, so the card replaces it in place.
 */
export function DeckSkeleton() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col pb-3">
      <div aria-busy="true" className="names-glass names-card-glass flex min-h-0 flex-1 flex-col justify-between gap-3 overflow-hidden rounded-xl p-5">
        <span role="status" className="sr-only">
          {DECK_LOADING_TEXT}
        </span>
        <div aria-hidden="true" className="flex items-center justify-between">
          <div className={`h-7 w-11 ${line}`} />
          <div className={`h-3 w-1/3 ${line}`} />
        </div>
        <div aria-hidden="true" className="flex flex-col items-center gap-4">
          <div className={`h-12 w-2/5 ${line}`} />
          <div className={`h-3 w-3/5 ${line}`} />
        </div>
        <div aria-hidden="true" className="flex flex-col gap-4">
          <div className={`h-2 w-full ${line}`} />
          <div className="flex gap-3">
            <div className="h-20 flex-1 rounded-lg bg-sand" />
            <div className="h-20 flex-1 rounded-lg bg-sand" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The names data didn't load (a failed or dropped request): the end panel's glass with the
 * problem and "ניסיון חוזר", which loads it again. After a retry that fails too, focus returns
 * to the button if it was lost with it.
 */
export function DeckLoadError({ onRetry, takeFocus }: { onRetry: () => void; takeFocus: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = document.activeElement;
    if (takeFocus && (!active || active === document.body)) root.current?.querySelector("button")?.focus();
  }, [takeFocus]);

  return (
    <div ref={root} className={deckPanelWrap}>
      <Glass as="section" aria-labelledby="names-load-error-title" className={deckPanel}>
        <p role="status" className="sr-only">
          {`${DECK_LOAD_ERROR.title} ${DECK_LOAD_ERROR.lead}`}
        </p>
        <h2 id="names-load-error-title" className={emptyTitleClass("glass")}>
          {DECK_LOAD_ERROR.title}
        </h2>
        <p className="text-intro text-ink-soft">{DECK_LOAD_ERROR.lead}</p>
        <Button size="md" onClick={onRetry}>
          ניסיון חוזר
        </Button>
      </Glass>
    </div>
  );
}
