import type { ComponentPropsWithRef, ReactNode, Ref } from "react";
import { AI_GENERATED, AI_REASON_LABEL } from "@/lib/names/aiDeck";
import { cardLabel } from "@/lib/names/a11y";
import { cardHints } from "@/lib/names/cardHints";
import type { Card } from "@/lib/names/types";
import { Button } from "../ui/Button";
import { hintChipClass } from "../ui/classes";
import { ChevronIcon } from "../ui/icons";
import CardHeader from "./CardHeader";
import CardSexBar from "./CardSexBar";
import CardStats from "./CardStats";

type NameCardProps = Omit<ComponentPropsWithRef<"article">, "children"> & {
  card: Card;
  /** 1-based place in the filtered deck and its size; the line is left out without them. */
  position?: number;
  total?: number;
  surname?: string | null;
  /** At the end of the top row, e.g. the swipe screen's "על הנתונים" button. */
  corner?: ReactNode;
  /** "חיפוש לפי תיאור": Claude's short reason this name fits (aiDeck.ts), labeled as suggested. */
  note?: string | null;
  /** Shows "לכל הפרטים" at the end of the card (board 12); it opens the name sheet. */
  onDetails?: () => void;
  /** On the "לכל הפרטים" button, e.g. the deck's sticky-toast lift (NP-BUG-011). */
  detailsRef?: Ref<HTMLButtonElement>;
};

const stamp =
  "pointer-events-none absolute top-5.5 rounded-sm border-3 border-current bg-surface px-3 py-1 text-stamp opacity-0";

/**
 * A whole name card (E16 FR-5a, slim per FR-D19 / board 12), one glass article in this order:
 * header and name, the intro (2 lines at most), hint chips for what the name sheet adds
 * ("מהתנ״ך", known people; labels, not controls), the boys/girls bar, the number tiles and,
 * with onDetails, the "לכל הפרטים" button. Empty sections are left out.
 * It scrolls inside itself only when the content can't fit (200% zoom, 320 px).
 * The swipe stamps (שמירה, דילוג, אהבתי מאוד) are opaque and hidden; the drag sets each one's
 * opacity (0..1) directly, found by its data-stamp (NP-093).
 */
export default function NameCard({ card, position, total, surname, corner, note = null, onDetails, detailsRef, className = "", ...rest }: NameCardProps) {
  const { stats, content, derived } = card;
  const hints = cardHints(content);
  return (
    <article
      aria-label={cardLabel(card)}
      aria-haspopup={onDetails ? "dialog" : undefined}
      className={`names-glass names-card-glass relative flex flex-col gap-3 overflow-y-auto overscroll-contain rounded-xl p-5 ${className}`}
      {...rest}
    >
      <CardHeader
        name={stats.name}
        niqqud={content.niqqud}
        sexTag={derived.sexTag}
        position={position}
        total={total}
        surname={surname}
        corner={corner}
      >
        {content.intro.trim() && <p className="line-clamp-2 text-intro text-center break-words text-ink">{content.intro}</p>}
        {note ? (
          <p className="m-0 text-center text-caption text-ink-soft">
            <span className="sr-only">{AI_REASON_LABEL}, {AI_GENERATED}: </span>
            <span aria-hidden="true">✨ </span>
            {note}
            <span aria-hidden="true" className="text-stone"> · {AI_GENERATED}</span>
          </p>
        ) : null}
        {hints.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-2">
            {hints.map((hint) => (
              <li key={hint} className={hintChipClass()}>
                {hint}
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
      <CardSexBar {...derived} />
      <CardStats stats={stats} {...derived} />
      {onDetails && (
        <Button ref={detailsRef} variant="secondary" size="md" aria-haspopup="dialog" onClick={onDetails} className="shrink-0 self-center">
          לכל הפרטים
          <ChevronIcon dir="forward" size={16} />
        </Button>
      )}
      <span aria-hidden="true" data-stamp="keep" className={`${stamp} end-5 -rotate-12 text-ink`}>
        שמירה
      </span>
      <span aria-hidden="true" data-stamp="skip" className={`${stamp} start-5 rotate-12 text-ink-soft`}>
        דילוג
      </span>
      <span
        aria-hidden="true"
        data-stamp="love"
        className={`${stamp} inset-x-0 top-[40%] mx-auto w-max text-clay-deep`}
      >
        אהבתי מאוד
      </span>
    </article>
  );
}
