import type { ReactNode } from "react";
import { fullName, positionText } from "@/lib/names/card";
import type { SexTag } from "@/lib/names/types";
import { tagClass } from "@/components/names/ui/classes";

interface CardHeaderProps {
  name: string;
  niqqud: string;
  sexTag: SexTag;
  /** 1-based place of the card in the filtered deck; the line is left out without it. */
  position?: number;
  total?: number;
  /** The user's surname from the device prefs; the full name line shows only when set. */
  surname?: string | null;
  /** The card's words (intro, hint chips): centred with the name in the space above the numbers. */
  children?: ReactNode;
  /** A small control at the end of the top row, e.g. the swipe screen's "על הנתונים" button. */
  corner?: ReactNode;
}

/**
 * Top of a name card (FR-W12, E16 FR-5a): the sex tag and "שם {n} מתוך {total}", then the
 * name with niqqud and the full name with surname. Sizes from Main.dc.html / GlassFabric.dc.html;
 * the soft text is stone on "ללא רקע" (board 2) and ink-soft on the photos (boards 8–10).
 */
export default function CardHeader({ name, niqqud, sexTag, position, total, surname, children, corner }: CardHeaderProps) {
  const full = fullName(name, surname);
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className={tagClass()}>{sexTag}</span>
        <div className="flex items-center gap-1">
          {position != null && total != null && (
            <span className="text-caption text-ink-soft tabular-nums in-data-[names-bg=none]:text-stone">
              {positionText(position, total)}
            </span>
          )}
          {corner}
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center-safe gap-3">
        <div className="flex flex-col items-center gap-0.5 text-center">
          <h2 className="text-name break-words text-ink">{niqqud}</h2>
          {full && (
            // The full name is the fun part: a size up from the card's soft lines, in ink.
            <p className="text-title break-words text-ink">
              {full}
            </p>
          )}
        </div>
        {children}
      </div>
    </>
  );
}
