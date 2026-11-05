import { createStore, del, get, set, type UseStore } from "idb-keyval";

/** The user's own background photo (PRD 3.2.15): a resized JPEG Blob, one per user, never uploaded. */
export const PHOTO_DB = "nest-names-photo";
const STORE = "photos";

let store: UseStore | null = null;

/** Opened on first use so importing this module is safe on the server. */
function photoStore(): UseStore | null {
  if (typeof indexedDB === "undefined") return null;
  store ??= createStore(PHOTO_DB, STORE);
  return store;
}

const listeners = new Set<() => void>();

/** Calls the listener after this tab saves or deletes an own photo; returns the unsubscribe. */
export function subscribeOwnPhoto(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function saveOwnPhoto(userId: string, blob: Blob): Promise<void> {
  const s = photoStore();
  if (!s) throw new Error("IndexedDB is not available");
  await set(userId, blob, s);
  listeners.forEach((l) => l());
}

/** The saved photo, or null when there is none (or it can't be read): the caller falls back to "בדים". */
export async function loadOwnPhoto(userId: string): Promise<Blob | null> {
  const s = photoStore();
  if (!s) return null;
  try {
    const value = await get<unknown>(userId, s);
    return value instanceof Blob ? value : null;
  } catch {
    return null;
  }
}

export async function deleteOwnPhoto(userId: string): Promise<void> {
  const s = photoStore();
  if (!s) return;
  await del(userId, s);
  listeners.forEach((l) => l());
}

/** PRD 3.2.15: the photo is kept at about 1,200 px on its long side, as a JPEG. */
export const PHOTO_LONG_SIDE = 1200;
export const PHOTO_QUALITY = 0.85;

/** The size to draw an image at so its long side is at most `max` px (never upscaled). */
export function fitLongSide(width: number, height: number, max = PHOTO_LONG_SIDE): { width: number; height: number } {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

/**
 * Decodes a picked image file (EXIF orientation applied), draws it on a canvas at
 * fitLongSide over `matte` (JPEG has no transparency) and returns a JPEG Blob. Runs
 * entirely in the browser; throws when the file isn't a decodable image.
 */
export async function resizePhoto(file: Blob, matte: string): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const { width, height } = fitLongSide(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d canvas");
    ctx.fillStyle = matte;
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", PHOTO_QUALITY));
    if (!blob) throw new Error("Could not encode the photo");
    return blob;
  } finally {
    bitmap.close();
  }
}
