"use client";

import { Suspense, useId, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { SheetName } from "@/lib/names/urlLayer";
import { DETENT_DRAG, detentAfterDrag, type Detent } from "./detents";
import { closeSheet, useLayerOpen } from "./layers";
import { useModal, usePortalHost } from "./useModal";

/**
 * A text title, or a custom header rendered instead of the title row (pinned above the
 * scrolling content). The header must put `titleId` on the element that names the dialog.
 */
type SheetHeading =
  | { title: string; header?: never }
  | { header: (titleId: string) => ReactNode; title?: never };

type BottomSheetProps = SheetHeading & {
  /** ?sheet=<name> opens it; open with openSheet(name) so Back closes it. */
  name: SheetName;
  /** Next to the title on the end side, e.g. "איפוס" (title row only). */
  headerEnd?: ReactNode;
  /** headerEnd holds its own "סגירה" button: the handle then leaves the Tab order (NP-UX-010). */
  closeInHeader?: boolean;
  /** Stays below the scrolling content, e.g. the apply button. */
  footer?: ReactNode;
  /**
   * Opt-in tall sheet (PRD 3.2.4): opens at min(70dvh, content), the handle drags it up to
   * full height, down from full to 70%, down from 70% closes it.
   */
  detents?: readonly ["70", "full"];
  /**
   * The thing the sheet shows, e.g. the name in the name sheet. When it changes while the sheet
   * stays open, the content scrolls back to the top and focus moves to [data-autofocus] again.
   */
  contentKey?: string;
  children: ReactNode;
};

// Dragging the handle down this far (px) closes the sheet (or changes a tall sheet's height).
const DRAG_CLOSE = DETENT_DRAG;
// Full height of a tall sheet: the screen minus the top safe area.
const FULL_HEIGHT = "calc(100dvh - env(safe-area-inset-top))";
// 28 px under the content (board 3), more on phones with a home indicator.
const SAFE_BOTTOM = "pb-[max(1.75rem,env(safe-area-inset-bottom))]";
// The pinned footer's height, on <html> while the sheet is open: ToastRegion sits above it, so a
// toast never covers the sheet's buttons.
const TOAST_LIFT = "--names-toast-lift";

/** Publishes the footer's height as TOAST_LIFT for as long as it is mounted. */
function useToastLift(footer: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const node = footer.current;
    if (!node) return;
    const root = document.documentElement.style;
    const lift = () => root.setProperty(TOAST_LIFT, `${node.offsetHeight}px`);
    lift();
    const observer = new ResizeObserver(lift);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.removeProperty(TOAST_LIFT);
    };
  }, [footer]);
}

/** A new `key` in an open sheet starts it over: content at the top, focus on [data-autofocus]. */
function useContentReset(panel: RefObject<HTMLElement | null>, scroller: RefObject<HTMLDivElement | null>, key: string | undefined) {
  const shown = useRef(key);
  useLayoutEffect(() => {
    if (shown.current === key) return;
    shown.current = key;
    scroller.current?.scrollTo({ top: 0 });
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
  }, [panel, scroller, key]);
}

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

/** The panel itself; exported for markup tests. */
export function SheetPanel({ name, title, header, headerEnd, closeInHeader = false, footer, detents, contentKey, children }: BottomSheetProps) {
  const panel = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useToastLift(footerRef);
  useContentReset(panel, scroller, contentKey);
  const drag = useRef<{ startY: number; startHeight: number; dy: number; moved: boolean } | null>(null);
  // Down: the panel moves down by `offset` px. Up (tall sheets only): it grows to `height` px.
  const [offset, setOffset] = useState(0);
  const [height, setHeight] = useState<number | null>(null);
  const [detent, setDetent] = useState<Detent>("70");
  const tall = Boolean(detents);
  const titleId = useId();
  const close = () => closeSheet(name);
  const onKeyDown = useModal(panel, close);

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startHeight = panel.current?.getBoundingClientRect().height ?? 0;
    drag.current = { startY: event.clientY, startHeight, dy: 0, moved: false };
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    const raw = event.clientY - drag.current.startY;
    const dy = tall ? raw : Math.max(0, raw);
    drag.current.dy = dy;
    if (Math.abs(dy) > 6) drag.current.moved = true;
    setOffset(Math.max(0, dy));
    setHeight(dy < 0 ? drag.current.startHeight - dy : null);
  }

  function onPointerEnd() {
    if (!drag.current) return;
    const { dy, moved } = drag.current;
    const next = tall ? detentAfterDrag(detent, dy, DRAG_CLOSE) : dy >= DRAG_CLOSE ? "close" : detent;
    if (next === "close") close();
    else {
      setDetent(next);
      setOffset(0);
      setHeight(null);
    }
    // A drag isn't a tap: keep `moved` so the click that follows pointerup is ignored.
    drag.current = moved ? { startY: 0, startHeight: 0, dy: 0, moved } : null;
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
        data-detent={tall ? detent : undefined}
        style={
          height !== null
            ? { height, maxHeight: FULL_HEIGHT }
            : offset
              ? { transform: `translateY(${offset}px)` }
              : undefined
        }
        className={`names-sheet-in relative mx-auto flex w-full max-w-lg flex-col rounded-t-xl bg-surface text-ink outline-none ${heightClass(tall, detent)} ${offset || height !== null ? "" : tall ? "transition-[transform,height] duration-200" : "transition-transform duration-200"}`}
      >
        <button
          type="button"
          aria-label="סגירה"
          tabIndex={closeInHeader ? -1 : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onClick={onHandleClick}
          className="relative z-10 mx-auto -mb-1.75 flex h-11 w-24 shrink-0 cursor-grab touch-none justify-center rounded-pill pt-3 active:cursor-grabbing"
        >
          <span aria-hidden="true" className="h-1.25 w-10 rounded-pill bg-line" />
        </button>
        {header ? <div className="shrink-0 px-5 pb-3">{header(titleId)}</div> : null}
        <div ref={scroller} className={`flex min-h-0 flex-col gap-5 ${tall ? "flex-1" : ""} overflow-y-auto overscroll-contain px-5 ${footer ? "pb-5" : SAFE_BOTTOM}`}>
          {header ? null : (
            <div className="flex min-h-11 items-center justify-between gap-3">
              <h2 id={titleId} className="text-title">
                {title}
              </h2>
              {headerEnd}
            </div>
          )}
          {children}
        </div>
        {footer ? (
          <div ref={footerRef} className={`shrink-0 px-5 ${SAFE_BOTTOM}`}>
            {footer}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function heightClass(tall: boolean, detent: Detent): string {
  if (!tall) return "max-h-[calc(100dvh-2.5rem)]";
  return detent === "full"
    ? "h-[calc(100dvh-env(safe-area-inset-top))]"
    : "max-h-[70dvh]";
}
