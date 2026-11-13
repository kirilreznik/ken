"use client";

import { useEffect, useRef, useState } from "react";
import WelcomeActions from "@/components/names/WelcomeActions";
import { Button, Glass, emptyTitleClass } from "@/components/names/ui";
import { GUEST_LIMIT, guestLeftLine, type GuestPrompt } from "@/lib/names/guest";
import { track } from "@/lib/names/track";
import { deckPanel, deckPanelWrap } from "./EmptyDeck";

type GuestPanelProps = {
  kind: GuestPrompt;
  /** The guest's decisions so far. */
  count: number;
  /** "Later" on a sign-in card: back to the deck (the wall has no way past it). */
  onLater: () => void;
};

/**
 * A sign-in card in a guest's deck, where the card was (like PausePanel): every 20 decisions
 * a card that can be put aside, and at 100 the wall that can't. Signing in keeps the names
 * decided so far: they move into the account (lib/names/guest.ts).
 */
export default function GuestPanel({ kind, count, onLater }: GuestPanelProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = document.activeElement;
    const el = root.current;
    if (!el) return;
    if (active && active !== document.body && !el.closest("main")?.contains(active)) return;
    el.querySelector<HTMLElement>("button, a")?.focus();
  }, [kind]);

  // Counted once per card shown, with the decisions it came after.
  const [shownAt] = useState(count);
  useEffect(() => {
    track("guest_prompt", { kind, action: "shown", votes: shownAt });
  }, [kind, shownAt]);

  return (
    <div ref={root} className={deckPanelWrap}>
      <Glass as="section" aria-labelledby="names-guest-title" aria-describedby="names-guest-lead" className={deckPanel}>
        <h2 id="names-guest-title" className={emptyTitleClass("glass")}>
          {kind === "wall" ? `עברת על ${GUEST_LIMIT} שמות` : "לשמור את מה שבחרת?"}
        </h2>
        <p id="names-guest-lead" className="m-0 text-intro text-ink-soft">
          {kind === "wall"
            ? "כדי להמשיך לבחור צריך להתחבר. השמות שכבר שמרת עוברים לחשבון ולא הולכים לאיבוד."
            : "עם חשבון, השמות שבחרת נשמרים בכל מכשיר, ואפשר להזמין מישהו לבחור יחד."}
        </p>
        {kind === "nudge" ? <p className="m-0 text-person text-ink-soft">{guestLeftLine(count)}</p> : null}
        <div className="flex w-full flex-col gap-3" onClickCapture={() => track("guest_prompt", { kind, action: "signin", votes: count })}>
          <WelcomeActions />
        </div>
        {kind === "nudge" ? (
          <Button
            variant="link"
            onClick={() => {
              track("guest_prompt", { kind, action: "later", votes: count });
              onLater();
            }}
          >
            אחר כך, להמשיך לבחור
          </Button>
        ) : null}
      </Glass>
    </div>
  );
}
