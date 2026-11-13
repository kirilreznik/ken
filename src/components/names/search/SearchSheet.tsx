"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { BottomSheet, closeSheet, emptyLineClass, inputClass, openNameSheet } from "@/components/names/ui";
import { useLayerOpen } from "@/components/names/ui/layers";
import { useNameStats } from "@/components/names/useCards";
import { normalizeName } from "@/lib/names/custom";
import { queryScript, searchCards, hebrewKey } from "@/lib/names/search";
import { track } from "@/lib/names/track";
import type { Card, Vote } from "@/lib/names/types";
import { isPushedLayer } from "@/lib/names/urlLayer";

export const SEARCH_SHEET = "search";

type SearchSheetProps = {
  cards: readonly Card[] | null;
  votes: ReadonlyMap<string, Vote>;
};

const VOTE_WORDS: Record<Vote, string> = {
  keep: "נשמר",
  love: "אהבתי מאוד",
  skip: "דילגתי",
  hidden: "הוסתר",
};

/**
 * Opens the name sheet on a result. The name sheet never opens over another layer, so the
 * search sheet closes first (Back past its entry), then the name opens on the page below.
 */
function openResult(name: string, rank: number, length: number) {
  track("search_result_open", { rank, length });
  track("detail_opened", { source: "search" });
  const pushed = isPushedLayer(window.history.state, "sheet", SEARCH_SHEET);
  closeSheet(SEARCH_SHEET);
  if (pushed) window.addEventListener("popstate", () => openNameSheet(name), { once: true });
  else openNameSheet(name);
}

/**
 * "חיפוש שם" (?sheet=search): type a name and jump straight to its card. Hebrew matches by
 * letters (no niqqud, any ו/י spelling), Latin by the Academy and international spellings. The
 * filters don't hide results. Mounts only while open, so each opening starts empty.
 */
export default function SearchSheet(props: SearchSheetProps) {
  return (
    <Suspense fallback={null}>
      <Gate {...props} />
    </Suspense>
  );
}

function Gate(props: SearchSheetProps) {
  return useLayerOpen("sheet", SEARCH_SHEET) ? <Panel {...props} /> : null;
}

function Panel({ cards, votes }: SearchSheetProps) {
  const [query, setQuery] = useState("");
  const hintId = useId();
  const statusId = useId();
  const { names: allNames } = useNameStats();
  const results = useMemo(() => (cards ? searchCards(cards, query) : []), [cards, query]);
  const script = queryScript(query);
  const typed = normalizeName(query);
  // A Hebrew name with no card: say so, and point to "הוספת שם" in the user's lists.
  const noCard =
    script === "hebrew" && typed && !results.some((c) => hebrewKey(c.stats.name) === hebrewKey(typed)) ? typed : null;
  const inData = noCard !== null && !!allNames?.has(noCard);

  useEffect(() => track("search_open"), []);
  // One event per query that found nothing (after a short pause in typing), never the text.
  const reported = useRef("");
  useEffect(() => {
    if (script === "none" || results.length > 0 || !cards) return;
    const t = window.setTimeout(() => {
      if (reported.current === query) return;
      reported.current = query;
      track("search_no_result", { length: query.trim().length, latin: script === "latin" });
    }, 800);
    return () => window.clearTimeout(t);
  }, [script, results.length, cards, query]);

  const status =
    script === "none" ? "" : results.length === 0 ? "לא נמצאו שמות" : results.length === 1 ? "נמצא שם אחד" : `נמצאו ${results.length} שמות`;

  return (
    <BottomSheet name={SEARCH_SHEET} title="חיפוש שם" closeButton>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name-search" className="sr-only">
          שם לחיפוש
        </label>
        <input
          id="name-search"
          type="search"
          dir="rtl"
          lang="he"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="למשל נועה או Noa"
          data-autofocus=""
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-describedby={`${hintId} ${statusId}`}
          className={`${inputClass()} text-end`}
        />
        <p id={hintId} className="m-0 text-caption text-stone">
          אפשר לכתוב בעברית או באותיות לועזיות. החיפוש כולל את כל השמות, גם אלה שמחוץ לסינון.
        </p>
        <p id={statusId} role="status" className="sr-only">
          {status}
        </p>
      </div>

      {results.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {results.map((card, i) => {
            const vote = votes.get(card.stats.name);
            const latin = card.content.latin?.intl ?? card.content.latin?.he ?? null;
            return (
              <li key={card.stats.name}>
                <button
                  type="button"
                  onClick={() => openResult(card.stats.name, i + 1, query.trim().length)}
                  className="flex min-h-14 w-full items-center gap-3 rounded-md bg-surface px-3.5 py-2.5 text-start shadow-card transition-transform duration-(--nest-duration-press) motion-safe:active:scale-[0.98]"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-card-title break-words text-ink">{card.stats.name}</span>
                    <span className="flex flex-wrap items-center gap-x-2 text-caption text-ink-soft">
                      <span>{card.derived.sexTag}</span>
                      {latin ? (
                        <bdi dir="ltr" lang="en" className="text-stone">
                          {latin}
                        </bdi>
                      ) : null}
                    </span>
                  </span>
                  {vote ? <span className="shrink-0 rounded-pill bg-canvas px-2.5 py-1 text-tag text-ink-soft">{VOTE_WORDS[vote]}</span> : null}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-stone ltr:-scale-x-100">
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {noCard ? (
        <div className="flex flex-col gap-1.5 rounded-md bg-canvas px-3.5 py-3">
          <p className="m-0 text-body text-ink">
            {inData ? (
              <>
                ל<bdi>{noCard}</bdi> עדיין אין כרטיס.
              </>
            ) : (
              <>
                השם <bdi>{noCard}</bdi> לא נמצא בבחירה.
              </>
            )}
          </p>
          <Link href="/names/lists?sheet=add-name" data-control className="self-start py-2 text-person font-bold text-ink underline underline-offset-4">
            הוספת שם לשמות שלי
          </Link>
        </div>
      ) : script !== "none" && results.length === 0 && cards ? (
        <p className={emptyLineClass()}>לא מצאנו שם שנכתב כך.</p>
      ) : null}
    </BottomSheet>
  );
}
