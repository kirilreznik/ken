"use client";

import { supabase } from "./supabase";
import type { DocCategory } from "./types";

export interface AiValue { name: string; value: string; unit?: string | null; reference?: string | null; flag: "normal" | "high" | "low" | "flagged" | "none" }
export interface AiSuggestion {
  title?: string;
  category?: DocCategory;
  doc_date?: string | null;
  provider?: string | null;
  summary?: string;
  values?: AiValue[];
  follow_ups?: Array<{ title: string; due_date?: string | null }>;
  applied?: boolean;
  added?: string[];
  error?: string;
  model?: string;
  at?: string;
}

export const AI_ERROR: Record<string, string> = {
  no_key: "הקריאה האוטומטית עוד לא הוגדרה בשרת",
  bad_key: "מפתח ה־API בשרת לא תקין",
  unsupported: "אפשר לקרוא רק PDF או תמונה",
  too_large: "הקובץ גדול מדי לקריאה אוטומטית",
  disabled: "הקריאה האוטומטית כבויה בהגדרות",
};

const readable = (mime: string | null | undefined) => !!mime && (mime.includes("pdf") || /^image\/(jpeg|png|webp|gif)$/.test(mime));
export const canRead = readable;

/** Ask the server to read a document. Resolves when the suggestion is stored (or rejects). */
export async function readDocument(id: string) {
  const { data, error } = await supabase.functions.invoke("read-document", { body: { document_id: id } });
  if (error) {
    let code = "failed";
    try { code = (await (error as { context?: Response }).context?.json())?.error ?? code; } catch { /* ignore */ }
    throw new Error(code);
  }
  return data as { ok: boolean; suggestion: AiSuggestion };
}
