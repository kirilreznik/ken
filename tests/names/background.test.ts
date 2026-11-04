import { describe, expect, it } from "vitest";
import {
  OWN_SCRIM_BASE,
  OWN_SCRIM_MAX,
  averageLuminance,
  cardRegion,
  coverSourceRect,
  effectiveBackground,
  ownScrimOpacity,
} from "@/lib/names/background";

describe("effectiveBackground", () => {
  it("falls back to fabric when the own photo is missing", () => {
    expect(effectiveBackground("own", false)).toBe("fabric");
    expect(effectiveBackground("own", true)).toBe("own");
  });

  it("keeps every other choice", () => {
    for (const bg of ["none", "fabric", "notebook", "nursery"] as const) {
      expect(effectiveBackground(bg, false)).toBe(bg);
    }
  });
});

describe("cardRegion", () => {
  it("is the padded column on a phone", () => {
    expect(cardRegion({ width: 390, height: 844 })).toEqual({ x: 20, y: 844 * 0.22, width: 350, height: 844 * 0.58 });
  });

  it("is centered and capped at 480 on desktop", () => {
    const r = cardRegion({ width: 1280, height: 800 });
    expect(r.width).toBe(440);
    expect(r.x).toBe(420);
  });
});

describe("coverSourceRect", () => {
  it("is the identity when the image matches the viewport", () => {
    const vp = { width: 400, height: 800 };
    expect(coverSourceRect(vp, vp, { x: 10, y: 20, width: 100, height: 200 })).toEqual({ x: 10, y: 20, width: 100, height: 200 });
  });

  it("accounts for the cropped sides of a wide image", () => {
    // 1600x800 image covering 400x800: scale 1, 600 px cropped on each side.
    const r = coverSourceRect({ width: 400, height: 800 }, { width: 1600, height: 800 }, { x: 0, y: 0, width: 400, height: 800 });
    expect(r).toEqual({ x: 600, y: 0, width: 400, height: 800 });
  });

  it("scales into a large image and stays inside it", () => {
    // 1200x2400 image covering 400x800: scale 1/3.
    const r = coverSourceRect({ width: 400, height: 800 }, { width: 1200, height: 2400 }, { x: 0, y: 400, width: 400, height: 800 });
    expect(r).toEqual({ x: 0, y: 1200, width: 1200, height: 1200 });
  });
});

const pixels = (rgba: number[], n: number) => Array.from({ length: n }, () => rgba).flat();

describe("averageLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(averageLuminance(pixels([0, 0, 0, 255], 4))).toBe(0);
    expect(averageLuminance(pixels([255, 255, 255, 255], 4))).toBeCloseTo(1);
  });

  it("averages and skips transparent pixels", () => {
    const data = [...pixels([0, 0, 0, 255], 1), ...pixels([255, 255, 255, 255], 1), ...pixels([0, 0, 0, 0], 2)];
    expect(averageLuminance(data)).toBeCloseTo(0.5);
  });

  it("treats empty data as bright", () => {
    expect(averageLuminance([])).toBe(1);
  });
});

describe("ownScrimOpacity", () => {
  it("is the base for bright photos and the max for black", () => {
    expect(ownScrimOpacity(0.9)).toBe(OWN_SCRIM_BASE);
    expect(ownScrimOpacity(0.5)).toBe(OWN_SCRIM_BASE);
    expect(ownScrimOpacity(0)).toBe(OWN_SCRIM_MAX);
  });

  it("rises as the photo gets darker", () => {
    expect(ownScrimOpacity(0.1)).toBeGreaterThan(ownScrimOpacity(0.3));
    expect(ownScrimOpacity(0.25)).toBe(0.4);
  });

  it("clamps bad input", () => {
    expect(ownScrimOpacity(-1)).toBe(OWN_SCRIM_MAX);
    expect(ownScrimOpacity(2)).toBe(OWN_SCRIM_BASE);
    expect(ownScrimOpacity(Number.NaN)).toBe(OWN_SCRIM_MAX);
  });
});
