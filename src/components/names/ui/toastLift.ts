"use client";

import { useCallback, useLayoutEffect } from "react";

// How far ToastRegion sits above the bottom of the screen, on <html> while a source is mounted:
// an open sheet's pinned footer, the deck's action bar, the duel's "עצירה". A toast never covers
// them (NP-BUG-003/004). A sheet wins over the screen under it; among equals the last one mounted.
const TOAST_LIFT = "--names-toast-lift";

type Source = { layer: boolean; lift: () => number | null };
const sources: Source[] = [];

function apply() {
  const layers = sources.filter((s) => s.layer);
  // An open sheet without a footer puts toasts back in the default spot.
  const lift = layers.length ? (layers.map((s) => s.lift()).findLast((v) => v !== null) ?? null) : (sources.at(-1)?.lift() ?? null);
  const root = document.documentElement.style;
  if (lift === null) root.removeProperty(TOAST_LIFT);
  else root.setProperty(TOAST_LIFT, `${Math.round(lift)}px`);
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
  useLayoutEffect(() => add({ layer: true, lift: () => null }), []);
}

/**
 * A callback ref that lifts toasts above its element for as long as it is mounted. `layer`: a
 * sheet's footer, pinned to the bottom (its height). Otherwise a row on the screen: above its top
 * while it shows at the bottom of the screen, the default spot once it is scrolled out of view.
 */
export function useToastLift({ layer = false } = {}) {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      const source: Source = {
        layer,
        lift: () => {
          if (layer) return el.offsetHeight;
          const { top, bottom } = el.getBoundingClientRect();
          return top < innerHeight && bottom > 0 ? innerHeight - top : null;
        },
      };
      const remove = add(source);
      const observer = new ResizeObserver(apply);
      observer.observe(el);
      if (!layer) {
        addEventListener("resize", apply);
        addEventListener("scroll", apply, { passive: true });
      }
      return () => {
        observer.disconnect();
        if (!layer) {
          removeEventListener("resize", apply);
          removeEventListener("scroll", apply);
        }
        remove();
      };
    },
    [layer],
  );
}
