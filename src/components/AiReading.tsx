"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { useSession } from "@/lib/session";
import { useSave } from "@/lib/data";
import { useOnline } from "@/lib/online";
import { AI_ERROR, canRead, readDocument, type AiSuggestion } from "@/lib/ai";
import { DOC_CATEGORY_LABEL } from "@/lib/labels";
import { fmtDayYear } from "@/lib/format";
import { weekOf } from "@/lib/pregnancy";
import type { DocumentRow } from "@/lib/types";

const FLAG: Record<string, { label: string; color: string } | undefined> = {
  high: { label: "גבוה", color: "var(--st-att)" },
  low: { label: "נמוך", color: "var(--st-att)" },
  flagged: { label: "מסומן", color: "var(--st-att)" },
};

/** Document drawer panel: run the opt-in AI reading and review/apply its suggestions. */
export function AiReading({ doc }: { doc: DocumentRow }) {
  const { space, user } = useSession();
  const qc = useQueryClient();
  const online = useOnline();
  const saveDoc = useSave("documents");
  const saveTask = useSave("tasks");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!space?.ai_reading_enabled || !user || !canRead(doc.mime_type)) return null;

  const s = (doc.ai_suggestion ?? null) as AiSuggestion | null;
  const status = busy ? "pending" : doc.ai_status;

  const run = async () => {
    setBusy(true); setErr("");
    try { await readDocument(doc.id); }
    catch (e) { setErr(AI_ERROR[(e as Error).message] ?? "הקריאה נכשלה. אפשר לנסות שוב."); }
    await qc.invalidateQueries({ queryKey: ["documents", space.id] });
    setBusy(false);
  };
  const patchSuggestion = (p: Partial<AiSuggestion>) => saveDoc.update(doc.id, { ai_suggestion: { ...(s ?? {}), ...p } as Record<string, unknown> });
  const apply = () => {
    if (!s) return;
    saveDoc.update(doc.id, {
      ...(s.title ? { title: s.title } : {}),
      ...(s.category && DOC_CATEGORY_LABEL[s.category] ? { category: s.category } : {}),
      ...(s.doc_date && /^\d{4}-\d{2}-\d{2}$/.test(s.doc_date) ? { doc_date: s.doc_date } : {}),
      ...(s.provider && !doc.provider ? { provider: s.provider } : {}),
      ...(s.summary && !doc.note ? { note: s.summary } : {}),
      ai_suggestion: { ...s, applied: true } as Record<string, unknown>,
    });
  };
  const addTask = (f: { title: string; due_date?: string | null }) => {
    const due = f.due_date && /^\d{4}-\d{2}-\d{2}$/.test(f.due_date) ? f.due_date : null;
    saveTask.insert({ title: f.title, category: "medical", priority: "normal", due_date: due, due_week: due ? weekOf(space.due_date, due) : null,
      notes: `מתוך: ${doc.title}`, document_id: doc.id, appointment_id: doc.appointment_id, source_key: `doc:${doc.id}:${f.title}`,
      done: false, done_at: null, done_by: null, trimester: null, assignee: null, created_by: user.id });
    patchSuggestion({ added: [...(s?.added ?? []), f.title] });
  };

  if (status === "pending") return (
    <div className="rounded-2xl p-4 bg-primary-50 flex items-center gap-3"><Icon name="sync" className="spin text-primary" /><span className="font-bold">קורא את המסמך…</span></div>
  );

  if (!s || status === "failed" || status === "dismissed" || !s.summary) return (
    <div className="rounded-2xl p-4 border border-dashed border-line flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <Icon name="doc" className="text-primary" />
        <span className="flex-1 min-w-[160px]"><b className="block">קריאה אוטומטית</b><span className="text-[13px] text-ink-3">שם, תאריך, ערכים ומשימות — מוצעים לאישור שלכם</span></span>
        <button className="btn btn-secondary h-10 min-h-0 text-sm" disabled={!online} onClick={run}>{status === "failed" ? "ניסיון חוזר" : "קריאת המסמך"}</button>
      </div>
      {(err || (status === "failed" && s?.error)) && <p className="text-[13px] font-bold" style={{ color: "var(--st-att)" }}>{err || AI_ERROR[s?.error ?? ""] || "הקריאה הקודמת נכשלה"}</p>}
    </div>
  );

  const changes = [
    s.title && s.title !== doc.title && ["שם", s.title],
    s.category && s.category !== doc.category && DOC_CATEGORY_LABEL[s.category] && ["קטגוריה", DOC_CATEGORY_LABEL[s.category]],
    s.doc_date && s.doc_date !== doc.doc_date && ["תאריך", fmtDayYear(s.doc_date)],
    s.provider && !doc.provider && ["נותן שירות", s.provider],
  ].filter(Boolean) as Array<[string, string]>;

  return (
    <section className="rounded-2xl p-4 bg-primary-50 flex flex-col gap-3" aria-label="קריאה אוטומטית">
      <div className="flex items-center gap-2"><Icon name="doc" className="text-primary" /><b className="flex-1">מה כתוב במסמך</b>
        <button className="text-[13px] font-bold text-ink-3" onClick={() => saveDoc.update(doc.id, { ai_status: "dismissed" })}>הסתרה</button></div>
      <p className="text-[15px] leading-relaxed">{s.summary}</p>

      {!!s.values?.length && (
        <div className="rounded-xl bg-white divide-y divide-line-2 text-[14px]">
          {s.values.map((v, i) => (
            <div key={i} className="flex items-baseline gap-3 px-3 py-2">
              <span className="flex-1 min-w-0">{v.name}{v.reference ? <span className="text-ink-3 text-[12px]"> · טווח {v.reference}</span> : null}</span>
              <b dir="ltr">{v.value}{v.unit ? ` ${v.unit}` : ""}</b>
              {FLAG[v.flag] && <span className="text-[12px] font-extrabold" style={{ color: FLAG[v.flag]!.color }}>{FLAG[v.flag]!.label}</span>}
            </div>
          ))}
        </div>
      )}

      {changes.length > 0 && !s.applied && (
        <div className="rounded-xl bg-white p-3 flex flex-col gap-2">
          <span className="text-[13px] font-bold text-ink-3">פרטים מוצעים</span>
          {changes.map(([k, v]) => <div key={k} className="flex gap-2 text-[14px]"><span className="text-ink-3 w-24 flex-none">{k}</span><b>{v}</b></div>)}
          <div className="flex gap-2"><button className="btn btn-primary h-9 min-h-0 text-sm" onClick={apply}>עדכון הפרטים</button>
            <button className="btn btn-ghost h-9 min-h-0 text-sm" onClick={() => patchSuggestion({ applied: true })}>להשאיר כמו שזה</button></div>
        </div>
      )}

      {!!s.follow_ups?.length && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-ink-3">צעדים שמוזכרים במסמך</span>
          {s.follow_ups.map((f) => {
            const added = s.added?.includes(f.title);
            return (
              <div key={f.title} className="flex items-center gap-2 text-[14px]">
                <span className="flex-1">{f.title}{f.due_date ? <span className="text-ink-3"> · עד {fmtDayYear(f.due_date)}</span> : null}</span>
                {added ? <span className="text-[13px] font-bold" style={{ color: "var(--st-done)" }}>נוסף</span>
                  : <button className="btn btn-ghost h-8 min-h-0 px-2 text-[13px]" onClick={() => addTask(f)}><Icon name="plus" size={14} />משימה</button>}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[12px] text-ink-3">נקרא אוטומטית — כדאי לוודא מול המסמך. זה לא פירוש רפואי; שאלות על התוצאות — לרופא/ה.</p>
    </section>
  );
}
