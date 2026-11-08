import { afterEach, describe, expect, it, vi } from "vitest";
import { collapseRow } from "@/components/names/ui/collapseRow";

// A stand-in row: just what collapseRow reads and writes.
function fakeRow() {
  const animate = vi.fn(() => ({ finished: Promise.resolve() }));
  return { row: { dataset: {} as DOMStringMap, inert: false, offsetHeight: 73, animate } as unknown as HTMLElement, animate };
}

function setReduced(reduce: boolean) {
  vi.stubGlobal("window", { matchMedia: () => ({ matches: reduce }) });
}

afterEach(() => vi.unstubAllGlobals());

describe("collapseRow", () => {
  it("fades and closes the row, then calls done once", async () => {
    setReduced(false);
    const { row, animate } = fakeRow();
    const done = vi.fn();
    collapseRow(row, done);
    collapseRow(row, done);
    await Promise.resolve();
    await Promise.resolve();
    expect(animate).toHaveBeenCalledTimes(1);
    const [frames, options] = animate.mock.calls[0] as unknown as [Keyframe[], KeyframeAnimationOptions];
    expect(frames[0]).toMatchObject({ height: "73px", opacity: 1 });
    expect(frames.at(-1)).toMatchObject({ height: "0px", opacity: 0 });
    expect(options.duration).toBeLessThanOrEqual(200);
    expect(row.inert).toBe(true);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("only fades with reduced motion", () => {
    setReduced(true);
    const { row, animate } = fakeRow();
    collapseRow(row, () => {});
    const [frames] = animate.mock.calls[0] as unknown as [Keyframe[]];
    expect(frames.every((f) => !("height" in f))).toBe(true);
  });

  it("calls done right away without a row", () => {
    const done = vi.fn();
    collapseRow(null, done);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
