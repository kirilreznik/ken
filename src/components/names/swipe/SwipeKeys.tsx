"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { isTextTarget, SWIPE_KEYS_HINT, swipeKey, type SwipeKey } from "@/lib/names/keys";

/** id of the shortcut hint; the card, the actions and "ביטול" point aria-describedby at it. */
export const SWIPE_KEYS_ID = "names-swipe-keys";

type SwipeKeysProps = {
  onKey: (key: SwipeKey) => void;
  className?: string;
  children: ReactNode;
};

/**
 * The swipe area's keyboard (FR-W11): while focus is anywhere inside it (the card, the
 * actions, the footer) K keeps, L loves, S skips and Z or Backspace undoes. Enter and Space
 * stay with the focused button. The hint is hidden; screen readers read it as the description
 * of each control that references it.
 */
export default function SwipeKeys({ onKey, className, children }: SwipeKeysProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.defaultPrevented || isTextTarget(e.target)) return;
    const key = swipeKey(e);
    if (!key) return;
    e.preventDefault();
    onKey(key);
  };
  return (
    <div className={className} onKeyDown={onKeyDown}>
      {children}
      <p id={SWIPE_KEYS_ID} hidden>
        {SWIPE_KEYS_HINT}
      </p>
    </div>
  );
}
