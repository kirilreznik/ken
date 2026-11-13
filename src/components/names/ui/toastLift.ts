"use client";

import { useCallback, useLayoutEffect } from "react";

// How far ToastRegion sits above the bottom of the screen, on <html> while a source is mounted:
// an open sheet's pinned footer, the deck's action bar, the duel's "עצירה". A toast never covers
// them (NP-BUG-003/004). A sheet wins over the screen under it; among equals the last one mounted.
// A toast that stays until dismissed ("עדכון זמין") also clears the sticky-only sources, e.g. the
// deck card's "לכל הפרטים" above the bar (NP-BUG-011): it sits above the highest of them.
const TOAST_LIFT = "--names-toast-lift";
const STICKY_LIFT = "--names-toast-lift-sticky";
// A sticky-only source is a control inside the screen, not its bottom edge: the pill keeps this
// much air above it so it doesn't read as attached (the spacing scale's step 2).
const STICKY_GAP = 8;

type Source = { layer: boolean; sticky: boolean; lift: () => number | null };
const sources: Source[] = [];

function liftOf(all: Source[], screen: (lifts: (number | null)[]) => number | null) {
  const layers = all.filter((s) => s.layer);
  // An open sheet without a footer puts toasts back in the default spot.
  if (layers.length) return layers.map((s) => s.lift()).findLast((v) => v !== null) ?? null;
  return screen(all.map((s) => s.lift()));
}

function set(name: string, lift: number | null) {
  const root = document.documentElement.style;
  if (lift === null) root.removeProperty(name);
  else root.setProperty(name, `${Math.round(lift)}px`);
}

function apply() {
  set(TOAST_LIFT, liftOf(sources.filter((s) => !s.sticky), (lifts) => lifts.at(-1) ?? null));
  set(STICKY_LIFT, liftOf(sources, (lifts) => {
    const shown = lifts.filter((v) => v !== null);
    return shown.length ? Math.max(...shown) : null;
  }));
}

function add(source: Source) {
  sources.push(source);
  apply();
  return () => {
    sources.splice(sources.indexOf(source), 1);
    apply();
  };
}

/** An open sheet: the screen under it no longer lifts toasts (its footer, if any, does). */
export function useToastLayer() {
  useLayoutEffect(() => add({ layer: true, sticky: false, lift: () => null }), []);
}

/**
 * A callback ref that lifts toasts above its element for as long as it is mounted. `layer`: a
 * sheet's footer, pinned to the bottom (its height). Otherwise a row on the screen: above its top
 * while it shows at the bottom of the screen, the default spot once it is scrolled out of view.
 * `sticky`: only toasts that stay until dismissed clear it.
 */
export function useToastLift({ layer = false, sticky = false } = {}) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      const source: Source = {
        layer,
        sticky,
        lift: () => {
          if (layer) return el.offsetHeight;
          const { top, bottom } = el.getBoundingClientRect();
          return top < innerHeight && bottom > 0 ? innerHeight - top + (sticky ? STICKY_GAP : 0) : null;
        },
      };
      const remove = add(source);
      const observer = new ResizeObserver(apply);
      observer.observe(el);
      if (!layer) {
        addEventListener("resize", apply);
        addEventListener("scroll", apply, { passive: true });
        // A row moved by a transform (the card's entrance, a snap back) is measured once it rests.
        addEventListener("animationend", apply);
        addEventListener("transitionend", apply);
      }
      return () => {
        observer.disconnect();
        if (!layer) {
          removeEventListener("resize", apply);
          removeEventListener("scroll", apply);
          removeEventListener("animationend", apply);
          removeEventListener("transitionend", apply);
        }
        remove();
      };
    },
    [layer, sticky],
  );
}
