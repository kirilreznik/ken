"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import {
  dragOutcome,
  dragStart,
  dragStyle,
  flingTo,
  keepDir,
  type DragKind,
  type DragMode,
  type KeepDir,
} from "@/lib/names/gesture";

type Drag = { id: number; x: number; y: number; t: number; dir: KeepDir; mode: DragMode | null; dx: number; dy: number };

/** Classes for the dragged card: the demo's grab cursor, and no text selection while dragging. */
export const dragClass = "cursor-grab select-none active:cursor-grabbing";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
 */
export function useSwipeDrag({ onDecide, disabled = false }: { onDecide: (kind: DragKind) => void; disabled?: boolean }) {
  const el = useRef<HTMLElement | null>(null);
  const drag = useRef<Drag | null>(null);
  const busy = useRef(false);
  const refocus = useRef(false);
  const observer = useRef<ResizeObserver | null>(null);
  const decide = useRef(onDecide);
  useEffect(() => {
    decide.current = onDecide;
  }, [onDecide]);

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

  const snapBack = () => {
    const node = el.current;
    const s = drag.current;
    drag.current = null;
    if (!node || !s?.mode) return;
    const from = node.style.transform;
    paint(node, "");
    if (from && !reducedMotion()) node.animate([{ transform: from }, { transform: "none" }], { duration: 220, easing: "ease-out" });
  };

  const fling = async (node: HTMLElement, kind: DragKind, dir: KeepDir) => {
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
    decide.current(kind);
    busy.current = false;
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (disabled || busy.current || e.button > 0 || drag.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dir: keepDir(), mode: null, dx: 0, dy: 0 };
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

  const fly = (kind: DragKind) => {
    const node = el.current;
    if (!node || disabled || busy.current || drag.current) return;
    void fling(node, kind, keepDir());
  };

  /** Call before anything that replaces the card (undo) to move focus to the new one. */
  const holdFocus = () => {
    refocus.current = !!el.current && document.activeElement === el.current;
  };

  return {
    card: { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, tabIndex: 0 },
    fly,
    holdFocus,
    /** A decision is on its way out; ignore further ones until the next card. */
    busy: () => busy.current,
  };
}
