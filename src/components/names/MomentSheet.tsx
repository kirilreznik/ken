"use client";

import { useId, useRef, type ReactNode } from "react";
import ScreenBackground from "@/components/names/ScreenBackground";
import { CloseIcon, Glass, IconButton, dotClass } from "@/components/names/ui";
import { useModal } from "@/components/names/ui/useModal";

type MomentSheetProps = {
  /** The dialog's accessible name. */
  label: string;
  eyebrow: string;
  /** The name, shown big. */
  name: string;
  /** The line under the clay dot; also the dialog's description. */
  line: ReactNode;
  /** The small caption under the line (the count line); null hides it. */
  meta?: ReactNode;
  /** The button stack. */
  actions: ReactNode;
  /** X, Escape. */
  onClose: () => void;
  /** Anything after the actions (the Nest card). */
  children?: ReactNode;
};

/**
 * The full-screen "moment" shared by the match and decision sheets: on the match background, in
 * ink with a clay dot; no green, no confetti. One DOM so the two moments can't drift apart.
 */
export default function MomentSheet({ label, eyebrow, name, line, meta, actions, onClose, children }: MomentSheetProps) {
  const panel = useRef<HTMLElement>(null);
  const lineId = useId();
  const onKeyDown = useModal(panel, onClose);

  return (
    <div data-names-layer className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-canvas">
      <ScreenBackground blobs="match">
        <section
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          aria-describedby={lineId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="names-sheet-in flex min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex-col gap-6 px-5 pt-14 pb-8 text-ink outline-none"
        >
          <IconButton aria-label="סגירה" onClick={onClose} className="self-end">
            <CloseIcon />
          </IconButton>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            <p className="m-0 text-person font-bold text-ink">{eyebrow}</p>
            <Glass className="flex w-full flex-col items-center gap-3 rounded-xl px-6 py-8">
              <h2 lang="he" className="m-0 text-match-name wrap-anywhere">
                {name}
              </h2>
              <span aria-hidden="true" className={dotClass()} />
              <p id={lineId} className="m-0 text-match-line text-ink-soft">
                {line}
              </p>
              {meta ? <p className="m-0 text-caption text-ink-soft">{meta}</p> : null}
            </Glass>
          </div>

          <div className="flex flex-col gap-3">{actions}</div>

          {children}
        </section>
      </ScreenBackground>
    </div>
  );
}
