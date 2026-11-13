"use client";

import { useEffect, useMemo } from "react";
import { emptyPanelClass, emptyTitleClass, openNameSheet } from "@/components/names/ui";
import { getDetailsSnapshot, startDetails, subscribeDetails } from "@/components/names/useNameDetails";
import { track } from "@/lib/names/track";
import { pairsAmong } from "@/lib/names/twins";
import type { Card } from "@/lib/names/types";
import { useSyncExternalStore } from "react";

const noDetails = () => null;

function openName(name: string) {
  openNameSheet(name);
  track("detail_opened", { source: "twins" });
}

/**
 * "זוגות" (with "מצפים לתאומים" on): pairs made from the saved names that have a card, best
 * first, each with why they go together. A name opens its sheet. Names added by hand have no
 * data to pair on and are left out.
 */
export default function PairsPanel({ cards, saved, ready }: { cards: readonly Card[] | null; saved: readonly string[]; ready: boolean }) {
  useEffect(() => void startDetails(), []);
  const details = useSyncExternalStore(subscribeDetails, () => getDetailsSnapshot().details, noDetails);
  const pairs = useMemo(() => {
    if (!cards) return [];
    const byName = new Map(cards.map((c) => [c.stats.name, c]));
    const savedCards = saved.map((n) => byName.get(n)).filter((c): c is Card => !!c);
    return pairsAmong(savedCards, (name) => details?.get(name)?.similar ?? []);
  }, [cards, saved, details]);

  if (!ready || !cards) {
    return (
      <div aria-busy="true" className="h-[78px] rounded-lg bg-surface shadow-card">
        <span className="sr-only">בטעינה</span>
      </div>
    );
  }
  if (pairs.length === 0) {
    return (
      <div className={emptyPanelClass("card")}>
        <p className={emptyTitleClass("card")}>{saved.length < 2 ? "שומרים כמה שמות, והזוגות יופיעו כאן" : "עוד אין זוגות בשמות ששמרת"}</p>
        <p className="m-0 text-body text-ink-soft">זוג הוא שני שמות באותה אות ראשונה, שמתחרזים או שיש להם אותה משמעות. בכל שם יש גם הצעות לזוג, בפרטי השם.</p>
      </div>
    );
  }
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {pairs.map(({ names: [a, b], reasons }) => (
        <li key={`${a}|${b}`} className="flex flex-col rounded-lg bg-surface px-4 pt-1 pb-3 shadow-card">
          <p className="m-0 flex flex-wrap items-center gap-x-1.5 text-card-title text-ink">
            <button type="button" onClick={() => openName(a)} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" aria-label={`${a}, פרטי השם`}>
              {a}
            </button>
            <span className="inline-flex items-center">
              ו
              <button type="button" onClick={() => openName(b)} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" aria-label={`${b}, פרטי השם`}>
                {b}
              </button>
            </span>
          </p>
          <p className="m-0 text-caption text-ink-soft">{reasons.join(" · ")}</p>
        </li>
      ))}
    </ul>
  );
}
