"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import {
  dragOutcome,
  dragStart,
  dragStyle,
  flingTo,
  isTap,
  keepDir,
  type Decision,
  type DragKind,
  type DragMode,
  type KeepDir,
} from "@/lib/names/gesture";

type Drag = {
  id: number;
  x: number;
  y: number;
  t: number;
  dir: KeepDir;
  mode: DragMode | null;
  dx: number;
  dy: number;
  /** It went down on a control inside the card ("i", "לכל הפרטים"): a tap there is the control's. */
  onControl: boolean;
};

const CONTROLS = "button, a, [role=button]";

/** Classes for the dragged card: the demo's grab cursor, and no text selection while dragging. */
export const dragClass = "cursor-grab select-none active:cursor-grabbing";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Drops the click that follows a tap (touch sends it after pointerup), if one comes soon. */
function swallowNextClick() {
  const stop = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    done();
  };
  const done = () => {
    window.removeEventListener("click", stop, true);
    window.clearTimeout(timer);
  };
  window.addEventListener("click", stop, true);
  const timer = window.setTimeout(done, 500);
}

function paint(el: HTMLElement, transform: string, keep = 0, skip = 0, love = 0) {
  el.style.transform = transform;
  el.style.setProperty("--keep", String(keep));
  el.style.setProperty("--skip", String(skip));
  el.style.setProperty("--love", String(love));
}

/**
 * The card drag (FR-W11) for mouse, touch and pen, like the landing demo's bindDrag(): the card
 * follows the pointer with the stamps showing, and on release it flies off and calls onDecide,
 * or snaps back. The keep side is read from the action buttons when the drag starts (PRD
 * 3.2.12). A card whose content fits keeps every touch gesture (touch-action: none) so a swipe
 * up can love it; a card that scrolls leaves vertical touch to scrolling (pan-y), and the
 * "אהבתי מאוד" button stays the way to love it by touch.
 *
 * Spread `card` on the current card; it's keyed by name, so each card gets a fresh element.
 * `fly(kind)` sends the card off the same way for the buttons and the keys (FR-W11); with
 * reduced motion every decision is a short fade instead of a fling (PRD 3.2.17). The card is
 * focusable (it sits between the chips and the actions in the tab order), and when it had focus
 * the next card takes it, so keyboard users stay on the card; `holdFocus()` does the same
 * before an undo brings the previous card back.
 *
 * A press that never started a drag and comes up as a tap (PRD 3.2.2: `isTap`) calls `onTap`,
 * unless it went down on a control inside the card or a fling is running. The click the
 * browser sends after that tap is swallowed, so it can't land on whatever `onTap` opened.
 */
export function useSwipeDrag({
  onDecide,
  onTap,
  disabled = false,
}: {
  onDecide: (decision: Decision) => void;
  onTap?: () => void;
  disabled?: boolean;
}) {
  const el = useRef<HTMLElement | null>(null);
  const drag = useRef<Drag | null>(null);
  const busy = useRef(false);
  const refocus = useRef(false);
  const observer = useRef<ResizeObserver | null>(null);
  const decide = useRef(onDecide);
  const tap = useRef(onTap);
  useEffect(() => {
    decide.current = onDecide;
    tap.current = onTap;
  }, [onDecide, onTap]);

  const ref = useCallback((node: HTMLElement | null) => {
    observer.current?.disconnect();
    el.current = node;
    drag.current = null;
    busy.current = false;
    if (!node) return;
    if (refocus.current) {
      refocus.current = false;
      node.focus({ preventScroll: true });
    }
    const fit = () => {
      node.style.touchAction = node.scrollHeight > node.clientHeight + 1 ? "pan-y" : "none";
    };
    fit();
    observer.current = new ResizeObserver(fit);
    observer.current.observe(node);
  }, []);
  useEffect(() => () => observer.current?.disconnect(), []);
  // Leaving the window mid-press never sends a pointerup: drop the press and put the card back.
  useEffect(() => {
    const reset = () => {
      const node = el.current;
      const pressed = drag.current;
      drag.current = null;
      if (node && pressed?.mode) paint(node, "");
    };
    window.addEventListener("blur", reset);
    return () => window.removeEventListener("blur", reset);
  }, []);

  const snapBack = () => {
    const node = el.current;
    const s = drag.current;
    drag.current = null;
    if (!node || !s?.mode) return;
    const from = node.style.transform;
    paint(node, "");
    if (from && !reducedMotion()) node.animate([{ transform: from }, { transform: "none" }], { duration: 220, easing: "ease-out" });
  };

  const fling = async (node: HTMLElement, kind: DragKind, dir: KeepDir, decision: Decision = kind) => {
    busy.current = true;
    const from = node.style.transform || "none";
    const frames = reducedMotion()
      ? [{ opacity: 1 }, { opacity: 0 }]
      : [{ transform: from }, { transform: flingTo(kind, dir), opacity: 0.4 }];
    if (kind === "love" && !reducedMotion()) node.style.setProperty("--love", "1");
    try {
      await node.animate(frames, { duration: reducedMotion() ? 160 : 300, easing: "ease-in", fill: "forwards" }).finished;
    } catch {
      // The card was replaced mid-flight.
    }
    if (el.current !== node) return;
    refocus.current = document.activeElement === node;
    decide.current(decision);
    busy.current = false;
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    // A press that never became a drag (it left the card before capture) is replaced, so the
    // card can't get stuck with a dead pending press that blocks the buttons and keys.
    if (disabled || busy.current || e.button > 0 || drag.current?.mode) return;
    const control = e.target instanceof Element ? e.target.closest(CONTROLS) : null;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      dir: keepDir(),
      mode: null,
      dx: 0,
      dy: 0,
      onControl: !!control && control !== e.currentTarget && e.currentTarget.contains(control),
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const s = drag.current;
    if (!s || e.pointerId !== s.id) return;
    s.dx = e.clientX - s.x;
    s.dy = e.clientY - s.y;
    if (!s.mode) {
      const start = dragStart(s.dx, s.dy);
      if (start === "cancel") drag.current = null;
      if (start === "x" || start === "up") {
        s.mode = start;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      if (!s.mode) return;
    }
    const { transform, keep, skip, love } = dragStyle(s.mode, s.dx, s.dy, s.dir);
    paint(e.currentTarget, transform, keep, skip, love);
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const s = drag.current;
    if (!s || e.pointerId !== s.id) return;
    if (!s.mode) {
      drag.current = null;
      const tapped = isTap(e.clientX - s.x, e.clientY - s.y, performance.now() - s.t);
      if (tapped && !s.onControl && !busy.current && !disabled && tap.current) {
        swallowNextClick();
        tap.current();
      }
      return;
    }
    const kind = dragOutcome(s.mode, s.dx, s.dy, performance.now() - s.t, s.dir);
    if (!kind) return snapBack();
    drag.current = null;
    void fling(e.currentTarget, kind, s.dir);
  };

  const onPointerCancel = (e: PointerEvent<HTMLElement>) => {
    if (drag.current?.id === e.pointerId) snapBack();
  };

  // Capture lost without a pointerup (the window lost focus, the OS took the gesture): put the card back.
  // Only the card's own capture counts: on touch the browser first captures the pointer to the inner
  // element under the finger, and moving that capture to the card fires a bubbling lostpointercapture
  // from the child right as the drag starts.
  const onLostPointerCapture = (e: PointerEvent<HTMLElement>) => {
    if (e.target === e.currentTarget && drag.current?.id === e.pointerId) snapBack();
  };

  /** "hidden" leaves the way a skip does. */
  const fly = (decision: Decision) => {
    const node = el.current;
    if (!node || disabled || busy.current || drag.current?.mode) return;
    drag.current = null;
    void fling(node, decision === "hidden" ? "skip" : decision, keepDir(), decision);
  };

  /** Call before anything that replaces the card (undo) to move focus to the new one. */
  const holdFocus = () => {
    refocus.current = !!el.current && document.activeElement === el.current;
  };

  return {
    card: { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, tabIndex: 0 },
    fly,
    holdFocus,
    /** A decision is on its way out; ignore further ones until the next card. */
    busy: () => busy.current,
  };
}
