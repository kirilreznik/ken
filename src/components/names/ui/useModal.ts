"use client";

import { useEffect, useSyncExternalStore, type KeyboardEvent, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const noSubscribe = () => () => {};

/** The .nest-names wrapper sheets and dialogs portal into (keeps the scoped base styles). */
export function usePortalHost(): HTMLElement | null {
  return useSyncExternalStore(
    noSubscribe,
    () => document.querySelector<HTMLElement>(".nest-names") ?? document.body,
    () => null,
  );
}

// Open modal layers, oldest first; only the top one handles Escape and Tab.
const stack: HTMLElement[] = [];
let scrollLocks = 0;

/**
 * Modal behaviour for a sheet or dialog panel while it is mounted: everything outside it is
 * inert, the page doesn't scroll, focus moves in ([data-autofocus] or the panel) and goes
 * back to the opener on close. Returns the panel's keydown handler (Escape, Tab wrap).
 * `active` false (a sheet sliding out) releases all of that while the panel stays mounted.
 */
export function useModal(panel: RefObject<HTMLElement | null>, onClose: () => void, active = true) {
  useEffect(() => {
    const el = panel.current;
    if (!el || !active) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const layer = el.closest<HTMLElement>("[data-names-layer]") ?? el;

    // Inert every sibling of the layer and of its ancestors, except other layers (the toast).
    const madeInert: HTMLElement[] = [];
    for (let node: HTMLElement | null = layer; node && node !== document.body; node = node.parentElement) {
      for (const sibling of Array.from(node.parentElement?.children ?? [])) {
        if (sibling === node || !(sibling instanceof HTMLElement)) continue;
        if (sibling.inert || sibling.hasAttribute("data-names-layer-keep")) continue;
        sibling.inert = true;
        madeInert.push(sibling);
      }
    }
    stack.push(el);
    if (scrollLocks++ === 0) document.documentElement.style.overflow = "hidden";

    const target = el.querySelector<HTMLElement>("[data-autofocus]") ?? el;
    target.focus({ preventScroll: true });

    return () => {
      for (const node of madeInert) node.inert = false;
      stack.splice(stack.indexOf(el), 1);
      if (--scrollLocks === 0) document.documentElement.style.overflow = "";
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [panel, active]);

  return function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const el = panel.current;
    if (!el || !active || stack[stack.length - 1] !== el) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      // Roving-tabindex options (tabIndex -1) match the selector but aren't Tab stops.
      (item) => item.tabIndex >= 0 && item.getClientRects().length > 0,
    );
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === el)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
}
