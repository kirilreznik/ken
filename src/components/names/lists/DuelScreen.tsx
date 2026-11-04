"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { Button, IconButton } from "@/components/names/ui";
import { APP_PATH } from "@/lib/names/auth";
import {
  currentPair,
  deserialize,
  duelAnnouncement,
  duelSource,
  isDone,
  pick,
  progress,
  ranking,
  resumeOrStart,
  roundText,
  sourceOf,
  start,
  type DuelSource,
  type DuelState,
} from "@/lib/names/duel";
import { rowMeta, rowMetaText } from "@/lib/names/lists";
import { getPref, setPref, subscribePrefs } from "@/lib/names/prefs";
import { showToast } from "@/lib/names/toast";
import type { NameStats } from "@/lib/names/types";

function Icon({ size = 20, children, className }: { size?: number; children: ReactNode; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];

/** The saved duel (the duelState pref) as a stable JSON snapshot. */
function useSavedDuel(userId: string | null): DuelState | null {
  const json = useSyncExternalStore(
    subscribePrefs,
    () => (userId ? JSON.stringify(getPref(userId, "duelState")) : "null"),
    () => "null",
  );
  return useMemo(() => deserialize(json), [json]);
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
};

/**
 * FR-W21 "דו־קרב" (board 6, E16 FR-13): two names at a time from "שמרתי" (or from "התאמות"
 * with 2+ matches) until a ranked top 5. Every pick is saved to the duelState pref, so
 * "עצירה" or a reload resumes where it stopped.
 */
export default function DuelScreen({ userId, from, ready, savedNames, matchNames, names, customNames, onSource, onBack }: DuelScreenProps) {
  const saved = useSavedDuel(userId);
  const [seed, setSeed] = useState(randomSeed);
  // The duel in play once a pick is made: it keeps going even if the list changes meanwhile.
  const [pinned, setPinned] = useState<DuelState | null>(null);
  const [status, setStatus] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  const source = duelSource(from, saved, savedNames.length, matchNames.length);
  const list = source === "matches" ? matchNames : savedNames;
  const canToggle = matchNames.length >= 2;

  const resolved =
    pinned && sourceOf(pinned) === source
      ? { state: pinned, restarted: false }
      : list.length >= 2
        ? resumeOrStart(saved, source, list, seed)
        : null;
  const duel = resolved?.state ?? null;
  const done = duel ? isDone(duel) : false;

  // The "דו־קרב" tab that opened this screen is gone; start from the title.
  useEffect(() => {
    if (!document.activeElement || document.activeElement === document.body) headingRef.current?.focus();
  }, []);

  const save = (state: DuelState) => {
    setPinned(state);
    if (userId) setPref(userId, "duelState", state);
  };

  const choose = (name: string) => {
    if (!duel) return;
    const next = pick(duel, name);
    save(next);
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
    showToast("הדו־קרב נשמר. אפשר להמשיך מאותו מקום.");
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
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-y-0 start-0 end-0 mx-auto max-w-[480px]">
          <div className="absolute top-65 inset-x-0 mx-auto size-70 rounded-full bg-peach opacity-20 blur-(--nest-blob-blur)" />
        </div>
      </div>

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
          {p && ready ? <span className="text-caption font-bold text-ink-soft">{roundText(p)}</span> : null}
        </header>

        {canToggle && ready ? (
          <div role="radiogroup" aria-label="דו־קרב בין" className="flex items-center gap-2">
            <span aria-hidden="true" className="text-person font-bold text-ink-soft">
              בין:
            </span>
            <div className="grid flex-1 grid-cols-2 gap-1 rounded-pill border border-line bg-surface p-1">
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
                    className={`min-h-11 rounded-pill px-2 text-person font-bold ${checked ? "bg-ink text-surface" : "text-ink-soft hover:bg-sand"}`}
                  >
                    {s.id === "saved" ? `${s.label} · ${savedNames.length}` : `${s.label} · ${matchNames.length}`}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {!ready ? (
          <div aria-busy="true" className="h-[180px] rounded-xl bg-surface shadow-card">
            <span className="sr-only">טוען</span>
          </div>
        ) : !duel || !p ? (
          <div className="flex flex-col items-start gap-2 rounded-lg bg-surface px-4 py-5 shadow-card">
            <p className="m-0 text-card-title">
              {source === "matches" ? "לדו־קרב צריך לפחות שתי התאמות." : "לדו־קרב צריך לפחות שני שמות ברשימה."}
            </p>
            <Button variant="link" href={APP_PATH}>
              לבחירת שמות
            </Button>
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
                <div className="h-1.5 rounded-pill bg-clay" style={{ width: `${barPercent}%` }} />
              </div>
              {resolved?.restarted ? (
                <p className="m-0 text-person text-ink-soft">הרשימה השתנתה מאז, אז הדו־קרב מתחיל מחדש.</p>
              ) : null}
              <p className="m-0 text-match-line text-ink-soft">{done ? "הדו־קרב הסתיים." : "איזה מהשניים?"}</p>
            </div>

            {pair ? (
              <>
                <div className="flex flex-col gap-3">
                  {[pair.a, pair.b].map((name, i) => {
                    const m = meta(name);
                    return (
                      <div key={i} className="contents">
                        {i === 1 ? (
                          <div
                            aria-hidden="true"
                            className="z-1 -my-8 flex size-11.5 items-center justify-center self-center rounded-full border-3 border-canvas bg-ink text-caption font-extrabold text-surface"
                          >
                            או
                          </div>
                        ) : null}
                        <button
                          type="button"
                          data-duel-pick={i === 0 ? "a" : "b"}
                          aria-describedby={m ? `duel-meta-${i}` : undefined}
                          onClick={() => choose(name)}
                          className="flex min-h-[180px] flex-col items-center justify-center gap-1.5 rounded-xl bg-surface px-4 text-ink shadow-hero"
                        >
                          <span className="text-duel-name break-words">{name}</span>
                          {m ? (
                            <span aria-hidden="true" className="text-caption font-medium text-stone">
                              {m.short}
                            </span>
                          ) : null}
                        </button>
                        {m ? (
                          <span id={`duel-meta-${i}`} className="sr-only">
                            {m.full}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="m-0 text-person font-bold">החמישייה עד עכשיו</h2>
                  <ol className="m-0 flex list-none flex-wrap gap-2 p-0">
                    {top.map((name, i) => (
                      <li key={name} className="rounded-pill bg-ink px-3 py-1.5 text-caption font-bold text-surface">
                        {i + 1}. {name}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-auto flex items-center">
                  <button
                    type="button"
                    onClick={stop}
                    className="min-h-11 px-1 text-person font-bold text-ink-soft underline"
                  >
                    עצירה, אפשר להמשיך אחר כך
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <h2 ref={resultRef} tabIndex={-1} className="m-0 text-section outline-none">
                    {top.length === 5 ? "החמישייה" : "הדירוג"}
                  </h2>
                  <ol aria-label="הדירוג" className="m-0 list-none rounded-lg bg-surface p-0 shadow-card">
                    {top.map((name, i) => {
                      const m = meta(name);
                      return (
                        <li key={name} className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0">
                          <span
                            aria-hidden="true"
                            className={`flex size-9 flex-none items-center justify-center rounded-full text-card-title ${i === 0 ? "bg-ink text-surface" : "bg-sand text-ink"}`}
                          >
                            {i + 1}
                          </span>
                          <span className="sr-only">מקום {i + 1}:</span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="text-row-name break-words">{name}</span>
                            {m ? (
                              <>
                                <span aria-hidden="true" className="text-caption text-stone">
                                  {m.short}
                                </span>
                                <span className="sr-only">{m.full}</span>
                              </>
                            ) : null}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="mt-auto flex flex-col items-stretch gap-2">
                  <Button onClick={restart}>דו־קרב חדש</Button>
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
