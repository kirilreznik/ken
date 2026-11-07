"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { BottomSheet, IconButton, closeSheet } from "@/components/names/ui";
import { NAME_SHEET, readName } from "@/lib/names/urlLayer";
import type { Card } from "@/lib/names/types";

const DETENTS = ["70", "full"] as const;

const close = () => closeSheet(NAME_SHEET);

/**
 * "פרטי השם" (boards 13–15, PRD 3.1.1): the tall sheet for ?sheet=name&n=<name>. It opens only
 * for a name that has a card in the deck; any other `n` drops the layer by replacing the URL.
 */
export default function NameDetailSheet({ cards }: { cards: readonly Card[] | null }) {
  // useSearchParams needs a Suspense boundary on prerendered routes (Next 16).
  return (
    <Suspense fallback={null}>
      <NameGate cards={cards} />
    </Suspense>
  );
}

function NameGate({ cards }: { cards: readonly Card[] | null }) {
  const params = useSearchParams();
  const open = params.get("sheet") === NAME_SHEET;
  const name = readName(params.toString());
  const byName = useMemo(() => new Map((cards ?? []).map((card) => [card.stats.name, card])), [cards]);
  const card = name ? (byName.get(name) ?? null) : null;
  // Wait for the cards before deciding the name isn't in the deck.
  const unknown = open && cards !== null && !card;

  useEffect(() => {
    if (unknown) closeSheet(NAME_SHEET);
  }, [unknown]);

  if (!card) return null;
  return (
    <BottomSheet name={NAME_SHEET} detents={DETENTS} closeInHeader header={(titleId) => <NameHeader card={card} titleId={titleId} />}>
      {/* The sections (FR-D8…FR-D17) go here. */}
      <div data-detail-body className="flex flex-col gap-5" />
    </BottomSheet>
  );
}

/**
 * FR-D7: the name, then its niqqud and the card's sex tag, and "סגירה" on the end side. The
 * heading names the dialog and takes focus on open (no outline: it isn't a control).
 */
function NameHeader({ card, titleId }: { card: Card; titleId: string }) {
  const { stats, content, derived } = card;
  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 id={titleId} tabIndex={-1} data-autofocus className="text-hero-name break-words text-ink focus:outline-none">
          {stats.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {content.niqqud.trim() && content.niqqud !== stats.name ? (
            <span className="text-card-title break-words text-ink-soft">{content.niqqud}</span>
          ) : null}
          <span className="rounded-pill bg-peach-soft px-2.5 py-1.5 text-tag text-clay-deep">{derived.sexTag}</span>
        </div>
      </div>
      <IconButton aria-label="סגירה" onClick={close}>
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="flex-none"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </IconButton>
    </div>
  );
}
