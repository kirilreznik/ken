"use client";

import { Icon } from "@/components/Icon";
import { KIND_LABEL } from "@/lib/labels";
import { fmtDayYear } from "@/lib/format";
import type { PlanRow } from "@/lib/plan";
import type { AppointmentKind } from "@/lib/types";

const num = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.min(42, parseInt(v, 10) || 0)));

const BADGE: Record<PlanRow["action"], { label: string; bg: string; fg: string }> = {
  create: { label: "חדש", bg: "var(--primary-100)", fg: "var(--primary)" },
  update: { label: "קיים · יעודכן", bg: "var(--st-sched-bg)", fg: "var(--st-sched)" },
  past: { label: "החלון עבר", bg: "var(--chip)", fg: "var(--ink-3)" },
  done: { label: "כבר בוצע", bg: "var(--st-done-bg)", fg: "var(--st-done)" },
};

function WeekInput({ value, onChange, label }: { value: number | null; onChange: (v: number | null) => void; label: string }) {
  return <input className="w-12 h-9 rounded-lg border border-line bg-surface-2 text-center font-bold" inputMode="numeric" aria-label={label}
    value={value ?? ""} onChange={(e) => onChange(num(e.target.value))} />;
}

function Row({ r, week, onChange, onRemove }: { r: PlanRow; week: number; onChange: (p: Partial<PlanRow>) => void; onRemove: () => void }) {
  const b = BADGE[r.action];
  const locked = r.action === "done";
  const late = r.include && r.bookBy != null && r.bookBy <= week && !r.date && r.action !== "past";
  return (
    <div className="py-3.5 flex gap-3 items-start" style={{ opacity: r.include || locked ? 1 : 0.55 }}>
      <input type="checkbox" className="cb mt-1.5" checked={r.include} disabled={locked} aria-label={`לכלול: ${r.title}`} onChange={(e) => onChange({ include: e.target.checked })} />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <input className="flex-1 min-w-[160px] font-bold bg-transparent border-b border-transparent focus:border-line outline-none py-0.5" value={r.title} disabled={locked}
            aria-label="שם הבדיקה" onChange={(e) => onChange({ title: e.target.value })} />
          <span className="badge text-[12px]" style={{ background: b.bg, color: b.fg }}>{b.label}</span>
          {r.optional && <span className="badge text-[12px] bg-chip text-ink-3">לפי בחירה</span>}
        </div>
        {!locked && (
          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-[14px] text-ink-2">
            <label className="flex items-center gap-1.5">שבועות <WeekInput label="שבוע התחלה" value={r.start} onChange={(v) => onChange({ start: v })} />–<WeekInput label="שבוע סיום" value={r.end} onChange={(v) => onChange({ end: v })} /></label>
            {!r.date && r.action !== "past" && (
              <label className="flex items-center gap-1.5" style={late ? { color: "var(--st-att)", fontWeight: 700 } : undefined}>לקבוע עד שבוע <WeekInput label="לקבוע עד שבוע" value={r.bookBy} onChange={(v) => onChange({ bookBy: v })} /></label>
            )}
            <select className="h-9 rounded-lg border border-line bg-surface-2 px-2 font-semibold" value={r.kind} aria-label="סוג" onChange={(e) => onChange({ kind: e.target.value as AppointmentKind })}>
              {(Object.keys(KIND_LABEL) as AppointmentKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
            </select>
          </div>
        )}
        {r.date && <div className="text-[13px] font-bold" style={{ color: "var(--st-sched)" }}><Icon name="cal" size={14} className="inline -mt-0.5" /> נקבע ל־{fmtDayYear(r.date)}{r.time ? ` · ${r.time}` : ""}</div>}
        {r.action === "past" && r.include && <div className="text-[13px] text-ink-3">יסומן כבוצע</div>}
        {late && <div className="text-[13px] font-bold" style={{ color: "var(--st-att)" }}>כדאי לקבוע כבר עכשיו</div>}
        {(r.notes || r.location) && <div className="text-[13px] text-ink-3">{[r.location, r.notes].filter(Boolean).join(" · ")}</div>}
      </div>
      {r.key.startsWith("new") && <button className="icon-btn" aria-label="הסרה" onClick={onRemove}><Icon name="close" size={18} /></button>}
    </div>
  );
}

/** Editable list of plan rows. Past windows are grouped at the end, unselected by default. */
export function PlanReview({ rows, week, onChange }: { rows: PlanRow[]; week: number; onChange: (rows: PlanRow[]) => void }) {
  const set = (key: string, p: Partial<PlanRow>) => onChange(rows.map((r) => (r.key === key ? { ...r, ...p } : r)));
  const remove = (key: string) => onChange(rows.filter((r) => r.key !== key));
  const add = () => onChange([...rows, { key: `new${rows.length}-${rows.filter((r) => r.key.startsWith("new")).length}`, include: true, title: "", kind: "other", start: week + 1, end: week + 2, bookBy: week, date: null, time: null, location: null, notes: null, optional: false, matchId: null, action: "create" }]);
  const upcoming = rows.filter((r) => r.action !== "past" && r.action !== "done");
  const behind = rows.filter((r) => r.action === "past" || r.action === "done");
  return (
    <div className="flex flex-col gap-4">
      <section className="card px-4 md:px-5 divide-y divide-line-2">
        {upcoming.length === 0 && <p className="py-4 text-ink-3">לא נמצאו בדיקות קדימה.</p>}
        {upcoming.map((r) => <Row key={r.key} r={r} week={week} onChange={(p) => set(r.key, p)} onRemove={() => remove(r.key)} />)}
        <div className="py-3"><button className="btn btn-ghost" onClick={add}><Icon name="plus" />הוספת בדיקה</button></div>
      </section>
      {behind.length > 0 && (
        <section className="flex flex-col gap-1">
          <h3 className="lbl px-1">כבר מאחוריכם</h3>
          <div className="card px-4 md:px-5 divide-y divide-line-2">
            {behind.map((r) => <Row key={r.key} r={r} week={week} onChange={(p) => set(r.key, p)} onRemove={() => remove(r.key)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
