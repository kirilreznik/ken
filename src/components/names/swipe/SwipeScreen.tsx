"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import AboutSheet from "@/components/names/about/AboutSheet";
import ReportSheet from "@/components/names/about/ReportSheet";
import BackgroundSheet from "@/components/names/BackgroundSheet";
import CardStack from "@/components/names/card/CardStack";
import NameDetailSheet from "@/components/names/detail/NameDetailSheet";
import FiltersSheet from "@/components/names/FiltersSheet";
import MatchSheet from "@/components/names/MatchSheet";
import SurveySheet from "@/components/names/SurveySheet";
import { useCards } from "@/components/names/useCards";
import { useSpace } from "@/components/names/useSpace";
import { useMatches, useSeenMatches } from "@/components/names/useMatches";
import { useSyncStatus } from "@/components/names/useSyncStatus";
import { useVotes } from "@/components/names/useVotes";
import { statusText } from "@/lib/names/a11y";
import { markAppEntry } from "@/lib/names/appHistory";
import { buildDeck, deckProgress, hashSeed } from "@/lib/names/deck";
import { defaultFilters, hasFilters, sexToken } from "@/lib/names/filters";
import type { Decision } from "@/lib/names/gesture";
import { matchToShow, withSeen, type Match } from "@/lib/names/matches";
import { RECAP_VOTES, countSession, pauseToShow, sessionTotals, surveyDue, type Pause } from "@/lib/names/launch";
import { getPref, setPref, subscribePrefs } from "@/lib/names/prefs";
import { currentSessionInfo, track } from "@/lib/names/track";
import type { Vote } from "@/lib/names/types";
import { applyVote, isSaved, savedInOrder, undo as undoVote, type UndoEntry } from "@/lib/names/votes";
import ActionBar from "./ActionBar";
import AboutLink from "./AboutLink";
import EmptyDeck from "./EmptyDeck";
import PausePanel from "./PausePanel";
import SurveyPrompt from "./SurveyPrompt";
import SwipeFooter from "./SwipeFooter";
import SwipeHeader from "./SwipeHeader";
import SwipeKeys, { SWIPE_KEYS_ID } from "./SwipeKeys";
import { dragClass, useSwipeDrag } from "./useSwipeDrag";

const NO_MATCHES: readonly Match[] = [];
const NO_TOTALS = { votes: 0, saves: 0, names: [] as string[] };

/** How the next decision was made: a drag ends in "swipe"; buttons and keys say so first. */
type DecideMethod = "swipe" | "button" | "key";

/**
 * A pref as a JSON string, so useSyncExternalStore gets a stable snapshot (getPref returns a
 * new object on every call).
 */
function usePrefJson(
  userId: string | null,
  key: "filters" | "surname" | "sessions" | "survey" | "invitePromptShown" | "recapSession",
): string | null {
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
  const sessionsJson = usePrefJson(userId, "sessions");
  const surveyJson = usePrefJson(userId, "survey");
  const sessionCount = sessionsJson ? (JSON.parse(sessionsJson) as { count: number }).count : 0;
  const surveyState = surveyJson ? (JSON.parse(surveyJson) as "done" | "dismissed" | null) : null;

  const [undoStack, setUndoStack] = useState<readonly UndoEntry[]>([]);
  const [top, setTop] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [next, setNext] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(markAppEntry, []);

  // The analytics session (renewed after 30 minutes away): read again whenever the votes change.
  const storedVotes = state?.votes ?? null;
  const session = useMemo(() => (storedVotes ? currentSessionInfo() : null), [storedVotes]);
  const sessionId = session?.id ?? null;
  useEffect(() => {
    if (!userId || !sessionId) return;
    const prev = getPref(userId, "sessions");
    if (prev.last !== sessionId) setPref(userId, "sessions", countSession(prev, sessionId));
  }, [userId, sessionId]);
  const totals = useMemo(
    () => (storedVotes && session ? sessionTotals(storedVotes, session.startedAt) : NO_TOTALS),
    [storedVotes, session],
  );
  const invitePromptShown = usePrefJson(userId, "invitePromptShown") === "true";
  const recapJson = usePrefJson(userId, "recapSession");
  const recapSession = recapJson ? (JSON.parse(recapJson) as string | null) : null;

  const votes = useMemo(() => {
    const map = new Map<string, Vote>();
    for (const [name, v] of state?.votes ?? []) map.set(name, v.vote);
    return map;
  }, [state?.votes]);
  const deckNames = useMemo(() => new Set((cards ?? []).map((c) => c.stats.name)), [cards]);
  const hiddenNames = useMemo(() => new Set([...votes].filter(([, v]) => v === "hidden").map(([name]) => name)), [votes]);
  const savedCount = useMemo(() => [...votes.values()].filter(isSaved).length, [votes]);
  const saved = useMemo(() => savedInOrder((cards ?? []).map((c) => c.stats.name), votes), [cards, votes]);

  const solo = !space.loading && !space.error && space.members.length === 1;
  // A pause comes only after a decision in this visit (`entered`), never on opening the app,
  // and stays until it is answered (endPause writes the prefs that turn it off).
  const pause: Pause | null =
    userId && entered
      ? pauseToShow({ solo, savedCount, invitePromptShown, sessionId, sessionVotes: totals.votes, recapSession })
      : null;
  const endPause = () => {
    if (!userId) return;
    if (pause === "invite") setPref(userId, "invitePromptShown", true);
    // The recap isn't stacked right after the invite prompt: one pause is enough for this session.
    if (sessionId && totals.votes >= RECAP_VOTES) setPref(userId, "recapSession", sessionId);
    else if (pause === "recap" && sessionId) setPref(userId, "recapSession", sessionId);
  };
  const showSurvey = !!userId && !pause && surveyDue(sessionCount, votes.size, surveyState);

  const ready = !!(cards && filters && userId && store && state?.ready);
  const deck = useMemo(
    () => (ready ? buildDeck(cards, votes, filters, hashSeed(userId), { top }) : null),
    [ready, cards, votes, filters, userId, top],
  );
  const progress = deck && cards && filters ? deckProgress(cards, votes, filters, deck.cards.length) : null;
  // While paused nothing can be decided: the panel stands where the card was.
  const current = pause ? null : (deck?.cards[0] ?? null);
  const method = useRef<DecideMethod>("swipe");

  // The deck ran out (all decided) or the filters left nothing: once each time it happens.
  const deckState = deck?.state ?? null;
  useEffect(() => {
    if (deckState === "all-decided") track("deck_exhausted", { votes: votes.size });
    else if (deckState === "empty-filter" && filters) {
      track("filter_empty", {
        sex: sexToken(filters.sex),
        popularity: filters.popularity !== null,
        trend: filters.trend !== null,
        letter: filters.letter !== null,
        length: filters.length !== null,
        origin: filters.origin !== null,
      });
    }
    // Only the change of state counts, not every vote or filter object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckState]);

  const decide = (kind: Decision) => {
    if (!store || !current) return;
    const name = current.stats.name;
    if (votes.size === 0) track("first_vote");
    track("vote", { vote: kind, method: method.current, shared: space.isShared, position: progress?.position ?? null });
    method.current = "swipe";
    const next = applyVote({ votes, undo: undoStack }, name, kind);
    setUndoStack(next.state.undo);
    store.setVote(name, kind);
    setTop(null);
    setEntered(true);
    setStatus(statusText(kind, name));
    // Focus stays on the button, so screen-reader users hear the next name without going back to the card.
    setNext(deck?.cards[1]?.stats.name ?? null);
  };

  const drag = useSwipeDrag({ onDecide: decide, disabled: !current });

  const undo = () => {
    if (!store || drag.busy()) return;
    if (pause) return;
    const { state: next, entry } = undoVote({ votes, undo: undoStack });
    if (!entry) return;
    track("vote_undone");
    drag.holdFocus();
    setUndoStack(next.undo);
    if (entry.previous) store.setVote(entry.name, entry.previous);
    else store.removeVote(entry.name);
    setTop(entry.name);
    setEntered(true);
    setStatus(statusText("undo", entry.name));
    setNext(null);
  };

  const resetFilters = () => {
    if (userId) setPref(userId, "filters", defaultFilters());
    track("filters_reset");
  };
  const fly = (kind: Decision) => () => {
    method.current = "button";
    drag.fly(kind);
  };

  return (
    <div className="flex h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col max-[20rem]:h-auto [@media(max-height:30rem)]:h-auto">
      <SwipeHeader saved={savedCount} filtered={hasFilters(filters)} />
      <main className="flex min-h-0 flex-1 flex-col">
        {showSurvey ? <SurveyPrompt onDismiss={() => userId && setPref(userId, "survey", "dismissed")} /> : null}
        <SwipeKeys
          onKey={(key) => {
            if (key === "undo") return undo();
            if (!current) return;
            method.current = "key";
            drag.fly(key);
          }} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col px-5 pt-1 max-[20rem]:min-h-100 max-[20rem]:px-3 [@media(max-height:30rem)]:min-h-100">
            {pause ? (
              <PausePanel key={pause} pause={pause} totals={totals} onContinue={endPause} />
            ) : deck && current && progress ? (
              <CardStack
                cards={deck.cards}
                enter={entered}
                position={progress.position}
                total={progress.total}
                surname={surname}
                className={`min-h-0 ${dragClass}`}
                aria-describedby={SWIPE_KEYS_ID}
                corner={<AboutLink />}
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
            onUndo={undo}
            canUndo={undoStack.length > 0 && !pause}
          />
          <SwipeFooter status={status} next={next} sync={sync} />
        </SwipeKeys>
      </main>
      <BackgroundSheet />
      <AboutSheet hasName={!!current} />
      <ReportSheet name={current?.stats.name ?? null} knownNames={deckNames} />
      <FiltersSheet userId={userId} cards={cards} votes={votes} />
      <NameDetailSheet
        cards={cards}
        surname={surname}
        matches={matches?.matches ?? NO_MATCHES}
        memberCount={space.members.length}
        hiddenNames={hiddenNames}
      />
      <SurveySheet votes={votes.size} sessions={sessionCount} onDone={() => userId && setPref(userId, "survey", "done")} />
      <MatchSheet
        match={newMatch}
        ready={!!matches?.ready}
        cards={cards}
        onSeen={() => setSeen(withSeen(seen, matches?.matches ?? []))}
      />
    </div>
  );
}
