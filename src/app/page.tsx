"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { Avatar, KindTile, PregnancyBar, PriorityTag, ProgressRing, StatusBadge } from "@/components/ui";
import { useQuick } from "@/components/QuickActions";
import { SuggestionsCard } from "@/components/Suggestions";
import { WeekSummaryCard } from "@/components/WeekSummaryCard";
import { useSession } from "@/lib/session";
import { displayStatus, nowSort, nextAppointment, openQuestionsFor, sortTasks, useAppointments, useDocuments, usePregnancy, useQuestions, useSave, useTasks } from "@/lib/data";
import { developmentFor, sizeFor, weekLabelOf } from "@/lib/pregnancy";
import { fmtDay, fmtDayYear, fmtMonthShort, fmtShort, fmtTime, fmtWeekdayShort, greeting, relDays } from "@/lib/format";
import { TASK_CATEGORY_COLOR, TASK_CATEGORY_LABEL } from "@/lib/labels";

const TRI = ["ראשון", "שני", "שלישי"];

export default function Home() {
  const { me, members, space, nameOf, user } = useSession();
  const wk = usePregnancy();
  const quick = useQuick();
  const { data: appts } = useAppointments();
  const { data: tasks } = useTasks();
  const { data: docs } = useDocuments();
  const { data: questions } = useQuestions();
  const saveTask = useSave("tasks");
  const saveQ = useSave("questions");
  const [qText, setQText] = useState("");

  const next = nextAppointment(appts);
  const after = useMemo(() => {
    if (!next) return null;
    return (appts ?? []).filter((a) => a.status === "scheduled" && a.starts_at && a.id !== next.id && a.starts_at > next.starts_at!)
      .sort((a, b) => a.starts_at!.localeCompare(b.starts_at!))[0] ?? null;
  }, [appts, next]);
  const attention = (appts ?? []).filter((a) => wk && displayStatus(a, wk.week) === "attention");
  const topTasks = sortTasks((tasks ?? []).filter((t) => !t.done)).slice(0, 5);
  const openQs = openQuestionsFor(questions, next?.id ?? null);
  const nextQs = (questions ?? []).filter((q) => !q.resolved && next && q.appointment_id === next.id);
  const nextDocs = (docs ?? []).filter((d) => next && d.appointment_id === next.id);

  const activity = useMemo(() => {
    const rows: Array<{ at: string; icon: "doc" | "check" | "task"; tint: [string, string]; title: string; sub: string }> = [];
    for (const d of docs ?? []) rows.push({ at: d.created_at ?? d.doc_date, icon: "doc", tint: ["var(--chip)", "var(--ink-2)"], title: `${nameOf(d.created_by) || "הועלה"}: ${d.title}`, sub: fmtShort(d.created_at ?? d.doc_date) });
    for (const a of appts ?? []) if (a.status === "completed" || a.status === "pending") rows.push({ at: a.updated_at ?? a.starts_at ?? "", icon: "check", tint: ["var(--st-done-bg)", "var(--st-done)"], title: `${a.title} — ${a.status === "pending" ? "ממתין לתוצאה" : "הושלם"}`, sub: a.starts_at && space ? `${fmtShort(a.starts_at)} · שבוע ${weekLabelOf(space.due_date, a.starts_at)}` : "" });
    for (const t of tasks ?? []) if (t.done && t.done_at) rows.push({ at: t.done_at, icon: "task", tint: ["var(--primary-100)", "var(--primary)"], title: `${nameOf(t.done_by) || ""} סימן/ה: ${t.title}`.trim(), sub: relDays(t.done_at) });
    return rows.filter((r) => r.at).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
  }, [docs, appts, tasks, nameOf, space]);

  if (!wk || !space) return null;
  const dev = developmentFor(wk.week);
  const size = sizeFor(wk.week);
  const names = members.map((m) => m.display_name).join(" ו");

  const addQuestion = () => {
    if (!qText.trim()) return;
    saveQ.insert({ text: qText.trim(), appointment_id: next?.id ?? null, week: wk.week, resolved: false, sort: nowSort(), created_by: user!.id, category: null, answer: null });
    setQText("");
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <div className="text-ink-3 font-semibold">{fmtDayYear(new Date())}</div>
          <h1 className="text-2xl md:text-[28px] font-extrabold">{greeting()}, {names || me?.display_name}</h1>
        </div>
        <button className="btn btn-primary hidden md:inline-flex" onClick={() => quick({ kind: "appointment" })}><Icon name="plus" />הוספת תור</button>
        <button className="btn btn-secondary hidden md:inline-flex" onClick={() => quick({ kind: "upload" })}><Icon name="up" />העלאת מסמך</button>
      </header>

      {attention.length > 0 && (
        <Link href="/tests" className="flex items-center gap-3 p-4 rounded-[18px] font-semibold" style={{ background: "var(--st-att-bg)", color: "#7e2f1d" }}>
          <Icon name="alert" />
          <span className="flex-1"><b className="block">{attention[0].title} עדיין לא נקבע</b>
            <span className="text-[13px]">{attention[0].window_end_week ? `החלון נסגר בסוף שבוע ${attention[0].window_end_week}` : "כדאי לקבוע תור"}{attention.length > 1 ? ` · ועוד ${attention.length - 1}` : ""}</span></span>
          <Icon name="chevL" />
        </Link>
      )}

      <div className="flex flex-wrap gap-6">
        {/* Hero */}
        <section aria-label="מצב ההריון" className="flex-[2_1_520px] rounded-[28px] md:rounded-[22px] p-6 md:p-8 flex flex-col gap-7 bg-primary text-on-primary md:bg-white md:text-ink md:border md:border-line md:shadow-[0_1px_2px_rgba(74,52,30,.04),0_8px_24px_-8px_rgba(74,52,30,.08)] shadow-[0_20px_40px_-20px_rgba(0,0,0,.35)]">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex-1 min-w-[220px] flex flex-col gap-2.5">
              <span className="badge self-start bg-white/15 text-on-primary md:bg-primary-100 md:text-primary">שליש {TRI[wk.trimester - 1]}</span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-serif text-[60px] md:text-[88px] leading-[.95] font-medium">שבוע {wk.week}</span>
                <span className="text-xl md:text-2xl font-semibold">{wk.day ? `ו־${wk.day} ימים` : "בדיוק"}</span>
              </div>
              <p className="text-[17px] md:text-lg md:text-ink-2">עברתם <b>{wk.percent}%</b> מההריון{wk.week < 20 ? ` · עוד ${20 - wk.week} שבועות לחצי הדרך` : ""}</p>
            </div>
            <div className="hidden md:block">
              <ProgressRing percent={wk.percent} size={148}>
                <span className="font-serif text-[38px] leading-none">{wk.daysLeft}</span><span className="text-sm font-semibold text-ink-3">ימים נותרו</span>
              </ProgressRing>
            </div>
            <div className="md:hidden">
              <ProgressRing percent={wk.percent} size={104} stroke={9} track="rgba(255,255,255,.18)" color="var(--accent)">
                <span className="text-2xl font-extrabold text-white">{wk.percent}%</span>
              </ProgressRing>
            </div>
          </div>
          <div className="hidden md:block"><PregnancyBar percent={wk.percent} /></div>
          <div className="md:hidden"><PregnancyBar percent={wk.percent} onDark /></div>
          <div className="flex flex-wrap gap-y-3 rounded-[18px] p-3.5 bg-white/10 md:bg-transparent md:p-0 md:pt-5 md:rounded-none md:border-t md:border-line-2">
            <div className="flex-1 min-w-[150px]"><div className="text-xs md:text-[13px] md:text-ink-3 font-bold opacity-80 md:opacity-100">תאריך לידה משוער</div><div className="font-extrabold md:text-[17px]">{fmtDayYear(space.due_date)}</div></div>
            <div className="flex-1 min-w-[150px] ps-4 border-s border-white/20 md:border-line-2"><div className="text-xs md:text-[13px] md:text-ink-3 font-bold opacity-80 md:opacity-100">נותרו</div><div className="font-extrabold md:text-[17px]">{wk.daysLeft} ימים · כ־{Math.round(wk.daysLeft / 7)} שבועות</div></div>
          </div>
        </section>

        {/* Next appointment */}
        <section aria-label="התור הבא" className="card flex-[1_1_320px] p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">התור הבא</h2>{next?.starts_at && <StatusBadge status="scheduled" label={relDays(next.starts_at)} />}</div>
          {next ? (
            <>
              <div className="flex gap-4 items-center">
                <div className="w-[68px] h-[74px] rounded-[18px] bg-bg flex flex-col items-center justify-center flex-none">
                  <span className="text-[13px] font-bold text-ink-3">{fmtMonthShort(next.starts_at!)}</span>
                  <span className="font-serif text-[32px] leading-none">{new Date(next.starts_at!).getDate()}</span>
                  <span className="text-xs font-bold text-ink-3">{fmtWeekdayShort(next.starts_at!)}</span>
                </div>
                <div><div className="text-xl font-extrabold leading-tight">{next.title}</div><div className="text-ink-3 mt-1">{fmtTime(next.starts_at!)} · {fmtDay(next.starts_at!)}</div></div>
              </div>
              <div className="flex flex-col gap-2.5 text-[15px] text-ink-2">
                {next.provider && <div className="flex gap-2 items-center"><Icon name="steth" size={18} className="text-ink-3" />{next.provider}</div>}
                {next.location && <div className="flex gap-2 items-center"><Icon name="pin" size={18} className="text-ink-3" />{next.location}</div>}
                <div className="flex gap-2 items-center"><Icon name="timeline" size={18} className="text-ink-3" />שבוע <span dir="ltr">{weekLabelOf(space.due_date, next.starts_at!)}</span></div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/questions" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[13px] font-extrabold" style={{ background: "var(--second-100)", color: "var(--second)" }}><Icon name="ask" size={16} />{nextQs.length} שאלות</Link>
                <Link href="/documents" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[13px] font-extrabold bg-chip text-[#4a443d]"><Icon name="clip" size={16} />{nextDocs.length} מסמכים</Link>
              </div>
              <div className="flex gap-2.5 mt-auto">
                <button className="btn btn-primary flex-1" onClick={() => quick({ kind: "appointment", initial: next })}>לפרטים</button>
                {next.location && <a className="btn btn-secondary" href={`https://waze.com/ul?q=${encodeURIComponent(next.location)}`} target="_blank" rel="noreferrer"><Icon name="nav" />ניווט</a>}
              </div>
              {after && <div className="text-sm text-ink-3 border-t border-line-2 pt-3">אחר כך: <b className="text-ink-2">{after.title}</b> · {fmtShort(after.starts_at!)} · שבוע <span dir="ltr">{weekLabelOf(space.due_date, after.starts_at!)}</span></div>}
            </>
          ) : (
            <div className="flex flex-col gap-3 items-start">
              <p className="text-ink-3">אין תור קרוב ביומן.</p>
              <button className="btn btn-primary" onClick={() => quick({ kind: "appointment" })}><Icon name="plus" />הוספת תור</button>
            </div>
          )}
        </section>
      </div>

      <WeekSummaryCard />
      <SuggestionsCard />

      <div className="flex flex-wrap gap-6">
        {/* This week */}
        <section aria-label="השבוע" className="flex-[1_1_360px] rounded-[22px] bg-sand p-6 md:p-7 flex flex-col gap-4">
          <span className="lbl" style={{ color: "#6a5a45" }}>השבוע · שבוע {wk.week}</span>
          <div className="flex gap-5 items-center">
            <svg viewBox="0 0 80 100" width="52" height="66" aria-hidden="true"><path d="M40 6c14 0 30 20 30 50a30 36 0 0 1-60 0C10 26 26 6 40 6z" fill="none" stroke="#8C7356" strokeWidth="2.2" /><circle cx="40" cy="62" r="13" fill="none" stroke="#8C7356" strokeWidth="2.2" /></svg>
            <div><div className="font-serif text-2xl md:text-[26px]">בגודל של {size.fruit}</div><div className="text-[15px] text-[#5a4c3c]">{size.measure}</div></div>
          </div>
          <p className="text-[17px] leading-relaxed text-[#3a332b]">{dev.text}</p>
          {dev.milestone && (
            <div className="rounded-2xl bg-white/65 p-4 flex gap-3"><Icon name="flag" style={{ color: "#8A6A2A" }} /><span className="text-[15px] leading-normal">{dev.milestone}</span></div>
          )}
          <div className="text-xs text-[#6a5a45]">מידע כללי, לא תחליף לייעוץ רפואי אישי.</div>
        </section>

        {/* Tasks */}
        <section aria-label="משימות קרובות" className="card flex-[1.6_1_440px] px-6 py-5 flex flex-col">
          <div className="flex items-center justify-between mb-1"><h2 className="text-lg font-extrabold">משימות קרובות</h2><Link href="/tasks" className="text-sm font-bold text-primary">כל המשימות ({(tasks ?? []).filter((t) => !t.done).length})</Link></div>
          {topTasks.length === 0 && <p className="text-ink-3 py-4">אין משימות פתוחות. כל הכבוד!</p>}
          {topTasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3.5 py-3.5 border-b border-line-2 last:border-0">
              <input type="checkbox" className="cb" aria-label={t.title} checked={t.done}
                onChange={() => saveTask.update(t.id, { done: true, done_at: new Date().toISOString(), done_by: user!.id })} />
              <button className="flex-1 min-w-0 text-start" onClick={() => quick({ kind: "task", initial: t })}>
                <div className="font-bold">{t.title}</div>
                <div className="text-[13px] text-ink-3 mt-0.5 flex gap-2 flex-wrap items-center">
                  <span className="inline-flex items-center gap-1.5 font-bold"><i className="w-[7px] h-[7px] rounded-full" style={{ background: TASK_CATEGORY_COLOR[t.category] }} />{TASK_CATEGORY_LABEL[t.category]}</span>
                  {t.due_date && <><span>·</span><span style={t.priority === "urgent" ? { color: "var(--st-att)", fontWeight: 700 } : undefined}>{relDays(t.due_date) === "היום" ? "היום" : `עד ${fmtShort(t.due_date)}`}</span></>}
                </div>
              </button>
              <PriorityTag p={t.priority} />
              {t.assignee && <Avatar name={nameOf(t.assignee)} tone={members.findIndex((m) => m.user_id === t.assignee)} />}
            </div>
          ))}
          <button className="btn btn-ghost self-start mt-2" onClick={() => quick({ kind: "task" })}><Icon name="plus" />משימה חדשה</button>
        </section>
      </div>

      <div className="flex flex-wrap gap-6">
        {/* Questions */}
        <section aria-label="שאלות לתור הבא" className="card flex-[1_1_320px] p-6 flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between"><h2 className="text-lg font-extrabold">שאלות לתור הבא</h2>{next && <span className="text-sm text-ink-3">{next.provider ?? next.title} · {fmtShort(next.starts_at!)}</span>}</div>
          <div className="flex items-baseline gap-2.5"><span className="font-serif text-5xl leading-none">{openQs.length}</span><span className="font-semibold text-ink-2">שאלות שמורות</span></div>
          <ul className="flex flex-col gap-2.5 text-[15px] leading-normal">
            {openQs.slice(0, 3).map((q) => <li key={q.id} className="flex gap-2.5"><i className="w-1.5 h-1.5 rounded-full mt-2.5 flex-none" style={{ background: "var(--second)" }} />{q.text}</li>)}
          </ul>
          <form className="flex gap-2 mt-auto" onSubmit={(e) => { e.preventDefault(); addQuestion(); }}>
            <label className="flex-1"><span className="sr-only">שאלה חדשה</span><input className="input" style={{ minHeight: 44, background: "var(--surface-2)" }} placeholder="שאלה חדשה…" value={qText} onChange={(e) => setQText(e.target.value)} /></label>
            <button className="icon-btn bg-ink text-white" aria-label="הוספת שאלה"><Icon name="plus" /></button>
          </form>
          <Link href="/visit" className="btn btn-secondary w-full">פתיחה במצב תור</Link>
        </section>

        {/* Activity */}
        <section aria-label="פעילות אחרונה" className="card flex-[1.2_1_360px] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2"><h2 className="text-lg font-extrabold">פעילות אחרונה</h2><Link href="/timeline" className="text-sm font-bold text-primary">בציר הזמן</Link></div>
          {activity.length === 0 && <p className="text-ink-3 py-3">כאן יופיעו מסמכים, תוצאות ומשימות שהושלמו.</p>}
          {activity.map((r, i) => (
            <div key={i} className="flex gap-3.5 py-3 border-b border-line-2 last:border-0">
              <span className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-none" style={{ background: r.tint[0], color: r.tint[1] }}><Icon name={r.icon} /></span>
              <div><div className="text-[15px] font-bold">{r.title}</div><div className="text-[13px] text-ink-3 mt-0.5">{r.sub}</div></div>
            </div>
          ))}
        </section>

        {/* Upcoming appointments needing action */}
        <section className="card flex-[0.9_1_280px] p-6 flex flex-col gap-3">
          <h2 className="text-lg font-extrabold">בשבועות הקרובים</h2>
          {(appts ?? []).filter((a) => a.status === "future" || a.status === "need").filter((a) => (a.window_start_week ?? 99) <= wk.week + 6)
            .sort((a, b) => (a.window_start_week ?? 0) - (b.window_start_week ?? 0)).slice(0, 4).map((a) => (
              <button key={a.id} className="flex items-center gap-3 text-start" onClick={() => quick({ kind: "appointment", initial: { ...a, status: "scheduled" } })}>
                <KindTile kind={a.kind} size={40} />
                <span className="flex-1 min-w-0"><b className="block text-[15px]">{a.title}</b><span className="text-[13px] text-ink-3">שבועות {a.window_start_week}–{a.window_end_week}</span></span>
                <StatusBadge status={displayStatus(a, wk.week)} />
              </button>
            ))}
          <Link href="/tests" className="text-sm font-bold text-primary mt-auto">לכל הבדיקות</Link>
        </section>
      </div>
    </div>
  );
}
