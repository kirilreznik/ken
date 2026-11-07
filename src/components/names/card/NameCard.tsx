import type { ComponentPropsWithRef, ReactNode } from "react";
import { cardLabel } from "@/lib/names/a11y";
import type { Card } from "@/lib/names/types";
import { Button } from "../ui/Button";
import CardBible from "./CardBible";
import CardHeader from "./CardHeader";
import CardPeople from "./CardPeople";
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
  /** Shows "לכל הפרטים" at the end of the card (board 12); it opens the name sheet. */
  onDetails?: () => void;
};

const stamp =
  "pointer-events-none absolute top-5.5 rounded-sm border-3 border-current bg-(--nest-white-75) px-3 py-1 text-stamp";

/**
 * A whole name card (E16 FR-5a), one glass article in this order: header and name, intro,
 * "מהתנ״ך", known people, the boys/girls bar, the number tiles and, with onDetails, the
 * "לכל הפרטים" button. Empty sections are left out.
 * It scrolls inside itself when the content is taller than the card. The swipe stamps
 * (שמירה, דילוג, אהבתי מאוד) show through the --keep, --skip and --love CSS variables (0..1)
 * that the drag sets on the article, like the landing demo's .nd-stamp.
 */
export default function NameCard({ card, position, total, surname, corner, onDetails, className = "", ...rest }: NameCardProps) {
  const { stats, content, derived } = card;
  return (
    <article
      aria-label={cardLabel(card)}
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
        {content.intro.trim() && <p className="text-intro text-center break-words text-ink">{content.intro}</p>}
        <CardBible bible={content.bible} />
        <CardPeople people={content.people} />
      </CardHeader>
      <CardSexBar {...derived} />
      <CardStats stats={stats} {...derived} />
      {onDetails && (
        <Button variant="secondary" size="md" aria-haspopup="dialog" onClick={onDetails} className="shrink-0 self-center">
          לכל הפרטים
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 ltr:-scale-x-100">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </Button>
      )}
      <span aria-hidden="true" className={`${stamp} end-5 -rotate-12 text-ink opacity-[var(--keep,0)]`}>
        שמירה
      </span>
      <span aria-hidden="true" className={`${stamp} start-5 rotate-12 text-ink-soft opacity-[var(--skip,0)]`}>
        דילוג
      </span>
      <span
        aria-hidden="true"
        className={`${stamp} inset-x-0 top-[40%] mx-auto w-max text-clay-deep opacity-[var(--love,0)]`}
      >
        אהבתי מאוד
      </span>
    </article>
  );
}
