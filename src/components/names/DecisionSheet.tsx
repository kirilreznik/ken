"use client";

import { Suspense, useId, useRef } from "react";
import { createPortal } from "react-dom";
import NestCard from "@/components/names/NestCard";
import ScreenBackground from "@/components/names/ScreenBackground";
import { Button, Glass, IconButton } from "@/components/names/ui";
import { closeSheet, useLayerOpen } from "@/components/names/ui/layers";
import { useModal, usePortalHost } from "@/components/names/ui/useModal";
import { useNameStats } from "@/components/names/useCards";
import { clearChoiceLabel, decisionTitle } from "@/lib/names/launch";
import { countLine } from "@/lib/names/popularity";

type DecisionSheetProps = {
  /** The chosen name in this space; null when none. */
  name: string | null;
  shared: boolean;
  /** "לשנות את הבחירה": takes the choice back. */
  onClear: () => void;
};

/**
 * The "בחרנו שם" moment (?sheet=decision, product review step 4): the chosen name on the
 * match sheet's look, a way back, then the Nest app card. Ink and a clay dot like the match
 * sheet; no confetti.
 */
export default function DecisionSheet(props: DecisionSheetProps) {
  return (
    <Suspense fallback={null}>
      <Gate {...props} />
    </Suspense>
  );
}

function Gate(props: DecisionSheetProps) {
  const open = useLayerOpen("sheet", "decision");
  const host = usePortalHost();
  if (!open || !props.name || !host) return null;
  return createPortal(<Panel {...props} name={props.name} />, host);
}

function Panel({ name, shared, onClear }: DecisionSheetProps & { name: string }) {
  const { names } = useNameStats();
  const panel = useRef<HTMLElement>(null);
  const lineId = useId();
  const close = () => closeSheet("decision");
  const onKeyDown = useModal(panel, close);
  const stats = names?.get(name);

  return (
    <div data-names-layer className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-canvas">
      <ScreenBackground blobs="match">
        <section
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={`${decisionTitle(shared)}: ${name}`}
          aria-describedby={lineId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="names-sheet-in flex min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col gap-6 px-5 pt-14 pb-8 text-ink outline-none"
        >
          <IconButton aria-label="סגירה" onClick={close} className="self-end">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </IconButton>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            <p className="m-0 text-person font-bold text-clay-deep">{decisionTitle(shared)}</p>
            <Glass className="flex w-full flex-col items-center gap-2.5 rounded-xl px-6 py-8">
              <h2 lang="he" className="m-0 text-match-name break-words">
                {name}
              </h2>
              <span aria-hidden="true" className="size-2.5 rounded-full bg-clay" />
              <p id={lineId} className="m-0 text-match-line text-ink-soft">
                מזל טוב. השם נשמר כאן, ואפשר לשנות אותו בכל רגע.
              </p>
              {stats ? <p className="m-0 text-caption text-stone">{countLine(stats)}</p> : null}
            </Glass>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={close}>חזרה לרשימה</Button>
            <Button
              variant="link"
              className="self-center"
              onClick={() => {
                onClear();
                close();
              }}
            >
              {clearChoiceLabel(name)}
            </Button>
          </div>

          {/* The side offer comes after the sheet's own actions, so they stay above the fold. */}
          <NestCard placement="decision" />
        </section>
      </ScreenBackground>
    </div>
  );
}
