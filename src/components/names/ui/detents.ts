/** The two heights of a tall sheet (PRD 3.2.4): min(70dvh, content) and full height. */
export type Detent = "70" | "full";

/** What a handle drag ends in: a height, or closing the sheet. */
export type DetentResult = Detent | "close";

// A handle drag shorter than this (px) snaps back to where it started.
export const DETENT_DRAG = 96;
// ...unless it's a flick: let go at this speed (px/ms) after at least FLICK_MIN px (NP-106).
export const FLICK_VELOCITY = 0.5;
export const FLICK_MIN = 24;

/**
 * Where a handle drag of `dy` px (down > 0, up < 0) from `from` ends: up from 70% goes to
 * full, down from full goes to 70%, down from 70% closes; anything shorter stays put unless
 * it was let go at `velocity` px/ms (same sign as `dy`) of at least FLICK_VELOCITY.
 */
export function detentAfterDrag(from: Detent, dy: number, threshold = DETENT_DRAG, velocity = 0): DetentResult {
  const flick = Math.abs(dy) >= FLICK_MIN && Math.abs(velocity) >= FLICK_VELOCITY && Math.sign(velocity) === Math.sign(dy);
  if (dy <= -threshold || (flick && dy < 0)) return "full";
  if (dy >= threshold || (flick && dy > 0)) return from === "full" ? "70" : "close";
  return from;
}
