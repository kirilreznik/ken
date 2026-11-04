"use client";

import { useState } from "react";
import CardStack from "@/components/names/card/CardStack";
import type { Card } from "@/lib/names/types";

// Dev-only: the stack with a button that advances it, to check the enter animation (US-040).
export default function DevStack({ cards }: { cards: Card[] }) {
  const [done, setDone] = useState(0);
  return (
    <>
      <CardStack
        cards={cards.slice(done)}
        enter={done > 0}
        position={done + 1}
        total={cards.length}
        className="min-h-[520px]"
      />
      <button type="button" className="mt-2 min-h-11" onClick={() => setDone((d) => Math.min(d + 1, cards.length))}>
        הבא
      </button>
    </>
  );
}
