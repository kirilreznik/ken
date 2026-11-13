import type { ReactNode } from "react";
import type { DetailSection } from "@/lib/names/detailVisit";

/**
 * One sheet section (boards 13–15): the small label used on the card, then its content.
 * `seen` names it for `detail_section_seen` (the sheet watches [data-detail-section]).
 */
export default function Section({ label, seen, children }: { label: string; seen?: DetailSection; children: ReactNode }) {
  return (
    <section data-detail-section={seen} className="flex flex-col gap-2">
      <h3 className="text-tag text-ink-soft">{label}</h3>
      {children}
    </section>
  );
}
