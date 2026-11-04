"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { Button, IconButton, openSheet } from "@/components/names/ui";
import { useNameStats } from "@/components/names/useCards";
import { useMatches, useOnline, useSeenMatches } from "@/components/names/useMatches";
import { useSpace } from "@/components/names/useSpace";
import { useVotes } from "@/components/names/useVotes";
import { APP_PATH } from "@/lib/names/auth";
import { hasAppEntry } from "@/lib/names/appHistory";
import { keptByText, matchesIntro, newMatches, updatedText, withSeen, type Match, type MatchesState } from "@/lib/names/matches";
import { addedText, listsTab, rowActionText, rowMeta, rowMetaText, savedRows, type ListsTab, type SavedRow } from "@/lib/names/lists";
import { showToast } from "@/lib/names/toast";
import type { NameStats } from "@/lib/names/types";
import AddNameSheet from "./AddNameSheet";
import DuelScreen from "./DuelScreen";
import RowMenu from "./RowMenu";

const LISTS_PATH = "/names/lists";

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
  const { store, state } = useVotes(space.spaceId, user?.id ?? null);
  const matches = useMatches(space.spaceId, user?.id ?? null, space.isShared, state?.votes);
  const [status, setStatus] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const tab = listsTab(params.get("tab"), space.isShared);
  const rows = useMemo(() => savedRows(state?.votes ?? new Map()), [state?.votes]);
  const ready = !!(store && state?.ready);

  const tabs: { id: ListsTab; label: string }[] = [
    { id: "saved", label: ready ? `שמרתי · ${rows.length}` : "שמרתי" },
    ...(space.isShared
      ? [{ id: "matches" as const, label: matches?.ready && matches.fetchedAt !== null ? `התאמות · ${matches.matches.length}` : "התאמות" }]
      : []),
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
      />
    );
  }

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
        <header className="flex items-center gap-2">
          <IconButton aria-label="חזרה" onClick={back}>
            <Icon className="ltr:-scale-x-100">
              <path d="M9 6l6 6-6 6" />
            </Icon>
          </IconButton>
          <h1 ref={headingRef} tabIndex={-1} className="m-0 min-w-0 flex-1 text-title outline-none">
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
                if (action === "remove") store.removeVote(name);
                else store.setVote(name, "hidden");
                setStatus(rowActionText(name, action));
              }}
              headingRef={headingRef}
            />
          ) : (
            <MatchesPanel userId={user?.id ?? null} state={matches} memberCount={space.members.length} names={names} />
          )}
        </section>

        <p role="status" className="sr-only">
          {status}
        </p>
      </main>
      <AddNameSheet names={names} saved={rows.map((r) => r.name)} onAdd={add} />
    </div>
  );
}

type MatchesPanelProps = {
  userId: string | null;
  state: MatchesState | null;
  memberCount: number;
  names: Map<string, NameStats> | null;
};

/**
 * FR-W19 "התאמות" (board 5): names 2+ members kept, newest first, from the matches cache.
 * "{n} שמרו" from 3 up, a heart when someone loved it (never who), the last update time
 * while offline. Nothing about anyone's skips.
 */
function MatchesPanel({ userId, state, memberCount, names }: MatchesPanelProps) {
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
          <span className="sr-only">טוען</span>
        </div>
      </>
    );
  }

  return (
    <>
      {intro}
      {updated}
      <MatchRows userId={userId} matches={state.matches} memberCount={memberCount} names={names} />
    </>
  );
}

type MatchRowsProps = {
  userId: string | null;
  matches: readonly Match[];
  memberCount: number;
  names: Map<string, NameStats> | null;
};

function MatchRows({ userId, matches, memberCount, names }: MatchRowsProps) {
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
          {memberCount > 2 ? "שם ששניים מכם שמרו יופיע כאן." : "שם ששניכם שמרתם יופיע כאן."}
        </p>
        <Button variant="link" href={APP_PATH}>
          לבחירת שמות
        </Button>
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
            <li key={match.name} className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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
                      מישהו אהב מאוד
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
              </div>
              {kept ? <span className="flex-none text-caption font-bold text-ink-soft">{kept}</span> : null}
            </li>
          );
        })}
      </ul>
      {matches.length >= 2 ? <DuelLink title="דו־קרב בין ההתאמות" from="matches" /> : null}
    </>
  );
}

function DuelLink({ title, from }: { title: string; from: "saved" | "matches" }) {
  return (
    <Link
      href={`${LISTS_PATH}?tab=duel&from=${from}`}
      replace
      scroll={false}
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

type SavedPanelProps = {
  ready: boolean;
  rows: SavedRow[];
  names: Map<string, NameStats> | null;
  onAction: (name: string, action: "remove" | "hide") => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
};

/** "שמרתי": loved first with "אהבתי מאוד", each row with sex tag, count, trend and its menu. */
function SavedPanel({ ready, rows, names, onAction, headingRef }: SavedPanelProps) {
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

  if (!ready) {
    return (
      <div aria-busy="true" className="h-[78px] rounded-lg bg-surface shadow-card">
        <span className="sr-only">טוען</span>
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
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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
              </div>
              <RowMenu
                name={row.name}
                onRemove={() => {
                  focusAfter.current = i;
                  onAction(row.name, "remove");
                }}
                onHide={() => {
                  focusAfter.current = i;
                  onAction(row.name, "hide");
                }}
              />
            </li>
          );
        })}
      </ul>
      {rows.length >= 2 ? <DuelLink title="דו־קרב בין השמות ששמרתי" from="saved" /> : null}
    </>
  );
}
