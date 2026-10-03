"use client";

import { useSyncExternalStore } from "react";
import { createStore, get, set, del, keys } from "idb-keyval";
import type { QueryClient } from "@tanstack/react-query";
import { supabase, DOCS_BUCKET } from "./supabase";
import type { DocCategory } from "./types";

export interface UploadMeta {
  title: string;
  category: DocCategory;
  doc_date: string;
  provider?: string | null;
  note?: string | null;
  appointment_id?: string | null;
  tags?: string[];
}
export interface UploadItem {
  id: string;
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
      } catch (e) {
        const offline = typeof navigator !== "undefined" && !navigator.onLine;
        await put({ ...it, status: offline ? "queued" : "failed", error: offline ? undefined : (e as Error).message });
        if (offline) break;
      }
    }
  } finally {
    running = false;
  }
}

export function useUploads() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); void load(); return () => listeners.delete(cb); },
    () => items,
    () => items,
  );
}
