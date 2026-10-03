"use client";

import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { PlanReview } from "@/components/plan/PlanReview";
import { supabase, DOCS_BUCKET } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { useAppointments, usePregnancy } from "@/lib/data";
import { useOnline } from "@/lib/online";
import { shrinkImage } from "@/lib/uploads";
import { buildRows, planChanges, standardPlan, type PlanRow } from "@/lib/plan";
import { toDay } from "@/lib/pregnancy";
import { fmtDayYear } from "@/lib/format";
import { report } from "@/lib/report";
import type { Appointment, PlanImport as PlanImportRow, PlanResult } from "@/lib/types";

const ERRORS: Record<string, string> = {
  no_key: "הניתוח האוטומטי עוד לא הוגדר בשרת.",
  bad_key: "מפתח ה־API בשרת לא תקין.",
  unsupported: "אפשר לנתח רק PDF או תמונות.",
  too_large: "הקבצים גדולים מדי. נסו לצלם מחדש או להעלות פחות עמודים.",
  too_many_files: "אפשר עד 6 קבצים בכל פעם.",
  timeout: "הניתוח לקח יותר מדי זמן.",
};
const STALE_MS = 3 * 60_000;

export interface PlanDone { created: number; updated: number }

/** Upload the follow-up plan (or pick the standard one) → AI analysis → review → appointments. */
export function PlanImport({ welcome = false, onDone, onSkip }: { welcome?: boolean; onDone: (r: PlanDone) => void; onSkip?: () => void }) {
  const { space, user } = useSession();
  const wk = usePregnancy();
  const qc = useQueryClient();
  const online = useOnline();
  const { data: appts } = useAppointments();
  const [files, setFiles] = useState<File[]>([]);
  const [chosen, setChosen] = useState<string | null>(null); // import id, or "none" to start over
  const [busy, setBusy] = useState<string>("");
  const [err, setErr] = useState("");
  const camRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Resume an analysis that is still running or waiting for review (e.g. the app was closed).
  const latest = useQuery({
    queryKey: ["plan_imports", "open", space?.id],
    enabled: !!space,
    queryFn: async () => {
      const { data } = await supabase.from("plan_imports").select("*").eq("space_id", space!.id).in("status", ["pending", "ready"])
        .gte("created_at", new Date(Date.now() - 2 * 86_400_000).toISOString()).order("created_at", { ascending: false }).limit(1);
      return (data?.[0] as PlanImportRow | undefined) ?? null;
    },
  });
  const activeId = chosen === "none" ? null : chosen ?? latest.data?.id ?? null;
  const imp = useQuery({
    queryKey: ["plan_imports", activeId],
    enabled: !!activeId,
    refetchInterval: (q) => ((q.state.data as PlanImportRow | undefined)?.status === "pending" ? 3000 : false),
    queryFn: async () => {
      const { data, error } = await supabase.from("plan_imports").select("*").eq("id", activeId!).single();
      if (error) throw error;
      return data as PlanImportRow;
    },
  });

  if (!space || !user || !wk) return null;
  const row = activeId ? imp.data : null;
  const stale = row?.status === "pending" && imp.dataUpdatedAt - new Date(row.created_at).getTime() > STALE_MS;

  const pick = (list: FileList | null) => {
    if (!list) return;
    setErr("");
    setFiles((f) => [...f, ...Array.from(list)].slice(0, 6));
  };

  const analyze = async () => {
    if (!online) return setErr("צריך חיבור לאינטרנט כדי להעלות ולנתח");
    if (!files.length) return;
    setErr(""); setBusy("מעלים את התוכנית…");
    try {
      const ids: string[] = [];
      for (const [i, f] of files.entries()) {
        const blob = await shrinkImage(f, 2400);
        const type = blob.type || f.type;
        const id = crypto.randomUUID();
        const ext = type.includes("pdf") ? "pdf" : "jpg";
        const path = `${space.id}/${id}/plan-${i + 1}.${ext}`;
        const up = await supabase.storage.from(DOCS_BUCKET).upload(path, blob, { contentType: type, upsert: true });
        if (up.error) throw up.error;
        const { error } = await supabase.from("documents").insert({
          id, space_id: space.id, created_by: user.id, storage_path: path, mime_type: type, size_bytes: blob.size,
          title: files.length > 1 ? `תוכנית מעקב הריון · עמוד ${i + 1}` : "תוכנית מעקב הריון", category: "plan",
          doc_date: toDay(new Date()), tags: ["תוכנית מעקב"],
        });
        if (error) throw error;
        ids.push(id);
      }
      const { data: created, error } = await supabase.from("plan_imports").insert({ space_id: space.id, document_ids: ids, source: "document", created_by: user.id }).select("id").single();
      if (error) throw error;
      setChosen(created.id);
      setFiles([]);
      qc.invalidateQueries({ queryKey: ["documents", space.id] });
      setBusy("");
      // Fire the analysis; the row is polled for the result (and survives closing the app).
      supabase.functions.invoke("analyze-plan", { body: { import_id: created.id } })
        .finally(() => qc.invalidateQueries({ queryKey: ["plan_imports", created.id] }));
    } catch (e) {
      report(e, "plan", { step: "upload" });
      setBusy(""); setErr("ההעלאה נכשלה. בדקו את החיבור ונסו שוב.");
    }
  };

  const useStandard = async () => {
    setErr(""); setBusy("מכינים את התוכנית…");
    const { data, error } = await supabase.from("plan_imports").insert({ space_id: space.id, source: "standard", status: "ready", result: standardPlan(), created_by: user.id }).select("id").single();
    setBusy("");
    if (error) return setErr("צריך חיבור לאינטרנט");
    setChosen(data.id);
  };

  // ── Review ──
  if (row?.status === "ready" && row.result) {
    return <ReviewStep key={row.id} imp={row} result={row.result} appointments={appts ?? []} week={wk.week} welcome={welcome}
      onBack={() => setChosen("none")} onDone={onDone} />;
  }

  // ── Analyzing ──
  if (row?.status === "pending" && !stale) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4">
        <span className="w-14 h-14 rounded-2xl bg-primary-100 text-primary flex items-center justify-center"><Icon name="sync" size={28} className="spin" /></span>
        <div><h2 className="text-xl font-extrabold">קוראים את התוכנית…</h2>
          <p className="text-ink-3 mt-1">מזהים את הבדיקות, החלונות ומתי צריך לקבוע. זה לוקח בדרך כלל עד דקה.</p>
          <p className="text-[13px] text-ink-3 mt-2">אפשר לסגור את האפליקציה — נמשיך מכאן כשתחזרו.</p></div>
      </div>
    );
  }

  // ── Choose ──
  const failed = row?.status === "failed" || stale;
  return (
    <div className="flex flex-col gap-4">
      {failed && (
        <div className="rounded-2xl p-4 flex gap-3 items-start" style={{ background: "var(--st-att-bg)", color: "#7e2f1d" }}>
          <Icon name="alert" />
          <div className="flex-1"><b className="block">לא הצלחנו לקרוא את התוכנית</b>
            <span className="text-sm">{ERRORS[stale ? "timeout" : row?.error ?? ""] ?? "אפשר לנסות שוב, לצלם מחדש באור טוב, או להתחיל מהתוכנית המקובלת."}</span></div>
          <button className="text-sm font-bold underline" onClick={() => setChosen("none")}>סגירה</button>
        </div>
      )}

      <section className="card p-5 md:p-6 flex flex-col gap-4">
        <div className="flex gap-3 items-start">
          <span className="w-11 h-11 rounded-xl bg-primary-100 text-primary flex items-center justify-center flex-none"><Icon name="doc" /></span>
          <div><h2 className="text-lg font-extrabold">יש לנו תוכנית מעקב מהרופא/ה</h2>
            <p className="text-sm text-ink-3 leading-relaxed">צלמו את הדף שקיבלתם בביקור הראשון (או העלו PDF). נזהה את כל הבדיקות, מתי לקבוע כל אחת ומה החלון שלה — ותאשרו לפני שמשהו נוצר.</p></div>
        </div>
        <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
        <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
        {files.length > 0 && (
          <ul className="flex flex-col gap-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                <Icon name={f.type.includes("pdf") ? "doc" : "img"} className="text-ink-3" />
                <span className="flex-1 truncate text-sm font-semibold">{files.length > 1 ? `עמוד ${i + 1} · ` : ""}{f.name}</span>
                <button className="icon-btn" aria-label="הסרה" onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}><Icon name="close" size={16} /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-secondary" onClick={() => camRef.current?.click()} disabled={!!busy}><Icon name="camera" />{files.length ? "צילום עמוד נוסף" : "צילום"}</button>
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} disabled={!!busy}><Icon name="up" />בחירת קובץ</button>
          {files.length > 0 && <button className="btn btn-primary" onClick={analyze} disabled={!!busy}>{busy || "ניתוח התוכנית"}</button>}
        </div>
        <p className="text-[12px] text-ink-3">הקבצים נשמרים במסמכים שלכם ונשלחים לקריאה ע״י Claude (Anthropic). זה לא ייעוץ רפואי.</p>
      </section>

      <section className="card p-5 md:p-6 flex flex-col gap-3">
        <div className="flex gap-3 items-start">
          <span className="w-11 h-11 rounded-xl bg-chip text-ink-2 flex items-center justify-center flex-none"><Icon name="list" /></span>
          <div><h2 className="text-lg font-extrabold">אין לנו תוכנית כרגע</h2>
            <p className="text-sm text-ink-3 leading-relaxed">נתחיל מהבדיקות המקובלות בישראל לפי השבוע שלכם. אפשר להעלות את התוכנית מהרופא/ה בכל שלב — נתאים את מה שכבר קיים.</p></div>
        </div>
        <button className="btn btn-secondary self-start" onClick={useStandard} disabled={!!busy}>התוכנית המקובלת</button>
      </section>

      {err && <p className="text-sm font-bold" style={{ color: "var(--st-att)" }}>{err}</p>}
      {busy && !files.length && <p className="text-sm text-ink-3">{busy}</p>}
      {welcome && onSkip && <button className="text-sm text-ink-3 underline self-center" onClick={onSkip}>דילוג — אוסיף תורים בעצמי</button>}
    </div>
  );
}

function ReviewStep({ imp, result, appointments, week, welcome, onBack, onDone }: {
  imp: PlanImportRow; result: PlanResult; appointments: Appointment[]; week: number; welcome: boolean; onBack: () => void; onDone: (r: PlanDone) => void;
}) {
  const { space, user, refresh } = useSession();
  const qc = useQueryClient();
  const [rows, setRows] = useState<PlanRow[]>(() => buildRows(result, { dueDate: space!.due_date, week, appointments }));
  const [newDue, setNewDue] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const planDue = result.due_date && /^\d{4}-\d{2}-\d{2}$/.test(result.due_date) && result.due_date !== space!.due_date ? result.due_date : null;

  const selected = rows.filter((r) => r.include && r.action !== "done" && r.title.trim());
  const nCreate = selected.filter((r) => r.action !== "update").length;
  const nUpdate = selected.filter((r) => r.action === "update").length;

  const apply = async () => {
    if (!space || !user) return;
    setBusy(true); setErr("");
    try {
      if (planDue && newDue) {
        const { error } = await supabase.from("spaces").update({ due_date: planDue }).eq("id", space.id);
        if (error) throw error;
      }
      const ch = planChanges(selected.map((r) => ({ ...r, title: r.title.trim() })), {
        week, appointments, source: imp.source === "standard" ? "standard" : "plan", planDocumentId: imp.document_ids?.[0] ?? null,
        userId: user.id, spaceId: space.id, startsAt: (d, t) => new Date(`${d}T${t ?? "09:00"}`).toISOString(),
      });
      if (ch.inserts.length) { const { error } = await supabase.from("appointments").insert(ch.inserts); if (error) throw error; }
      for (const u of ch.updates) { const { error } = await supabase.from("appointments").update(u.patch).eq("id", u.id); if (error) throw error; }
      await supabase.from("plan_imports").update({ status: "applied", updated_at: new Date().toISOString() }).eq("id", imp.id);
      qc.invalidateQueries({ queryKey: ["appointments", space.id] });
      qc.invalidateQueries({ queryKey: ["plan_imports"] });
      if (planDue && newDue) refresh();
      onDone({ created: ch.inserts.length, updated: ch.updates.length });
    } catch (e) {
      report(e, "plan", { step: "apply" });
      setErr("לא הצלחנו לשמור. בדקו את החיבור ונסו שוב.");
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-extrabold">{imp.source === "standard" ? "התוכנית המקובלת" : "זה מה שמצאנו בתוכנית"}</h2>
          <p className="text-sm text-ink-3 mt-1">עברו על הרשימה, תקנו שבועות אם צריך והורידו את מה שלא רלוונטי. {appointments.length ? "בדיקות שכבר קיימות יעודכנו ולא ישוכפלו." : ""}</p>
          {result.clinic && <p className="text-[13px] text-ink-3 mt-1">מתוך: {result.clinic}</p>}
        </div>
        <button className="btn btn-ghost" onClick={onBack}>חזרה</button>
      </div>
      {result.general_notes && <div className="rounded-2xl p-3.5 bg-surface-2 text-sm">{result.general_notes}</div>}
      {planDue && (
        <label className="rounded-2xl p-3.5 bg-primary-50 flex gap-3 items-start cursor-pointer">
          <input type="checkbox" className="cb mt-0.5" checked={newDue} onChange={(e) => setNewDue(e.target.checked)} />
          <span><b className="block">בתוכנית כתוב תאריך לידה משוער {fmtDayYear(planDue)}</b>
            <span className="text-[13px] text-ink-3">אצלנו: {fmtDayYear(space!.due_date)}. לעדכן לפי התוכנית?</span></span>
        </label>
      )}
      <PlanReview rows={rows} week={week} onChange={setRows} />
      <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] md:bottom-4 z-10 card p-3 flex items-center gap-3 shadow-lg">
        <span className="flex-1 text-sm font-bold text-ink-2">{nCreate ? `${nCreate} חדשים` : ""}{nCreate && nUpdate ? " · " : ""}{nUpdate ? `${nUpdate} יעודכנו` : ""}{!nCreate && !nUpdate ? "לא נבחר כלום" : ""}</span>
        <button className="btn btn-primary" disabled={busy || (!nCreate && !nUpdate)} onClick={apply}>{busy ? "שומרים…" : welcome ? "יצירת התוכנית" : "עדכון התורים"}</button>
      </div>
      {err && <p className="text-sm font-bold" style={{ color: "var(--st-att)" }}>{err}</p>}
    </div>
  );
}
