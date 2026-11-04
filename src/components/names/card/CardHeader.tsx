import { fullName, positionText } from "@/lib/names/card";
import type { SexTag } from "@/lib/names/types";

interface CardHeaderProps {
  name: string;
  niqqud: string;
  sexTag: SexTag;
  /** 1-based place of the card in the filtered deck; the line is left out without it. */
  position?: number;
  total?: number;
  /** The user's surname from the device prefs; the full name line shows only when set. */
  surname?: string | null;
}

/**
 * Top of a name card (FR-W12, E16 FR-5a): the sex tag and "שם {n} מתוך {total}", then the
 * name with niqqud and the full name with surname. Sizes from Main.dc.html / GlassFabric.dc.html;
 * the soft text is stone on "ללא רקע" (board 2) and ink-soft on the photos (boards 8–10).
 */
export default function CardHeader({ name, niqqud, sexTag, position, total, surname }: CardHeaderProps) {
  const full = fullName(name, surname);
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-pill bg-peach-soft px-2.5 py-1.5 text-tag text-clay-deep">{sexTag}</span>
        {position != null && total != null && (
          <span className="text-caption text-ink-soft in-data-[names-bg=none]:text-stone">
            {positionText(position, total)}
          </span>
        )}
      </div>
      <div className="flex flex-col items-center gap-0.5 pt-2 text-center">
        <h2 className="text-name break-words text-ink">{niqqud}</h2>
        {full && (
          <p className="text-card-title font-medium break-words text-ink-soft in-data-[names-bg=none]:text-stone">
            {full}
          </p>
        )}
      </div>
    </>
  );
}
