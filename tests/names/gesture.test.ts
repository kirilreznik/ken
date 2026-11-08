import { describe, expect, it } from "vitest";
import {
  dragOutcome,
  dragStart,
  dragStyle,
  flingDistance,
  flingTiming,
  flingTo,
  isTap,
  keepSamples,
  longPressMoved,
  releaseVelocity,
  START_PX,
} from "@/lib/names/gesture";
import { DURATION_FLING, DURATION_FLING_QUICK, EASE_OUT } from "@/styles/nest-motion";

describe("dragStart", () => {
  it("waits under 8 px", () => {
    expect(dragStart(5, 3)).toBeNull();
    expect(dragStart(-7, 0)).toBeNull();
  });
  it("starts sideways once mostly horizontal", () => {
    expect(dragStart(8, 2)).toBe("x");
    expect(dragStart(-10, 10)).toBe("x");
  });
  it("starts upward once mostly up", () => {
    expect(dragStart(2, -9)).toBe("up");
  });
  it("leaves a downward drag to scrolling", () => {
    expect(dragStart(3, 10)).toBeNull();
    expect(dragStart(3, 13)).toBe("cancel");
  });
});

describe("dragOutcome", () => {
  it("decides past 100 px toward the keep side (RTL: right keeps)", () => {
    expect(dragOutcome("x", 101, 0, 1000, 1)).toBe("keep");
    expect(dragOutcome("x", -101, 0, 1000, 1)).toBe("skip");
  });
  it("follows the keep side when it's on the left", () => {
    expect(dragOutcome("x", 101, 0, 1000, -1)).toBe("skip");
    expect(dragOutcome("x", -101, 0, 1000, -1)).toBe("keep");
  });
  it("decides a fast fling past 40 px", () => {
    expect(dragOutcome("x", 50, 0, 50, 1)).toBe("keep");
    expect(dragOutcome("x", 50, 0, 100, 1)).toBeNull();
    expect(dragOutcome("x", 39, 0, 1, 1)).toBeNull();
  });
  it("snaps back on a short drag", () => {
    expect(dragOutcome("x", 100, 0, 1000, 1)).toBeNull();
  });
  it("loves past 100 px up", () => {
    expect(dragOutcome("up", 0, -101, 1000, 1)).toBe("love");
    expect(dragOutcome("up", 0, -100, 1000, 1)).toBeNull();
    expect(dragOutcome("up", 120, -110, 1000, 1)).toBeNull();
  });
  it("snaps back when released moving back toward the centre (NP-089)", () => {
    expect(dragOutcome("x", -104, 0, 1000, 1, { x: 0.3, y: 0 })).toBeNull();
    expect(dragOutcome("x", 140, 0, 1000, 1, { x: -0.5, y: 0 })).toBeNull();
    expect(dragOutcome("up", 0, -140, 1000, 1, { x: 0, y: 0.3 })).toBeNull();
  });
  it("still decides when the pull-back is slower than 0.2 px/ms, or the finger moves outward", () => {
    expect(dragOutcome("x", -104, 0, 1000, 1, { x: 0.1, y: 0 })).toBe("skip");
    expect(dragOutcome("x", 104, 0, 1000, 1, { x: 1, y: 0 })).toBe("keep");
    expect(dragOutcome("up", 0, -140, 1000, 1, { x: 0, y: -1 })).toBe("love");
  });
});

describe("release velocity", () => {
  it("reads the speed over the last 80 ms of moves", () => {
    let s = [{ x: 0, y: 0, t: 0 }];
    for (let t = 10; t <= 200; t += 10) s = keepSamples(s, { x: -t, y: 0, t });
    expect(s.length).toBeLessThanOrEqual(9);
    expect(releaseVelocity(s, 200)).toEqual({ x: -1, y: 0 });
  });
  it("uses the move before when moves come sparsely (a pull-back from 130 to 104 px in 90 ms)", () => {
    const s = keepSamples([{ x: -130, y: 0, t: 0 }], { x: -104, y: 0, t: 90 });
    expect(releaseVelocity(s, 90).x).toBeCloseTo(0.289);
  });
  it("ignores a pointerup where the last move was", () => {
    let s = keepSamples([{ x: -130, y: 0, t: 0 }], { x: -104, y: 0, t: 90 });
    s = keepSamples(s, { x: -104, y: 0, t: 95 });
    expect(releaseVelocity(s, 95).x).toBeCloseTo(0.289);
  });
  it("is 0 when the finger rested before lifting", () => {
    const s = keepSamples([{ x: 0, y: 0, t: 0 }, { x: 50, y: 0, t: 40 }], { x: 50, y: 0, t: 300 });
    expect(releaseVelocity(s, 300)).toEqual({ x: 0, y: 0 });
    expect(releaseVelocity([{ x: 0, y: 0, t: 0 }, { x: 50, y: 0, t: 40 }], 300)).toEqual({ x: 0, y: 0 });
    expect(releaseVelocity([], 0)).toEqual({ x: 0, y: 0 });
  });
});

describe("fling timing", () => {
  it("takes the full fling with the ease-out token for the buttons and keys", () => {
    expect(flingTiming(0)).toEqual({ duration: DURATION_FLING, easing: EASE_OUT });
  });
  it("starts a released drag at the finger's speed: the token's curve with its start bent", () => {
    const d = flingDistance("skip", -60, 0, 370, 520);
    expect(d).toBeCloseTo(421);
    // 1.2 px/ms over 421 px in 300 ms: a start 0.855× the average speed, floored at an even pace.
    expect(flingTiming(d, 1.2)).toEqual({ duration: DURATION_FLING, easing: "cubic-bezier(0.2, 0.2, 0.2, 1)" });
    // 2.5 px/ms: 1.78× → y1 0.356.
    expect(flingTiming(d, 2.5)).toEqual({ duration: DURATION_FLING, easing: "cubic-bezier(0.2, 0.356, 0.2, 1)" });
    expect(flingTiming(d, 0)).toEqual({ duration: DURATION_FLING, easing: "cubic-bezier(0.2, 0.2, 0.2, 1)" });
  });
  it("shortens a very fast flick so the plain token starts as fast as the finger", () => {
    const d = flingDistance("skip", -60, 0, 370, 520);
    expect(flingTiming(d, 7)).toEqual({ duration: Math.round((4 * d) / 7), easing: EASE_OUT });
    expect(flingTiming(d, 50).duration).toBe(DURATION_FLING_QUICK);
  });
  it("measures love's distance upward", () => {
    expect(flingDistance("love", 0, -100, 370, 500)).toBe(500);
  });
});

describe("dragStyle", () => {
  it("shows the keep stamp on the keep side and caps at 1", () => {
    expect(dragStyle("x", 50, 0, 1)).toMatchObject({ keep: 0.5, skip: 0, love: 0 });
    expect(dragStyle("x", 200, 0, -1)).toMatchObject({ keep: 0, skip: 1 });
    expect(dragStyle("x", 32, 10, 1).transform).toBe("translate(32px,1.5px) rotate(2deg)");
  });
  it("shows the love stamp going up", () => {
    expect(dragStyle("up", 0, -50, 1)).toMatchObject({ keep: 0, skip: 0, love: 0.5 });
  });
});

describe("flingTo", () => {
  it("flies off the decided side, or up for love", () => {
    expect(flingTo("keep", 1)).toBe("translateX(130%) rotate(18deg)");
    expect(flingTo("skip", 1)).toBe("translateX(-130%) rotate(-18deg)");
    expect(flingTo("keep", -1)).toBe("translateX(-130%) rotate(-18deg)");
    expect(flingTo("love", 1)).toBe("translateY(-120%) scale(0.9)");
  });
});

describe("longPressMoved", () => {
  it("allows a 10 px wobble and cancels past it", () => {
    expect(longPressMoved(0, 0)).toBe(false);
    expect(longPressMoved(6, 8)).toBe(false);
    expect(longPressMoved(8, 8)).toBe(true);
    expect(longPressMoved(0, -11)).toBe(true);
  });
});

describe("isTap", () => {
  it("accepts a still tap", () => {
    expect(isTap(0, 0, 80)).toBe(true);
  });
  it("accepts a shaky tap up to 10 px", () => {
    expect(isTap(9, 0, 200)).toBe(true);
    expect(isTap(6, 8, 200)).toBe(true);
  });
  it("rejects 11 px", () => {
    expect(isTap(11, 0, 100)).toBe(false);
    expect(isTap(0, -11, 100)).toBe(false);
  });
  it("rejects a press held past 400 ms", () => {
    expect(isTap(0, 0, 400)).toBe(true);
    expect(isTap(0, 0, 401)).toBe(false);
  });
  it("never starts a drag for a sideways tap below 8 px", () => {
    for (let dx = -(START_PX - 1); dx <= START_PX - 1; dx++) {
      expect(isTap(dx, 0, 100)).toBe(true);
      expect(dragStart(dx, 0)).toBeNull();
    }
  });
  it("never starts a sideways drag for any tap below 8 px across", () => {
    for (let dx = -(START_PX - 1); dx <= START_PX - 1; dx++) {
      for (let dy = -10; dy <= 10; dy++) {
        if (!isTap(dx, dy, 100)) continue;
        expect(dragStart(dx, dy)).not.toBe("x");
      }
    }
  });
});
