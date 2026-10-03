"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field, Sheet } from "./ui";
import { Icon } from "./Icon";
import { useMediaUrls, useSave } from "@/lib/data";
import { useSession } from "@/lib/session";
import { enqueueMedia } from "@/lib/uploads";
import { supabase, MEDIA_BUCKET } from "@/lib/supabase";
import { toDay } from "@/lib/pregnancy";
import { JOURNAL_KIND_LABEL } from "@/lib/labels";
import type { JournalEntry, JournalKind } from "@/lib/types";

export function JournalSheet({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Partial<JournalEntry> | null }) {
  return (
    <Sheet open={open} onClose={onClose} title={initial?.id ? "עריכת רשומה" : "רגע חדש"} wide>
      {open && <JournalForm key={initial?.id ?? "new"} onClose={onClose} initial={initial} />}
    </Sheet>
  );
}

export function JournalForm({ onClose, initial, inline }: { onClose: () => void; initial?: Partial<JournalEntry> | null; inline?: boolean }) {
  const { space, user } = useSession();
  const qc = useQueryClient();
  const save = useSave("journal_entries");
  const editing = !!initial?.id;
  const mine = !initial?.author || initial.author === user?.id;
  const [f, setF] = useState(() => ({
    title: initial?.title ?? "", body: initial?.body ?? "", kind: (initial?.kind ?? "note") as JournalKind, entry_date: initial?.entry_date ?? toDay(new Date()),
    visibility: initial?.visibility ?? "shared", hidden: initial?.hidden ?? false, include_in_book: initial?.include_in_book ?? true,
  }));
  const [files, setFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [err, setErr] = useState("");
  const urls = useMediaUrls(photos).data ?? {};

  const submit = async () => {
    if (!f.title.trim() && !f.body.trim() && files.length === 0 && photos.length === 0) return setErr("כתבו משהו או הוסיפו תמונה");
    const row = { title: f.title.trim() || null, body: f.body.trim() || null, kind: f.kind, entry_date: f.entry_date, visibility: f.visibility as "shared" | "private",
      hidden: f.hidden, include_in_book: f.include_in_book, photos, updated_at: new Date().toISOString() };
    let id = initial?.id;
    if (editing) save.update(id!, row);
    else id = save.insert({ ...row, author: user!.id, appointment_id: initial?.appointment_id ?? null });
    for (const file of files) await enqueueMedia(space!.id, user!.id, file, { table: "journal_entries", rowId: id!, field: "photos" }, qc);
    if (editing && initial?.photos) {
      const removed = initial.photos.filter((p) => !photos.includes(p));
      if (removed.length) void supabase.storage.from(MEDIA_BUCKET).remove(removed);
    }
    setFiles([]); setF((x) => ({ ...x, title: "", body: "" }));
    onClose();
  };

  return (
    <div className={inline ? "flex flex-col gap-3" : "flex flex-col gap-4"}>
      {!inline && <Field label="כותרת (לא חובה)"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>}
      <label><span className="sr-only">מה קרה?</span>
        <textarea className={inline ? "w-full min-h-[72px] border-0 resize-none text-[19px] leading-normal bg-transparent font-serif p-1 focus:outline-none" : "input font-serif text-lg"} rows={inline ? 2 : 5}
          placeholder="מה קרה השבוע? משהו שתרצו לזכור…" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} disabled={!mine} />
      </label>
      {(photos.length > 0 || files.length > 0) && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((p) => (
            <div key={p} className="relative w-20 h-20 rounded-xl overflow-hidden bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {urls[p] && <img src={urls[p]} alt="" className="w-full h-full object-cover" />}
              {mine && <button type="button" aria-label="הסרת תמונה" onClick={() => setPhotos(photos.filter((x) => x !== p))} className="absolute top-1 end-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"><Icon name="close" size={12} /></button>}
            </div>
          ))}
          {files.map((file, i) => <div key={i} className="w-20 h-20 rounded-xl bg-sand flex items-center justify-center text-[11px] font-bold text-ink-3 p-1 text-center">{file.name.slice(0, 18)}</div>)}
        </div>
      )}
      {err && <span className="text-[13px] font-semibold" style={{ color: "var(--st-att)" }}>{err}</span>}
      <div className="flex gap-2 items-center flex-wrap">
        <label className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl bg-[#F7F2EA] text-sm font-bold cursor-pointer"><Icon name="img" size={18} />תמונות
          <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} /></label>
        {(Object.keys(JOURNAL_KIND_LABEL) as JournalKind[]).filter((k) => k !== "photo").map((k) => (
          <button key={k} type="button" aria-pressed={f.kind === k} onClick={() => setF({ ...f, kind: k })} className="h-10 px-3 rounded-xl text-sm font-bold"
            style={f.kind === k ? { background: "var(--ink)", color: "#fff" } : { background: "#F7F2EA", color: "#4A3F33" }}>{JOURNAL_KIND_LABEL[k]}</button>
        ))}
        <input type="date" className="h-10 rounded-xl border border-[#e2dace] bg-white px-2 text-sm" aria-label="תאריך" value={f.entry_date} onChange={(e) => setF({ ...f, entry_date: e.target.value })} />
      </div>
      <div className="flex gap-x-5 gap-y-1 flex-wrap text-sm font-semibold">
        <label className="flex items-center gap-2 min-h-11"><input type="checkbox" className="switch" checked={f.visibility === "private"} disabled={!mine}
          onChange={(e) => setF({ ...f, visibility: e.target.checked ? "private" : "shared" })} />רק אני רואה</label>
        <label className="flex items-center gap-2 min-h-11"><input type="checkbox" className="switch" checked={f.hidden} onChange={(e) => setF({ ...f, hidden: e.target.checked })} />מוסתר (למשל גילוי מין)</label>
        {!inline && <label className="flex items-center gap-2 min-h-11"><input type="checkbox" className="switch" checked={f.include_in_book} onChange={(e) => setF({ ...f, include_in_book: e.target.checked })} />בספר ההריון</label>}
      </div>
      <div className={inline ? "flex justify-end" : "sticky bottom-0 -mx-5 px-5 pt-3 pb-5 pb-safe bg-white flex gap-2.5 justify-end border-t border-line-2"}>
        {editing && mine && <button type="button" className="btn btn-danger me-auto" onClick={() => { save.remove(initial!.id!); if (initial?.photos?.length) void supabase.storage.from(MEDIA_BUCKET).remove(initial.photos); onClose(); }}><Icon name="trash" size={18} />מחיקה</button>}
        {!inline && <button type="button" className="btn btn-secondary" onClick={onClose}>ביטול</button>}
        <button type="button" className="btn btn-primary" style={{ background: "var(--ink)" }} onClick={submit}>שמירה</button>
      </div>
    </div>
  );
}
