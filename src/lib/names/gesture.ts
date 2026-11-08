// The card drag (FR-W11), with the landing demo's numbers: a drag starts once it moves 8 px
// mostly sideways (or mostly up); a drag that turns downward first is left to scrolling. On
// release it decides past 100 px, or past 40 px when flung faster than 0.6 px/ms; up past
// 100 px is "אהבתי מאוד". Anything shorter snaps back, and so does a release moving back toward
// the centre (NP-089). A decided card flies off from the finger's speed (flingTiming).

import { DURATION_FLING, DURATION_FLING_QUICK, EASE_OUT } from "@/styles/nest-motion";

export type DragKind = "keep" | "skip" | "love";
/** What a card can leave with: a drag kind, or "hidden" ("דילוג ולא להציג שוב", flies like a skip). */
export type Decision = DragKind | "hidden";
/** 1 when a drag toward the right keeps (RTL: "שמירה" is the right-most action), else −1. */
export type KeepDir = 1 | -1;
export type DragMode = "x" | "up";

export const START_PX = 8;
export const CANCEL_PX = 12;
export const DECIDE_PX = 100;
export const FLING_PX = 40;
export const FLING_PX_PER_MS = 0.6;
/** Holding "דילוג" this long opens the hide menu (US-046); moving more than the slop cancels. */
export const LONG_PRESS_MS = 500;
export const LONG_PRESS_SLOP_PX = 10;
/** A tap (opens the name sheet): released within 10 px of where it went down, within 400 ms. */
export const TAP_SLOP_PX = 10;
export const TAP_MAX_MS = 400;
/** The stamps are fully visible where a release starts to count (DECIDE_PX), never before. */
export const STAMP_PX = DECIDE_PX;
/** A release moving back toward the centre faster than this snaps back, however far out it is. */
export const REVERSE_PX_PER_MS = 0.2;
/** The release speed is read from the moves of the last 80 ms (or the move before, if none is that recent). */
export const VELOCITY_WINDOW_MS = 80;

/** A pointer position (relative to where the drag started) and its time. */
export type Sample = { x: number; y: number; t: number };
export type Velocity = { x: number; y: number };

/**
 * The moves worth keeping for the release speed: the new one, the older ones still inside the
 * window, and at least the one before it (a device that sends moves sparsely still has a speed).
 * A sample where the last one was (the pointerup after the last move) isn't a move: it's dropped,
 * so a finger that rested before lifting reads 0 and one lifted mid-move keeps its speed.
 */
export function keepSamples(samples: Sample[], next: Sample): Sample[] {
  const last = samples.at(-1);
  if (last && last.x === next.x && last.y === next.y) return samples;
  const recent = samples.filter((s) => next.t - s.t <= VELOCITY_WINDOW_MS);
  return [...(recent.length ? recent : samples.slice(-1)), next];
}

/** The pointer's speed in px/ms over the kept moves, or 0 when the last one is older than the window. */
export function releaseVelocity(samples: Sample[], now: number): Velocity {
  const last = samples.at(-1);
  const first = samples[0];
  if (!last || !first || now - last.t > VELOCITY_WINDOW_MS) return { x: 0, y: 0 };
  const dt = last.t - first.t;
  if (dt <= 0) return { x: 0, y: 0 };
  return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
}

/** How a drag that hasn't started yet goes on: a mode, "cancel" (scrolling down), or null (wait). */
export function dragStart(dx: number, dy: number): DragMode | "cancel" | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax >= START_PX && ax >= ay) return "x";
  if (dy <= -START_PX && ay > ax) return "up";
  if (ay > CANCEL_PX) return "cancel";
  return null;
}

/**
 * The decision for a released drag, or null to snap back. `v` is the release velocity: a card
 * that's being pulled back toward the centre when the finger lifts returns (the "I changed my
 * mind" gesture), wherever it is.
 */
export function dragOutcome(
  mode: DragMode,
  dx: number,
  dy: number,
  ms: number,
  dir: KeepDir,
  v: Velocity = { x: 0, y: 0 },
): DragKind | null {
  if (mode === "up") return v.y <= REVERSE_PX_PER_MS && -dy > DECIDE_PX && -dy > Math.abs(dx) ? "love" : null;
  if (dx * v.x < 0 && Math.abs(v.x) > REVERSE_PX_PER_MS) return null;
  const ax = Math.abs(dx);
  const speed = ax / Math.max(1, ms);
  if (ax > DECIDE_PX || (ax > FLING_PX && speed > FLING_PX_PER_MS)) return Math.sign(dx) === dir ? "keep" : "skip";
  return null;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** The card's transform and stamp strengths while dragging. */
export function dragStyle(mode: DragMode, dx: number, dy: number, dir: KeepDir) {
  if (mode === "up") {
    return { transform: `translate(${dx * 0.15}px,${Math.min(0, dy)}px)`, keep: 0, skip: 0, love: clamp01(-dy / STAMP_PX) };
  }
  return {
    transform: `translate(${dx}px,${dy * 0.15}px) rotate(${dx / 16}deg)`,
    keep: clamp01((dx * dir) / STAMP_PX),
    skip: clamp01((-dx * dir) / STAMP_PX),
    love: 0,
  };
}

/** Where a decided card flies (the demo's decide()): off the keep/skip side, or up for love. */
export function flingTo(kind: DragKind, dir: KeepDir): string {
  if (kind === "love") return "translateY(-120%) scale(0.9)";
  const side = kind === "keep" ? dir : -dir;
  return `translateX(${130 * side}%) rotate(${18 * side}deg)`;
}

/** How far a released card still has to go to its flingTo() place, from its size and the drag. */
export function flingDistance(kind: DragKind, dx: number, dy: number, width: number, height: number): number {
  return kind === "love" ? 1.2 * height + Math.min(0, dy) : 1.3 * width - Math.abs(dx);
}

/** The ease-out token's control points; its start speed is y1 / x1 times its average speed. */
const [EASE_X1, EASE_Y1, EASE_X2, EASE_Y2] = EASE_OUT.match(/[\d.]+/g)!.map(Number);
const EASE_START = EASE_Y1 / EASE_X1;

/**
 * The fling's duration and curve (NP-089). The buttons and keys (no speed) take DURATION_FLING
 * with the ease-out token. A released drag (speed in px/ms toward where it flies) hands its
 * speed on, so there's no seam between dragging and flying: the token's curve with its start
 * bent to the finger's speed. A fast flick is shortened (down to DURATION_FLING_QUICK) so the
 * curve can start that fast; a slow or resting release starts no slower than an even pace.
 */
export function flingTiming(distance: number, speed?: number): { duration: number; easing: string } {
  if (speed === undefined) return { duration: DURATION_FLING, easing: EASE_OUT };
  const d = Math.max(1, distance);
  const v = Math.max(0, speed);
  const fit = v > 0 ? (EASE_START * d) / v : Infinity;
  const duration = Math.round(Math.max(DURATION_FLING_QUICK, Math.min(DURATION_FLING, fit)));
  const start = Math.max(1, Math.min(EASE_START, (v * duration) / d));
  if (start === EASE_START) return { duration, easing: EASE_OUT };
  const y1 = Math.round(EASE_X1 * start * 1000) / 1000;
  return { duration, easing: `cubic-bezier(${EASE_X1}, ${y1}, ${EASE_X2}, ${EASE_Y2})` };
}

/** The keep side from the action buttons' positions on screen (PRD 3.2.12), not a constant. */
export function keepDir(root: ParentNode = document): KeepDir {
  const keep = root.querySelector("[data-act=keep]")?.getBoundingClientRect();
  const skip = root.querySelector("[data-act=skip]")?.getBoundingClientRect();
  if (keep && skip && keep.width && skip.width) return keep.left + keep.width / 2 >= skip.left + skip.width / 2 ? 1 : -1;
  return 1; // The app is RTL.
}

/** Whether a pointer held on "דילוג" moved too far to still be a long press. */
export function longPressMoved(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) > LONG_PRESS_SLOP_PX;
}

/** Whether a released pointer was a tap: it stayed within the slop and came up in time. */
export function isTap(dx: number, dy: number, ms: number): boolean {
  return Math.hypot(dx, dy) <= TAP_SLOP_PX && ms <= TAP_MAX_MS;
}
