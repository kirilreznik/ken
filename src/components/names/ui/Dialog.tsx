"use client";

import { Suspense, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { closeDialog, useLayerOpen } from "./layers";
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
  const host = usePortalHost();
  if (!open || !host) return null;
  return createPortal(<DialogPanel {...props} />, host);
}

function DialogPanel({ name, title, description, children }: DialogProps) {
  const panel = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const close = () => closeDialog(name);
  const onKeyDown = useModal(panel, close);

  return (
    <div data-names-layer className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div aria-hidden="true" className="names-scrim-in absolute inset-0 bg-(--nest-ink-45)" onClick={close} />
      <section
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        data-names-bg="none"
        className="names-dialog-in relative flex w-full max-w-sm flex-col gap-3 rounded-xl bg-surface p-6 text-ink shadow-hero outline-none"
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
