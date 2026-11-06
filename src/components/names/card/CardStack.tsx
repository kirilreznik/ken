import type { ComponentProps } from "react";
import type { Card } from "@/lib/names/types";
import NameCard from "./NameCard";

type CardStackProps = Omit<ComponentProps<typeof NameCard>, "card"> & {
  /** The deck from the current card on; the next two peek out underneath. */
  cards: Card[];
  /** Plays the enter animation on the current card (after a decision, not on first render). */
  enter?: boolean;
};

const back = "names-glass-soft pointer-events-none absolute rounded-xl";

/**
 * The current card with the next two peeking out under it (Main.dc.html, GlassFabric.dc.html,
 * the demo's .nd-back): thin edges only, the nearer one at +1°, 12 px in and 6 px below, the
 * farther one at −1.5°, 24 px in and 12 px below. They used to show the next names in 22/44 px
 * strips, which crowded the action buttons. They're decoration (aria-hidden); the current card
 * is a NameCard keyed by name, so a new one mounts with the demo's enter animation (a fade with
 * reduced motion).
 */
export default function CardStack({ cards, enter = false, className = "", ...cardProps }: CardStackProps) {
  const [card, next, after] = cards;
  if (!card) return null;
  return (
    <div className="relative flex min-h-0 flex-1 flex-col pb-3">
      {after && <div aria-hidden="true" className={`${back} names-back-far inset-x-6 top-6 bottom-0 -rotate-[1.5deg]`} />}
      {next && <div aria-hidden="true" className={`${back} names-back-near inset-x-3 top-3 bottom-1.5 rotate-1`} />}
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
