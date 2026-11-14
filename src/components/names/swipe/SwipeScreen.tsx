"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useIsGuest, useUserId } from "@/components/names/AuthProvider";
import AboutSheet from "@/components/names/about/AboutSheet";
import CardStack from "@/components/names/card/CardStack";
import NameDetailSheet, { preloadNameDetail } from "@/components/names/detail/LazyNameDetailSheet";
import FiltersSheet from "@/components/names/FiltersSheet";
import MatchSheet from "@/components/names/MatchSheet";
import { closeSheet, openNameSheet, useToastLift } from "@/components/names/ui";
import { lazySheet } from "@/components/names/lazySheet";
import { useCards } from "@/components/names/useCards";
import { usePrefJson } from "@/components/names/usePrefJson";
import { useSpace } from "@/components/names/useSpace";
import { useMatches, useSeenMatches } from "@/components/names/useMatches";
import { useSyncStatus } from "@/components/names/useSyncStatus";
import { useVotes } from "@/components/names/useVotes";
import { sheetVoteText, statusText } from "@/lib/names/a11y";
import { markAppEntry } from "@/lib/names/appHistory";
import { buildAiDeck, reasonFor } from "@/lib/names/aiDeck";
import { buildDeck, deckProgress, deckSlot, hashSeed, type Deck } from "@/lib/names/deck";
import { defaultFilters, hasFilters, sexToken } from "@/lib/names/filters";
import type { Decision, DragKind } from "@/lib/names/gesture";
import { matchToShow, withSeen, type Match } from "@/lib/names/matches";
import { RECAP_VOTES, countSession, pauseAfterVote, pauseToShow, sessionTotals, surveyDue, type Pause } from "@/lib/names/launch";
import { getPref, setPref } from "@/lib/names/prefs";
import { showToast } from "@/lib/names/toast";
import { currentSessionInfo, track } from "@/lib/names/track";
import { guestPrompt, readGuestNudge, writeGuestNudge, type GuestVoteStore } from "@/lib/names/guest";
import type { Card, Vote } from "@/lib/names/types";
import { isOpenKey } from "@/lib/names/keys";
import { NAME_SHEET, readName } from "@/lib/names/urlLayer";
import { applyVote, isSaved, savedInOrder, undo as undoVote, type UndoEntry } from "@/lib/names/votes";
import ActionBar from "./ActionBar";
import AiBanner, { AiDeckEnd } from "./AiBanner";
import AboutLink from "./AboutLink";
import { DeckLoadError, DeckSkeleton } from "./DeckLoad";
import EmptyDeck from "./EmptyDeck";
import GuestPanel from "./GuestPanel";
import PausePanel from "./PausePanel";
import RelativeChip from "./RelativeChip";
import SurveyPrompt from "./SurveyPrompt";
import SwipeFooter from "./SwipeFooter";
import SwipeHeader from "./SwipeHeader";
import SwipeKeys, { SWIPE_KEYS_ID } from "./SwipeKeys";
import { dragClass, useSwipeDrag } from "./useSwipeDrag";

// Opened from a tap or once (search, a report, the survey): out of the first load, loaded when idle.
const SearchSheet = lazySheet("search", () => import("@/components/names/search/SearchSheet"));
const ReportSheet = lazySheet("report", () => import("@/components/names/about/ReportSheet"));
const SurveySheet = lazySheet("survey", () => import("@/components/names/SurveySheet"));

const NO_MATCHES: readonly Match[] = [];
const NO_TOTALS = { votes: 0, saves: 0, names: [] as string[] };

/** How the next decision was made: a drag ends in "swipe"; buttons and keys say so first. */
type DecideMethod = "swipe" | "button" | "key" | "detail";

/**
 * The swipe screen (FR-W10, FR-W14, FR-W15): the user's seeded deck without decided or hidden
 * names and filtered by the saved filters; each decision is saved through the vote store
 * (optimistic, offline outbox) and "ביטול" takes back up to 10, putting the name back on top.
 */
export default function SwipeScreen() {
  const userId = useUserId();
  const guest = useIsGuest();
  const space = useSpace();
  const barRef = useToastLift();
  // "עדכון זמין" stays until tapped: it waits above the card's "לכל הפרטים", not on it (NP-BUG-011).
  const detailsRef = useToastLift({ sticky: true });
  const { cards, error: cardsError, retry: retryCards } = useCards();
  const [retried, setRetried] = useState(false);
  const { store, state } = useVotes(space.spaceId, userId);
  const matches = useMatches(space.spaceId, userId, space.isShared, state?.votes);
  const sync = useSyncStatus(state?.pendingCount ?? 0, state?.loadFailed ?? false);
  const { seen, setSeen } = useSeenMatches(userId);
  const newMatch = useMemo(() => (matches?.ready ? matchToShow(matches.matches, seen) : null), [matches, seen]);

  const filtersJson = usePrefJson(userId, "filters");
  const surnameJson = usePrefJson(userId, "surname");
  const filters = useMemo(() => (userId && filtersJson ? getPref(userId, "filters") : null), [userId, filtersJson]);
  const surname = surnameJson ? (JSON.parse(surnameJson) as string) : "";
  // "חיפוש לפי תיאור": while a picked deck is saved, it replaces the shuffled deck.
  const aiJson = usePrefJson(userId, "aiDeck");
  const aiDeck = useMemo(() => (userId && aiJson ? getPref(userId, "aiDeck") : null), [userId, aiJson]);
  const sessionsJson = usePrefJson(userId, "sessions");
  const surveyJson = usePrefJson(userId, "survey");
  const sessionCount = sessionsJson ? (JSON.parse(sessionsJson) as { count: number }).count : 0;
  const surveyState = surveyJson ? (JSON.parse(surveyJson) as "done" | "dismissed" | null) : null;

  const [undoStack, setUndoStack] = useState<readonly UndoEntry[]>([]);
  const [top, setTop] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [next, setNext] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  // The card the last undo brought back and the way it had left, so it returns from there (NP-091).
  const [returning, setReturning] = useState<{ name: string; kind: DragKind } | null>(null);

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
  const savedCount = useMemo(() => [...votes.values()].filter(isSaved).length, [votes]);
  const saved = useMemo(() => savedInOrder((cards ?? []).map((c) => c.stats.name), votes), [cards, votes]);

  const solo = !space.loading && !space.error && space.members.length === 1;
  // A pause comes only after a decision in this visit (`entered`), never on opening the app,
  // and stays until it is answered (endPause writes the prefs that turn it off).
  const pauseInput = { solo, savedCount, invitePromptShown, sessionId, sessionVotes: totals.votes, recapSession };
  // A guest's sign-in cards (lib/names/guest.ts): every 20 decisions one that can be put aside
  // (only after a decision in this visit), and at 100 the wall, which stays.
  const guestCount = useMemo(
    () => (guest && store && state ? (store as GuestVoteStore).decidedCount() : 0),
    [guest, store, state],
  );
  const [lastNudge, setLastNudge] = useState(readGuestNudge);
  const guestKind = guest && state?.ready ? guestPrompt(guestCount, lastNudge) : null;
  const guestCard = guestKind === "wall" || (guestKind === "nudge" && entered) ? guestKind : null;
  const putNudgeAside = () => {
    writeGuestNudge(guestCount);
    setLastNudge(guestCount);
  };
  const guestOpensCard = (nextCount: number) => guest && guestPrompt(nextCount, lastNudge) !== null;
  const launchPause: Pause | null = userId && entered ? pauseToShow(pauseInput) : null;
  const pause: Pause | "guest" | null = guestCard ? "guest" : launchPause;
  const endPause = () => {
    if (!userId) return;
    if (pause === "invite") setPref(userId, "invitePromptShown", true);
    // The recap isn't stacked right after the invite prompt: one pause is enough for this session.
    if (sessionId && totals.votes >= RECAP_VOTES) setPref(userId, "recapSession", sessionId);
    else if (pause === "recap" && sessionId) setPref(userId, "recapSession", sessionId);
  };
  const showSurvey = !!userId && !guest && !pause && surveyDue(sessionCount, votes.size, surveyState);

  const ready = !!(cards && filters && userId && store && state?.ready);
  const aiView = useMemo(
    () => (ready && aiDeck ? buildAiDeck(cards, aiDeck, votes, filters, top) : null),
    [ready, aiDeck, cards, votes, filters, top],
  );
  const deck: Deck<Card> | null = useMemo(() => {
    if (aiView) return { state: aiView.cards.length ? "ok" : "all-decided", cards: aiView.cards };
    return ready ? buildDeck(cards, votes, filters, hashSeed(userId), { top }) : null;
  }, [aiView, ready, cards, votes, filters, userId, top]);
  const progress = aiView
    ? { position: aiView.position, total: aiView.total }
    : deck && cards && filters
      ? deckProgress(cards, votes, filters, deck.cards.length)
      : null;
  // While paused nothing can be decided: the panel stands where the card was.
  const current = pause ? null : (deck?.cards[0] ?? null);
  const slot = deckSlot({ paused: !!pause, hasCard: !!(deck && current && progress), deckState: deck?.state ?? null, loadError: cardsError });
  const method = useRef<DecideMethod>("swipe");

  // A retry that worked: the button is gone, so focus (if it went with it) moves to the card.
  useEffect(() => {
    const active = document.activeElement;
    if (slot !== "card" || !retried || (active && active !== document.body)) return;
    document.querySelector<HTMLElement>("main article[tabindex='0']")?.focus();
  }, [slot, retried]);

  // The deck ran out (all decided) or the filters left nothing (none match, or all of those
  // are decided: both are the filter_empty event): once each time it happens.
  const deckState = deck?.state ?? null;
  const aiOn = aiView !== null;
  useEffect(() => {
    if (aiOn) {
      if (deckState === "all-decided") track("ai_deck_end", { total: aiView?.total ?? 0 });
      return;
    }
    if (deckState === "all-decided") track("deck_exhausted", { votes: votes.size });
    else if ((deckState === "empty-filter" || deckState === "filter-done") && filters) {
      track("filter_empty", {
        sex: sexToken(filters.sex),
        popularity: filters.popularity !== null,
        trend: filters.trend !== null,
        letter: filters.letter !== null,
        length: filters.length !== null,
        relative: filters.relative !== null,
      });
    }
    // Only the change of state counts, not every vote or filter object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckState]);

  const decide = (kind: Decision) => {
    if (!store || !current) return;
    const name = current.stats.name;
    if (votes.size === 0) track("first_vote");
    track("vote", { vote: kind, method: method.current, shared: space.isShared, position: progress?.position ?? null, deck: aiOn ? "ai" : "all" });
    method.current = "swipe";
    const next = applyVote({ votes, undo: undoStack }, name, kind);
    setUndoStack(next.state.undo);
    store.setVote(name, kind);
    setTop(null);
    setEntered(true);
    setStatus(statusText(kind, name));
    // Focus stays on the button, so screen-reader users hear the next name without going back to the card.
    // Not when this decision opens a pause: the panel covers the next card, and focus moves to it.
    const opensPause = guestOpensCard(guestCount + Number(!storedVotes?.has(name))) || pauseAfterVote(pauseInput, {
      previous: storedVotes?.get(name),
      saves: isSaved(kind),
      startedAt: session?.startedAt ?? null,
    });
    setNext(opensPause ? null : (deck?.cards[1]?.stats.name ?? null));
  };

  const openDetails = (source: "tap" | "button" | "key") => () => {
    if (!current) return;
    openNameSheet(current.stats.name);
    track("detail_opened", { source });
  };

  const drag = useSwipeDrag({ onDecide: decide, onTap: openDetails("tap"), disabled: !current });

  // Enter or Space on the card itself; the buttons inside it keep their own Enter and Space.
  const onCardKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget || !isOpenKey(e) || drag.busy()) return;
    e.preventDefault();
    openDetails("key")();
  };

  const undo = () => {
    if (!store || drag.busy()) return;
    if (pause) return;
    const { state: next, entry } = undoVote({ votes, undo: undoStack });
    if (!entry) return;
    const undone = votes.get(entry.name);
    track("vote_undone");
    drag.holdFocus();
    setUndoStack(next.undo);
    if (entry.previous) store.setVote(entry.name, entry.previous);
    else store.removeVote(entry.name);
    setTop(entry.name);
    setReturning(undone ? { name: entry.name, kind: undone === "hidden" ? "skip" : undone } : null);
    setEntered(true);
    setStatus(statusText("undo", entry.name));
    setNext(null);
  };

  const clearRelative = () => {
    if (userId && filters) setPref(userId, "filters", { ...filters, relative: null });
  };

  const clearAiDeck = (where: "banner" | "end") => {
    if (!userId) return;
    setPref(userId, "aiDeck", null);
    setTop(null);
    track("ai_deck_cleared", { where });
  };

  const resetFilters = () => {
    if (userId) setPref(userId, "filters", defaultFilters());
    track("filters_reset");
  };
  const fly = (kind: Decision) => () => {
    method.current = "button";
    drag.fly(kind);
  };
  // PRD 3.2.5: on the current card the sheet closes first (Back past its entries, so none is
  // left behind), then the card leaves as it does for the action buttons. On another name
  // (reached through similar names) the vote is saved and the sheet stays open.
  const decideInSheet = (name: string, kind: Decision) => {
    if (!current || name !== current.stats.name) return decideOther(name, kind);
    if (drag.busy()) return;
    const leave = () =>
      requestAnimationFrame(() => {
        method.current = "detail";
        drag.fly(kind);
      });
    closeSheet(NAME_SHEET);
    if (readName(window.location.search) === null) leave();
    else window.addEventListener("popstate", leave, { once: true });
  };

  // Same store path as decide(), so the deck, undo and the session counters include it; the
  // card on top stays. The toast (a live region kept outside the sheet's inert page) says it.
  const decideOther = (name: string, kind: Decision) => {
    if (!store || !deckNames.has(name) || guestCard === "wall") return;
    if (votes.size === 0) track("first_vote");
    track("vote", { vote: kind, method: "detail", shared: space.isShared, position: null, deck: aiOn ? "ai" : "all" });
    const next = applyVote({ votes, undo: undoStack }, name, kind);
    setUndoStack(next.state.undo);
    store.setVote(name, kind);
    setStatus(statusText(kind, name));
    setNext(null);
    showToast(sheetVoteText(kind, name));
  };

  return (
    <div className="flex h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col max-[20rem]:h-auto [@media(max-height:30rem)]:h-auto">
      <SwipeHeader saved={state?.loadFailed ? null : savedCount} filtered={hasFilters(filters)} />
      {aiDeck && aiView ? (
        <AiBanner saved={aiDeck} total={aiView.total} filtered={hasFilters(filters)} onClear={() => clearAiDeck("banner")} />
      ) : null}
      {filters?.relative ? <RelativeChip filter={filters.relative} onClear={clearRelative} /> : null}
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
            {slot === "pause" && guestCard ? (
              <GuestPanel key={`${guestCard}:${guestCount}`} kind={guestCard} count={guestCount} onLater={putNudgeAside} />
            ) : slot === "pause" && launchPause ? (
              <PausePanel key={launchPause} pause={launchPause} totals={totals} onContinue={endPause} />
            ) : slot === "card" && deck && progress ? (
              <CardStack
                cards={deck.cards}
                enter={entered}
                returning={returning?.name === deck.cards[0]?.stats.name ? returning.kind : null}
                position={progress.position}
                total={progress.total}
                surname={surname}
                note={aiOn ? reasonFor(aiDeck, deck.cards[0]?.stats.name) : null}
                // Content-sized decks (zoom, short screens) cap the card under the viewport so it
                // scrolls itself (pan-y, useSwipeDrag) and the page can still reach the bar (NP-087).
                className={`min-h-0 max-[20rem]:max-h-[80dvh] [@media(max-height:30rem)]:max-h-[80dvh] ${dragClass}`}
                aria-describedby={SWIPE_KEYS_ID}
                corner={<AboutLink />}
                onDetails={openDetails("button")}
                detailsRef={detailsRef}
                onKeyDown={onCardKeyDown}
                // A touch or focus on the card may become a tap: start loading the sheet's code.
                onPointerDownCapture={preloadNameDetail}
                onFocus={preloadNameDetail}
                {...drag.card}
              />
            ) : slot === "empty" && aiOn ? (
              <AiDeckEnd takeFocus={entered} onClear={() => clearAiDeck("end")} />
            ) : slot === "empty" && deck && deck.state !== "ok" ? (
              <EmptyDeck
                state={deck.state}
                saved={saved}
                solo={space.members.length === 1}
                onReset={resetFilters}
                takeFocus={entered}
              />
            ) : slot === "error" ? (
              <DeckLoadError
                takeFocus={retried}
                onRetry={() => {
                  setRetried(true);
                  retryCards();
                }}
              />
            ) : (
              <DeckSkeleton />
            )}
          </div>
          {/* The sync line floats above the action bar (SwipeFooter); toasts sit above it too. */}
          <div ref={barRef} className="relative">
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
          </div>
        </SwipeKeys>
      </main>
      <SearchSheet cards={cards} votes={votes} />
      <AboutSheet hasName={!!current} />
      <ReportSheet name={current?.stats.name ?? null} knownNames={deckNames} />
      <FiltersSheet userId={userId} cards={cards} votes={votes} />
      <NameDetailSheet
        cards={cards}
        surname={surname}
        matches={matches?.matches ?? NO_MATCHES}
        memberCount={space.members.length}
        votes={votes}
        onDecide={decideInSheet}
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
