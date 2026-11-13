"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { dismissScreenToast } from "@/lib/names/toast";
import { otherLayerOpen, type SheetName } from "@/lib/names/urlLayer";
import { DURATION_FAST, DURATION_SHEET, EASE_OUT } from "@/styles/nest-motion";
import { IconButton } from "./Button";
import { DETENT_DRAG, detentAfterDrag, type Detent } from "./detents";
import { closeSheet, useLayerOpen } from "./layers";
import { useToastLayer, useToastLift } from "./toastLift";
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
// Full height of a tall sheet: the screen minus the top safe area.
const FULL_HEIGHT = "calc(100dvh - env(safe-area-inset-top))";
// 28 px under the content (board 3), more on phones with a home indicator.
const SAFE_BOTTOM = "pb-[max(1.75rem,env(safe-area-inset-bottom))]";
// PRD 3.2.12: a tall sheet slides out in DURATION_FAST (DURATION_FADE with reduced motion, names.css);
// it unmounts on animationend, or after this if that never fires.
const EXIT_MS = DURATION_FAST + 100;
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
// PRD 3.2.4: from 768 px a tall sheet is a centered panel (max 480 px wide, 90vh) without detents.
const DESKTOP = "(min-width: 768px)";
const desktop = () => window.matchMedia(DESKTOP).matches;
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
  // A tall sheet stays mounted while it slides out, unless another layer replaces it (no overlap).
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const onClosed = useCallback(() => setMounted(false), []);
  if (open && (!mounted || closing)) {
    setMounted(true);
    setClosing(false);
  } else if (!open && mounted && !closing) {
    if (props.detents && !otherLayerOpen(search)) setClosing(true);
    else setMounted(false);
  }
  if (!mounted || !host) return null;
  return createPortal(<SheetPanel {...props} closing={closing} onClosed={onClosed} />, host);
}

type PanelProps = BottomSheetProps & {
  /** Sliding out after the URL closed it: no longer modal, inert, gone on `onClosed`. */
  closing?: boolean;
  onClosed?: () => void;
};

/** The panel itself; exported for markup tests. */
export function SheetPanel({ name, title, header, headerEnd, closeInHeader = false, closeButton = false, footer, detents, onDetent, contentKey, closing = false, onClosed, children }: PanelProps) {
  const panel = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const footerRef = useToastLift({ layer: true });
  useToastLayer();
  useEffect(dismissScreenToast, []);
  useContentReset(panel, scroller, contentKey);
  // `detents`: a tall sheet on a phone; on desktop its handle only drags down to close.
  const drag = useRef<{ startY: number; startHeight: number; dy: number; moved: boolean; detents: boolean } | null>(null);
  // Down: the panel moves down by `offset` px. Up (tall sheets only): it grows to `height` px.
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

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => onClosed?.(), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [closing, onClosed]);

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startHeight = panel.current?.getBoundingClientRect().height ?? 0;
    drag.current = { startY: event.clientY, startHeight, dy: 0, moved: false, detents: tall && !desktop() };
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    const raw = event.clientY - drag.current.startY;
    const dy = drag.current.detents ? raw : Math.max(0, raw);
    drag.current.dy = dy;
    // Raw: a drag up on a sheet without detents doesn't move it, but it isn't a tap either.
    if (Math.abs(raw) > 6) drag.current.moved = true;
    setOffset(Math.max(0, dy));
    setHeight(dy < 0 ? drag.current.startHeight - dy : null);
  }

  function onPointerEnd() {
    if (!drag.current) return;
    const { dy, moved, detents: detented } = drag.current;
    const next = detented ? detentAfterDrag(detent, dy, DRAG_CLOSE) : dy >= DRAG_CLOSE ? "close" : detent;
    if (next === "close") close();
    else {
      if (tall && moved && panel.current) {
        settleFrom.current = { height: panel.current.getBoundingClientRect().height, offset: Math.max(0, dy) };
        setSettles((count) => count + 1);
      }
      setDetent(next);
      if (tall && moved) onDetent?.(next);
      setOffset(0);
      setHeight(null);
    }
    // A drag isn't a tap: keep `moved` so the click that follows pointerup is ignored.
    drag.current = moved ? { startY: 0, startHeight: 0, dy: 0, moved, detents: detented } : null;
  }

  function onHandleClick() {
    const moved = drag.current?.moved;
    drag.current = null;
    if (!moved) close();
  }

  return (
    <div ref={layer} data-names-layer onClickCapture={onClickCapture} onPointerDownCapture={selectGuard ? armSelectGuard : undefined} className={`fixed inset-0 z-40 flex flex-col justify-end ${tall ? "md:justify-center md:px-5" : ""} ${closing ? "pointer-events-none" : ""} ${selectGuard ? "select-none [-webkit-touch-callout:none]" : ""}`}>
      <div
        aria-hidden="true"
        className={`${closing ? "names-scrim-out" : "names-scrim-in"} absolute inset-0 bg-(--nest-ink-45)`}
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
        style={
          height !== null
            ? { height, maxHeight: FULL_HEIGHT }
            : offset
              ? { transform: `translateY(${offset}px)` }
              : undefined
        }
        className={`${closing ? "names-sheet-out" : "names-sheet-in"} relative mx-auto flex w-full max-w-lg flex-col rounded-t-xl bg-surface text-ink outline-none ${heightClass(tall, detent)} ${offset || height !== null || tall ? "" : "transition-transform duration-(--nest-duration-fast)"}`}
      >
        <button
          type="button"
          aria-label="סגירה"
          tabIndex={closeInHeader || closeButton ? -1 : undefined}
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
              {closeButton ? (
                <div className="flex items-center gap-2">
                  {headerEnd}
                  <IconButton aria-label="סגירה" onClick={close}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
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
  // Desktop: a centered panel with all corners round, as high as its content up to 90vh.
  const panel = "md:h-auto md:max-h-[90vh] md:max-w-[480px] md:rounded-xl";
  return detent === "full"
    ? `h-[calc(100dvh-env(safe-area-inset-top))] ${panel}`
    : `max-h-[70dvh] ${panel}`;
}
