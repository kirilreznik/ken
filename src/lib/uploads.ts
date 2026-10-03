"use client";

import { canRead, readDocument } from "./ai";
import { useSyncExternalStore } from "react";
import { createStore, get, set, del, keys } from "idb-keyval";
import type { QueryClient } from "@tanstack/react-query";
import { supabase, DOCS_BUCKET, MEDIA_BUCKET } from "./supabase";
import type { DocCategory } from "./types";
import { report } from "./report";

export interface UploadMeta {
  title: string;
  category: DocCategory;
  doc_date: string;
  provider?: string | null;
  note?: string | null;
  appointment_id?: string | null;
  tags?: string[];
}
/** Media uploads attach a photo to an existing row instead of creating a document. */
export interface MediaTarget {
  table: "prep_items" | "journal_entries";
  rowId: string;
  field: "image_path" | "photos";
}
export interface UploadItem {
  id: string;
  media?: MediaTarget;
  spaceId: string;
  userId: string;
  name: string;
  type: string;
  size: number;
  file: Blob;
  meta: UploadMeta;
  status: "queued" | "uploading" | "failed";
  error?: string;
  addedAt: number;
}

const store = typeof indexedDB !== "undefined" ? createStore("kan-uploads", "items") : undefined;
let items: UploadItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let loaded = false;
let running = false;

async function load() {
  if (loaded || !store) return;
  loaded = true;
  const ks = await keys(store);
  const all = await Promise.all(ks.map((k) => get<UploadItem>(k, store)));
  items = all.filter(Boolean).map((i) => ({ ...i!, status: i!.status === "uploading" ? "queued" : i!.status }));
  emit();
}

async function put(item: UploadItem) {
  items = [...items.filter((i) => i.id !== item.id), item].sort((a, b) => a.addedAt - b.addedAt);
  emit();
  if (store) await set(item.id, item, store);
}
async function drop(id: string) {
  items = items.filter((i) => i.id !== id);
  emit();
  if (store) await del(id, store);
}

const safeName = (n: string) => n.replace(/[^\w.\-]+/g, "_").slice(-80) || "file";

export async function enqueueUpload(spaceId: string, userId: string, file: File, meta: UploadMeta, qc: QueryClient) {
  await load();
  const item: UploadItem = {
    id: crypto.randomUUID(), spaceId, userId, name: file.name, type: file.type, size: file.size,
    file, meta, status: "queued", addedAt: Date.now(),
  };
  await put(item);
  void processUploads(qc);
  return item.id;
}

/** Queue a photo for a prep item / journal entry (downscaled first, works offline). */
export async function enqueueMedia(spaceId: string, userId: string, file: File, target: MediaTarget, qc: QueryClient) {
  await load();
  const blob = await shrinkImage(file);
  const item: UploadItem = {
    id: crypto.randomUUID(), media: target, spaceId, userId, name: file.name.replace(/\.[^.]+$/, "") + ".jpg", type: blob.type || file.type,
    size: blob.size, file: blob, meta: { title: file.name, category: "other", doc_date: "" }, status: "queued", addedAt: Date.now(),
  };
  await put(item);
  void processUploads(qc);
  return item.id;
}

async function shrinkImage(file: File, max = 2000): Promise<Blob> {
  if (!file.type.startsWith("image/") || typeof createImageBitmap === "undefined") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b ?? file), "image/jpeg", 0.85));
  } catch {
    return file;
  }
}

async function attachMedia(it: UploadItem, path: string) {
  const t = it.media!;
  if (t.field === "image_path") {
    const { error } = await supabase.from(t.table).update({ image_path: path }).eq("id", t.rowId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from(t.table).select("photos").eq("id", t.rowId).maybeSingle();
    if (error) throw error;
    if (!data) return; // row was deleted meanwhile
    const photos = ((data as { photos: string[] }).photos ?? []).filter((p) => p !== path);
    const { error: e2 } = await supabase.from(t.table).update({ photos: [...photos, path] }).eq("id", t.rowId);
    if (e2) throw e2;
  }
}

export async function retryUpload(id: string, qc: QueryClient) {
  const it = items.find((i) => i.id === id);
  if (it) await put({ ...it, status: "queued", error: undefined });
  void processUploads(qc);
}
export const cancelUpload = (id: string) => drop(id);

export async function processUploads(qc: QueryClient) {
  await load();
  if (running || (typeof navigator !== "undefined" && !navigator.onLine)) return;
  running = true;
  try {
    for (const it of items.filter((i) => i.status === "queued")) {
      await put({ ...it, status: "uploading" });
      const path = `${it.spaceId}/${it.id}/${safeName(it.name)}`;
      try {
        if (it.media) {
          const up = await supabase.storage.from(MEDIA_BUCKET).upload(path, it.file, { contentType: it.type || undefined, upsert: true });
          if (up.error) throw up.error;
          await attachMedia(it, path);
          await drop(it.id);
          qc.invalidateQueries({ queryKey: [it.media.table, it.spaceId] });
          continue;
        }
        const up = await supabase.storage.from(DOCS_BUCKET).upload(path, it.file, { contentType: it.type || undefined, upsert: true });
        if (up.error) throw up.error;
        const { error } = await supabase.from("documents").insert({
          id: it.id, space_id: it.spaceId, created_by: it.userId, storage_path: path, mime_type: it.type || null,
          size_bytes: it.size, title: it.meta.title, category: it.meta.category, doc_date: it.meta.doc_date,
          provider: it.meta.provider || null, note: it.meta.note || null, appointment_id: it.meta.appointment_id || null,
          tags: it.meta.tags ?? [],
        });
        if (error && error.code !== "23505") throw error;
        await drop(it.id);
        qc.invalidateQueries({ queryKey: ["documents", it.spaceId] });
        // Opt-in AI reading: the server ignores this when the space hasn't enabled it.
        if (canRead(it.type)) readDocument(it.id).then(() => qc.invalidateQueries({ queryKey: ["documents", it.spaceId] }), () => {});
      } catch (e) {
        const offline = typeof navigator !== "undefined" && !navigator.onLine;
        if (!offline) report(e, "upload", { type: it.type, size: it.size });
        await put({ ...it, status: offline ? "queued" : "failed", error: offline ? undefined : (e as Error).message });
        if (offline) break;
      }
    }
  } finally {
    running = false;
  }
}

/** Pending media uploads for a given row (to show placeholders). */
export function pendingMediaFor(list: UploadItem[], rowId: string) {
  return list.filter((i) => i.media?.rowId === rowId);
}

export function useUploads() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); void load(); return () => listeners.delete(cb); },
    () => items,
    () => items,
  );
}
