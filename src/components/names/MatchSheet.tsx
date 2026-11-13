"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import MomentSheet from "@/components/names/MomentSheet";
import { Button } from "@/components/names/ui";
import { closeSheet, openSheet, useLayerOpen } from "@/components/names/ui/layers";
import { usePortalHost } from "@/components/names/ui/useModal";
import { useNameStats } from "@/components/names/useCards";
import { matchSheetLine, type Match } from "@/lib/names/matches";
import { countLine } from "@/lib/names/popularity";
import type { Card } from "@/lib/names/types";
import { track } from "@/lib/names/track";

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

  const close = (action: "continue" | "close") => {
    track("match_cta", { action });
    onSeen();
    closeSheet("match");
  };

  // Once per panel (it is keyed by the name), even when the matches are read again.
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track("match_shown", { kept_by: match.keptByCount, loved_by: match.lovedByCount });
  }, [match]);

  const toList = () => {
    track("match_cta", { action: "list" });
    onSeen();
    // Replaces the sheet's history entry, so Back from the list returns to the swipe screen.
    router.replace(MATCHES_LIST_PATH);
  };

  const card = cards?.find((c) => c.stats.name === match.name);
  const stats = card?.stats ?? names?.get(match.name);

  return (
    <MomentSheet
      label={`יש התאמה: ${match.name}`}
      eyebrow="יש התאמה"
      name={card?.content.niqqud || match.name}
      line={matchSheetLine(match)}
      meta={stats ? countLine(stats) : null}
      onClose={() => close("close")}
      actions={
        <>
          <Button onClick={toList}>
            לרשימת ההתאמות
          </Button>
          <Button variant="secondary" size="tall" onClick={() => close("continue")}>
            להמשיך לבחור
          </Button>
        </>
      }
    />
  );
}
