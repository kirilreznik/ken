import { addDays, parseDay, toDay, weekInfo } from "./pregnancy";
import { buildSuggestions } from "./suggestions";
import type { Appointment, PrepItem, SuggestionState, Task } from "./types";

export interface WeekSummary {
  /** Pregnancy week on the first day (Sunday) of the calendar week. */
  week: number;
  /** Pregnancy week on the last day (Saturday) — usually week + 1. */
  weekTo: number;
  from: string; // YYYY-MM-DD (Sunday)
  to: string;   // YYYY-MM-DD (Saturday)
  appointments: Appointment[];
  tasks: Task[];
  overdue: Task[];
  windowsClosing: Appointment[];
  suggestions: number;
  firstSuggestion: string | null;
}

/** The upcoming (or current) Sunday–Saturday. On Saturday it looks ahead to tomorrow. */
export function summaryRange(today: string) {
  const d = parseDay(today);
  const dow = d.getDay(); // 0 = Sunday
  const start = dow === 6 ? addDays(d, 1) : addDays(d, -dow);
  return { from: toDay(start), to: toDay(addDays(start, 6)) };
}

/** What's coming up this week — shared by the Home card and the Saturday push. */
export function weekSummary(opts: {
  dueDate: string;
  today: string;
  /** Local YYYY-MM-DD of an ISO timestamp (timezone-aware on the server). */
  dayOf?: (iso: string) => string;
  appointments?: Appointment[];
  tasks?: Task[];
  prep?: PrepItem[];
  states?: SuggestionState[];
  lead?: number;
}): WeekSummary {
  const { from, to } = summaryRange(opts.today);
  const dayOf = opts.dayOf ?? ((iso: string) => toDay(new Date(iso)));
  const week = weekInfo(opts.dueDate, parseDay(from)).week;
  const weekTo = weekInfo(opts.dueDate, parseDay(to)).week;
  const appts = opts.appointments ?? [];
  const open = (opts.tasks ?? []).filter((t) => !t.done);
  const inRange = (d: string) => d >= from && d <= to;
  const sugg = buildSuggestions({ week, appointments: appts, tasks: opts.tasks, prep: opts.prep, states: opts.states, lead: opts.lead });
  return {
    week, weekTo, from, to,
    appointments: appts.filter((a) => a.status === "scheduled" && a.starts_at && inRange(dayOf(a.starts_at)))
      .sort((a, b) => a.starts_at!.localeCompare(b.starts_at!)),
    tasks: open.filter((t) => t.due_date && inRange(t.due_date)),
    overdue: open.filter((t) => t.due_date && t.due_date < opts.today),
    windowsClosing: appts.filter((a) => (a.status === "future" || a.status === "need") && a.window_end_week != null
      && a.window_end_week >= week && a.window_end_week <= week + 1),
    suggestions: sugg.length,
    firstSuggestion: sugg[0]?.title ?? null,
  };
}

export function summaryLine(s: WeekSummary) {
  const parts: string[] = [];
  parts.push(s.appointments.length ? `${s.appointments.length === 1 ? "תור אחד" : `${s.appointments.length} תורים`}` : "אין תורים");
  if (s.tasks.length) parts.push(`${s.tasks.length} משימות`);
  if (s.overdue.length) parts.push(`${s.overdue.length} באיחור`);
  if (s.windowsClosing.length) parts.push(`${s.windowsClosing.length} חלונות נסגרים`);
  if (s.suggestions) parts.push(`${s.suggestions} הצעות`);
  return parts.join(" · ");
}

/** "שבוע 16–17" for a calendar week that spans two pregnancy weeks. */
export const weekRangeLabel = (s: Pick<WeekSummary, "week" | "weekTo">) => (s.week === s.weekTo ? `שבוע ${s.week}` : `שבוע ${s.week}–${s.weekTo}`);
