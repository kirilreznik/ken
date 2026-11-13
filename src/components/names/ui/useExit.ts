"use client";

import { useCallback, useEffect, useState } from "react";
import { DURATION_FAST } from "@/styles/nest-motion";

// PRD 3.2.12: sheets, dialogs and menus leave in DURATION_FAST at most (DURATION_FADE with reduced
// motion, names.css); they unmount on animationend, or after this if that never fires (NP-098).
export const EXIT_MS = DURATION_FAST + 100;

/**
 * One closing state for every layer: after `open` turns false the layer stays mounted with
 * `closing` (play its -out animation, make it inert) until `onClosed`. With `animate` false it
 * unmounts at once (e.g. another layer replaces it, so the two never overlap).
 */
export function useExit(open: boolean, animate = true) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  if (open && (!mounted || closing)) {
    setMounted(true);
    setClosing(false);
  } else if (!open && mounted && !closing) {
    if (animate) setClosing(true);
    else setMounted(false);
  }
  const onClosed = useCallback(() => {
    setMounted(false);
    setClosing(false);
  }, []);
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClosed, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [closing, onClosed]);
  return { mounted, closing, onClosed };
}
