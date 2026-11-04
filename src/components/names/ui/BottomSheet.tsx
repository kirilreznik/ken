"use client";

import { Suspense, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { SheetName } from "@/lib/names/urlLayer";
import { closeSheet, useLayerOpen } from "./layers";
import { useModal, usePortalHost } from "./useModal";

type BottomSheetProps = {
  /** ?sheet=<name> opens it; open with openSheet(name) so Back closes it. */
  name: SheetName;
  title: string;
  /** Next to the title on the end side, e.g. "איפוס". */
  headerEnd?: ReactNode;
  /** Stays below the scrolling content, e.g. the apply button. */
  footer?: ReactNode;
  children: ReactNode;
};

// Dragging the handle down this far (px) closes the sheet.
const DRAG_CLOSE = 96;
// 28 px under the content (board 3), more on phones with a home indicator.
const SAFE_BOTTOM = "pb-[max(1.75rem,env(safe-area-inset-bottom))]";

/**
 * Bottom sheet bound to ?sheet= (board 3 chrome): ink scrim, white panel with 30 px top
 * corners, drag handle that is also the 44 px "סגירה" button, title row. Escape, Back,
 * the handle, a drag down or a tap on the scrim close it.
 */
export function BottomSheet(props: BottomSheetProps) {
  // useSearchParams needs a Suspense boundary on prerendered routes (Next 16).
  return (
    <Suspense fallback={null}>
      <SheetGate {...props} />
    </Suspense>
  );
}

function SheetGate(props: BottomSheetProps) {
  const open = useLayerOpen("sheet", props.name);
  const host = usePortalHost();
  if (!open || !host) return null;
  return createPortal(<SheetPanel {...props} />, host);
}

function SheetPanel({ name, title, headerEnd, footer, children }: BottomSheetProps) {
  const panel = useRef<HTMLElement>(null);
  const drag = useRef<{ startY: number; dy: number; moved: boolean } | null>(null);
  const [offset, setOffset] = useState(0);
  const titleId = useId();
  const close = () => closeSheet(name);
  const onKeyDown = useModal(panel, close);

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, dy: 0, moved: false };
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    const dy = Math.max(0, event.clientY - drag.current.startY);
    drag.current.dy = dy;
    if (dy > 6) drag.current.moved = true;
    setOffset(dy);
  }

  function onPointerEnd() {
    if (!drag.current) return;
    const { dy, moved } = drag.current;
    if (dy >= DRAG_CLOSE) close();
    else setOffset(0);
    // A drag isn't a tap: keep `moved` so the click that follows pointerup is ignored.
    drag.current = moved ? { startY: 0, dy: 0, moved } : null;
  }

  function onHandleClick() {
    const moved = drag.current?.moved;
    drag.current = null;
    if (!moved) close();
  }

  return (
    <div data-names-layer className="fixed inset-0 z-40 flex flex-col justify-end">
      <div aria-hidden="true" className="names-scrim-in absolute inset-0 bg-(--nest-ink-45)" onClick={close} />
      <section
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        data-names-bg="none"
        style={offset ? { transform: `translateY(${offset}px)` } : undefined}
        className={`names-sheet-in relative mx-auto flex max-h-[calc(100dvh-2.5rem)] w-full max-w-lg flex-col rounded-t-xl bg-surface text-ink outline-none ${offset ? "" : "transition-transform duration-200"}`}
      >
        <button
          type="button"
          aria-label="סגירה"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onClick={onHandleClick}
          className="relative z-10 mx-auto -mb-1.75 flex h-11 w-24 shrink-0 cursor-grab touch-none justify-center rounded-pill pt-3 active:cursor-grabbing"
        >
          <span aria-hidden="true" className="h-1.25 w-10 rounded-pill bg-line" />
        </button>
        <div className={`flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain px-5 ${footer ? "pb-5" : SAFE_BOTTOM}`}>
          <div className="flex min-h-11 items-center justify-between gap-3">
            <h2 id={titleId} className="text-title">
              {title}
            </h2>
            {headerEnd}
          </div>
          {children}
        </div>
        {footer ? <div className={`shrink-0 px-5 ${SAFE_BOTTOM}`}>{footer}</div> : null}
      </section>
    </div>
  );
}
