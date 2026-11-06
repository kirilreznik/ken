"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import AboutSheet from "@/components/names/about/AboutSheet";
import ReportSheet from "@/components/names/about/ReportSheet";
import BackgroundSheet from "@/components/names/BackgroundSheet";
import CardStack from "@/components/names/card/CardStack";
import FiltersSheet from "@/components/names/FiltersSheet";
import MatchSheet from "@/components/names/MatchSheet";
import { useCards } from "@/components/names/useCards";
import { useSpace } from "@/components/names/useSpace";
import { useMatches, useSeenMatches } from "@/components/names/useMatches";
import { useSyncStatus } from "@/components/names/useSyncStatus";
import { useVotes } from "@/components/names/useVotes";
import { statusText } from "@/lib/names/a11y";
import { markAppEntry } from "@/lib/names/appHistory";
import { buildDeck, deckProgress, hashSeed } from "@/lib/names/deck";
import { defaultFilters, hasSheetFilters, withSex } from "@/lib/names/filters";
import type { Decision } from "@/lib/names/gesture";
import { matchToShow, withSeen } from "@/lib/names/matches";
import { getPref, setPref, subscribePrefs } from "@/lib/names/prefs";
import type { SexTag, Vote } from "@/lib/names/types";
import { applyVote, isSaved, savedInOrder, undo as undoVote, type UndoEntry } from "@/lib/names/votes";
import ActionBar from "./ActionBar";
import AboutLink from "./AboutLink";
import EmptyDeck from "./EmptyDeck";
import QuickChips from "./QuickChips";
import SwipeFooter from "./SwipeFooter";
import SwipeHeader from "./SwipeHeader";
import SwipeKeys, { SWIPE_KEYS_ID } from "./SwipeKeys";
import { dragClass, useSwipeDrag } from "./useSwipeDrag";

/**
 * A pref as a JSON string, so useSyncExternalStore gets a stable snapshot (getPref returns a
 * new object on every call).
 */
function usePrefJson(userId: string | null, key: "filters" | "surname"): string | null {
  return useSyncExternalStore(
    subscribePrefs,
    () => (userId ? JSON.stringify(getPref(userId, key)) : null),
    () => null,
  );
}

/**
 * The swipe screen (FR-W10, FR-W14, FR-W15): the user's seeded deck without decided or hidden
 * names and filtered by the saved filters; each decision is saved through the vote store
 * (optimistic, offline outbox) and "ביטול" takes back up to 10, putting the name back on top.
 */
export default function SwipeScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const space = useSpace();
  const { cards } = useCards();
  const { store, state } = useVotes(space.spaceId, userId);
  const matches = useMatches(space.spaceId, userId, space.isShared, state?.votes);
  const sync = useSyncStatus(state?.pendingCount ?? 0);
  const { seen, setSeen } = useSeenMatches(userId);
  const newMatch = useMemo(() => (matches?.ready ? matchToShow(matches.matches, seen) : null), [matches, seen]);

  const filtersJson = usePrefJson(userId, "filters");
  const surnameJson = usePrefJson(userId, "surname");
  const filters = useMemo(() => (userId && filtersJson ? getPref(userId, "filters") : null), [userId, filtersJson]);
  const surname = surnameJson ? (JSON.parse(surnameJson) as string) : "";

  const [undoStack, setUndoStack] = useState<readonly UndoEntry[]>([]);
  const [top, setTop] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [entered, setEntered] = useState(false);

  useEffect(markAppEntry, []);

  const votes = useMemo(() => {
    const map = new Map<string, Vote>();
    for (const [name, v] of state?.votes ?? []) map.set(name, v.vote);
    return map;
  }, [state?.votes]);
  const savedCount = useMemo(() => [...votes.values()].filter(isSaved).length, [votes]);
  const saved = useMemo(() => savedInOrder((cards ?? []).map((c) => c.stats.name), votes), [cards, votes]);

  const ready = !!(cards && filters && userId && store && state?.ready);
  const deck = useMemo(
    () => (ready ? buildDeck(cards, votes, filters, hashSeed(userId), { top }) : null),
    [ready, cards, votes, filters, userId, top],
  );
  const progress = deck && cards && filters ? deckProgress(cards, votes, filters, deck.cards.length) : null;
  const current = deck?.cards[0] ?? null;

  const decide = (kind: Decision) => {
    if (!store || !current) return;
    const name = current.stats.name;
    const next = applyVote({ votes, undo: undoStack }, name, kind);
    setUndoStack(next.state.undo);
    store.setVote(name, kind);
    setTop(null);
    setEntered(true);
    setStatus(statusText(kind, name));
  };

  const drag = useSwipeDrag({ onDecide: decide, disabled: !current });

  const undo = () => {
    if (!store || drag.busy()) return;
    const { state: next, entry } = undoVote({ votes, undo: undoStack });
    if (!entry) return;
    drag.holdFocus();
    setUndoStack(next.undo);
    if (entry.previous) store.setVote(entry.name, entry.previous);
    else store.removeVote(entry.name);
    setTop(entry.name);
    setEntered(true);
    setStatus(statusText("undo", entry.name));
  };

  const setSex = (sex: SexTag | null) => {
    if (userId && filters) setPref(userId, "filters", withSex(filters, sex));
  };
  const resetFilters = () => {
    if (userId) setPref(userId, "filters", defaultFilters());
  };
  const fly = (kind: Decision) => () => drag.fly(kind);

  return (
    <div className="flex h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col max-[20rem]:h-auto">
      <SwipeHeader saved={savedCount} filtered={hasSheetFilters(filters)} />
      <main className="flex min-h-0 flex-1 flex-col">
        <QuickChips sex={filters?.sex ?? null} onChange={setSex} />
        <SwipeKeys onKey={(key) => (key === "undo" ? undo() : drag.fly(key))} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col px-5 max-[20rem]:min-h-100 max-[20rem]:px-3">
            {deck && current && progress ? (
              <CardStack
                cards={deck.cards}
                enter={entered}
                position={progress.position}
                total={progress.total}
                surname={surname}
                className={`min-h-0 ${dragClass}`}
                aria-describedby={SWIPE_KEYS_ID}
                footer={<AboutLink />}
                {...drag.card}
              />
            ) : deck && deck.state !== "ok" ? (
              <EmptyDeck
                state={deck.state}
                saved={saved}
                solo={space.members.length === 1}
                onReset={resetFilters}
                takeFocus={entered}
              />
            ) : null}
          </div>
          <ActionBar
            onKeep={fly("keep")}
            onLove={fly("love")}
            onSkip={fly("skip")}
            onHide={fly("hidden")}
            disabled={!current}
            describedBy={SWIPE_KEYS_ID}
          />
          <SwipeFooter canUndo={undoStack.length > 0} onUndo={undo} status={status} describedBy={SWIPE_KEYS_ID} sync={sync} />
        </SwipeKeys>
      </main>
      <BackgroundSheet />
      <AboutSheet hasName={!!current} />
      <ReportSheet name={current?.stats.name ?? null} />
      <FiltersSheet userId={userId} cards={cards} votes={votes} />
      <MatchSheet
        match={newMatch}
        ready={!!matches?.ready}
        cards={cards}
        onSeen={() => setSeen(withSeen(seen, matches?.matches ?? []))}
      />
    </div>
  );
}
