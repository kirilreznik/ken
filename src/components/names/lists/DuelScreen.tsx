"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { Button, IconButton, emptyPanelClass, emptyTitleClass, linkClass, segmentClass, segmentGroupClass, useToastLift } from "@/components/names/ui";
import { hintChipClass } from "@/components/names/ui/classes";
import { DuelSkeleton } from "./ListSkeleton";
import RowName from "./RowName";
import { APP_PATH } from "@/lib/names/auth";
import { formatCount } from "@/lib/names/card";
import {
  currentPair,
  duelAnnouncement,
  duelSource,
  duelTooFewText,
  isDone,
  pick,
  progress,
  ranking,
  resumeOrStart,
  readDuelSaves,
  roundText,
  savedDuel,
  sourceOf,
  start,
  withDuel,
  type DuelSaves,
  type DuelSource,
  type DuelState,
} from "@/lib/names/duel";
import { rowMeta, rowMetaText } from "@/lib/names/lists";
import { getPref, setPref, subscribePrefs } from "@/lib/names/prefs";
import { dismissToast, showToast } from "@/lib/names/toast";
import type { NameStats } from "@/lib/names/types";
import { track } from "@/lib/names/track";

function Icon({ size = 20, children, className }: { size?: number; children: ReactNode; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];

// The "עצירה" toast; reopening the duel ends it so it doesn't cover the result's link (NP-097).
let stopToastId: number | undefined;

/** The saved duels (the duelState pref, one per source) as a stable JSON snapshot. */
function useSavedDuels(userId: string | null): DuelSaves | null {
  const json = useSyncExternalStore(
    subscribePrefs,
    () => (userId ? JSON.stringify(getPref(userId, "duelState")) : "null"),
    () => "null",
  );
  return useMemo(() => readDuelSaves(JSON.parse(json)), [json]);
}

const SOURCES: { id: DuelSource; label: string }[] = [
  { id: "saved", label: "שמרתי" },
  { id: "matches", label: "התאמות" },
];

type DuelScreenProps = {
  userId: string | null;
  /** `?from=`. */
  from: string | null;
  /** False until the votes (and, in a shared space, the matches) are read. */
  ready: boolean;
  savedNames: readonly string[];
  matchNames: readonly string[];
  names: Map<string, NameStats> | null;
  customNames: ReadonlySet<string>;
  onSource: (source: DuelSource) => void;
  onBack: (source: DuelSource) => void;
  /** "בחרנו בשם X" on the finished ranking (the decision moment). */
  onChoose: (name: string, from: DuelSource, rank: number) => void;
  chooseLabel: (name: string) => string;
  /** "הוספת שם" on the too-few card: opens the add-name sheet over the duel. */
  onAddName: () => void;
  /** Whether a name has a card, so its result row opens "פרטי השם" (NP-167). */
  canOpen: (name: string) => boolean;
  onOpenName: (name: string) => void;
};

/**
 * FR-W21 "דו־קרב" (board 6, E16 FR-13): two names at a time from "שמרתי" (or from "התאמות"
 * with 2+ matches) until a ranked top 5. Every pick is saved to the duelState pref, one duel per
 * source, so "עצירה", a reload or a switch to the other list and back resumes where it stopped.
 */
export default function DuelScreen({ userId, from, ready, savedNames, matchNames, names, customNames, onSource, onBack, onChoose, chooseLabel, onAddName, canOpen, onOpenName }: DuelScreenProps) {
  const saves = useSavedDuels(userId);
  const [seed, setSeed] = useState(randomSeed);
  // The duel in play once a pick is made: it keeps going even if the list changes meanwhile.
  const [pinned, setPinned] = useState<DuelState | null>(null);
  const [status, setStatus] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  // Toasts ("השם … נוסף לרשימה") sit above "עצירה" (NP-BUG-003).
  const stopRef = useToastLift();

  const source = duelSource(from, savedDuel(saves), savedNames.length, matchNames.length);
  const list = source === "matches" ? matchNames : savedNames;
  const canToggle = matchNames.length >= 2;

  const resolved =
    pinned && sourceOf(pinned) === source
      ? { state: pinned, restarted: false }
      : list.length >= 2
        ? resumeOrStart(savedDuel(saves, source), source, list, seed)
        : null;
  const duel = resolved?.state ?? null;
  const done = duel ? isDone(duel) : false;

  // The "דו־קרב" tab that opened this screen is gone; start from the title.
  useEffect(() => {
    if (!document.activeElement || document.activeElement === document.body) headingRef.current?.focus();
    if (stopToastId !== undefined) dismissToast(stopToastId);
  }, []);

  // Its own page title while open (NP-163).
  useEffect(() => {
    const previous = document.title;
    document.title = "דו־קרב · בחירת שם";
    return () => {
      document.title = previous;
    };
  }, []);

  const save = (state: DuelState) => {
    setPinned(state);
    if (userId) setPref(userId, "duelState", withDuel(getPref(userId, "duelState"), state));
  };

  // A double tap on a card records one pick, not one on the next pair it never showed (NP-161).
  const lastPick = useRef(0);
  const choose = (name: string, at: number) => {
    if (!duel || at - lastPick.current < 300) return;
    lastPick.current = at;
    const next = pick(duel, name);
    save(next);
    if (duel.picks === 0) track("duel_started", { from: source, size: duel.names.length });
    if (isDone(next)) track("duel_completed", { from: source, size: next.names.length, picks: next.picks });
    setStatus(duelAnnouncement(next));
    if (isDone(next)) requestAnimationFrame(() => resultRef.current?.focus());
  };

  const restart = () => {
    const nextSeed = randomSeed();
    const next = { ...start(list, nextSeed), source };
    setSeed(nextSeed);
    save(next);
    setStatus(duelAnnouncement(next));
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const stop = () => {
    if (duel) save(duel);
    stopToastId = showToast("הדו־קרב נשמר. אפשר להמשיך מאותו מקום.");
    onBack(source);
  };

  const onToggleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const other = source === "saved" ? "matches" : "saved";
    onSource(other);
    document.getElementById(`duel-source-${other}`)?.focus();
  };

  const meta = (name: string) => {
    if (customNames.has(name)) return { short: "שם שהוספתי", full: "שם שהוספתי" };
    const m = rowMeta(names?.get(name));
    if (!m) return null;
    return { short: m.trend ? `${m.sexTag} · ${m.trend.arrow} ${m.trend.word}` : m.sexTag, full: rowMetaText(m) };
  };

  const p = duel ? progress(duel) : null;
  // Board 6 fills the bar up to the round on screen, so round 1 already shows.
  const barPercent = p ? (p.total === 0 ? 100 : Math.round((p.round / p.total) * 100)) : 0;
  const top = duel ? ranking(duel) : [];
  const pair = duel ? currentPair(duel) : null;

  return (
    <div data-names-bg="none" className="relative isolate min-h-dvh bg-canvas">
      {/* The glow lights the cards or the ranking only; the few-names and loading states stay plain (NP-168). */}
      {ready && duel && p ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-y-0 start-0 end-0 mx-auto max-w-[480px]">
            <div className="absolute top-65 inset-x-0 mx-auto size-70 rounded-pill bg-peach opacity-20 blur-(--nest-blob-blur)" />
          </div>
        </div>
      ) : null}

      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <header className="flex items-center gap-2">
          <IconButton aria-label="חזרה" onClick={() => onBack(source)}>
            <Icon className="ltr:-scale-x-100">
              <path d="M9 6l6 6-6 6" />
            </Icon>
          </IconButton>
          <h1 ref={headingRef} tabIndex={-1} className="m-0 min-w-0 flex-1 text-title outline-none">
            דו־קרב
          </h1>
          {p && ready && !done ? <span className="text-caption font-bold text-ink-soft tabular-nums">{roundText(p)}</span> : null}
        </header>

        {canToggle && ready ? (
          <div role="radiogroup" aria-label="דו־קרב בין" className="flex items-center gap-2">
            <span aria-hidden="true" className="text-person font-bold text-ink-soft">
              בין:
            </span>
            <div className={`flex-1 ${segmentGroupClass()}`}>
              {SOURCES.map((s) => {
                const checked = s.id === source;
                return (
                  <button
                    key={s.id}
                    id={`duel-source-${s.id}`}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    tabIndex={checked ? 0 : -1}
                    onClick={() => onSource(s.id)}
                    onKeyDown={onToggleKey}
                    className={segmentClass(checked)}
                  >
                    {s.id === "saved" ? `${s.label} ·\u00a0${formatCount(savedNames.length)}` : `${s.label} ·\u00a0${formatCount(matchNames.length)}`}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {!ready ? (
          <DuelSkeleton />
        ) : !duel || !p ? (
          <div className={emptyPanelClass("card")}>
            <h2 className={emptyTitleClass("card")}>{duelTooFewText(source, list.length)}</h2>
            <div className="flex flex-wrap justify-center gap-x-6">
              <Button variant="link" href={APP_PATH}>
                לבחירת שמות
              </Button>
              {source === "saved" && list.length === 1 ? (
                <Button variant="link" onClick={onAddName}>
                  הוספת שם
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <div
                role="progressbar"
                aria-label="התקדמות הדו־קרב"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={barPercent}
                aria-valuetext={roundText(p)}
                className="h-1.5 overflow-hidden rounded-pill bg-line"
              >
                <div className="h-1.5 rounded-pill bg-clay transition-[width] duration-(--nest-duration-fast) ease-out" style={{ width: `${barPercent}%` }} />
              </div>
              {resolved?.restarted ? (
                <p className="m-0 text-person text-ink-soft">הרשימה השתנתה מאז, אז הדו־קרב מתחיל מחדש.</p>
              ) : null}
              <p className="m-0 text-match-line text-ink-soft">{done ? "הדו־קרב הסתיים." : "איזה מהשניים?"}</p>
            </div>

            {pair ? (
              <>
                {/* A short landscape screen sets the two names side by side, so both show (NP-169). */}
                <div className="flex flex-col gap-3 [@media(max-height:30rem)]:flex-row">
                  {[pair.a, pair.b].map((name, i) => {
                    const m = meta(name);
                    return (
                      <div key={i} className="contents">
                        {i === 1 ? (
                          <div
                            aria-hidden="true"
                            className="z-1 -my-8 flex size-11.5 flex-none [@media(max-height:30rem)]:-mx-8 [@media(max-height:30rem)]:my-0 items-center justify-center self-center rounded-pill border-3 border-canvas bg-ink text-caption font-extrabold text-surface"
                          >
                            או
                          </div>
                        ) : null}
                        <button
                          type="button"
                          data-duel-pick={i === 0 ? "a" : "b"}
                          aria-describedby={m ? `duel-meta-${i}` : undefined}
                          onClick={(event) => choose(name, event.timeStamp)}
                          className="@container flex min-h-[180px] min-w-0 touch-manipulation [@media(max-height:30rem)]:min-h-[140px] [@media(max-height:30rem)]:flex-1 flex-col items-center justify-center gap-1.5 rounded-xl bg-surface px-4 text-ink shadow-hero transition-transform duration-(--nest-duration-press) motion-safe:active:scale-97"
                        >
                          {/* Each round's names fade in (NP-162); a plain fade, so it stays under reduced motion (data-motion). The button itself keeps focus. */}
                          <span
                            key={`${duel.picks}-${name}`}
                            data-motion="fade"
                            className="flex max-w-full animate-[names-fade-in_var(--nest-duration-fade)_ease-out] flex-col items-center gap-1.5"
                          >
                            {/* A narrow card (Page Zoom 150 %) steps the name down a size, and a name too long for a line breaks anywhere (NP-BUG-012). */}
                            <span className="max-w-full text-center text-duel-name wrap-anywhere @max-[16rem]:text-hero-name">{name}</span>
                            {m ? (
                              <span aria-hidden="true" className="text-caption font-medium text-stone">
                                {m.short}
                              </span>
                            ) : null}
                          </span>
                        </button>
                        {/* hidden, not sr-only: read once as the button's description (NP-164). */}
                        {m ? (
                          <span id={`duel-meta-${i}`} hidden>
                            {m.full}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Before the first pick the "top five" is just the first name in the list, so it waits. */}
                <div className={`flex flex-col gap-2 ${duel && duel.picks > 0 ? "" : "hidden"}`}>
                  <h2 className="m-0 text-person font-bold">החמישייה עד עכשיו</h2>
                  <ol className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {top.map((name, i) => (
                      <li key={name} className={`max-w-full wrap-anywhere ${hintChipClass()}`}>
                        {i + 1}. {name}
                      </li>
                    ))}
                  </ol>
                </div>

                <div ref={stopRef} className="mt-auto flex items-center">
                  <button type="button" onClick={stop} className={linkClass("quiet")}>
                    עצירה, אפשר להמשיך אחר כך
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Tighter gaps keep the primary above the fold at 320 × 568 (NP-167). */}
                <div className="flex flex-col gap-1.5">
                  <h2 ref={resultRef} tabIndex={-1} className="m-0 text-section outline-none">
                    {top.length === 5 ? "החמישייה" : "הדירוג"}
                  </h2>
                  <ol aria-label="הדירוג" className="m-0 list-none rounded-lg bg-surface p-0 shadow-card">
                    {top.map((name, i) => {
                      const m = meta(name);
                      return (
                        <li key={name} className="flex items-center gap-3 border-b border-line px-4 py-2 last:border-b-0">
                          <span
                            aria-hidden="true"
                            className={`flex size-9 flex-none items-center justify-center rounded-pill text-card-title ${i === 0 ? "bg-ink text-surface" : "bg-sand text-ink"}`}
                          >
                            {i + 1}
                          </span>
                          <span className="sr-only">מקום {i + 1}:</span>
                          {/* Names with a card open "פרטי השם" like every list row; #1 a size up (NP-167). */}
                          <RowName onOpen={canOpen(name) ? () => onOpenName(name) : undefined}>
                            <span className={`${i === 0 ? "text-section" : "text-row-name"} break-words`}>{name}</span>
                            {m ? (
                              <>
                                <span aria-hidden="true" className="text-caption text-stone">
                                  {m.short}
                                </span>
                                <span className="sr-only">{m.full}</span>
                              </>
                            ) : null}
                          </RowName>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="mt-auto flex flex-col items-stretch gap-1.5">
                  {top[0] ? <Button onClick={() => onChoose(top[0], source, 1)}>{chooseLabel(top[0])}</Button> : null}
                  <Button variant="secondary" onClick={restart}>
                    דו־קרב חדש
                  </Button>
                  <Button variant="link" onClick={() => onBack(source)}>
                    חזרה לרשימה
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        <p role="status" className="sr-only">
          {status}
        </p>
      </main>
    </div>
  );
}
