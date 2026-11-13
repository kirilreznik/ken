"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { dismissScreenToast } from "@/lib/names/toast";
import { otherLayerOpen, type SheetName } from "@/lib/names/urlLayer";
import { DURATION_FAST, DURATION_SHEET, EASE_OUT } from "@/styles/nest-motion";
import { IconButton } from "./Button";
import { CloseIcon } from "./icons";
import { DETENT_DRAG, detentAfterDrag, type Detent } from "./detents";
import { closeSheet, useLayerOpen } from "./layers";
import { useToastLayer, useToastLift } from "./toastLift";
import { useExit } from "./useExit";
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
  /** The custom header holds its own "סגירה" button: the handle then leaves the Tab order (NP-UX-010). */
  closeInHeader?: boolean;
  /**
   * A "סגירה" X at the end of the title row, after `headerEnd` (title row only). The handle then
   * leaves the Tab order, as with `closeInHeader` (NP-110).
   */
  closeButton?: boolean;
  /** Stays below the scrolling content, e.g. the apply button. */
  footer?: ReactNode;
  /**
   * Opt-in tall sheet (PRD 3.2.4): opens at min(70dvh, content), the handle drags it up to
   * full height, down from full to 70%, down from 70% closes it.
   */
  detents?: readonly ["70", "full"];
  /** A tall sheet's handle settled it at a detent (not on a close). */
  onDetent?: (detent: Detent) => void;
  /**
   * The thing the sheet shows, e.g. the name in the name sheet. When it changes while the sheet
   * stays open, the content scrolls back to the top and focus moves to [data-autofocus] again.
   */
  contentKey?: string;
  children: ReactNode;
};

// Dragging the handle down this far (px) closes the sheet (or changes a tall sheet's height).
const DRAG_CLOSE = DETENT_DRAG;
// A pause this long (ms) between the last move and letting go means it wasn't a flick.
const FLICK_HOLD_MS = 100;
// Full height of a tall sheet: the screen minus the top safe area.
const FULL_HEIGHT = "calc(100dvh - env(safe-area-inset-top))";
// 28 px under the content (board 3), more on phones with a home indicator.
const SAFE_BOTTOM = "pb-[max(1.75rem,env(safe-area-inset-bottom))]";
// PRD 3.2.2: a card tap opens the sheet on pointerup. Quick taps that follow land on the scrim or
// on the sliding panel's controls before it has slid in (DURATION_SHEET); for this long after opening,
// clicks in the layer do nothing (no close, no decision).
const OPEN_GUARD_MS = DURATION_SHEET + 90;
// Mobile Safari turns a quick double tap on the card into a word selection in the sheet that just
// opened under the second tap (ND-BUG-007). Text in the layer can't be selected until the taps that
// opened it stop: this long after opening, or after the last press in the layer during it. A
// selection made in it meanwhile is dropped when the guard ends.
const SELECT_GUARD_MS = 600;
// A tall sheet settling after a handle drag (new detent or snap back), as the slide-in eases.
const SETTLE = { duration: DURATION_FAST, easing: EASE_OUT } as const;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// PRD 3.2.4: from 768 px a tall sheet is a centered panel (max 480 px wide, 90dvh) without detents.
const DESKTOP = "(min-width: 768px)";
const desktop = () => window.matchMedia(DESKTOP).matches;
// Past its limit the panel follows the finger less and less, then springs back on release (NP-108).
const RUBBER = 0.55;
const RUBBER_MAX = 120;
// A drag that starts on one of these in the header / title row is theirs, not the sheet's (NP-107).
const CONTROL = "button, a, input, select, textarea, label, [role=button], [role=switch], [role=tab], [contenteditable]";
const onControl = (event: PointerEvent<HTMLElement>) =>
  event.target instanceof Element && event.target.closest(CONTROL) !== null && event.currentTarget.contains(event.target.closest(CONTROL));
const rubberband = (overshoot: number) => (overshoot * RUBBER_MAX * RUBBER) / (RUBBER_MAX + RUBBER * overshoot);
/** FULL_HEIGHT in px (the safe-area inset only resolves in CSS). */
function fullHeightPx(host: HTMLElement): number {
  const probe = document.createElement("div");
  probe.style.cssText = `position:fixed;visibility:hidden;height:${FULL_HEIGHT}`;
  host.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
}
// The scrolling content fades over this many px at an edge with more beyond it (NP-109).
const FADE_PX = 24;
function fadeMask(more: { top: boolean; bottom: boolean }): string | undefined {
  if (!more.top && !more.bottom) return undefined;
  const top = more.top ? `transparent 0, #000 ${FADE_PX}px` : "#000 0";
  const bottom = more.bottom ? `#000 calc(100% - ${FADE_PX}px), transparent 100%` : "#000 100%";
  return `linear-gradient(to bottom, ${top}, ${bottom})`;
}
function edgesOf(el: HTMLElement) {
  return (m: { top: boolean; bottom: boolean }) => {
    const top = el.scrollTop > 1;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    return m.top === top && m.bottom === bottom ? m : { top, bottom };
  };
}
/** Which edges of the scroller have content past them; follows scrolling and resizes. */
function useScrollEdges(scroller: RefObject<HTMLDivElement | null>) {
  const [more, setMore] = useState({ top: false, bottom: false });
  const update = () => {
    const el = scroller.current;
    if (el) setMore(edgesOf(el));
  };
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    // observe() reports the first size right away, so this also sets the starting edges.
    const observer = new ResizeObserver(() => setMore(edgesOf(el)));
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [scroller]);
  return { more, update };
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
  const search = useSearchParams().toString();
  const host = usePortalHost();
  // Every sheet stays mounted while it slides out (NP-098), unless another layer replaces it (no overlap).
  const { mounted, closing, onClosed } = useExit(open, !otherLayerOpen(search));
  if (!mounted || !host) return null;
  return createPortal(<SheetPanel {...props} closing={closing} onClosed={onClosed} />, host);
}

type PanelProps = BottomSheetProps & {
  /** Sliding out after the URL closed it: no longer modal, inert, gone on `onClosed` (useExit's timer is the fallback). */
  closing?: boolean;
  onClosed?: () => void;
};

/** The panel itself; exported for markup tests. */
export function SheetPanel({ name, title, header, headerEnd, closeInHeader = false, closeButton = false, footer, detents, onDetent, contentKey, closing = false, onClosed, children }: PanelProps) {
  const panel = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scroller);
  const footerRef = useToastLift({ layer: true });
  useToastLayer();
  useEffect(dismissScreenToast, []);
  useContentReset(panel, scroller, contentKey);
  // `detents`: a tall sheet on a phone; on desktop its handle only drags down to close.
  // `at`/`velocity`: the last move's time and the drag's speed in px/ms (down > 0), for flicks (NP-106).
  // `full`: a tall sheet's full height in px, where its growth turns into a rubber band (NP-108).
  const drag = useRef<{ startY: number; startHeight: number; dy: number; moved: boolean; detents: boolean; at: number; velocity: number; full: number } | null>(null);
  // Down: the panel moves down by `offset` px. Up: a tall sheet grows to `height` px; past its
  // limit (full height, or where it is for other sheets) it rubber-bands up (negative `offset`).
  const [offset, setOffset] = useState(0);
  const [height, setHeight] = useState<number | null>(null);
  const [detent, setDetent] = useState<Detent>("70");
  const tall = Boolean(detents);
  const titleId = useId();
  const close = () => closeSheet(name);
  const onKeyDown = useModal(panel, close, !closing);
  // Where the panel was when a tall sheet's handle was let go; the layout effect eases from it.
  const settleFrom = useRef<{ height: number; offset: number } | null>(null);
  const [settles, setSettles] = useState(0);
  const shownAt = useRef(0);
  const layer = useRef<HTMLDivElement>(null);
  const [selectGuard, setSelectGuard] = useState(true);
  const selectTimer = useRef(0);
  useEffect(() => {
    if (!closing) shownAt.current = performance.now();
  }, [closing]);
  const armSelectGuard = useCallback(() => {
    window.clearTimeout(selectTimer.current);
    selectTimer.current = window.setTimeout(() => {
      setSelectGuard(false);
      const selection = window.getSelection();
      if (selection?.anchorNode && layer.current?.contains(selection.anchorNode)) selection.removeAllRanges();
    }, SELECT_GUARD_MS);
  }, []);
  useEffect(() => {
    armSelectGuard();
    return () => window.clearTimeout(selectTimer.current);
  }, [armSelectGuard]);
  const onClickCapture = (event: MouseEvent) => {
    if (performance.now() - shownAt.current >= OPEN_GUARD_MS) return;
    event.stopPropagation();
    event.preventDefault();
  };

  useLayoutEffect(() => {
    const from = settleFrom.current;
    const el = panel.current;
    settleFrom.current = null;
    if (!from || !el || reducedMotion()) return;
    const to = el.getBoundingClientRect().height;
    if (Math.abs(to - from.height) < 1 && from.offset === 0) return;
    el.animate(
      [
        // maxHeight: the 70% detent's max-h would cap the height on the way down from full.
        { height: `${from.height}px`, maxHeight: "none", transform: `translateY(${from.offset}px)` },
        { height: `${to}px`, maxHeight: "none", transform: "translateY(0)" },
      ],
      SETTLE,
    );
  }, [settles]);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    if (event.currentTarget !== event.target && onControl(event)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startHeight = panel.current?.getBoundingClientRect().height ?? 0;
    const detented = tall && !desktop();
    const full = detented && layer.current ? fullHeightPx(layer.current) : 0;
    drag.current = { startY: event.clientY, startHeight, dy: 0, moved: false, detents: detented, at: event.timeStamp, velocity: 0, full };
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!drag.current) return;
    const raw = event.clientY - drag.current.startY;
    const { detents: detented, startHeight, full } = drag.current;
    const dy = detented ? raw : Math.max(0, raw);
    const elapsed = event.timeStamp - drag.current.at;
    if (elapsed > 0) {
      // Smoothed so one jittery sample doesn't make or break a flick.
      drag.current.velocity = 0.2 * drag.current.velocity + (0.8 * (dy - drag.current.dy)) / elapsed;
      drag.current.at = event.timeStamp;
    }
    drag.current.dy = dy;
    // Raw: a drag up on a sheet without detents doesn't move it, but it isn't a tap either.
    if (Math.abs(raw) > 6) drag.current.moved = true;
    if (raw >= 0) {
      setOffset(dy);
      setHeight(null);
    } else if (detented) {
      const grown = startHeight - raw;
      setHeight(Math.min(grown, Math.max(full, startHeight)));
      setOffset(grown > full ? -rubberband(grown - Math.max(full, startHeight)) : 0);
    } else {
      setOffset(-rubberband(-raw));
      setHeight(null);
    }
  }

  function onPointerEnd(event: PointerEvent<HTMLElement>) {
    if (!drag.current) return;
    const { dy, moved, detents: detented, at } = drag.current;
    // A hold before letting go isn't a flick.
    const velocity = event.timeStamp - at > FLICK_HOLD_MS ? 0 : drag.current.velocity;
    const next = detented
      ? detentAfterDrag(detent, dy, DRAG_CLOSE, velocity)
      : detentAfterDrag("70", dy, DRAG_CLOSE, velocity) === "close"
        ? "close"
        : detent;
    if (next === "close") close();
    else {
      if (tall && moved && panel.current) {
        settleFrom.current = { height: panel.current.getBoundingClientRect().height, offset };
        setSettles((count) => count + 1);
      }
      setDetent(next);
      if (tall && moved) onDetent?.(next);
      setOffset(0);
      setHeight(null);
    }
    // A drag isn't a tap: keep `moved` so the click that follows pointerup is ignored.
    drag.current = moved ? { startY: 0, startHeight: 0, dy: 0, moved, detents: detented, at: 0, velocity: 0, full: 0 } : null;
  }

  // The browser took the pointer (scroll, system gesture): the sheet goes back to where it was, never closes (NP-105).
  function onPointerCancel() {
    if (!drag.current) return;
    const { moved } = drag.current;
    if (tall && moved && panel.current) {
      settleFrom.current = { height: panel.current.getBoundingClientRect().height, offset };
      setSettles((count) => count + 1);
    }
    setOffset(0);
    setHeight(null);
    drag.current = null;
  }

  // The header / title row drag the sheet like the handle (NP-107); a drag there isn't a click on it.
  const rowDrag = {
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
    onPointerCancel,
    onClickCapture: (event: MouseEvent) => {
      const moved = drag.current?.moved;
      drag.current = null;
      if (!moved) return;
      event.stopPropagation();
      event.preventDefault();
    },
  };

  function onHandleClick() {
    const moved = drag.current?.moved;
    drag.current = null;
    if (!moved) close();
  }

  return (
    <div ref={layer} data-names-layer onClickCapture={onClickCapture} onPointerDownCapture={selectGuard ? armSelectGuard : undefined} className={`fixed inset-0 z-40 flex flex-col justify-end ${tall ? "md:justify-center md:px-5" : ""} ${closing ? "pointer-events-none" : ""} ${selectGuard ? "select-none [-webkit-touch-callout:none]" : ""}`}>
      <div
        aria-hidden="true"
        className={`${closing ? "names-scrim-out" : "names-scrim-in"} absolute inset-0 bg-ink-45`}
        // A press on the scrim never takes focus out of the dialog (it only closes it, on click).
        onMouseDown={(event) => event.preventDefault()}
        onClick={closing ? undefined : close}
      />
      <section
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        inert={closing}
        onKeyDown={onKeyDown}
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) onClosed?.();
        }}
        data-names-bg="none"
        data-detent={tall ? detent : undefined}
        style={{
          ...(height !== null ? { height, maxHeight: FULL_HEIGHT } : null),
          ...(offset ? { transform: `translateY(${offset}px)` } : null),
        }}
        className={`${closing ? "names-sheet-out" : "names-sheet-in"} relative mx-auto flex w-full max-w-lg flex-col rounded-t-xl bg-surface text-ink outline-none ${heightClass(tall, detent)} ${offset || height !== null || tall ? "" : "transition-transform duration-(--nest-duration-fast)"}`}
      >
        <button
          type="button"
          aria-label="סגירה"
          // With a "סגירה" button in the header the handle is only for dragging: out of the Tab order
          // and hidden from screen readers, so they hear one "סגירה" (NP-111).
          aria-hidden={closeInHeader || closeButton ? true : undefined}
          tabIndex={closeInHeader || closeButton ? -1 : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerCancel}
          onClick={onHandleClick}
          className="relative z-10 mx-auto -mb-1.75 flex h-11 w-24 shrink-0 cursor-grab touch-none justify-center rounded-pill pt-3 active:cursor-grabbing"
        >
          <span aria-hidden="true" className="h-1.25 w-10 rounded-pill bg-line" />
        </button>
        {header ? (
          <div {...rowDrag} className="shrink-0 touch-none px-5 pb-3">
            {header(titleId)}
          </div>
        ) : null}
        <div
          ref={scroller}
          onScroll={edges.update}
          style={{ maskImage: fadeMask(edges.more), WebkitMaskImage: fadeMask(edges.more) }}
          className={`flex min-h-0 flex-col gap-5 ${tall ? "flex-1" : ""} overflow-y-auto overscroll-contain px-5 ${footer ? "pb-5" : SAFE_BOTTOM}`}>
          {header ? null : (
            <div {...rowDrag} className="flex min-h-11 touch-none items-center justify-between gap-3">
              <h2 id={titleId} className="text-title">
                {title}
              </h2>
              {closeButton ? (
                <div className="flex items-center gap-2">
                  {headerEnd}
                  <IconButton aria-label="סגירה" onClick={close}>
                    <CloseIcon />
                  </IconButton>
                </div>
              ) : (
                headerEnd
              )}
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
  // Desktop: a centered panel with all corners round, as high as its content up to 90dvh (NP-050).
  const panel = "md:h-auto md:max-h-[90dvh] md:max-w-content md:rounded-xl";
  return detent === "full"
    ? `h-[calc(100dvh-env(safe-area-inset-top))] ${panel}`
    : `max-h-[70dvh] ${panel}`;
}
