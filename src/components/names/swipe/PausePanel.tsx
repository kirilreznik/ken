"use client";

import { useEffect, useRef, useState } from "react";
import NestCard from "@/components/names/NestCard";
import { Button, Glass, emptyTitleClass } from "@/components/names/ui";
import { deckPanel, deckPanelWrap } from "./EmptyDeck";
import { RECAP_NAMES, recapLine, type Pause } from "@/lib/names/launch";
import { track } from "@/lib/names/track";

type PausePanelProps = {
  pause: Pause;
  /** This session's totals, for the recap. */
  totals: { votes: number; saves: number; names: string[] };
  /** Done with the pause (back to the deck, or on to another screen): it won't come back. */
  onContinue: () => void;
};

/**
 * A pause where the card was (like the end-of-deck panel): the one-time "choose together"
 * prompt after the 5th save (solo), or the round recap after 30 decisions in a session with
 * the Nest app card. One button goes back to the deck; nothing else is blocked.
 */
export default function PausePanel({ pause, totals, onContinue }: PausePanelProps) {
  const root = useRef<HTMLDivElement>(null);

  // Focus follows the card that was swiped away, so keyboard and screen-reader users land here;
  // the main button is described by the panel's lines, so the reason is read with it.
  useEffect(() => {
    const active = document.activeElement;
    const el = root.current;
    if (!el) return;
    if (active && active !== document.body && !el.closest("main")?.contains(active)) return;
    el.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [pause]);

  // The numbers of the moment it opened; counted once per pause shown.
  const [opened] = useState(totals);
  useEffect(() => {
    if (pause === "recap") track("recap_shown", { votes: opened.votes, saves: opened.saves });
    else track("invite_prompt", { placement: "fifth_save", action: "shown" });
  }, [pause, opened]);

  return (
    <div ref={root} className={deckPanelWrap}>
      <Glass
        as="section"
        aria-labelledby="names-pause-title"
        className={deckPanel}
      >
        {pause === "invite" ? (
          <>
            <h2 id="names-pause-title" className={emptyTitleClass("glass")}>
              רוצה לבחור עם מישהו?
            </h2>
            <p id="names-pause-lead" className="m-0 text-intro text-ink-soft">
              כבר שמרת 5 שמות. אפשר להזמין מישהו נוסף: הבחירה נעשית בנפרד, בכל טלפון, ושם שנשמר אצל שניים או יותר הופך להתאמה.
            </p>
            <p id="names-pause-note" className="m-0 text-person text-ink-soft">על מה דילגת נשאר רק אצלך.</p>
            <Button
              size="md"
              href="/names/invite"
              data-autofocus=""
              aria-describedby="names-pause-lead names-pause-note"
              onClick={() => {
                track("invite_prompt", { placement: "fifth_save", action: "invite" });
                onContinue();
              }}
            >
              הזמנה לבחירה משותפת
            </Button>
            <Button
              variant="link"
              onClick={() => {
                track("invite_prompt", { placement: "fifth_save", action: "later" });
                onContinue();
              }}
            >
              אחר כך, להמשיך לבחור
            </Button>
          </>
        ) : (
          <>
            <h2 id="names-pause-title" className={emptyTitleClass("glass")}>
              סיכום הסבב
            </h2>
            <p id="names-pause-lead" className="m-0 text-intro text-ink-soft">{recapLine(opened.votes, opened.saves)}</p>
            {opened.names.length > 0 ? (
              <ol aria-label="שמות ששמרת בסבב הזה" className="m-0 flex list-none flex-wrap justify-center gap-1.5 p-0">
                {opened.names.slice(0, RECAP_NAMES).map((name) => (
                  <li key={name} className="names-glass-soft rounded-pill px-3 py-1 text-card-title text-ink">
                    {name}
                  </li>
                ))}
              </ol>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                size="md"
                data-autofocus=""
                aria-describedby="names-pause-lead"
                onClick={() => {
                  track("recap_cta", { action: "continue" });
                  onContinue();
                }}
              >
                להמשיך לבחור
              </Button>
              <Button
                variant="secondary"
                size="md"
                href="/names/lists"
                onClick={() => {
                  track("recap_cta", { action: "list" });
                  onContinue();
                }}
              >
                לשמות שלי
              </Button>
            </div>
            <NestCard placement="recap" />
          </>
        )}
      </Glass>
    </div>
  );
}
