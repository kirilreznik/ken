"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Field, Sheet } from "@/components/ui";
import { useBirthPlan, useContacts, useDocuments, usePrepItems, useSave, useTasks, nowSort, signedUrl } from "@/lib/data";
import { useSession } from "@/lib/session";
import { addDays, dateOfWeek, toDay, weekInfo } from "@/lib/pregnancy";
import { fmtDayYear, fmtDay } from "@/lib/format";
import { BIRTH_PREFERENCE_SUGGESTIONS, DOC_CATEGORY_LABEL } from "@/lib/labels";
import { BIRTH_TASKS } from "@/lib/birthDefaults";
import type { BirthPlan, Contact } from "@/lib/types";

function Card({ icon, tint, title, action, children, className = "" }: { icon: IconName; tint: [string, string]; title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 md:p-6 flex flex-col gap-3.5 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style={{ background: tint[0], color: tint[1] }}><Icon name={icon} /></span>
        <h2 className="text-lg font-extrabold flex-1">{title}</h2>{action}
      </div>
      {children}
    </section>
  );
}
const CallBtn = ({ phone, label }: { phone?: string | null; label: string }) =>
  phone ? <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} aria-label={`חיוג ל${label}`} className="icon-btn flex-none" style={{ background: "var(--primary-100)", color: "var(--primary)" }}><Icon name="phone" /></a> : null;
const Edit = ({ onClick }: { onClick: () => void }) => <button className="text-sm font-bold text-primary min-h-11 px-1" onClick={onClick}>עריכה</button>;

type PlanFields = "hospital" | "caregiver" | "route";

function PlanSheet({ open, section, plan, onSave, onClose }: { open: boolean; section: PlanFields | null; plan: BirthPlan | null; onSave: (p: Partial<BirthPlan>) => void; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={section === "hospital" ? "בית חולים" : section === "caregiver" ? "רופא/ה ומיילדת" : "מסלול לבית החולים"}>
      {open && section && <PlanForm key={section} section={section} plan={plan} onSave={(p) => { onSave(p); onClose(); }} onClose={onClose} />}
    </Sheet>
  );
}
function PlanForm({ section, plan, onSave, onClose }: { section: PlanFields; plan: BirthPlan | null; onSave: (p: Partial<BirthPlan>) => void; onClose: () => void }) {
  const [f, setF] = useState(() => ({
    hospital_name: plan?.hospital_name ?? "", hospital_ward: plan?.hospital_ward ?? "", hospital_phone: plan?.hospital_phone ?? "", hospital_address: plan?.hospital_address ?? "",
    tour: plan?.tour_at ? toDay(new Date(plan.tour_at)) : "", caregiver_name: plan?.caregiver_name ?? "", caregiver_phone: plan?.caregiver_phone ?? "", doula_status: plan?.doula_status ?? "",
    parking: plan?.parking ?? "", route_notes: plan?.route_notes ?? "", free: plan?.travel_minutes_free?.toString() ?? "", peak: plan?.travel_minutes_peak?.toString() ?? "",
  }));
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const n = (s: string) => (s.trim() ? parseInt(s, 10) || null : null);
  const submit = () => onSave(section === "hospital"
    ? { hospital_name: f.hospital_name || null, hospital_ward: f.hospital_ward || null, hospital_phone: f.hospital_phone || null, hospital_address: f.hospital_address || null, tour_at: f.tour ? new Date(`${f.tour}T10:00`).toISOString() : null }
    : section === "caregiver" ? { caregiver_name: f.caregiver_name || null, caregiver_phone: f.caregiver_phone || null, doula_status: f.doula_status || null }
      : { parking: f.parking || null, route_notes: f.route_notes || null, travel_minutes_free: n(f.free), travel_minutes_peak: n(f.peak) });
  return (
    <>
      {section === "hospital" && <>
        <Field label="שם בית החולים"><input className="input" value={f.hospital_name} onChange={set("hospital_name")} autoFocus /></Field>
        <Field label="מחלקה / חדרי לידה"><input className="input" value={f.hospital_ward} onChange={set("hospital_ward")} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="טלפון"><input className="input" type="tel" dir="ltr" style={{ textAlign: "right" }} value={f.hospital_phone} onChange={set("hospital_phone")} /></Field>
          <Field label="סיור במחלקה"><input className="input" type="date" value={f.tour} onChange={set("tour")} /></Field>
        </div>
        <Field label="כתובת" hint="משמשת לניווט"><input className="input" value={f.hospital_address} onChange={set("hospital_address")} /></Field>
      </>}
      {section === "caregiver" && <>
        <Field label="רופא/ה מלווה"><input className="input" value={f.caregiver_name} onChange={set("caregiver_name")} autoFocus /></Field>
        <Field label="טלפון"><input className="input" type="tel" dir="ltr" style={{ textAlign: "right" }} value={f.caregiver_phone} onChange={set("caregiver_phone")} /></Field>
        <Field label="מיילדת / דולה" hint="למשל: בבדיקה — שיחות היכרות עם שירה ומאיה"><input className="input" value={f.doula_status} onChange={set("doula_status")} /></Field>
      </>}
      {section === "route" && <>
        <div className="grid grid-cols-2 gap-3">
          <Field label="דקות בלי פקקים"><input className="input" inputMode="numeric" value={f.free} onChange={set("free")} /></Field>
          <Field label="דקות בשעות עומס"><input className="input" inputMode="numeric" value={f.peak} onChange={set("peak")} /></Field>
        </div>
        <Field label="חניה"><input className="input" value={f.parking} onChange={set("parking")} placeholder="למשל: חניון מזרחי, כניסה 3" /></Field>
        <Field label="הערות למסלול"><textarea className="input" rows={2} value={f.route_notes} onChange={set("route_notes")} placeholder="למשל: בלילה נכנסים דרך המיון" /></Field>
      </>}
      <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-5 pb-safe bg-white flex gap-2.5 justify-end border-t border-line-2">
        <button type="button" className="btn btn-secondary" onClick={onClose}>ביטול</button>
        <button type="button" className="btn btn-primary" onClick={submit}>שמירה</button>
      </div>
    </>
  );
}

function ContactRow({ c, onSave, onRemove }: { c: Contact; onSave: (p: Partial<Contact>) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <form className="flex flex-col gap-2 py-3 border-b border-line-2" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget);
        onSave({ name: String(fd.get("name") || c.name), role: String(fd.get("role") || "") || null, phone: String(fd.get("phone") || "") || null }); setEditing(false); }}>
        <div className="grid grid-cols-2 gap-2"><input name="name" className="input" defaultValue={c.name} aria-label="שם" /><input name="role" className="input" defaultValue={c.role ?? ""} placeholder="קשר" aria-label="קשר" /></div>
        <input name="phone" className="input" type="tel" dir="ltr" style={{ textAlign: "right" }} defaultValue={c.phone ?? ""} placeholder="טלפון" aria-label="טלפון" />
        <div className="flex gap-2"><button className="btn btn-primary h-10 min-h-0">שמירה</button><button type="button" className="btn btn-ghost h-10 min-h-0" onClick={() => setEditing(false)}>ביטול</button>
          <button type="button" className="btn btn-danger h-10 min-h-0 ms-auto" onClick={onRemove}><Icon name="trash" size={16} />מחיקה</button></div>
      </form>
    );
  }
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-line-2 last:border-0 min-h-14">
      <button className="flex-1 text-start" onClick={() => setEditing(true)}><b>{c.name}</b>{c.role && <span className="text-[13px] text-ink-3"> · {c.role}</span>}</button>
      <CallBtn phone={c.phone} label={c.name} />
    </div>
  );
}

export default function Birth() {
  const { space, user } = useSession();
  const { plan, save } = useBirthPlan();
  const { data: contacts } = useContacts();
  const { data: prep } = usePrepItems();
  const { data: docs } = useDocuments();
  const { data: tasks } = useTasks();
  const saveContact = useSave("contacts");
  const savePrep = useSave("prep_items");
  const saveDoc = useSave("documents");
  const saveTask = useSave("tasks");
  const [section, setSection] = useState<PlanFields | null>(null);
  const [pref, setPref] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  if (!space || !user) return null;

  const wk = weekInfo(space.due_date);
  const closeBy = dateOfWeek(space.due_date, 36);
  const bag = (prep ?? []).filter((p) => p.category === "birth_bag" && p.status !== "not_needed");
  const bagReady = bag.filter((p) => p.status === "bought" || p.status === "chosen").length;
  const pinned = (docs ?? []).filter((d) => d.pinned_for_birth);
  const birthTasks = (tasks ?? []).filter((t) => t.category === "birth").sort((a, b) => (a.due_week ?? 99) - (b.due_week ?? 99) || (a.due_date ?? "").localeCompare(b.due_date ?? ""));
  const prefs = plan?.preferences ?? [];
  const sorted = (contacts ?? []).slice().sort((a, b) => a.sort - b.sort);
  const navQ = plan?.hospital_address || plan?.hospital_name;

  const areas = [!!plan?.hospital_name, !!plan?.caregiver_name, sorted.length > 0, bag.length > 0 && bagReady === bag.length, pinned.length > 0, prefs.length > 0, !!(plan?.travel_minutes_free || plan?.parking), birthTasks.length > 0 && birthTasks.every((t) => t.done)];
  const done = areas.filter(Boolean).length;

  const addContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    if (!name) return;
    saveContact.insert({ name, role: String(fd.get("role") || "") || null, phone: String(fd.get("phone") || "") || null, sort: nowSort() });
    e.currentTarget.reset();
  };
  const togglePref = (p: string) => save({ preferences: prefs.includes(p) ? prefs.filter((x) => x !== p) : [...prefs, p] });
  const seedTasks = () => {
    const have = new Set(birthTasks.map((t) => t.source_key));
    for (const t of BIRTH_TASKS) if (!have.has(t.key)) saveTask.insert({ title: t.title, category: "birth", priority: "normal", due_week: t.week,
      due_date: toDay(addDays(dateOfWeek(space.due_date, t.week + 1), -1)), source_key: t.key, done: false, done_at: null, done_by: null,
      notes: null, trimester: 3, assignee: null, appointment_id: null, document_id: null, created_by: user.id });
  };
  const openDoc = async (id: string) => { const d = docs?.find((x) => x.id === id); if (d) try { window.open(await signedUrl(d), "_blank"); } catch { alert("אפשר לפתוח מסמכים רק עם חיבור"); } };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <h1 className="font-serif text-[34px] md:text-[40px] leading-tight">הכנה ללידה</h1>
          <p className="text-ink-3 mt-1">{wk.week < 36 ? `אין לחץ — יש זמן. כדאי לסגור הכל עד שבוע 36, ב־${fmtDayYear(closeBy)}.` : "הישורת האחרונה — כל מה שצריך במקום אחד."}</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-line rounded-[20px] px-4 py-3">
          <div className="flex gap-1">{areas.map((ok, i) => <span key={i} className="w-5 h-2 rounded" style={{ background: ok ? "var(--primary)" : "#EDE6DB" }} />)}</div>
          <span className="text-sm font-bold">{done} מתוך 8 תחומים מוכנים</span>
        </div>
        <Link href="/birth/print" className="btn btn-secondary"><Icon name="down" />דף ללידה להדפסה</Link>
      </header>

      <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] items-start">
        <Card icon="test" tint={["var(--st-sched-bg)", "var(--st-sched)"]} title="בית חולים" action={<Edit onClick={() => setSection("hospital")} />}>
          {plan?.hospital_name ? (
            <>
              <div className="flex items-center gap-3"><div className="flex-1"><div className="font-serif text-2xl">{plan.hospital_name}</div>{plan.hospital_ward && <div className="text-sm text-ink-3">{plan.hospital_ward}</div>}</div><CallBtn phone={plan.hospital_phone} label="בית החולים" /></div>
              <div className="flex items-center gap-2.5 py-2 border-t border-line-2 text-[15px]"><Icon name="cal" size={18} className="text-ink-3" /><span className="flex-1">סיור בחדרי לידה</span><b>{plan.tour_at ? fmtDay(plan.tour_at) : "—"}</b></div>
              <label className="flex items-center gap-2.5 py-2 border-t border-line-2 text-[15px] min-h-11"><input type="checkbox" className="cb" checked={plan.registration_done} onChange={(e) => save({ registration_done: e.target.checked })} /><span className="flex-1">רישום מוקדם בבית החולים</span><span className="text-[13px] text-ink-3">שבוע 32</span></label>
            </>
          ) : <button className="btn btn-secondary self-start" onClick={() => setSection("hospital")}><Icon name="plus" />בחירת בית חולים</button>}
        </Card>

        <Card icon="steth" tint={["var(--primary-100)", "var(--primary)"]} title="רופא/ה ומיילדת" action={<Edit onClick={() => setSection("caregiver")} />}>
          {plan?.caregiver_name ? <div className="flex items-center gap-3"><span className="flex-1"><b className="block">{plan.caregiver_name}</b><span className="text-[13px] text-ink-3">רופא/ה מלווה</span></span><CallBtn phone={plan.caregiver_phone} label={plan.caregiver_name} /></div>
            : <button className="btn btn-secondary self-start" onClick={() => setSection("caregiver")}><Icon name="plus" />הוספה</button>}
          {plan?.doula_status && <div className="text-[15px] border-t border-line-2 pt-2.5"><b>מיילדת / דולה:</b> {plan.doula_status}</div>}
        </Card>

        <Card icon="users" tint={["var(--chip)", "var(--ink-2)"]} title="אנשי קשר חשובים">
          <div>{sorted.map((c) => <ContactRow key={c.id} c={c} onSave={(p) => saveContact.update(c.id, p)} onRemove={() => saveContact.remove(c.id)} />)}</div>
          <form onSubmit={addContact} className="flex flex-col gap-2 pt-1">
            <div className="grid grid-cols-2 gap-2"><input name="name" className="input" placeholder="שם" aria-label="שם" /><input name="role" className="input" placeholder="למשל: אמא של נועה" aria-label="קשר" /></div>
            <div className="flex gap-2"><input name="phone" className="input" type="tel" dir="ltr" style={{ textAlign: "right" }} placeholder="טלפון" aria-label="טלפון" /><button className="btn btn-secondary flex-none"><Icon name="plus" />הוספה</button></div>
          </form>
        </Card>

        <Card icon="bag" tint={["var(--second-100)", "var(--second)"]} title="תיק לידה" action={<span className="text-sm font-extrabold">{bagReady}/{bag.length}</span>}>
          {bag.length > 0 && <div className="h-1.5 rounded-full bg-[#EDE6DB] flex"><span className="rounded-full" style={{ width: `${(bagReady / bag.length) * 100}%`, background: "var(--second)" }} /></div>}
          {bag.slice(0, 8).map((p) => {
            const ok = p.status === "bought" || p.status === "chosen";
            return (
              <label key={p.id} className="flex items-center gap-3 py-1.5 min-h-11 text-[15px]">
                <input type="checkbox" className="cb" checked={ok} onChange={() => savePrep.update(p.id, { status: ok ? "need" : "bought", updated_at: new Date().toISOString() })} />
                <span className={ok ? "line-through text-[#8a8177]" : ""}>{p.title}</span>
              </label>
            );
          })}
          <Link href="/prep" className="text-sm font-bold text-primary">{bag.length ? "לרשימה המלאה בהכנות לתינוק" : "הוספת פריטים לתיק בהכנות לתינוק"}</Link>
        </Card>

        <Card icon="doc" tint={["var(--chip)", "var(--ink-2)"]} title="מסמכים חשובים" action={<button className="text-sm font-bold text-primary min-h-11 px-1" onClick={() => setPinOpen(true)}>הצמדה</button>}>
          {pinned.length === 0 && <p className="text-sm text-ink-3">הצמידו מסמכים שחשוב שיהיו בהישג יד בחדר הלידה — כרטיס מעקב, סוג דם, סיכומי סקירות.</p>}
          {pinned.map((d) => (
            <div key={d.id} className="flex items-center gap-2.5 py-1.5 text-[15px]"><Icon name="check" size={18} style={{ color: "var(--st-done)" }} />
              <button className="flex-1 text-start" onClick={() => openDoc(d.id)}>{d.title}</button>
              <button className="text-[13px] text-ink-3 min-h-11 px-1" onClick={() => saveDoc.update(d.id, { pinned_for_birth: false })}>הסרה</button></div>
          ))}
          <p className="text-[13px] text-ink-3 flex items-center gap-1.5"><Icon name="cloudCheck" size={16} style={{ color: "var(--primary)" }} />רשימת המסמכים זמינה גם בלי קליטה</p>
        </Card>

        <Card icon="heart" tint={["var(--second-100)", "var(--second)"]} title="העדפות ללידה" className="!bg-[#FFF9F3] !border-[#F1E0CF]">
          <p className="text-sm text-ink-3 leading-normal">מה חשוב לכם — לא תוכנית מחייבת. כדאי לעבור על זה עם הרופא/ה בשבוע 34.</p>
          <div className="flex flex-wrap gap-2">
            {[...new Set([...prefs, ...BIRTH_PREFERENCE_SUGGESTIONS])].map((p) => {
              const on = prefs.includes(p);
              return <button key={p} aria-pressed={on} onClick={() => togglePref(p)} className="min-h-9 px-3.5 py-1.5 rounded-[14px] text-sm font-semibold"
                style={on ? { background: "var(--second)", color: "#fff" } : { background: "#fff", color: "#4A3F33", boxShadow: "inset 0 0 0 1px #EBD9C8" }}>{p}</button>;
            })}
          </div>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (pref.trim()) { save({ preferences: [...prefs, pref.trim()] }); setPref(""); } }}>
            <input className="input" style={{ minHeight: 40 }} value={pref} onChange={(e) => setPref(e.target.value)} placeholder="העדפה משלכם…" aria-label="העדפה חדשה" />
            <button className="btn btn-secondary h-10 min-h-0">הוספה</button>
          </form>
        </Card>

        <Card icon="nav" tint={["var(--primary-100)", "var(--primary)"]} title="מסלול לבית החולים" action={<Edit onClick={() => setSection("route")} />}>
          <div className="flex gap-6">
            <div><div className="font-serif text-[28px]">{plan?.travel_minutes_free ?? "—"}</div><div className="text-[13px] font-bold text-ink-3">דק׳ בלי פקקים</div></div>
            <div><div className="font-serif text-[28px]">{plan?.travel_minutes_peak ?? "—"}</div><div className="text-[13px] font-bold text-ink-3">דק׳ בשעות עומס</div></div>
          </div>
          {plan?.parking && <div className="text-sm"><b>חניה:</b> {plan.parking}</div>}
          {plan?.route_notes && <div className="text-sm">{plan.route_notes}</div>}
          {navQ ? (
            <div className="flex gap-2">
              <a className="btn btn-primary flex-1" href={`https://waze.com/ul?q=${encodeURIComponent(navQ)}&navigate=yes`} target="_blank" rel="noreferrer"><Icon name="nav" />Waze</a>
              <a className="btn btn-secondary flex-1" href={`https://maps.google.com/?q=${encodeURIComponent(navQ)}`} target="_blank" rel="noreferrer">מפות</a>
            </div>
          ) : <p className="text-sm text-ink-3">הוסיפו כתובת לבית החולים כדי לנווט בלחיצה.</p>}
        </Card>

        <Card icon="task" tint={["var(--primary-100)", "var(--primary)"]} title="Checklist סופי">
          {birthTasks.length === 0 ? (
            <button className="btn btn-secondary self-start" onClick={seedTasks}><Icon name="plus" />הוספת הרשימה המומלצת</button>
          ) : [...new Set(birthTasks.map((t) => t.due_week))].map((w) => (
            <div key={String(w)} className="flex flex-col">
              <div className="lbl mt-1">{w ? `שבוע ${w}` : "ללא שבוע"}</div>
              {birthTasks.filter((t) => t.due_week === w).map((t) => (
                <label key={t.id} className="flex items-center gap-3 py-1.5 min-h-11 text-[15px]">
                  <input type="checkbox" className="cb" checked={t.done} onChange={() => saveTask.update(t.id, t.done ? { done: false, done_at: null, done_by: null } : { done: true, done_at: new Date().toISOString(), done_by: user.id })} />
                  <span className={t.done ? "line-through text-[#8a8177]" : ""}>{t.title}</span>
                </label>
              ))}
            </div>
          ))}
        </Card>
      </div>

      <PlanSheet open={!!section} section={section} plan={plan} onSave={save} onClose={() => setSection(null)} />
      <Sheet open={pinOpen} onClose={() => setPinOpen(false)} title="הצמדת מסמכים ללידה">
        {(docs ?? []).length === 0 && <p className="text-ink-3">עוד אין מסמכים.</p>}
        {(docs ?? []).slice().sort((a, b) => b.doc_date.localeCompare(a.doc_date)).map((d) => (
          <label key={d.id} className="flex items-center gap-3 min-h-12 border-b border-line-2">
            <input type="checkbox" className="cb" checked={!!d.pinned_for_birth} onChange={(e) => saveDoc.update(d.id, { pinned_for_birth: e.target.checked })} />
            <span className="flex-1"><b>{d.title}</b> <span className="text-[13px] text-ink-3">· {DOC_CATEGORY_LABEL[d.category]}</span></span>
          </label>
        ))}
        <div className="pb-5" />
      </Sheet>
    </div>
  );
}
