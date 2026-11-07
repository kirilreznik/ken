/** The two heights of a tall sheet (PRD 3.2.4): min(70dvh, content) and full height. */
export type Detent = "70" | "full";

/** What a handle drag ends in: a height, or closing the sheet. */
export type DetentResult = Detent | "close";

// A handle drag shorter than this (px) snaps back to where it started.
export const DETENT_DRAG = 96;

/**
 * Where a handle drag of `dy` px (down > 0, up < 0) from `from` ends: up from 70% goes to
 * full, down from full goes to 70%, down from 70% closes; anything shorter stays put.
 */
export function detentAfterDrag(from: Detent, dy: number, threshold = DETENT_DRAG): DetentResult {
  if (dy <= -threshold) return "full";
  if (dy >= threshold) return from === "full" ? "70" : "close";
  return from;
}
