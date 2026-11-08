"use client";

import { useEffect, useRef } from "react";
import NestCard from "@/components/names/NestCard";
import { Button, openSheet, Glass, emptyPanelClass, emptyTitleClass } from "@/components/names/ui";

type EmptyDeckProps = {
  /** "empty-filter": undecided names exist but none match; "all-decided": every name has a vote. */
  state: "empty-filter" | "all-decided";
  /** Saved names (loved first) for the all-decided list. */
  saved: readonly string[];
  /** The space has one member: offer the invite link. */
  solo: boolean;
  onReset: () => void;
  /**
   * The deck emptied after a decision in this visit: if focus was in the swipe area (or lost
   * with the card), it moves to the first button.
   */
  takeFocus: boolean;
};

/** The deck panel's shape (`emptyPanelClass("glass")`), shared with the pauses (PausePanel) and the load error (DeckLoad). */
export const deckPanelWrap = "flex min-h-0 flex-1 flex-col pb-7";
export const deckPanel = emptyPanelClass("glass");

/** Shown names on the all-decided panel; the rest are on "השמות שלי". */
const SAVED_SHOWN = 10;

/**
 * The deck's end states (FR-W14, the demo's .nd-empty): a glass panel where the card was.
 * The empty filter offers "איפוס סינון"; at the end of the deck it lists the saved names and
 * links to "השמות שלי" and, when solo, to the invite screen.
 */
export default function EmptyDeck({ state, saved, solo, onReset, takeFocus }: EmptyDeckProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    const active = document.activeElement;
    if (!takeFocus || !el) return;
    if (active && active !== document.body && !el.closest("main")?.contains(active)) return;
    el.querySelector<HTMLElement>("a, button")?.focus();
  }, [takeFocus]);

  return (
    <div ref={root} className={deckPanelWrap}>
      <Glass
        as="section"
        aria-labelledby="names-empty-title"
        className={deckPanel}
      >
        {state === "empty-filter" ? (
          <>
            <h2 id="names-empty-title" className={emptyTitleClass("glass")}>
              אין שמות שמתאימים לסינון הזה
            </h2>
            {/* Two ways out: change one filter, or clear them all. */}
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="md" onClick={onReset}>
                איפוס סינון
              </Button>
              <Button variant="secondary" size="md" onClick={() => openSheet("filters")}>
                שינוי הסינון
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="names-empty-title" className={emptyTitleClass("glass")}>
              עברת על כל השמות.
              <br />
              בקרוב יתווספו עוד.
            </h2>
            {saved.length > 0 ? (
              <>
                <p className="text-intro text-ink-soft">השמות ששמרת:</p>
                <ol className="flex flex-wrap justify-center gap-1.5">
                  {saved.slice(0, SAVED_SHOWN).map((name) => (
                    <li key={name} className="names-glass-soft rounded-pill px-3 py-1 text-card-title text-ink">
                      {name}
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-intro text-ink-soft">לא נשמרו שמות הפעם.</p>
            )}
            <Button size="md" href="/names/lists">
              לשמות שלי
            </Button>
            {solo && (
              <Button variant="link" href="/names/invite">
                להזמין מישהו לבחור ביחד
              </Button>
            )}
            <NestCard placement="deck_end" />
          </>
        )}
      </Glass>
    </div>
  );
}
