"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import AboutSheet from "@/components/names/about/AboutSheet";
import ReportSheet from "@/components/names/about/ReportSheet";
import DecisionSheet from "@/components/names/DecisionSheet";
import NameDetailSheet, { preloadNameDetail } from "@/components/names/detail/LazyNameDetailSheet";
import { Button, IconButton, collapseRow, openNameSheet, openSheet } from "@/components/names/ui";
import { useChosen } from "@/components/names/useChosen";
import { useCards, useNameStats } from "@/components/names/useCards";
import { useMatches, useOnline, useSeenMatches } from "@/components/names/useMatches";
import { InstallHint, InstallSheet } from "@/components/names/pwa/Install";
import { usePrefJson } from "@/components/names/usePrefJson";
import { useSpace } from "@/components/names/useSpace";
import { useVotes } from "@/components/names/useVotes";
import type { Decision } from "@/components/names/DecisionButtons";
import { DETAILS_HINT, sheetVoteText } from "@/lib/names/a11y";
import { APP_PATH } from "@/lib/names/auth";
import { hasAppEntry } from "@/lib/names/appHistory";
import { keptByText, matchesIntro, newMatches, updatedText, withSeen, type Match, type MatchesState } from "@/lib/names/matches";
import { addedText, listsTab, rowActionText, rowMeta, rowMetaText, rowUndoText, savedRows, type ListsTab, type SavedRow } from "@/lib/names/lists";
import { showToast } from "@/lib/names/toast";
import type { NameStats, Vote } from "@/lib/names/types";
import AddNameSheet from "./AddNameSheet";
import DuelScreen from "./DuelScreen";
import RowMenu from "./RowMenu";
import { clearChoiceLabel, decideLabel } from "@/lib/names/launch";
import { track } from "@/lib/names/track";

const LISTS_PATH = "/names/lists";
const NO_MATCHES: readonly Match[] = [];

// FR-D4: a row's name opens the same "פרטי השם" sheet as the swipe card.
function openDetails(name: string) {
  openNameSheet(name);
  track("detail_opened", { source: "list" });
}

function Icon({ size = 20, children, className }: { size?: number; children: ReactNode; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

/**
 * FR-W18 "השמות שלי" (board 5): the header with back, invite and "הוספת שם", the segments
 * "שמרתי" / "התאמות" (shared spaces only) / "דו־קרב" bound to ?tab=, and the "שמרתי" rows.
 */
export default function ListsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const space = useSpace();
  const { names } = useNameStats();
  const { cards } = useCards();
  const { store, state } = useVotes(space.spaceId, user?.id ?? null);
  const matches = useMatches(space.spaceId, user?.id ?? null, space.isShared, state?.votes);
  const [status, setStatus] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const tab = listsTab(params.get("tab"));
  const { chosen, choose, clear } = useChosen(user?.id ?? null, space.spaceId, space.isShared);
  const decision = <DecisionSheet name={chosen} shared={space.isShared} onClear={() => clear("sheet")} />;
  useEffect(() => track("lists_tab", { tab }), [tab]);
  const rows = useMemo(() => savedRows(state?.votes ?? new Map()), [state?.votes]);
  const ready = !!(store && state?.ready);
  // Only names with a card open the sheet; names added by hand have nothing to show there.
  const deckNames = useMemo(() => new Set((cards ?? []).map((c) => c.stats.name)), [cards]);
  const canOpen = (name: string) => deckNames.has(name);
  const votes = useMemo(() => {
    const map = new Map<string, Vote>();
    for (const [name, v] of state?.votes ?? []) map.set(name, v.vote);
    return map;
  }, [state?.votes]);
  const surnameJson = usePrefJson(user?.id ?? null, "surname");
  const surname = surnameJson ? (JSON.parse(surnameJson) as string) : "";

  const tabs: { id: ListsTab; label: string }[] = [
    { id: "saved", label: ready ? `שמרתי · ${rows.length}` : "שמרתי" },
    { id: "matches", label: space.isShared && matches?.ready && matches.fetchedAt !== null ? `התאמות · ${matches.matches.length}` : "התאמות" },
    { id: "duel", label: "דו־קרב" },
  ];

  const selectTab = (id: ListsTab) => router.replace(`${LISTS_PATH}?tab=${id}`, { scroll: false });

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const index = tabs.findIndex((t) => t.id === tab);
    let next = -1;
    if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = (index + 1) % tabs.length;
    else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    selectTab(tabs[next].id);
    document.getElementById(`lists-tab-${tabs[next].id}`)?.focus();
  };

  const back = () => {
    if (hasAppEntry()) router.back();
    else router.replace(APP_PATH);
  };

  // Coming back from the duel screen: its title is gone, so start from this one.
  const lastTab = useRef(tab);
  useEffect(() => {
    if (lastTab.current === "duel" && tab !== "duel" && (!document.activeElement || document.activeElement === document.body)) {
      headingRef.current?.focus();
    }
    lastTab.current = tab;
  }, [tab]);

  const online = useOnline();
  // The matches the duel can use: the last fetched list, or the cache while offline.
  const matchesLoaded = !space.isShared || (!!matches?.ready && (matches.fetchedAt !== null || !online));
  const matchNames = useMemo(() => (space.isShared && matches ? matches.matches.map((m) => m.name) : []), [space.isShared, matches]);
  const customNames = useMemo(() => new Set(rows.filter((r) => r.custom).map((r) => r.name)), [rows]);

  if (tab === "duel") {
    return (
      <>
      <DuelScreen
        userId={user?.id ?? null}
        from={params.get("from")}
        ready={ready && matchesLoaded}
        savedNames={rows.map((r) => r.name)}
        matchNames={matchNames}
        names={names}
        customNames={customNames}
        onSource={(source) => router.replace(`${LISTS_PATH}?tab=duel&from=${source}`, { scroll: false })}
        onBack={(source) => selectTab(source === "matches" && space.isShared ? "matches" : "saved")}
        chooseLabel={(name) => decideLabel(space.isShared, name)}
        onChoose={(name, _source, rank) => choose(name, "duel", { custom: customNames.has(name), rank })}
      />
      {decision}
      </>
    );
  }

  // PRD 3.2.6: a choice in the name sheet changes the vote through the store; the sheet stays
  // open with the new choice pressed, and the toast (outside the sheet's inert page) says it.
  // "דילוג" on a saved name takes it out of "שמרתי"; the toast's "ביטול" puts the old vote back.
  const decideInSheet = (name: string, kind: Decision) => {
    if (!store) return;
    const previous = state?.votes.get(name);
    if (previous?.vote === kind) return;
    track("vote", { vote: kind, method: "detail", shared: space.isShared, position: null });
    store.setVote(name, kind, previous?.custom ?? false);
    const message = sheetVoteText(kind, name);
    setStatus(message);
    const wasSaved = previous && (previous.vote === "keep" || previous.vote === "love");
    if (kind === "skip" && wasSaved) {
      const restore = () => {
        store.setVote(name, previous.vote, previous.custom);
        const back = sheetVoteText(previous.vote, name);
        setStatus(back);
        showToast(back);
      };
      showToast(message, { action: { label: "ביטול", onAction: restore } });
    } else {
      showToast(message);
    }
  };

  const add = (name: string, custom: boolean) => {
    if (!store) return;
    store.setVote(name, "keep", custom);
    if (tab !== "saved") selectTab("saved");
    setStatus(addedText(name));
    showToast(addedText(name));
  };

  return (
    <div data-names-bg="none" className="min-h-dvh bg-canvas">
      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <header className="flex items-center gap-2 max-[20rem]:flex-wrap">
          <IconButton aria-label="חזרה" onClick={back}>
            <Icon className="ltr:-scale-x-100">
              <path d="M9 6l6 6-6 6" />
            </Icon>
          </IconButton>
          <h1 ref={headingRef} tabIndex={-1} className="m-0 min-w-0 flex-1 text-title outline-none max-[20rem]:min-w-max">
            השמות שלי
          </h1>
          <IconButton href="/names/invite" aria-label="הזמנה לבחירה משותפת">
            <Icon>
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" />
            </Icon>
          </IconButton>
          <Button variant="secondary" size="md" aria-label="הוספת שם שלא ברשימה" onClick={() => openSheet("add-name")} className="text-person font-bold">
            <Icon size={16}>
              <path d="M12 5v14M5 12h14" />
            </Icon>
            הוספת שם
          </Button>
        </header>

        {chosen ? <ChosenBanner name={chosen} shared={space.isShared} onOpen={() => openSheet("decision")} onClear={() => clear("lists")} /> : null}

        {ready ? <InstallHint userId={user?.id ?? null} voteCount={state?.votes.size ?? 0} /> : null}

        <div role="tablist" aria-label="רשימות" className="grid auto-cols-fr grid-flow-col gap-1 rounded-pill border border-line bg-surface p-1">
          {tabs.map((t) => {
            const selected = t.id === tab;
            return (
              <button
                key={t.id}
                id={`lists-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`lists-panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(t.id)}
                onKeyDown={onTabKeyDown}
                className={`min-h-11 rounded-pill px-2 text-person font-bold ${selected ? "bg-ink text-surface" : "text-ink-soft hover:bg-sand"}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <section id={`lists-panel-${tab}`} role="tabpanel" aria-labelledby={`lists-tab-${tab}`} className="flex flex-col gap-4">
          {tab === "saved" ? (
            <SavedPanel
              ready={ready}
              rows={rows}
              names={names}
              onAction={(name, action) => {
                if (!store) return;
                const previous = state?.votes.get(name);
                if (action === "remove") store.removeVote(name);
                else store.setVote(name, "hidden");
                // Like "דילוג" in the sheet: the toast says what happened, "ביטול" puts the old vote back.
                const undo = previous
                  ? () => {
                      store.setVote(name, previous.vote, previous.custom);
                      showToast(rowUndoText(name));
                    }
                  : undefined;
                showToast(rowActionText(name, action), undo ? { action: { label: "ביטול", onAction: undo } } : {});
              }}
              headingRef={headingRef}
              canOpen={canOpen}
              chooseLabel={(name) => decideLabel(space.isShared, name)}
              onChoose={(row) => choose(row.name, "saved", { custom: row.custom })}
            />
          ) : space.loading ? (
            <div aria-busy="true" className="h-[78px] rounded-lg bg-surface shadow-card">
              <span className="sr-only">בטעינה</span>
            </div>
          ) : !space.isShared ? (
            <SoloMatches />
          ) : (
            <MatchesPanel
              userId={user?.id ?? null}
              state={matches}
              memberCount={space.members.length}
              names={names}
              canOpen={canOpen}
              chooseLabel={(name) => decideLabel(space.isShared, name)}
              onChoose={(name) => choose(name, "matches")}
            />
          )}
        </section>

        <p role="status" className="sr-only">
          {status}
        </p>
      </main>
      <AddNameSheet names={names} saved={rows.map((r) => r.name)} onAdd={add} />
      <NameDetailSheet
        cards={cards}
        surname={surname}
        matches={space.isShared ? (matches?.matches ?? NO_MATCHES) : NO_MATCHES}
        memberCount={space.members.length}
        votes={votes}
        onDecide={decideInSheet}
      />
      {/* The name sheet's source links: both keep `n`, so closing them comes back to it. */}
      <AboutSheet hasName />
      <ReportSheet name={null} knownNames={deckNames} />
      {decision}
      <InstallSheet />
    </div>
  );
}

type ChooseProps = {
  chooseLabel: (name: string) => string;
  /** Whether the row's name has a card, so it opens the name sheet. */
  canOpen: (name: string) => boolean;
};

type MatchesPanelProps = ChooseProps & {
  userId: string | null;
  state: MatchesState | null;
  memberCount: number;
  names: Map<string, NameStats> | null;
  onChoose: (name: string) => void;
};

/**
 * FR-W19 "התאמות" (board 5): names 2+ members kept, newest first, from the matches cache.
 * "{n} שמרו" from 3 up, a heart when someone loved it (never who), the last update time
 * while offline. Nothing about anyone's skips.
 */
function MatchesPanel({ userId, state, memberCount, names, canOpen, chooseLabel, onChoose }: MatchesPanelProps) {
  const online = useOnline();
  // The day to compare the last update with; the screen isn't open across midnight for long.
  const [openedAt] = useState(() => Date.now());
  const intro = <p className="m-0 text-person text-ink-soft">{matchesIntro(memberCount)}</p>;
  const updated =
    !online && state?.fetchedAt != null ? (
      <p className="m-0 text-caption text-stone">{updatedText(state.fetchedAt, openedAt)}</p>
    ) : null;

  // Before the first fetch an empty list is only "no cache yet"; offline it's all there is.
  if (!state?.ready || (state.fetchedAt === null && online)) {
    return (
      <>
        {intro}
        <div aria-busy="true" className="h-[78px] rounded-lg bg-surface shadow-card">
          <span className="sr-only">בטעינה</span>
        </div>
      </>
    );
  }

  return (
    <>
      {intro}
      {updated}
      <MatchRows userId={userId} matches={state.matches} memberCount={memberCount} names={names} canOpen={canOpen} chooseLabel={chooseLabel} onChoose={onChoose} />
    </>
  );
}

type MatchRowsProps = ChooseProps & {
  userId: string | null;
  matches: readonly Match[];
  memberCount: number;
  names: Map<string, NameStats> | null;
  onChoose: (name: string) => void;
};

function MatchRows({ userId, matches, memberCount, names, canOpen, chooseLabel, onChoose }: MatchRowsProps) {
  const { seen, setSeen } = useSeenMatches(userId);
  // "חדש" marks matches this device hadn't shown before the list opened (or that came in since).
  const [seenAtOpen] = useState(() => new Set(seen));

  // Seeing the list counts as seeing the match: the match sheet won't pop up for these.
  useEffect(() => {
    if (newMatches(matches, seen).length > 0) setSeen(withSeen(seen, matches));
  }, [matches, seen, setSeen]);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg bg-surface px-4 py-6 text-center shadow-card">
        <p className="m-0 text-card-title text-ink-soft">עוד אין התאמות.</p>
        <p className="m-0 text-person text-ink-soft">
          {memberCount < 2
            ? "התאמה היא שם שגם מי שבוחר איתך שמר."
            : memberCount > 2
              ? "שם ששניים מכם שמרו יופיע כאן."
              : "שם ששניכם שמרתם יופיע כאן."}
        </p>
        {memberCount < 2 ? (
          <Button variant="link" href="/names/invite">
            הזמנה לבחירה משותפת
          </Button>
        ) : (
          <Button variant="link" href={APP_PATH}>
            לבחירת שמות
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <ul aria-label="התאמות" className="m-0 list-none rounded-lg bg-surface p-0 shadow-card">
        {matches.map((match) => {
          const meta = rowMeta(names?.get(match.name));
          const kept = keptByText(match);
          return (
            <li key={match.name} className="flex items-center gap-3 border-b border-line py-3.5 ps-4 pe-2 last:border-b-0">
              <RowName onOpen={canOpen(match.name) ? () => openDetails(match.name) : undefined}>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-row-name break-words">{match.name}</span>
                  {!seenAtOpen.has(match.name) ? (
                    <span className="rounded-pill bg-peach-soft px-2 py-0.5 text-label text-clay-deep">חדש</span>
                  ) : null}
                  {match.lovedByCount > 0 ? (
                    <span className="flex items-center gap-1 text-caption font-bold text-ink-soft">
                      <Icon size={16} className="fill-clay stroke-clay">
                        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
                      </Icon>
                      סומן ״אהבתי מאוד״
                    </span>
                  ) : null}
                </span>
                {meta ? (
                  <>
                    <span aria-hidden="true" className="text-caption text-stone">
                      {meta.sexTag} · {meta.count}
                      {meta.trend ? (
                        <>
                          {" · "}
                          {meta.trend.arrow} {meta.trend.word}
                        </>
                      ) : null}
                    </span>
                    <span className="sr-only">{rowMetaText(meta)}</span>
                  </>
                ) : null}
              </RowName>
              {kept ? <span className="flex-none text-caption font-bold text-ink-soft">{kept}</span> : null}
              <RowMenu name={match.name} onChoose={() => onChoose(match.name)} chooseLabel={chooseLabel(match.name)} />
            </li>
          );
        })}
      </ul>
      {matches.length >= 2 ? <DuelLink title="דו־קרב בין ההתאמות" from="matches" /> : null}
    </>
  );
}

/**
 * The name part of a row. With `onOpen` (the name has a card) it's a button that opens the
 * name sheet, same look; without it, plain text (custom names have no sheet).
 */
function RowName({ onOpen, children }: { onOpen?: () => void; children: ReactNode }) {
  const className = "flex min-w-0 flex-1 flex-col gap-0.5";
  if (!onOpen) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      // Safari doesn't focus a tapped button; focus it so the sheet gives focus back to this row.
      onPointerDown={preloadNameDetail}
      onFocus={preloadNameDetail}
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        onOpen();
      }}
      className={`${className} min-h-11 justify-center rounded-sm text-start`}>
      {children}
      <span className="sr-only">, {DETAILS_HINT}</span>
    </button>
  );
}

function DuelLink({ title, from }: { title: string; from: "saved" | "matches" }) {
  return (
    <Link
      href={`${LISTS_PATH}?tab=duel&from=${from}`}
      replace
      scroll={false}
      data-control
      className="flex items-center gap-3 rounded-lg bg-peach-soft px-4 py-3.5 text-ink"
    >
      <span aria-hidden="true" className="flex size-10 flex-none items-center justify-center rounded-md bg-surface">
        <Icon>
          <path d="M7 4v16M17 4v16M3 8h8M13 16h8" />
        </Icon>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-card-title">{title}</span>
        <span className="text-caption text-ink-soft">שני שמות בכל פעם, עד שנשארת חמישייה</span>
      </span>
      <Icon size={18} className="ltr:-scale-x-100">
        <path d="M15 6l-6 6 6 6" />
      </Icon>
    </Link>
  );
}

type SavedPanelProps = ChooseProps & {
  onChoose: (row: SavedRow) => void;
  ready: boolean;
  rows: SavedRow[];
  names: Map<string, NameStats> | null;
  onAction: (name: string, action: "remove" | "hide") => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
};

/** "שמרתי": loved first with "אהבתי מאוד", each row with sex tag, count, trend and its menu. */
function SavedPanel({ ready, rows, names, onAction, headingRef, canOpen, chooseLabel, onChoose }: SavedPanelProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const focusAfter = useRef<number | null>(null);

  // After a row goes, focus the menu button that took its place (or the one before it, or the title).
  useEffect(() => {
    const index = focusAfter.current;
    if (index === null) return;
    focusAfter.current = null;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-row-menu]");
    const target = buttons?.length ? buttons[Math.min(index, buttons.length - 1)] : headingRef.current;
    target?.focus();
  }, [rows, headingRef]);

  // The row closes first (NP-137), then the vote changes and the row goes from the data.
  const leave = (index: number, name: string, action: "remove" | "hide") => {
    collapseRow(listRef.current?.children[index] as HTMLElement | undefined, () => {
      focusAfter.current = index;
      onAction(name, action);
    });
  };

  if (!ready) {
    return (
      <div aria-busy="true" className="h-[78px] rounded-lg bg-surface shadow-card">
        <span className="sr-only">בטעינה</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg bg-surface px-4 py-6 text-center shadow-card">
        <p className="m-0 text-card-title text-ink-soft">עוד לא נשמרו שמות.</p>
        <Button variant="link" href={APP_PATH}>
          לבחירת שמות
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="m-0 text-person text-ink-soft">השמות ששמרת, אלה שאהבת מאוד ראשונים.</p>
      <ul ref={listRef} aria-label="שמות ששמרתי" className="m-0 list-none rounded-lg bg-surface p-0 shadow-card">
        {rows.map((row, i) => {
          const meta = row.custom ? null : rowMeta(names?.get(row.name));
          return (
            <li key={row.name} className="flex items-center gap-3 border-b border-line py-3.5 ps-4 pe-2 last:border-b-0">
              <RowName onOpen={!row.custom && canOpen(row.name) ? () => openDetails(row.name) : undefined}>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-row-name break-words">{row.name}</span>
                  {row.vote === "love" ? (
                    <span className="flex items-center gap-1 text-caption font-bold text-ink-soft">
                      <Icon size={16} className="fill-clay stroke-clay">
                        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
                      </Icon>
                      אהבתי מאוד
                    </span>
                  ) : null}
                </span>
                {meta ? (
                  <>
                    <span aria-hidden="true" className="text-caption text-stone">
                      {meta.sexTag} · {meta.count}
                      {meta.trend ? (
                        <>
                          {" · "}
                          {meta.trend.arrow} {meta.trend.word}
                        </>
                      ) : null}
                    </span>
                    <span className="sr-only">{rowMetaText(meta)}</span>
                  </>
                ) : row.custom ? (
                  <span className="text-caption text-stone">שם שהוספתי</span>
                ) : null}
              </RowName>
              <RowMenu
                name={row.name}
                chooseLabel={chooseLabel(row.name)}
                onChoose={() => onChoose(row)}
                onRemove={() => leave(i, row.name, "remove")}
                onHide={() => leave(i, row.name, "hide")}
              />
            </li>
          );
        })}
      </ul>
      {rows.length >= 2 ? <DuelLink title="דו־קרב בין השמות ששמרתי" from="saved" /> : null}
    </>
  );
}

/**
 * "התאמות" in a solo space (product review step 5): what a match is, and the invite. The
 * matches loop is the product's peak, so a solo user sees it here instead of a missing tab.
 */
function SoloMatches() {
  useEffect(() => track("invite_prompt", { placement: "matches_tab", action: "shown" }), []);
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-surface px-5 py-7 text-center shadow-card">
      <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-peach-soft text-clay-deep">
        <Icon size={24}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" />
        </Icon>
      </span>
      <h2 className="m-0 text-card-title text-ink">בוחרים ביחד?</h2>
      <p className="m-0 text-person text-ink-soft">
        אפשר להזמין את מי שבוחר איתך. כל אחד בוחר בטלפון שלו, ושם ששניכם שמרתם יופיע כאן כהתאמה.
      </p>
      <p className="m-0 text-caption text-stone">על מה כל אחד דילג נשאר פרטי. השמות ששמרת עוברים איתך.</p>
      <Button size="md" href="/names/invite" onClick={() => track("invite_prompt", { placement: "matches_tab", action: "invite" })}>
        הזמנה לבחירה משותפת
      </Button>
    </div>
  );
}

/** The chosen name at the top of "השמות שלי"; opens the decision moment again, or takes it back. */
function ChosenBanner({ name, shared, onOpen, onClear }: { name: string; shared: boolean; onOpen: () => void; onClear: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-peach-soft py-2 ps-4 pe-2 text-ink">
      <span aria-hidden="true" className="size-2.5 flex-none rounded-full bg-clay" />
      <button type="button" onClick={onOpen} className="flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center text-start">
        <span className="text-caption font-bold text-ink-soft">{shared ? "השם שבחרנו" : "השם שבחרתי"}</span>
        <span className="text-row-name break-words">{name}</span>
      </button>
      <Button variant="link" onClick={onClear} aria-label={clearChoiceLabel(name)} className="text-person!">
        ביטול הבחירה
      </Button>
    </div>
  );
}
