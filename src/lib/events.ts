import { addDays, dateOfWeek, parseDay, toDay } from "./pregnancy";
import type { Appointment, Task } from "./types";

export type EventKind = "doctor" | "test" | "deadline" | "task" | "milestone";
export interface CalEvent {
  id: string;
  day: string; // YYYY-MM-DD (local)
  time?: string; // HH:MM
  kind: EventKind;
  title: string;
  sub?: string;
  done?: boolean;
  ref?: { type: "appointment"; row: Appointment } | { type: "task"; row: Task };
}

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export const MILESTONES: Array<{ week: number; title: string }> = [
  { week: 14, title: "תחילת השליש השני" },
  { week: 20, title: "חצי הדרך" },
  { week: 28, title: "תחילת השליש השלישי" },
  { week: 37, title: "הריון מלא" },
  { week: 40, title: "תאריך לידה משוער" },
];

/** Everything that belongs on the calendar, derived from existing data. */
export function buildEvents(dueDate: string, appts: Appointment[] = [], tasks: Task[] = []): CalEvent[] {
  const out: CalEvent[] = [];
  for (const a of appts) {
    if (a.starts_at) {
      const d = new Date(a.starts_at);
      out.push({
        id: `a-${a.id}`, day: toDay(d), time: hhmm(d), kind: a.kind === "doctor" || a.kind === "other" ? "doctor" : "test",
        title: a.title, sub: a.provider ?? undefined, done: a.status === "completed" || a.status === "done" || a.status === "pending",
        ref: { type: "appointment", row: a },
      });
    } else if ((a.status === "need" || a.status === "future") && a.window_end_week != null) {
      // Deadline = last day of the window.
      out.push({
        id: `w-${a.id}`, day: toDay(addDays(dateOfWeek(dueDate, a.window_end_week + 1), -1)), kind: "deadline",
        title: `סוף חלון: ${a.title}`, sub: `שבועות ${a.window_start_week}–${a.window_end_week}`, ref: { type: "appointment", row: a },
      });
    }
  }
  for (const t of tasks) {
    if (!t.due_date || t.done) continue;
    out.push({ id: `t-${t.id}`, day: t.due_date, kind: "task", title: t.title, ref: { type: "task", row: t } });
  }
  for (const m of MILESTONES) {
    const day = m.week === 40 ? dueDate : toDay(dateOfWeek(dueDate, m.week));
    out.push({ id: `m-${m.week}`, day, kind: "milestone", title: m.title, sub: `שבוע ${m.week}` });
  }
  return out.sort((a, b) => (a.day + (a.time ?? "99")).localeCompare(b.day + (b.time ?? "99")));
}

export function groupByDay(events: CalEvent[]) {
  const m = new Map<string, CalEvent[]>();
  for (const e of events) m.set(e.day, [...(m.get(e.day) ?? []), e]);
  return m;
}

/** Sunday-first 6-week grid for a month. */
export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = addDays(first, -first.getDay());
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row = Array.from({ length: 7 }, (_, i) => addDays(start, w * 7 + i));
    if (w >= 4 && row[0].getMonth() !== month) break;
    weeks.push(row);
  }
  return weeks;
}

export const isSameDay = (a: Date, b: Date) => toDay(a) === toDay(b);
export { parseDay };
