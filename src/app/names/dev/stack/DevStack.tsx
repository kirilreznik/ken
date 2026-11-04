"use client";

import { useState } from "react";
import CardStack from "@/components/names/card/CardStack";
import ActionBar from "@/components/names/swipe/ActionBar";
import SwipeFooter from "@/components/names/swipe/SwipeFooter";
import { dragClass, useSwipeDrag } from "@/components/names/swipe/useSwipeDrag";
import { statusText, type StatusKind } from "@/lib/names/a11y";
import type { Card } from "@/lib/names/types";

// Dev-only: the stack with the action bar and footer, to check the enter animation (US-040)
// the actions (US-041) and the drag (US-043). Decisions only advance the stack; nothing is saved.
export default function DevStack({ cards }: { cards: Card[] }) {
  const [done, setDone] = useState(0);
  const [status, setStatus] = useState("");
  const current = cards[done];
  const decide = (kind: Exclude<StatusKind, "undo">) => () => {
    setStatus(statusText(kind, current.stats.name));
    setDone((d) => d + 1);
  };
  const drag = useSwipeDrag({ onDecide: (kind) => decide(kind)(), disabled: !current });
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col px-5">
        <CardStack
          cards={cards.slice(done)}
          enter={done > 0}
          position={done + 1}
          total={cards.length}
          className={`min-h-0 ${dragClass}`}
          {...drag}
        />
      </div>
      <ActionBar onKeep={decide("keep")} onLove={decide("love")} onSkip={decide("skip")} disabled={!current} />
      <SwipeFooter
        canUndo={done > 0}
        onUndo={() => {
          setStatus(statusText("undo", cards[done - 1].stats.name));
          setDone((d) => d - 1);
        }}
        status={status}
      />
    </>
  );
}
