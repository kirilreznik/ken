import type { ComponentProps } from "react";
import type { Card } from "@/lib/names/types";
import NameCard from "./NameCard";

type CardStackProps = Omit<ComponentProps<typeof NameCard>, "card"> & {
  /** The deck from the current card on; the next two peek out underneath. */
  cards: Card[];
  /** Plays the enter animation on the current card (after a decision, not on first render). */
  enter?: boolean;
};

const back =
  "names-glass-soft pointer-events-none absolute flex items-end justify-center rounded-xl text-ink-soft";

/**
 * The current card with the next two peeking out under it (Main.dc.html, GlassFabric.dc.html,
 * the demo's .nd-back): the nearer one at +2°, 12 px in and 22 px below, the farther one at
 * −3°, 24 px in and 44 px below, each showing its name in its own visible strip (the boards'
 * 14/28 px strips are shorter than a line, so the names overlapped behind the glass). They're decoration
 * (aria-hidden); the current card is a NameCard keyed by name, so a new one mounts with the
 * demo's enter animation (a fade with reduced motion).
 */
export default function CardStack({ cards, enter = false, className = "", ...cardProps }: CardStackProps) {
  const [card, next, after] = cards;
  if (!card) return null;
  return (
    <div className="relative flex min-h-0 flex-1 flex-col pb-11">
      {after && (
        <div
          aria-hidden="true"
          className={`${back} names-back-far inset-x-6 top-7 bottom-0 -rotate-3 pb-1 text-peek leading-none in-data-[names-bg=none]:text-faint`}
        >
          {after.stats.name}
        </div>
      )}
      {next && (
        <div
          aria-hidden="true"
          className={`${back} names-back-near inset-x-3 top-3.5 bottom-5.5 rotate-2 pb-1.5 text-card-title leading-none font-extrabold in-data-[names-bg=none]:text-mist`}
        >
          {next.stats.name}
        </div>
      )}
      <NameCard
        key={card.stats.name}
        card={card}
        data-motion={enter ? "fade" : undefined}
        className={`flex-1 ${enter ? "names-card-enter" : ""} ${className}`}
        {...cardProps}
      />
    </div>
  );
}
