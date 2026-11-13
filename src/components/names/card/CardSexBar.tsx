import { barLabel } from "@/lib/names/a11y";
import type { CardDerived } from "@/lib/names/types";

type CardSexBarProps = Pick<CardDerived, "boysShare" | "boysLabel" | "girlsLabel">;

/**
 * Boys/girls bar (E16 FR-5b): births by sex since 1949, "בנים {x}%" at the start and
 * "בנות {y}%" at the end, the boys part ink on a peach track (never blue and pink).
 * An inset ink-35 edge keeps the peach (girls) part visible on peach-tinted glass.
 * One image element for screen readers, read with barLabel(). Sizes from Main.dc.html.
 */
export default function CardSexBar({ boysShare, boysLabel, girlsLabel }: CardSexBarProps) {
  const width = `${Math.min(1, Math.max(0, boysShare)) * 100}%`;
  return (
    <div role="img" aria-label={barLabel({ boysLabel, girlsLabel })} className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-2 text-ref font-bold text-ink">
        <span>בנים {boysLabel}</span>
        <span>בנות {girlsLabel}</span>
      </div>
      <div aria-hidden="true" className="flex h-2 overflow-hidden rounded-pill bg-peach ring-1 ring-inset ring-ink-35">
        <div className="h-2 bg-ink" style={{ width }} />
      </div>
    </div>
  );
}
