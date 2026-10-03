"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/ui";
import { useQuick } from "@/components/QuickActions";
import { EVENT_STYLE, EventChip, EventMark } from "@/components/CalendarParts";
import { usePregnancy, useAppointments, useTasks } from "@/lib/data";
import { useSession } from "@/lib/session";
import { buildEvents, groupByDay, monthGrid, type CalEvent, type EventKind } from "@/lib/events";
import { addDays, toDay, weekOf } from "@/lib/pregnancy";
import { fmtDay, fmtMonth, relDays } from "@/lib/format";

const WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
type View = "month" | "agenda";

export default function CalendarPage() {
  const { space } = useSession();
  const wk = usePregnancy();
  const quick = useQuick();
  const { data: appts } = useAppointments();
  const { data: tasks } = useTasks();
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [view, setView] = useState<View>("month");
  const [hidden, setHidden] = useState<Set<EventKind>>(new Set());

  const events = useMemo(() => (space ? buildEvents(space.due_date, appts, tasks).filter((e) => !hidden.has(e.kind)) : []), [space, appts, tasks, hidden]);
  const byDay = useMemo(() => groupByDay(events), [events]);
  if (!space || !wk) return null;

  const open = (e: CalEvent) => {
    if (e.ref?.type === "appointment") quick({ kind: "appointment", initial: e.ref.row });
    else if (e.ref?.type === "task") quick({ kind: "task", initial: e.ref.row });
  };
  const grid = monthGrid(cursor.y, cursor.m);
  const todayKey = toDay(today);
  const shift = (d: number) => setCursor(({ y, m }) => { const x = new Date(y, m + d, 1); return { y: x.getFullYear(), m: x.getMonth() }; });
  const agenda = events.filter((e) => e.day >= todayKey && e.day <= toDay(addDays(today, 60)));
  const agendaDays = [...groupByDay(agenda).entries()];
  const toggle = (k: EventKind) => setHidden((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-2.5 flex-wrap">
        <h1 className="font-serif text-[32px] md:text-[40px] leading-tight flex-1 min-w-[180px]">{view === "month" ? fmtMonth(new Date(cursor.y, cursor.m, 1)) : "יומן"}</h1>
        {view === "month" && <>
          <button className="icon-btn bg-white shadow-[inset_0_0_0_1px_#e2dace]" aria-label="החודש הקודם" onClick={() => shift(-1)}><Icon name="chevR" /></button>
          <button className="btn btn-secondary" onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}>היום</button>
          <button className="icon-btn bg-white shadow-[inset_0_0_0_1px_#e2dace]" aria-label="החודש הבא" onClick={() => shift(1)}><Icon name="chevL" /></button>
        </>}
        <div className="seg"><button aria-pressed={view === "month"} onClick={() => setView("month")}>חודש</button><button aria-pressed={view === "agenda"} onClick={() => setView("agenda")}>סדר יום</button></div>
        <button className="btn btn-primary" onClick={() => quick({ kind: "appointment" })}><Icon name="plus" />אירוע</button>
      </header>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0" role="group" aria-label="סינון קטגוריות">
        {(Object.keys(EVENT_STYLE) as EventKind[]).map((k) => (
          <button key={k} className="chip" aria-pressed={!hidden.has(k)} onClick={() => toggle(k)}
            style={hidden.has(k) ? { opacity: 0.55 } : { background: "#fff", color: "var(--ink)", boxShadow: "inset 0 0 0 1.5px var(--ink)" }}>
            <EventMark kind={k} />{EVENT_STYLE[k].label}
          </button>
        ))}
      </div>

      {view === "month" ? (
        <div className="card overflow-hidden p-0">
          <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] md:grid-cols-[64px_repeat(7,minmax(0,1fr))] bg-surface-2">
            <div className="p-2 text-[11px] font-extrabold text-ink-3">שבוע</div>
            {WEEKDAYS.map((d) => <div key={d} className="p-2 md:p-2.5 text-[13px] font-extrabold text-ink-3">{d}</div>)}
          </div>
          {grid.map((row) => {
            const mid = row[3];
            const pw = weekOf(space.due_date, mid);
            const current = row.some((d) => toDay(d) === todayKey);
            return (
              <div key={toDay(row[0])} className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] md:grid-cols-[64px_repeat(7,minmax(0,1fr))]"
                style={current ? { background: "var(--primary-50)", boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--primary) 35%, white)" } : undefined}>
                <div className="border-t border-[#efe8de] flex flex-col items-center pt-3 gap-0.5" style={current ? { background: "var(--primary-100)", color: "var(--primary)" } : { color: "var(--ink-3)" }}>
                  <span className="text-[10px] md:text-[11px] font-bold">{current ? "השבוע" : "שבוע"}</span>
                  <span className="font-serif text-xl md:text-[26px] leading-none">{pw >= 0 && pw <= 42 ? pw : "–"}</span>
                </div>
                {row.map((d) => {
                  const key = toDay(d);
                  const inMonth = d.getMonth() === cursor.m;
                  const evs = byDay.get(key) ?? [];
                  const isToday = key === todayKey;
                  return (
                    <div key={key} className="min-h-[76px] md:min-h-[118px] p-1 md:p-2 border-t border-s border-[#efe8de] flex flex-col gap-1">
                      <span className={`self-start text-[13px] md:text-sm font-bold ${isToday ? "w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-extrabold" : "px-1"}`}
                        style={!isToday ? { color: inMonth ? "var(--ink)" : "#B3A999" } : undefined}>{d.getDate()}</span>
                      <div className="hidden md:flex flex-col gap-1">{evs.slice(0, 3).map((e) => <EventChip key={e.id} e={e} onClick={() => open(e)} />)}
                        {evs.length > 3 && <span className="text-[11px] font-bold text-ink-3 px-1">ועוד {evs.length - 3}</span>}</div>
                      <div className="md:hidden flex flex-wrap gap-1 px-0.5">{evs.slice(0, 4).map((e) => <EventMark key={e.id} kind={e.kind} />)}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : agendaDays.length === 0 ? (
        <EmptyState title="אין אירועים בחודשיים הקרובים" />
      ) : (
        <div className="flex flex-col gap-1">
          {agendaDays.map(([day, evs]) => (
            <section key={day} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2 px-1 pt-3"><b className="text-base">{fmtDay(day)}</b>
                <span className="text-[13px] font-bold text-ink-3">{relDays(day)} · שבוע {weekOf(space.due_date, day)}</span></div>
              {evs.map((e) => (
                <button key={e.id} onClick={() => open(e)} disabled={!e.ref}
                  className="flex items-stretch gap-3 rounded-[18px] p-3.5 text-start min-h-16 border"
                  style={{ background: e.kind === "milestone" ? "#F6EFE2" : "#fff", borderColor: "var(--line)", borderStyle: e.kind === "task" ? "dashed" : "solid" }}>
                  <span className="w-1 rounded flex-none" style={{ background: e.kind === "doctor" ? "var(--st-sched)" : e.kind === "test" ? "var(--primary)" : e.kind === "deadline" ? "#A85A36" : e.kind === "milestone" ? "#8A6A2A" : "#3D3832" }} />
                  <span className="w-12 flex-none text-sm font-extrabold pt-0.5" dir="ltr" style={{ textAlign: "right" }}>{e.time ?? "—"}</span>
                  <span className="flex-1 min-w-0"><b className="block">{e.title}</b>{e.sub && <span className="text-[13px] text-ink-3 font-semibold">{e.sub}</span>}</span>
                </button>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
