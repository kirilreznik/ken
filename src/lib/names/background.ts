import type { Background } from "./prefs";

/** The three photos of FR-W17, served from public/landing/. */
export const PHOTO_BACKGROUNDS = ["fabric", "notebook", "nursery"] as const;
export type PhotoBackground = (typeof PHOTO_BACKGROUNDS)[number];
/** The photo's file as public/names/sw.js precaches it (STATIC_ASSETS): shown as is, it works offline after one visit (NP-BUG-009). */
export const photoUrl = (id: PhotoBackground) => `/landing/names-${id}.webp`;

/** What the screen actually shows: "own" without a readable photo falls back to "בדים" (FR-W17). */
export function effectiveBackground(choice: Background, hasOwnPhoto: boolean): Background {
  return choice === "own" && !hasOwnPhoto ? "fabric" : choice;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The part of the screen the card covers, as fractions of the viewport: the centered
 * column (max 480 px, 20 px side padding) from below the header and chips to above the
 * actions (board 2's card spans roughly 22%–80% of the height).
 */
export function cardRegion(viewport: Size): Rect {
  const column = Math.min(viewport.width, 480);
  const width = Math.max(column - 40, 1);
  return {
    x: (viewport.width - width) / 2,
    y: viewport.height * 0.22,
    width,
    height: viewport.height * 0.58,
  };
}

/**
 * Maps a rect on screen to the source rect of an image drawn with object-fit: cover,
 * centered (the photo layer). Clamped to the image.
 */
export function coverSourceRect(viewport: Size, image: Size, region: Rect): Rect {
  const scale = Math.max(viewport.width / image.width, viewport.height / image.height);
  const offsetX = (image.width * scale - viewport.width) / 2;
  const offsetY = (image.height * scale - viewport.height) / 2;
  const x = Math.max(0, (region.x + offsetX) / scale);
  const y = Math.max(0, (region.y + offsetY) / scale);
  return {
    x,
    y,
    width: Math.max(1, Math.min(image.width - x, region.width / scale)),
    height: Math.max(1, Math.min(image.height - y, region.height / scale)),
  };
}

const linear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Mean relative luminance (WCAG, 0–1) of RGBA pixel data; fully transparent pixels are skipped. */
export function averageLuminance(data: ArrayLike<number>): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i + 3 < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    sum += 0.2126 * linear(data[i]) + 0.7152 * linear(data[i + 1]) + 0.0722 * linear(data[i + 2]);
    count++;
  }
  return count ? sum / count : 1;
}

/** Scrim over the user's own photo (PRD 3.2.15): always some, more for dark photos. */
export const OWN_SCRIM_BASE = 0.2;
export const OWN_SCRIM_MAX = 0.6;
/** Photos at or above this luminance get only the base scrim. */
const BRIGHT_ENOUGH = 0.5;

/** Canvas-colored scrim opacity for a photo whose card area has this luminance. */
export function ownScrimOpacity(luminance: number): number {
  const l = Number.isFinite(luminance) ? Math.min(Math.max(luminance, 0), 1) : 0;
  const darkness = Math.max(0, (BRIGHT_ENOUGH - l) / BRIGHT_ENOUGH);
  return Math.round((OWN_SCRIM_BASE + (OWN_SCRIM_MAX - OWN_SCRIM_BASE) * darkness) * 100) / 100;
}
