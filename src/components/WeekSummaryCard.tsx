"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/Icon";
import { useSession } from "@/lib/session";
import { useAppointments, usePrepItems, useSuggestionStates, useTasks } from "@/lib/data";
import { toDay } from "@/lib/pregnancy";
import { weekRangeLabel, weekSummary } from "@/lib/summary";
import { fmtShort, fmtTime, fmtWeekdayShort } from "@/lib/format";

function Stat({ n, label, warn }: { n: number; label: string; warn?: boolean }) {
  return (
    <div className="flex-1 min-w-[90px] rounded-2xl bg-white/70 p-3">
      <div className="font-serif text-3xl leading-none" style={warn && n ? { color: "var(--st-att)" } : undefined}>{n}</div>
      <div className="text-[13px] font-bold text-ink-3 mt-1">{label}</div>
    </div>
  );
}

/** In-app twin of the Saturday-evening push. Shown Saturday → Monday. */
export function WeekSummaryCard({ force = false }: { force?: boolean }) {
  const { space } = useSession();
  const { data: appts } = useAppointments();
  const { data: tasks } = useTasks();
  const { data: prep } = usePrepItems();
  const { states } = useSuggestionStates();
  const today = toDay(new Date());
  const dow = new Date().getDay();

  const s = useMemo(
    () => (space ? weekSummary({ dueDate: space.due_date, today, appointments: appts, tasks, prep, states, lead: space.booking_lead_weeks }) : null),
    [space, today, appts, tasks, prep, states],
  );
  if (!s || (!force && dow !== 6 && dow !== 0 && dow !== 1)) return null;

  return (
    <section aria-label="השבוע הקרוב" className="rounded-[22px] p-5 md:p-6 flex flex-col gap-4 bg-primary-50 border border-line">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none bg-white text-primary"><Icon name="cal" /></span>
        <div className="flex-1">
          <h2 className="text-lg font-extrabold">השבוע הקרוב · {weekRangeLabel(s)}</h2>
          <p className="text-[13px] text-ink-3">{fmtShort(s.from)}–{fmtShort(s.to)}</p>
        </div>
        <Link href="/calendar" className="text-sm font-bold text-primary">ביומן</Link>
      </div>
      <div className="flex gap-2.5 flex-wrap">
        <Stat n={s.appointments.length} label="תורים" />
        <Stat n={s.tasks.length} label="משימות לשבוע" />
        <Stat n={s.overdue.length} label="באיחור" warn />
        <Stat n={s.windowsClosing.length} label="חלונות נסגרים" warn />
      </div>
      {s.appointments.length > 0 && (
        <ul className="flex flex-col gap-2">
          {s.appointments.slice(0, 3).map((a) => (
            <li key={a.id} className="flex gap-3 items-baseline text-[15px]">
              <span className="font-bold text-ink-3 w-[88px] flex-none">{fmtWeekdayShort(a.starts_at!)} {fmtShort(a.starts_at!)}</span>
              <span className="flex-1"><b>{a.title}</b> · {fmtTime(a.starts_at!)}</span>
            </li>
          ))}
        </ul>
      )}
      {s.windowsClosing.length > 0 && (
        <Link href="/tests" className="text-sm font-bold" style={{ color: "var(--st-att)" }}>לקבוע: {s.windowsClosing.map((a) => a.title).join(", ")}</Link>
      )}
    </section>
  );
}
