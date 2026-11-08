"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { Button, IconButton, collapseRow } from "@/components/names/ui";
import { useNameStats } from "@/components/names/useCards";
import { useSpace } from "@/components/names/useSpace";
import { useVotes } from "@/components/names/useVotes";
import { APP_PATH } from "@/lib/names/auth";
import { hasAppEntry } from "@/lib/names/appHistory";
import { hiddenAgainText, hiddenNames, restoredText, rowMeta, rowMetaText } from "@/lib/names/lists";
import { showToast } from "@/lib/names/toast";
import type { Vote } from "@/lib/names/types";

/**
 * FR-W22 (E16 FR-11): the names the user hid, the latest first, in board 5's list rows.
 * "החזרה" deletes the hidden vote, so the deck offers the name again.
 */
export default function HiddenScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const space = useSpace();
  const { names } = useNameStats();
  const { store, state } = useVotes(space.spaceId, user?.id ?? null);
  const listRef = useRef<HTMLUListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusAfter = useRef<number | null>(null);

  const hidden = useMemo(() => {
    const votes = new Map<string, Vote>();
    for (const [name, v] of state?.votes ?? []) votes.set(name, v.vote);
    return hiddenNames(votes);
  }, [state?.votes]);
  const ready = !!(store && state?.ready);

  // After a row goes, focus the "החזרה" that took its place (or the one before it, or the title).
  useEffect(() => {
    const index = focusAfter.current;
    if (index === null) return;
    focusAfter.current = null;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-restore]");
    const target = buttons?.[Math.min(index, buttons.length - 1)] ?? headingRef.current;
    target?.focus();
  }, [hidden]);

  // The row closes first (NP-137); the toast's "ביטול" hides the name again.
  const restore = (name: string, index: number, row: HTMLElement | null) => {
    if (!store) return;
    const custom = state?.votes.get(name)?.custom ?? false;
    collapseRow(row, () => {
      focusAfter.current = index;
      store.removeVote(name);
      const undo = () => {
        store.setVote(name, "hidden", custom);
        showToast(hiddenAgainText(name));
      };
      showToast(restoredText(name), { action: { label: "ביטול", onAction: undo } });
    });
  };

  const back = () => {
    if (hasAppEntry()) router.back();
    else router.replace(APP_PATH);
  };

  return (
    <div data-names-bg="none" className="min-h-dvh bg-canvas">
      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <header className="flex items-center gap-2">
          <IconButton aria-label="חזרה" onClick={back}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ltr:-scale-x-100">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </IconButton>
          <h1 ref={headingRef} tabIndex={-1} className="m-0 min-w-0 flex-1 text-title outline-none">
            שמות שהסתרתי
          </h1>
        </header>
        <p className="m-0 text-person font-medium text-ink-soft">שמות שהסתרת לא מופיעים בבחירה. אחרי החזרה השם יופיע בה שוב.</p>

        {!ready ? (
          <div aria-busy="true" className="h-[78px] rounded-lg bg-surface shadow-card">
            <span className="sr-only">בטעינה</span>
          </div>
        ) : hidden.length === 0 ? (
          <p className="m-0 rounded-lg bg-surface px-4 py-6 text-center text-card-title text-ink-soft shadow-card">אין שמות מוסתרים</p>
        ) : (
          <ul ref={listRef} aria-label="שמות מוסתרים" className="m-0 list-none overflow-hidden rounded-lg bg-surface p-0 shadow-card">
            {hidden.map((name, i) => {
              const meta = rowMeta(names?.get(name));
              return (
                <li key={name} className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-row-name break-words">{name}</span>
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
                  <Button variant="secondary" size="md" data-restore="" aria-label={`החזרה של ${name}`} onClick={(event) => restore(name, i, event.currentTarget.closest("li"))}>
                    החזרה
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

      </main>
    </div>
  );
}
