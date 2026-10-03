"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field, Sheet } from "./ui";
import { Icon } from "./Icon";
import { useMediaUrls, useSave, nowSort } from "@/lib/data";
import { useSession } from "@/lib/session";
import { enqueueMedia } from "@/lib/uploads";
import { PREP_CATEGORY_LABEL, PREP_STATUS_LABEL, PREP_STATUS_ORDER } from "@/lib/labels";
import type { PrepCategory, PrepItem, PrepStatus } from "@/lib/types";

export function PrepSheet({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Partial<PrepItem> | null }) {
  return (
    <Sheet open={open} onClose={onClose} title={initial?.id ? "עריכת פריט" : "פריט חדש"}>
      {open && <PrepForm key={initial?.id ?? "new"} onClose={onClose} initial={initial} />}
    </Sheet>
  );
}

function PrepForm({ onClose, initial }: { onClose: () => void; initial?: Partial<PrepItem> | null }) {
  const { space, user } = useSession();
  const qc = useQueryClient();
  const save = useSave("prep_items");
  const editing = !!initial?.id;
  const [f, setF] = useState(() => ({
    title: initial?.title ?? "", category: (initial?.category ?? "misc") as PrepCategory, status: (initial?.status ?? "need") as PrepStatus,
    price: initial?.price != null ? String(initial.price) : "", quantity: String(initial?.quantity ?? 1), url: initial?.url ?? "",
    recommended_by: initial?.recommended_by ?? "", compare_group: initial?.compare_group ?? "", notes: initial?.notes ?? "",
  }));
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const img = useMediaUrls(initial?.image_path ? [initial.image_path] : []).data?.[initial?.image_path ?? ""];
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    if (!f.title.trim()) return setErr("מה הפריט?");
    const url = f.url.trim();
    if (url && !/^https?:\/\//i.test(url)) return setErr("קישור צריך להתחיל ב־https://");
    const row = {
      title: f.title.trim(), category: f.category, status: f.status, price: f.price ? Number(f.price.replace(/[^\d.]/g, "")) || null : null,
      quantity: Math.max(1, parseInt(f.quantity, 10) || 1), url: url || null, recommended_by: f.recommended_by || null,
      compare_group: f.compare_group.trim() || null, notes: f.notes || null, updated_at: new Date().toISOString(),
    };
    let id = initial?.id;
    if (editing) save.update(id!, row);
    else id = save.insert({ ...row, image_path: null, sort: nowSort(), created_by: user!.id });
    if (file && id) await enqueueMedia(space!.id, user!.id, file, { table: "prep_items", rowId: id, field: "image_path" }, qc);
    onClose();
  };

  return (
    <>
      <Field label="פריט" error={err || undefined}><input className="input" value={f.title} onChange={set("title")} autoFocus placeholder="למשל: עגלה משולבת" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="קטגוריה"><select className="input" value={f.category} onChange={set("category")}>{(Object.keys(PREP_CATEGORY_LABEL) as PrepCategory[]).map((c) => <option key={c} value={c}>{PREP_CATEGORY_LABEL[c]}</option>)}</select></Field>
        <Field label="סטטוס"><select className="input" value={f.status} onChange={set("status")}>{PREP_STATUS_ORDER.map((s) => <option key={s} value={s}>{PREP_STATUS_LABEL[s]}</option>)}</select></Field>
        <Field label="מחיר (₪)"><input className="input" inputMode="decimal" dir="ltr" style={{ textAlign: "right" }} value={f.price} onChange={set("price")} /></Field>
        <Field label="כמות"><input className="input" type="number" min={1} value={f.quantity} onChange={set("quantity")} /></Field>
      </div>
      <Field label="קישור למוצר"><input className="input" type="url" dir="ltr" style={{ textAlign: "right" }} value={f.url} onChange={set("url")} placeholder="https://" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="מי המליץ"><input className="input" value={f.recommended_by} onChange={set("recommended_by")} /></Field>
        <Field label="קבוצת השוואה" hint="אותו שם = מושווים זה לצד זה"><input className="input" value={f.compare_group} onChange={set("compare_group")} placeholder="למשל: עגלה" /></Field>
      </div>
      <label className="flex items-center gap-3 rounded-2xl p-3 cursor-pointer" style={{ border: "1.5px dashed #CFC3B3", background: "var(--surface-2)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img && !file ? <img src={img} alt="" className="w-14 h-14 rounded-xl object-cover" /> : <span className="w-14 h-14 rounded-xl bg-sand flex items-center justify-center text-[#a8957c]"><Icon name="camera" /></span>}
        <span className="flex-1 font-bold">{file ? file.name : img ? "החלפת תמונה" : "הוספת תמונה"}<span className="block text-[13px] font-medium text-ink-3">אפשר גם בלי חיבור — תעלה אוטומטית</span></span>
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <Field label="הערות"><textarea className="input" rows={2} value={f.notes} onChange={set("notes")} style={{ background: "#FFFBF6", borderColor: "#EBD9C8" }} /></Field>
      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-5 pb-safe bg-white flex gap-2.5 justify-end border-t border-line-2">
        {editing && <button type="button" className="btn btn-danger me-auto" onClick={() => { save.remove(initial!.id!); onClose(); }}><Icon name="trash" size={18} />מחיקה</button>}
        <button type="button" className="btn btn-secondary" onClick={onClose}>ביטול</button>
        <button type="button" className="btn btn-primary" onClick={submit}>שמירה</button>
      </div>
    </>
  );
}
