"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { EmptyState, WeekBadge } from "@/components/ui";
import { useQuick } from "@/components/QuickActions";
import { nextAppointment, nowSort, useAppointments, usePregnancy, useQuestions, useSave } from "@/lib/data";
import { useSession } from "@/lib/session";
import { fmtDay, fmtShort, fmtTime } from "@/lib/format";
import { QUESTION_CATEGORIES } from "@/lib/labels";
import type { Question } from "@/lib/types";

type Tab = "open" | "answered" | "all";

export default function Questions() {
  const { user } = useSession();
  const wk = usePregnancy();
  const quick = useQuick();
  const save = useSave("questions");
  const { data: qs, isLoading } = useQuestions();
  const { data: appts } = useAppointments();
  const [tab, setTab] = useState<Tab>("open");
  const [text, setText] = useState("");
  const [cat, setCat] = useState("");
  const next = nextAppointment(appts);
  const [target, setTarget] = useState<string>("");

  const list = (qs ?? []).filter((q) => tab === "all" || (tab === "open" ? !q.resolved : q.resolved));
  const byAppt = new Map<string, Question[]>();
  for (const q of list.sort((a, b) => a.sort - b.sort)) {
    const k = q.appointment_id ?? "";
    byAppt.set(k, [...(byAppt.get(k) ?? []), q]);
  }
  const apptTitle = (id: string) => {
    if (!id) return "ללא תור מסוים";
    const a = (appts ?? []).find((x) => x.id === id);
    return a ? `${a.title}${a.starts_at ? ` · ${fmtShort(a.starts_at)}` : ""}` : "תור";
  };
  const nextCount = (qs ?? []).filter((q) => !q.resolved && (q.appointment_id === next?.id || !q.appointment_id)).length;

  const add = () => {
    if (!text.trim()) return;
    save.insert({ text: text.trim(), category: cat || null, appointment_id: (target || next?.id) ?? null, week: wk?.week ?? null,
      answer: null, resolved: false, sort: nowSort(), created_by: user!.id });
    setText("");
  };
  const move = (group: Question[], i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= group.length) return;
    const a = group[i], b = group[j];
    save.update(a.id, { sort: b.sort });
    save.update(b.id, { sort: a.sort });
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1000px]">
      <h1 className="font-serif text-[34px] md:text-[40px] leading-tight">שאלות לרופא</h1>

      <section className="rounded-[28px] bg-primary text-on-primary p-6 md:p-8 flex items-center gap-6 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="font-serif text-[36px] md:text-[48px] leading-[1.05]">{nextCount} שאלות לתור הבא</div>
          <div className="mt-2 text-on-primary-2">{next ? `${next.title} · ${fmtDay(next.starts_at!)} · ${fmtTime(next.starts_at!)}${next.provider ? ` · ${next.provider}` : ""}` : "עוד לא נקבע תור"}</div>
        </div>
        <Link href="/visit" className="btn h-[52px] bg-[#f5efe6] text-ink"><Icon name="play" />התחלת מצב תור</Link>
      </section>

      <form className="card p-4 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <label><span className="sr-only">שאלה חדשה</span>
          <input className="input text-[17px] min-h-14" style={{ background: "var(--surface-2)" }} placeholder="מה תרצו לשאול? כתבו עכשיו, תסדרו אחר כך" value={text} onChange={(e) => setText(e.target.value)} /></label>
        <div className="flex gap-2.5 items-center flex-wrap">
          {wk && <WeekBadge label={wk.label} />}
          <select className="h-9 rounded-[11px] border border-[#e2dace] bg-white px-2.5 text-sm font-semibold" aria-label="קטגוריה" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">קטגוריה</option>{QUESTION_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="h-9 rounded-[11px] border border-[#e2dace] bg-white px-2.5 text-sm font-semibold max-w-[220px]" aria-label="לתור" value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">{next ? `לתור הבא (${fmtShort(next.starts_at!)})` : "ללא תור"}</option>
            {(appts ?? []).filter((a) => a.status === "scheduled" && a.id !== next?.id).map((a) => <option key={a.id} value={a.id}>{a.title}{a.starts_at ? ` · ${fmtShort(a.starts_at)}` : ""}</option>)}
          </select>
          <button className="btn btn-primary ms-auto h-10 min-h-0" disabled={!text.trim()}>שמירה</button>
        </div>
      </form>

      <div className="seg self-start">
        {(["open", "answered", "all"] as Tab[]).map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t === "open" ? "פתוחות" : t === "answered" ? "נענו" : "הכל"}
            <span className="text-ink-3">{t === "open" ? (qs ?? []).filter((q) => !q.resolved).length : t === "answered" ? (qs ?? []).filter((q) => q.resolved).length : qs?.length ?? 0}</span></button>
        ))}
      </div>

      {isLoading && !qs ? null : list.length === 0 ? (
        <EmptyState title={tab === "answered" ? "עוד אין שאלות שנענו" : "עדיין אין שאלות"} text="כל מה שעולה לכם בראש במהלך השבוע — רשמו כאן, ותגיעו לביקור עם הכל מסודר." />
      ) : [...byAppt.entries()].map(([id, group]) => (
        <section key={id} className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2.5 px-1"><h2 className="text-lg font-extrabold">{apptTitle(id)}</h2><span className="text-sm text-ink-3">{group.length} שאלות</span></div>
          <div className="card">
            {group.map((q, i) => (
              <div key={q.id} className="flex items-start gap-3 px-4 md:px-5 py-4 border-b border-line-2 last:border-0">
                {!q.resolved && tab !== "all" ? (
                  <div className="flex flex-col -my-1">
                    <button className="w-7 h-6 flex items-center justify-center text-[#b3a999] disabled:opacity-30" disabled={i === 0} aria-label="למעלה" onClick={() => move(group, i, -1)}><Icon name="chevD" size={16} style={{ transform: "rotate(180deg)" }} /></button>
                    <span className="text-sm font-extrabold text-center" style={{ color: "var(--second)" }}>{i + 1}</span>
                    <button className="w-7 h-6 flex items-center justify-center text-[#b3a999] disabled:opacity-30" disabled={i === group.length - 1} aria-label="למטה" onClick={() => move(group, i, 1)}><Icon name="chevD" size={16} /></button>
                  </div>
                ) : <Icon name={q.resolved ? "check" : "ask"} className="mt-1" style={{ color: q.resolved ? "var(--st-done)" : "var(--ink-3)" }} />}
                <button className="flex-1 min-w-0 text-start" onClick={() => quick({ kind: "question", initial: q })}>
                  <div className={`text-[17px] font-semibold leading-snug ${q.resolved ? "text-[#5c554d]" : ""}`}>{q.text}</div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">{q.week != null && <WeekBadge label={q.week} />}{q.category && <span className="badge bg-white shadow-[inset_0_0_0_1px_#e2dace] text-[#4a443d] h-6 text-xs">{q.category}</span>}</div>
                  {q.answer && <div className="mt-2.5 rounded-[14px] px-3.5 py-2.5 border border-[#e4ebf3] bg-[#f7f9fc]"><div className="lbl" style={{ color: "#35526E" }}>התשובה</div><p className="mt-1 leading-relaxed">{q.answer}</p></div>}
                </button>
                <label className="flex gap-2 items-center text-sm font-semibold text-ink-3 min-h-11">נענתה
                  <input type="checkbox" className="switch" checked={q.resolved} onChange={(e) => save.update(q.id, { resolved: e.target.checked })} /></label>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
