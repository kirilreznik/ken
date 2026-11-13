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
 *
 * On a photo the current card's glass is see-through, so the back cards sit in a wrapper that
 * names.css masks to the strip below the card (and its rounded corners): only the peeking edges
 * paint. The wrapper reaches 16 px under the stack so the tilted far card's corner isn't cut.
 * While the card moves (data-moving, useSwipeDrag) the mask lifts and the next card shows.
 * The stack is a size container: on short screens the card drops its chips, then tightens,
 * to fit without scrolling (names.css, NP-BUG-010). Content-sized decks (under 20rem wide or
 * 30rem high, SwipeScreen) aren't containers, so there the card keeps every part.
 */
export default function CardStack({ cards, enter = false, className = "", ...cardProps }: CardStackProps) {
  const [card, next, after] = cards;
  if (!card) return null;
  return (
    <div className="names-stack relative flex min-h-0 flex-1 flex-col pb-3 @container-size max-[20rem]:[container-type:normal] [@media(max-height:30rem)]:[container-type:normal]">
      {next && (
        <div aria-hidden="true" className="names-back-clip pointer-events-none absolute inset-x-0 top-0 -bottom-4">
          {after && <div className={`${back} names-back-far inset-x-6 top-6 bottom-4 -rotate-[1.5deg]`} />}
          <div className={`${back} names-back-near inset-x-3 top-3 bottom-5.5 rotate-1`} />
        </div>
      )}
      <NameCard
        key={card.stats.name}
        card={card}
        data-motion={enter ? "fade-in" : undefined}
        className={`flex-1 ${enter ? "names-card-enter" : ""} ${className}`}
        {...cardProps}
      />
    </div>
  );
}
