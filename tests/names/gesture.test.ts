import { describe, expect, it } from "vitest";
import { dragOutcome, dragStart, dragStyle, flingTo, longPressMoved } from "@/lib/names/gesture";

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
});

describe("dragStyle", () => {
  it("shows the keep stamp on the keep side and caps at 1", () => {
    expect(dragStyle("x", 45, 0, 1)).toMatchObject({ keep: 0.5, skip: 0, love: 0 });
    expect(dragStyle("x", 200, 0, -1)).toMatchObject({ keep: 0, skip: 1 });
    expect(dragStyle("x", 32, 10, 1).transform).toBe("translate(32px,1.5px) rotate(2deg)");
  });
  it("shows the love stamp going up", () => {
    expect(dragStyle("up", 0, -45, 1)).toMatchObject({ keep: 0, skip: 0, love: 0.5 });
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
