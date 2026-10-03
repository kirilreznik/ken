"use client";

import type { QueryClient } from "@tanstack/react-query";
import { supabase, MEDIA_BUCKET } from "./supabase";
import { shrinkImage } from "./uploads";
import type { PrepInbox, PrepItem, PrepOffer } from "./types";

export const firstUrl = (t?: string | null) => t?.match(/https?:\/\/[^\s<>"']+/)?.[0]?.replace(/[).,]+$/, "") ?? null;

export const INBOX_ERROR: Record<string, string> = {
  no_key: "הסיווג האוטומטי עוד לא הוגדר בשרת",
  empty: "לא התקבל קישור או תמונה",
  not_product: "לא זיהינו כאן מוצר",
  model: "הסיווג נכשל — אפשר לנסות שוב",
};

const invalidate = (qc: QueryClient, spaceId: string) => {
  for (const t of ["prep_items", "prep_offers", "prep_inbox"]) qc.invalidateQueries({ queryKey: [t, spaceId] });
};

/** Save a shared link/text/screenshot to the inbox and let the server triage it. Returns the inbox id. */
export async function shareToKen(input: { url?: string | null; text?: string | null; file?: File | Blob | null; via?: PrepInbox["via"] }, spaceId: string, userId: string, qc: QueryClient) {
  const id = crypto.randomUUID();
  let image_path: string | null = null;
  if (input.file) {
    const blob = input.file instanceof File ? await shrinkImage(input.file, 1800) : input.file;
    image_path = `${spaceId}/inbox/${id}.jpg`;
    const up = await supabase.storage.from(MEDIA_BUCKET).upload(image_path, blob, { contentType: blob.type || "image/jpeg", upsert: true });
    if (up.error) throw up.error;
  }
  const url = input.url?.trim() || firstUrl(input.text) || null;
  const { error } = await supabase.from("prep_inbox").insert({ id, space_id: spaceId, created_by: userId, url, text: input.text?.trim() || null, image_path, via: input.via ?? "app" });
  if (error) throw error;
  invalidate(qc, spaceId);
  await runTriage(id, spaceId, qc);
  return id;
}

export async function runTriage(id: string, spaceId: string, qc: QueryClient) {
  try { await supabase.functions.invoke("triage-product", { body: { inbox_id: id } }); }
  finally { invalidate(qc, spaceId); }
}

/** Revert what the triage did. */
export async function undoInbox(row: PrepInbox, items: PrepItem[], offers: PrepOffer[], spaceId: string, qc: QueryClient) {
  if (row.action === "new" && row.item_id) {
    await supabase.from("prep_items").delete().eq("id", row.item_id);
  } else if (row.action === "offer" && row.offer_id) {
    await supabase.from("prep_offers").delete().eq("id", row.offer_id);
    if (row.item_id) {
      const rest = offers.filter((o) => o.item_id === row.item_id && o.id !== row.offer_id && o.currency === "ILS" && o.price != null).map((o) => Number(o.price));
      if (rest.length) await supabase.from("prep_items").update({ price: Math.min(...rest) }).eq("id", row.item_id);
    }
  } else if (row.action === "fill" && row.item_id) {
    if (row.offer_id) await supabase.from("prep_offers").delete().eq("id", row.offer_id);
    const prev = row.result?.prev ?? {};
    const item = items.find((i) => i.id === row.item_id);
    await supabase.from("prep_items").update({ ...prev, source: item?.source === "share" ? "manual" : item?.source ?? null, image_path: null }).eq("id", row.item_id);
  }
  await supabase.from("prep_inbox").update({ status: "undone", dismissed: true, updated_at: new Date().toISOString() }).eq("id", row.id);
  invalidate(qc, spaceId);
}

export const ACTION_LABEL: Record<NonNullable<PrepInbox["action"]>, string> = {
  new: "נוסף לרשימה",
  offer: "חנות נוספת למוצר קיים",
  fill: "השלים פריט ברשימה",
};
