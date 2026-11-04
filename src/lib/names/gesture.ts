// The card drag (FR-W11), with the landing demo's numbers: a drag starts once it moves 8 px
// mostly sideways (or mostly up); a drag that turns downward first is left to scrolling. On
// release it decides past 100 px, or past 40 px when flung faster than 0.6 px/ms; up past
// 100 px is "אהבתי מאוד". Anything shorter snaps back.

export type DragKind = "keep" | "skip" | "love";
/** 1 when a drag toward the right keeps (RTL: "שמירה" is the right-most action), else −1. */
export type KeepDir = 1 | -1;
export type DragMode = "x" | "up";

export const START_PX = 8;
export const CANCEL_PX = 12;
export const DECIDE_PX = 100;
export const FLING_PX = 40;
export const FLING_PX_PER_MS = 0.6;
/** The stamps are fully visible at 90 px. */
export const STAMP_PX = 90;

/** How a drag that hasn't started yet goes on: a mode, "cancel" (scrolling down), or null (wait). */
export function dragStart(dx: number, dy: number): DragMode | "cancel" | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax >= START_PX && ax >= ay) return "x";
  if (dy <= -START_PX && ay > ax) return "up";
  if (ay > CANCEL_PX) return "cancel";
  return null;
}

/** The decision for a released drag, or null to snap back. */
export function dragOutcome(mode: DragMode, dx: number, dy: number, ms: number, dir: KeepDir): DragKind | null {
  if (mode === "up") return -dy > DECIDE_PX && -dy > Math.abs(dx) ? "love" : null;
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

/** The keep side from the action buttons' positions on screen (PRD 3.2.12), not a constant. */
export function keepDir(root: ParentNode = document): KeepDir {
  const keep = root.querySelector("[data-act=keep]")?.getBoundingClientRect();
  const skip = root.querySelector("[data-act=skip]")?.getBoundingClientRect();
  if (keep && skip && keep.width && skip.width) return keep.left + keep.width / 2 >= skip.left + skip.width / 2 ? 1 : -1;
  return 1; // The app is RTL.
}
