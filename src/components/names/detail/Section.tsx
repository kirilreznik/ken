import type { ReactNode } from "react";

/** One sheet section (boards 13–15): the small label used on the card, then its content. */
export default function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-tag text-ink-soft">{label}</h3>
      {children}
    </section>
  );
}
