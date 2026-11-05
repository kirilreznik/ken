"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import ScreenBackground from "@/components/names/ScreenBackground";
import { Button, Glass, IconButton } from "@/components/names/ui";
import { closeSheet, openSheet, useLayerOpen } from "@/components/names/ui/layers";
import { useModal, usePortalHost } from "@/components/names/ui/useModal";
import { useNameStats } from "@/components/names/useCards";
import { matchSheetLine, type Match } from "@/lib/names/matches";
import { countLine } from "@/lib/names/popularity";
import type { Card } from "@/lib/names/types";

export const MATCHES_LIST_PATH = "/names/lists?tab=matches";

type MatchSheetProps = {
  /** The newest match not shown on this device yet; null when there is none. */
  match: Match | null;
  /** False until the matches have been read (cache or server). */
  ready: boolean;
  /** The deck's cards, for the name with niqqud. */
  cards: readonly Card[] | null;
  /** Marks every current match as shown, so the sheet never comes back for them. */
  onSeen: () => void;
};

/**
 * FR-W20 match sheet (board 4): opens by itself (?sheet=match) when a match is new on this
 * device, on the chosen background, in ink with a clay dot; no green, no confetti. Shown once
 * per name: any way out (X, "להמשיך לבחור", "לרשימת ההתאמות", Escape, Back) marks it seen.
 */
export default function MatchSheet(props: MatchSheetProps) {
  return (
    <Suspense fallback={null}>
      <MatchGate {...props} />
    </Suspense>
  );
}

function MatchGate({ match, ready, cards, onSeen }: MatchSheetProps) {
  const params = useSearchParams();
  const open = useLayerOpen("sheet", "match");
  const host = usePortalHost();
  const otherLayer = !open && (params.has("sheet") || params.has("dialog"));
  // The match on screen until a way out marks it seen.
  const shownRef = useRef<string | null>(null);
  const seenRef = useRef(onSeen);

  useEffect(() => {
    seenRef.current = onSeen;
  }, [onSeen]);

  useEffect(() => {
    if (open && match) {
      shownRef.current = match.name;
    } else if (!open && shownRef.current) {
      // Back (or any history move) took ?sheet=match away: that counts as seeing it. Done here,
      // not in a popstate listener: the router re-renders before such a listener would run.
      shownRef.current = null;
      seenRef.current();
    } else if (ready && match && !open && !otherLayer) {
      // Waits for any other sheet or dialog to close. A ?sheet=match with nothing new shows
      // nothing (closing it here would race the Back that a close has already started).
      openSheet("match");
    }
  }, [match, open, otherLayer, ready]);

  if (!open || !match || !host) return null;
  return createPortal(<MatchPanel key={match.name} match={match} cards={cards} onSeen={onSeen} />, host);
}

function MatchPanel({ match, cards, onSeen }: { match: Match; cards: readonly Card[] | null; onSeen: () => void }) {
  const router = useRouter();
  const { names } = useNameStats();
  const panel = useRef<HTMLElement>(null);
  const lineId = useId();

  const close = () => {
    onSeen();
    closeSheet("match");
  };
  const onKeyDown = useModal(panel, close);

  const toList = () => {
    onSeen();
    // Replaces the sheet's history entry, so Back from the list returns to the swipe screen.
    router.replace(MATCHES_LIST_PATH);
  };

  const card = cards?.find((c) => c.stats.name === match.name);
  const stats = card?.stats ?? names?.get(match.name);
  const display = card?.content.niqqud || match.name;

  return (
    <div data-names-layer className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-canvas">
      <ScreenBackground blobs="match">
        <section
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={`יש התאמה: ${match.name}`}
          aria-describedby={lineId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="names-sheet-in flex min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col gap-6 px-5 pt-14 pb-8 text-ink outline-none"
        >
          <IconButton aria-label="סגירה" onClick={close} className="self-end">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </IconButton>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            <p className="m-0 text-person font-bold text-clay-deep">יש התאמה</p>
            <Glass className="flex w-full flex-col items-center gap-2.5 rounded-xl px-6 py-8">
              <h2 lang="he" className="m-0 text-match-name break-words">
                {display}
              </h2>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-clay" />
              <p id={lineId} className="m-0 text-match-line text-ink-soft">
                {matchSheetLine(match)}
              </p>
              {stats ? <p className="m-0 text-caption text-stone">{countLine(stats)}</p> : null}
            </Glass>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={toList}>
              לרשימת ההתאמות
            </Button>
            <Button variant="secondary" onClick={close} className="h-13! text-card-title">
              להמשיך לבחור
            </Button>
          </div>
        </section>
      </ScreenBackground>
    </div>
  );
}
