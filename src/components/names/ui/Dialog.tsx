"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { otherLayerOpen } from "@/lib/names/urlLayer";
import { closeDialog, useLayerOpen } from "./layers";
import { useExit } from "./useExit";
import { useModal, usePortalHost } from "./useModal";

type DialogProps = {
  /** ?dialog=<name> opens it; open with openDialog(name) so Back closes it. */
  name: string;
  title: string;
  description: ReactNode;
  /** The action buttons; mark the safe one (usually "ביטול") with data-autofocus. */
  children: ReactNode;
};

/** Confirm dialog (role alertdialog) bound to ?dialog=. Escape, Back and the scrim cancel. */
export function Dialog(props: DialogProps) {
  // useSearchParams needs a Suspense boundary on prerendered routes (Next 16).
  return (
    <Suspense fallback={null}>
      <DialogGate {...props} />
    </Suspense>
  );
}

function DialogGate(props: DialogProps) {
  const open = useLayerOpen("dialog", props.name);
  const search = useSearchParams().toString();
  const host = usePortalHost();
  // Fades out before it unmounts (NP-098), unless another layer replaces it.
  const { mounted, closing, onClosed } = useExit(open, !otherLayerOpen(search));
  if (!mounted || !host) return null;
  return createPortal(<DialogPanel {...props} closing={closing} onClosed={onClosed} />, host);
}

function DialogPanel({ name, title, description, children, closing, onClosed }: DialogProps & { closing: boolean; onClosed: () => void }) {
  const panel = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const close = () => closeDialog(name);
  const onKeyDown = useModal(panel, close, !closing);

  return (
    <div data-names-layer className={`fixed inset-0 z-50 flex items-center justify-center p-5 ${closing ? "pointer-events-none" : ""}`}>
      <div aria-hidden="true" className={`${closing ? "names-scrim-out" : "names-scrim-in"} absolute inset-0 bg-ink-45`} onClick={closing ? undefined : close} />
      <section
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        inert={closing}
        onKeyDown={onKeyDown}
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) onClosed();
        }}
        data-names-bg="none"
        className={`${closing ? "names-dialog-out" : "names-dialog-in"} relative flex w-full max-w-sm flex-col gap-3 rounded-xl bg-surface p-6 text-ink shadow-hero outline-none`}
      >
        <h2 id={titleId} className="text-section">
          {title}
        </h2>
        <div id={descriptionId} className="text-body text-ink-soft">
          {description}
        </div>
        <div className="mt-3 flex flex-col gap-2.5">{children}</div>
      </section>
    </div>
  );
}
