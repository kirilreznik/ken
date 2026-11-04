"use client";

import { useState } from "react";
import CardStack from "@/components/names/card/CardStack";
import ActionBar from "@/components/names/swipe/ActionBar";
import SwipeFooter from "@/components/names/swipe/SwipeFooter";
import SwipeKeys, { SWIPE_KEYS_ID } from "@/components/names/swipe/SwipeKeys";
import { dragClass, useSwipeDrag } from "@/components/names/swipe/useSwipeDrag";
import { statusText } from "@/lib/names/a11y";
import type { Decision } from "@/lib/names/gesture";
import type { Card } from "@/lib/names/types";

// Dev-only: the stack with the action bar and footer, to check the enter animation (US-040),
// the actions (US-041), the drag (US-043) and the keys (US-044). Decisions only advance the
// stack; nothing is saved.
export default function DevStack({ cards }: { cards: Card[] }) {
  const [done, setDone] = useState(0);
  const [status, setStatus] = useState("");
  const current = cards[done];
  const drag = useSwipeDrag({
    onDecide: (kind) => {
      setStatus(statusText(kind, current.stats.name));
      setDone((d) => d + 1);
    },
    disabled: !current,
  });
  const undo = () => {
    if (done === 0 || drag.busy()) return;
    drag.holdFocus();
    setStatus(statusText("undo", cards[done - 1].stats.name));
    setDone((d) => d - 1);
  };
  const fly = (kind: Decision) => () => drag.fly(kind);
  return (
    <SwipeKeys onKey={(key) => (key === "undo" ? undo() : drag.fly(key))} className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col px-5">
        <CardStack
          cards={cards.slice(done)}
          enter={done > 0}
          position={done + 1}
          total={cards.length}
          className={`min-h-0 ${dragClass}`}
          aria-describedby={SWIPE_KEYS_ID}
          {...drag.card}
        />
      </div>
      <ActionBar
        onKeep={fly("keep")}
        onLove={fly("love")}
        onSkip={fly("skip")}
        onHide={fly("hidden")}
        disabled={!current}
        describedBy={SWIPE_KEYS_ID}
      />
      <SwipeFooter canUndo={done > 0} onUndo={undo} status={status} describedBy={SWIPE_KEYS_ID} />
    </SwipeKeys>
  );
}
