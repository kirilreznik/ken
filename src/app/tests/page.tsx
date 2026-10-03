"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { EmptyState, KindTile, StatusBadge, WeekBadge } from "@/components/ui";
import { useQuick } from "@/components/QuickActions";
import { displayStatus, sortAppointments, useAppointments, useDocuments, usePregnancy, useQuestions, useSave } from "@/lib/data";
import { useSession } from "@/lib/session";
import { weekLabelOf } from "@/lib/pregnancy";
import { fmtDay, fmtShort, fmtTime, relDays } from "@/lib/format";
import { KIND_LABEL, STATUS_FLOW, STATUS_LABEL } from "@/lib/labels";
import { bookByOf } from "@/lib/plan";
import type { Appointment, AppointmentKind, DisplayStatus } from "@/lib/types";

type Tab = "upcoming" | "need" | "pending" | "completed";
const TAB_LABEL: Record<Tab, string> = { upcoming: "קרובים", need: "צריך לקבוע", pending: "ממתינים לתוצאות", completed: "הושלמו" };
const tabOf = (s: DisplayStatus): Tab | null =>
  s === "scheduled" ? "upcoming" : s === "need" || s === "attention" ? "need" : s === "done" || s === "pending" ? "pending" : s === "completed" ? "completed" : null;

export default function Tests() {
  const { space } = useSession();
  const lead = space?.booking_lead_weeks ?? 3;
  const wk = usePregnancy();
  const quick = useQuick();
  const save = useSave("appointments");
  const { data: appts, isLoading } = useAppointments();
  const { data: docs } = useDocuments();
  const { data: qs } = useQuestions();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [kind, setKind] = useState<AppointmentKind | "all">("all");
  if (!space || !wk) return null;

  const withStatus = sortAppointments(appts ?? []).map((a) => ({ a, st: displayStatus(a, wk.week) }));
  const counts = { upcoming: 0, need: 0, pending: 0, completed: 0 } as Record<Tab, number>;
  const flow: Record<string, number> = {};
  for (const { st } of withStatus) { const t = tabOf(st); if (t) counts[t]++; flow[st === "attention" ? "need" : st] = (flow[st === "attention" ? "need" : st] ?? 0) + 1; }
  const future = withStatus.filter((x) => x.st === "future");
  let list = withStatus.filter((x) => tabOf(x.st) === tab && (kind === "all" || x.a.kind === kind));
  if (tab === "completed") list = list.reverse();

  const advance = (a: Appointment, st: DisplayStatus) => {
    if (st === "need" || st === "attention" || st === "future") quick({ kind: "appointment", initial: { ...a, status: "scheduled" } });
    else if (st === "scheduled") save.update(a.id, { status: "done", updated_at: new Date().toISOString() });
    else if (st === "done") save.update(a.id, { status: "pending", updated_at: new Date().toISOString() });
    else if (st === "pending") quick({ kind: "appointment", initial: { ...a, status: "completed" } });
  };
  const advanceLabel: Partial<Record<DisplayStatus, string>> = { need: "קביעת תור", attention: "קביעת תור", future: "קביעת תור", scheduled: "סימון כבוצע", done: "ממתין לתוצאה", pending: "התוצאה הגיעה" };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]"><h1 className="font-serif text-[34px] md:text-[40px] leading-tight">בדיקות ותורים</h1><p className="text-ink-3 mt-1">מה נקבע, מה עוד צריך לקבוע, ומה מחכה לתוצאה</p></div>
        <Link href="/plan" className="btn btn-secondary"><Icon name="list" />ייבוא תוכנית מעקב</Link>
        <button className="btn btn-secondary hidden md:inline-flex" onClick={() => quick({ kind: "upload" })}><Icon name="up" />העלאת תוצאה</button>
        <button className="btn btn-primary" onClick={() => quick({ kind: "appointment" })}><Icon name="plus" />הוספת תור</button>
      </header>

      <div className="hidden md:flex items-center gap-2" aria-label="מסלול סטטוס">
        {STATUS_FLOW.map((s, i) => (
          <div key={s} className="contents">
            {i > 0 && <Icon name="arrowL" className="text-[#b3a999]" />}
            <div className="flex-1 rounded-[18px] bg-white border border-line px-4 py-3.5 flex flex-col gap-1">
              <span className="lbl">{STATUS_LABEL[s]}</span><b className="font-serif text-[28px] font-medium leading-none">{flow[s] ?? 0}</b>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div role="tablist" className="seg overflow-x-auto max-w-full">
          {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
              {TAB_LABEL[t]}<span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-extrabold inline-flex items-center justify-center"
                style={t === "need" && counts.need ? { background: "var(--st-att-bg)", color: "var(--st-att)" } : { background: "#e6ded2" }}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          {(["all", "doctor", "ultrasound", "blood", "genetic", "medical", "other"] as const).map((k) => (
            <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{k === "all" ? "הכל" : KIND_LABEL[k]}</button>
          ))}
        </div>
      </div>

      {isLoading && !appts ? null : list.length === 0 ? (
        <EmptyState title={tab === "upcoming" ? "אין תורים קרובים" : tab === "need" ? "אין מה לקבוע כרגע" : tab === "pending" ? "לא מחכים לאף תוצאה" : "עוד לא הושלמו בדיקות"}
          action={tab === "upcoming" ? <button className="btn btn-primary mt-2" onClick={() => quick({ kind: "appointment" })}><Icon name="plus" />הוספת תור</button> : undefined} />
      ) : (
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))]">
          {list.map(({ a, st }) => {
            const nDocs = (docs ?? []).filter((d) => d.appointment_id === a.id).length;
            const nQs = (qs ?? []).filter((q) => q.appointment_id === a.id && !q.resolved).length;
            const step = STATUS_FLOW.indexOf(st === "attention" ? "need" : st);
            return (
              <article key={a.id} className="card p-5 flex flex-col gap-4" style={st === "attention" ? { boxShadow: "inset 0 0 0 1.5px #E7B9A8" } : undefined}>
                <div className="flex items-start gap-3.5">
                  <KindTile kind={a.kind} />
                  <div className="flex-1 min-w-0"><h3 className="text-lg font-extrabold">{a.title}</h3><div className="text-sm text-ink-3 mt-0.5">{KIND_LABEL[a.kind]}</div></div>
                  <StatusBadge status={st} />
                </div>
                <div className="flex flex-col gap-2 text-[15px] text-ink-2">
                  <div className="flex items-center gap-2">
                    <Icon name="cal" size={18} className="text-ink-3" />
                    {a.starts_at ? <><b>{fmtDay(a.starts_at)} · {fmtTime(a.starts_at)}</b><span className="text-ink-3">· {relDays(a.starts_at)}</span></>
                      : <span>חלון: שבועות {a.window_start_week}–{a.window_end_week}{st !== "attention" && bookByOf(a, lead) != null && <> · לקבוע עד שבוע {bookByOf(a, lead)}</>}{st === "attention" && <b style={{ color: "var(--st-att)" }}> · החלון נסגר בקרוב</b>}</span>}
                    <span className="ms-auto">{a.starts_at ? <WeekBadge label={weekLabelOf(space.due_date, a.starts_at)} /> : null}</span>
                  </div>
                  {a.provider && <div className="flex items-center gap-2"><Icon name="users" size={18} className="text-ink-3" />{a.provider}</div>}
                  {a.location && <div className="flex items-center gap-2"><Icon name="pin" size={18} className="text-ink-3" />{a.location}</div>}
                  {a.result_summary && <div className="flex items-center gap-2"><Icon name="check" size={18} style={{ color: "var(--st-done)" }} /><b>{a.result_summary}</b></div>}
                </div>
                {a.personal_note && <div className="rounded-[14px] px-3.5 py-2.5 text-sm leading-normal border border-[#f1e0cf] bg-[#fff8f1]"><b style={{ color: "#8A4526" }}>הערה שלנו: </b>{a.personal_note}</div>}
                {step >= 0 && (
                  <div className="flex gap-1.5" aria-label={`שלב ${step + 1} מתוך 5`}>
                    {STATUS_FLOW.map((s, i) => <span key={s} className="flex-1 h-[5px] rounded-full" style={{ background: i < step ? "var(--primary)" : i === step ? (st === "pending" ? "#D9B36A" : "var(--primary)") : "#EDE6DB" }} />)}
                  </div>
                )}
                <div className="flex items-center gap-3.5 pt-3.5 border-t border-line-2 text-[13px] font-bold text-ink-3 mt-auto">
                  <span className="inline-flex items-center gap-1"><Icon name="clip" size={16} />{nDocs}</span>
                  <span className="inline-flex items-center gap-1" style={nQs ? { color: "var(--second)" } : undefined}><Icon name="ask" size={16} />{nQs}</span>
                  <span className="ms-auto flex gap-1.5">
                    <button className="btn btn-ghost h-[38px] min-h-0 text-sm" onClick={() => quick({ kind: "appointment", initial: a })}>לפרטים</button>
                    {advanceLabel[st] && <button className="btn btn-primary h-[38px] min-h-0 text-sm" onClick={() => advance(a, st)}>{advanceLabel[st]}</button>}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {tab === "need" && future.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="lbl">בהמשך ההריון</h2>
          <div className="card divide-y divide-line-2">
            {future.map(({ a }) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex-1 font-semibold text-ink-2">{a.title}</span>
                <span className="text-sm text-ink-3">שבועות {a.window_start_week}–{a.window_end_week} · לקבוע עד שבוע {bookByOf(a, lead)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      <p className="text-[13px] text-ink-3">עודכן לאחרונה {fmtShort(new Date())}</p>
    </div>
  );
}
