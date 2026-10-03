"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Field, Sheet } from "./ui";
import { Icon } from "./Icon";
import { useAppointments, useSave, nextAppointment, sortAppointments, nowSort } from "@/lib/data";
import { useSession } from "@/lib/session";
import { enqueueUpload } from "@/lib/uploads";
import { toDay, weekInfo, weekLabelOf } from "@/lib/pregnancy";
import { fmtShort } from "@/lib/format";
import { DOC_CATEGORY_LABEL, KIND_LABEL, PRIORITY_LABEL, QUESTION_CATEGORIES, STATUS_LABEL, TASK_CATEGORY_LABEL } from "@/lib/labels";
import type { Appointment, AppointmentKind, AppointmentStatus, DocCategory, Priority, Question, Task, TaskCategory } from "@/lib/types";

const opt = <T extends string>(rec: Record<T, string>) => (Object.keys(rec) as T[]).map((k) => <option key={k} value={k}>{rec[k]}</option>);

function AppointmentSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data } = useAppointments();
  const list = sortAppointments((data ?? []).filter((a) => a.status !== "completed"));
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">ללא קישור</option>
      {list.map((a) => <option key={a.id} value={a.id}>{a.title}{a.starts_at ? ` · ${fmtShort(a.starts_at)}` : ""}</option>)}
    </select>
  );
}

function Footer({ onClose, onSave, onDelete, saveLabel = "שמירה" }: { onClose: () => void; onSave: () => void; onDelete?: () => void; saveLabel?: string }) {
  return (
    <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-5 pb-safe bg-white flex gap-2.5 justify-end border-t border-line-2">
      {onDelete && <button type="button" className="btn btn-danger me-auto" onClick={onDelete}><Icon name="trash" size={18} />מחיקה</button>}
      <button type="button" className="btn btn-secondary" onClick={onClose}>ביטול</button>
      <button type="button" className="btn btn-primary" onClick={onSave}>{saveLabel}</button>
    </div>
  );
}

/* ───────────── Appointment / test ───────────── */
export function AppointmentSheet({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Partial<Appointment> | null }) {
  return (
    <Sheet open={open} onClose={onClose} title={initial?.id ? "עריכת תור" : "הוספת תור או בדיקה"} wide>
      {open && <AppointmentForm key={initial?.id ?? "new"} onClose={onClose} initial={initial} />}
    </Sheet>
  );
}

function AppointmentForm({ onClose, initial }: { onClose: () => void; initial?: Partial<Appointment> | null }) {
  const { space, user } = useSession();
  const save = useSave("appointments");
  const editing = !!initial?.id;
  const [f, setF] = useState(() => {
    const d = initial?.starts_at ? new Date(initial.starts_at) : null;
    return {
      title: initial?.title ?? "", kind: (initial?.kind ?? "doctor") as AppointmentKind, status: (initial?.status ?? "scheduled") as AppointmentStatus,
      date: d ? toDay(d) : "", time: d ? d.toTimeString().slice(0, 5) : "",
      provider: initial?.provider ?? "", location: initial?.location ?? "", medical_notes: initial?.medical_notes ?? "",
      personal_note: initial?.personal_note ?? "", result_summary: initial?.result_summary ?? "",
    };
  });
  const [err, setErr] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const startsAt = f.date ? new Date(`${f.date}T${f.time || "09:00"}`).toISOString() : null;
  const week = f.date && space ? weekLabelOf(space.due_date, new Date(`${f.date}T12:00`)) : null;

  const submit = () => {
    if (!f.title.trim()) return setErr("צריך לתת שם לתור או לבדיקה");
    if (f.status === "scheduled" && !f.date) return setErr("לתור שנקבע צריך תאריך");
    const row = {
      title: f.title.trim(), kind: f.kind, status: f.status, starts_at: startsAt,
      provider: f.provider || null, location: f.location || null, medical_notes: f.medical_notes || null,
      personal_note: f.personal_note || null, result_summary: f.result_summary || null,
    };
    if (editing) save.update(initial!.id!, { ...row, updated_at: new Date().toISOString() });
    else save.insert({ ...row, created_by: user!.id, window_start_week: initial?.window_start_week ?? null, window_end_week: initial?.window_end_week ?? null });
    onClose();
  };

  return (
    <>
      <Field label="מה התור?" error={err && !f.title.trim() ? err : undefined}>
        <input className="input" value={f.title} onChange={set("title")} placeholder="למשל: סקירת מערכות מאוחרת" autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="סוג"><select className="input" value={f.kind} onChange={set("kind")}>{opt(KIND_LABEL)}</select></Field>
        <Field label="סטטוס">
          <select className="input" value={f.status} onChange={set("status")}>
            {(["future", "need", "scheduled", "done", "pending", "completed"] as const).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </Field>
        <Field label="תאריך" error={err && f.status === "scheduled" && !f.date ? err : undefined}
          hint={week ? `שבוע ${week} · מחושב אוטומטית` : undefined}>
          <input className="input" type="date" value={f.date} onChange={set("date")} />
        </Field>
        <Field label="שעה"><input className="input" type="time" value={f.time} onChange={set("time")} /></Field>
        <Field label="רופא / נותן שירות"><input className="input" value={f.provider} onChange={set("provider")} /></Field>
        <Field label="מקום"><input className="input" value={f.location} onChange={set("location")} /></Field>
      </div>
      {(f.status === "pending" || f.status === "completed" || f.status === "done") && (
        <Field label="תוצאה בקצרה"><input className="input" value={f.result_summary} onChange={set("result_summary")} placeholder="למשל: תקין" /></Field>
      )}
      <Field label="הערות רפואיות" hint="מה נאמר במרפאה">
        <textarea className="input" rows={2} value={f.medical_notes} onChange={set("medical_notes")} style={{ background: "#F7F9FC", borderColor: "#D8E2EC" }} />
      </Field>
      <Field label="הערה אישית" hint="רק לשניכם">
        <textarea className="input" rows={2} value={f.personal_note} onChange={set("personal_note")} style={{ background: "#FFFBF6", borderColor: "#EBD9C8" }} />
      </Field>
      <Footer onClose={onClose} onSave={submit} onDelete={editing ? () => { save.remove(initial!.id!); onClose(); } : undefined} />
    </>
  );
}

/* ───────────── Task ───────────── */
export function TaskSheet({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Partial<Task> | null }) {
  return (
    <Sheet open={open} onClose={onClose} title={initial?.id ? "עריכת משימה" : "משימה חדשה"}>
      {open && <TaskForm key={initial?.id ?? "new"} onClose={onClose} initial={initial} />}
    </Sheet>
  );
}

function TaskForm({ onClose, initial }: { onClose: () => void; initial?: Partial<Task> | null }) {
  const { user, members } = useSession();
  const save = useSave("tasks");
  const editing = !!initial?.id;
  const [f, setF] = useState(() => ({ title: initial?.title ?? "", category: (initial?.category ?? "pregnancy") as TaskCategory, due_date: initial?.due_date ?? "",
    priority: (initial?.priority ?? "normal") as Priority, assignee: initial?.assignee ?? user?.id ?? "", notes: initial?.notes ?? "", appointment_id: initial?.appointment_id ?? "" }));
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = () => {
    if (!f.title.trim()) return setErr("מה צריך לעשות?");
    const row = { title: f.title.trim(), category: f.category, due_date: f.due_date || null, priority: f.priority,
      assignee: f.assignee || null, notes: f.notes || null, appointment_id: f.appointment_id || null };
    if (editing) save.update(initial!.id!, row);
    else save.insert({ ...row, done: false, done_at: null, done_by: null, trimester: initial?.trimester ?? null, document_id: null, created_by: user!.id });
    onClose();
  };
  return (
    <>
      <Field label="משימה" error={err || undefined}><input className="input" value={f.title} onChange={set("title")} autoFocus /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="קטגוריה"><select className="input" value={f.category} onChange={set("category")}>{opt(TASK_CATEGORY_LABEL)}</select></Field>
        <Field label="עדיפות"><select className="input" value={f.priority} onChange={set("priority")}>{opt(PRIORITY_LABEL)}</select></Field>
        <Field label="עד מתי"><input className="input" type="date" value={f.due_date} onChange={set("due_date")} /></Field>
        <Field label="באחריות">
          <select className="input" value={f.assignee} onChange={set("assignee")}>
            <option value="">שנינו</option>
            {members.map((m) => <option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="קשור לתור"><AppointmentSelect value={f.appointment_id} onChange={(v) => setF({ ...f, appointment_id: v })} /></Field>
      <Field label="הערות"><textarea className="input" rows={2} value={f.notes} onChange={set("notes")} /></Field>
      <Footer onClose={onClose} onSave={submit} onDelete={editing ? () => { save.remove(initial!.id!); onClose(); } : undefined} />
    </>
  );
}

/* ───────────── Upload document ───────────── */
export function UploadSheet({ open, onClose, appointmentId }: { open: boolean; onClose: () => void; appointmentId?: string | null }) {
  return (
    <Sheet open={open} onClose={onClose} title="העלאת מסמך">
      {open && <UploadForm onClose={onClose} appointmentId={appointmentId} />}
    </Sheet>
  );
}

function UploadForm({ onClose, appointmentId }: { onClose: () => void; appointmentId?: string | null }) {
  const { space, user } = useSession();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [f, setF] = useState(() => ({ title: "", category: "other" as DocCategory, doc_date: toDay(new Date()), provider: "", note: "", appointment_id: appointmentId ?? "" }));
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFile(file);
    if (file && !f.title) setF((x) => ({ ...x, title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") }));
    if (file?.type.startsWith("image/") && f.category === "other") setF((x) => ({ ...x, category: "ultrasound" }));
  };
  const submit = async () => {
    if (!file) return setErr("בחרו קובץ או צלמו מסמך");
    if (file.size > 25 * 1024 * 1024) return setErr("הקובץ גדול מ־25MB");
    await enqueueUpload(space!.id, user!.id, file, { ...f, title: f.title.trim() || file.name, appointment_id: f.appointment_id || null }, qc);
    onClose();
  };
  return (
    <>
      <label className="rounded-[18px] p-5 text-center flex flex-col items-center gap-1.5 cursor-pointer" style={{ border: "1.5px dashed #CFC3B3", background: "var(--surface-2)" }}>
        <Icon name={file ? "doc" : "camera"} size={28} style={{ color: "var(--primary)" }} />
        <span className="font-extrabold">{file ? file.name : "צילום מסמך או בחירת קובץ"}</span>
        <span className="text-[13px] text-ink-3">PDF או תמונה · עד 25MB · אפשר גם בלי חיבור</span>
        <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={pick} />
      </label>
      {err && <span className="text-[13px] font-semibold" style={{ color: "var(--st-att)" }}>{err}</span>}
      <Field label="שם המסמך"><input className="input" value={f.title} onChange={set("title")} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="קטגוריה"><select className="input" value={f.category} onChange={set("category")}>{opt(DOC_CATEGORY_LABEL)}</select></Field>
        <Field label="תאריך" hint={space && f.doc_date ? `שבוע ${weekLabelOf(space.due_date, new Date(`${f.doc_date}T12:00`))}` : undefined}>
          <input className="input" type="date" value={f.doc_date} onChange={set("doc_date")} />
        </Field>
      </div>
      <Field label="רופא / נותן שירות"><input className="input" value={f.provider} onChange={set("provider")} /></Field>
      <Field label="קשור לתור"><AppointmentSelect value={f.appointment_id} onChange={(v) => setF({ ...f, appointment_id: v })} /></Field>
      <Field label="הערה"><textarea className="input" rows={2} value={f.note} onChange={set("note")} /></Field>
      <Footer onClose={onClose} onSave={submit} saveLabel="העלאה" />
    </>
  );
}

/* ───────────── Question ───────────── */
export function QuestionSheet({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Partial<Question> | null }) {
  return (
    <Sheet open={open} onClose={onClose} title={initial?.id ? "שאלה" : "שאלה חדשה לרופא"}>
      {open && <QuestionForm key={initial?.id ?? "new"} onClose={onClose} initial={initial} />}
    </Sheet>
  );
}

function QuestionForm({ onClose, initial }: { onClose: () => void; initial?: Partial<Question> | null }) {
  const { user, space } = useSession();
  const save = useSave("questions");
  const { data: appts } = useAppointments();
  const editing = !!initial?.id;
  const [f, setF] = useState(() => ({ text: initial?.text ?? "", category: initial?.category ?? "", appointment_id: initial?.appointment_id ?? nextAppointment(appts)?.id ?? "",
    answer: initial?.answer ?? "", resolved: initial?.resolved ?? false }));
  const submit = () => {
    if (!f.text.trim()) return;
    const row = { text: f.text.trim(), category: f.category || null, appointment_id: f.appointment_id || null, answer: f.answer || null, resolved: f.resolved };
    if (editing) save.update(initial!.id!, row);
    else save.insert({ ...row, week: space ? weekInfo(space.due_date).week : null,
      sort: nowSort(), created_by: user!.id });
    onClose();
  };
  return (
    <>
      <Field label="השאלה"><textarea className="input" rows={3} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} autoFocus placeholder="מה תרצו לשאול?" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="קטגוריה">
          <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
            <option value="">ללא</option>{QUESTION_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="לתור"><AppointmentSelect value={f.appointment_id} onChange={(v) => setF({ ...f, appointment_id: v })} /></Field>
      </div>
      {editing && (
        <>
          <Field label="תשובת הרופא/ה"><textarea className="input" rows={2} value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} style={{ background: "#F7F9FC" }} /></Field>
          <label className="flex items-center justify-between min-h-11"><span className="font-semibold">השאלה נענתה</span>
            <input type="checkbox" className="switch" checked={f.resolved} onChange={(e) => setF({ ...f, resolved: e.target.checked })} /></label>
        </>
      )}
      <Footer onClose={onClose} onSave={submit} onDelete={editing ? () => { save.remove(initial!.id!); onClose(); } : undefined} />
    </>
  );
}
