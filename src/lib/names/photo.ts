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

export async function saveOwnPhoto(userId: string, blob: Blob): Promise<void> {
  const s = photoStore();
  if (!s) throw new Error("IndexedDB is not available");
  await set(userId, blob, s);
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
}

