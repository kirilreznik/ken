"use client";

import { useEffect, useRef } from "react";
import NestCard from "@/components/names/NestCard";
import { Button, openSheet, Glass, emptyPanelClass, emptyTitleClass } from "@/components/names/ui";

type EmptyDeckProps = {
  /**
   * "empty-filter": undecided names exist but none match; "filter-done": every name that
   * matches is decided; "all-decided": every name has a vote.
   */
  state: "empty-filter" | "filter-done" | "all-decided";
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
 * Saved names as one plain line ("א · ב · ג"), not chips that look like buttons, ending in
 * "ועוד {n}" when there are more than shown (NP-080). Shared with the round recap (PausePanel).
 */
export function SavedNames({ names, shown, label }: { names: readonly string[]; shown: number; label?: string }) {
  const more = names.length - shown;
  return (
    <ol aria-label={label} className="m-0 flex list-none flex-wrap justify-center p-0 text-card-title text-ink">
      {names.slice(0, shown).map((name, i) => (
        <li key={name}>
          {i > 0 ? <span aria-hidden="true" className="text-ink-soft">{"\u00a0·\u00a0"}</span> : null}
          {name}
        </li>
      ))}
      {more > 0 ? (
        <li className="text-ink-soft">
          <span aria-hidden="true">{"\u00a0·\u00a0"}</span>
          ועוד {more.toLocaleString("he-IL")}
        </li>
      ) : null}
    </ol>
  );
}

/**
 * The deck's end states (FR-W14, the demo's .nd-empty): a glass panel where the card was.
 * The empty or finished filter offers "איפוס סינון"; at the end of the deck it lists the saved names and
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
        {state !== "all-decided" ? (
          <>
            <h2 id="names-empty-title" className={emptyTitleClass("glass")}>
              {state === "filter-done" ? "עברת על כל השמות בסינון הזה." : "אין שמות שמתאימים לסינון הזה"}
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
                <SavedNames names={saved} shown={SAVED_SHOWN} />
              </>
            ) : (
              <p className="text-intro text-ink-soft">לא נשמרו שמות.</p>
            )}
            <Button size="md" variant={saved.length > 0 ? "primary" : "secondary"} href="/names/lists">
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
