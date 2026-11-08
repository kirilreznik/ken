// A list row that leaves (removed, hidden, restored): it fades, then its height closes so the
// rows below slide up instead of jumping (NP-137). Reduced motion: a fade only. Durations and
// the curve are the sheets' (names.css); there are no motion tokens yet.

const EXIT_MS = 200;
const EXIT_FADE_MS = 160;
const EASE_OUT = "cubic-bezier(0.2, 0.8, 0.2, 1)";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Plays the exit on `row`, then calls `done` (which takes the row out of the data). A second
 * call on a row that is already leaving does nothing, so a double tap acts once.
 */
export function collapseRow(row: HTMLElement | null | undefined, done: () => void): void {
  if (!row || typeof row.animate !== "function") return done();
  if (row.dataset.leaving !== undefined) return;
  row.dataset.leaving = "";
  row.inert = true;
  const frames: Keyframe[] = reducedMotion()
    ? [{ opacity: 1 }, { opacity: 0 }]
    : [
        { opacity: 1, height: `${row.offsetHeight}px`, overflow: "hidden" },
        { opacity: 0, offset: 0.4 },
        { opacity: 0, height: "0px", paddingTop: "0px", paddingBottom: "0px", borderBottomWidth: "0px", overflow: "hidden" },
      ];
  const animation = row.animate(frames, { duration: reducedMotion() ? EXIT_FADE_MS : EXIT_MS, easing: EASE_OUT, fill: "forwards" });
  animation.finished.then(done, done);
}
