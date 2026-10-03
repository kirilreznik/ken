/** Pregnancy follow-up plan → reviewable rows → appointment changes. Pure (no browser APIs). */
import { STANDARD_TESTS, weekOf } from "./pregnancy";
import type { Appointment, AppointmentKind, AppointmentStatus, PlanResult, PlanResultItem } from "./types";

export type RowAction = "create" | "update" | "past" | "done";

export interface PlanRow {
  key: string;
  include: boolean;
  title: string;
  kind: AppointmentKind;
  start: number | null;
  end: number | null;
  bookBy: number | null;
  date: string | null;   // YYYY-MM-DD, already scheduled
  time: string | null;   // HH:MM
  location: string | null;
  notes: string | null;
  optional: boolean;
  matchId: string | null;
  action: RowAction;
}

/** How many weeks ahead to book when the plan doesn't say (ultrasounds fill up early). */
export function defaultBookBy(kind: AppointmentKind, start: number | null, week: number) {
  if (start == null) return null;
  const lead = kind === "ultrasound" ? 3 : 1;
  return Math.max(week, start - lead);
}

/** The Israeli standard schedule (used when there's no plan document). */
export function standardPlan(): PlanResult {
  return { items: STANDARD_TESTS.map((t) => ({ title: t.title, kind: t.kind, window_start_week: t.from, window_end_week: t.to, optional: t.kind === "genetic" })) };
}

const STOP = new Set(["בדיקת", "בדיקה", "בדיקות", "סקירת", "סקירה", "מערכות", "דם", "של", "ו", "ב", "ל", "תור", "ביקור"]);
const tokens = (s: string) => s.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).map((w) => w.replace(/^ה(?=\p{L}{3,})/u, "")).filter((w) => w.length >= 2 && !STOP.has(w));
const norm = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "");

function overlaps(a1: number | null, a2: number | null, b1: number | null, b2: number | null) {
  if (a1 == null || b1 == null) return true;
  return a1 <= (b2 ?? b1) && b1 <= (a2 ?? a1);
}

/** Best existing appointment for a plan item (when the AI didn't say). */
export function findMatch(it: { title: string; kind: AppointmentKind; start: number | null; end: number | null }, appts: Appointment[], used: Set<string>) {
  const t = tokens(it.title);
  let best: { a: Appointment; score: number } | null = null;
  for (const a of appts) {
    if (used.has(a.id)) continue;
    if (!overlaps(it.start, it.end, a.window_start_week, a.window_end_week)) continue;
    let score = 0;
    const na = norm(a.title), ni = norm(it.title);
    if (na && ni && (na.includes(ni) || ni.includes(na))) score += 3;
    const shared = tokens(a.title).filter((w) => t.includes(w)).length;
    score += shared * 2;
    if (a.kind === it.kind) score += 1;
    if (score >= 3 && (!best || score > best.score)) best = { a, score };
  }
  return best?.a ?? null;
}

const isDay = (s?: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

/** Turn an analysis result into review rows, matched against what's already in the app. */
export function buildRows(result: PlanResult, opts: { dueDate: string; week: number; appointments: Appointment[] }): PlanRow[] {
  const used = new Set<string>();
  const byId = new Map(opts.appointments.map((a) => [a.id, a]));
  const items = [...result.items].sort((a, b) => (startOf(a, opts.dueDate) ?? 99) - (startOf(b, opts.dueDate) ?? 99));
  return items.map((it, i) => {
    const start = startOf(it, opts.dueDate);
    const end = it.window_end_week ?? (isDay(it.window_end_date) ? weekOf(opts.dueDate, it.window_end_date!) : null) ?? start;
    const date = isDay(it.date) ? it.date! : null;
    const kind = it.kind ?? "other";
    let match = it.match_id && byId.has(it.match_id) && !used.has(it.match_id) ? byId.get(it.match_id)! : null;
    if (!match) match = findMatch({ title: it.title, kind, start, end }, opts.appointments, used);
    if (match) used.add(match.id);
    const finished = match && ["completed", "done", "pending"].includes(match.status);
    const past = !match && end != null && end < opts.week && !date;
    const action: RowAction = finished ? "done" : match ? "update" : past ? "past" : "create";
    return {
      key: `r${i}`,
      include: action === "create" || action === "update",
      title: it.title.trim(),
      kind,
      start, end,
      bookBy: it.book_by_week ?? defaultBookBy(kind, start, opts.week),
      date, time: it.time && /^\d{1,2}:\d{2}$/.test(it.time) ? it.time.padStart(5, "0") : null,
      location: it.location ?? null,
      notes: it.notes ?? null,
      optional: !!it.optional,
      matchId: match?.id ?? null,
      action,
    };
  });
}

function startOf(it: PlanResultItem, dueDate: string) {
  return it.window_start_week ?? (isDay(it.window_start_date) ? weekOf(dueDate, it.window_start_date!) : null) ?? (isDay(it.date) ? weekOf(dueDate, it.date!) : null);
}

export interface PlanChanges {
  inserts: Array<Partial<Appointment>>;
  updates: Array<{ id: string; patch: Partial<Appointment> }>;
}

/** Selected rows → inserts and updates. `startsAt` builds a timestamp from a local date + time. */
export function planChanges(rows: PlanRow[], opts: { week: number; appointments: Appointment[]; source: "plan" | "standard"; planDocumentId: string | null; userId: string; spaceId: string; startsAt: (date: string, time: string | null) => string }): PlanChanges {
  const byId = new Map(opts.appointments.map((a) => [a.id, a]));
  const out: PlanChanges = { inserts: [], updates: [] };
  for (const r of rows) {
    if (!r.include || r.action === "done") continue;
    const scheduled = r.date ? { starts_at: opts.startsAt(r.date, r.time), status: "scheduled" as AppointmentStatus } : {};
    if (r.action === "update" && r.matchId) {
      const a = byId.get(r.matchId);
      if (!a) continue;
      const patch: Partial<Appointment> = {
        window_start_week: r.start, window_end_week: r.end, book_by_week: r.bookBy,
        plan_document_id: opts.planDocumentId ?? a.plan_document_id ?? null,
        ...(a.location ? {} : r.location ? { location: r.location } : {}),
        ...(a.medical_notes ? {} : r.notes ? { medical_notes: r.notes } : {}),
        ...((a.status === "future" || a.status === "need") ? scheduled : {}),
      };
      out.updates.push({ id: a.id, patch });
      continue;
    }
    const status: AppointmentStatus = r.action === "past" ? "completed" : r.date ? "scheduled" : r.start != null && opts.week >= r.start ? "need" : "future";
    out.inserts.push({
      space_id: opts.spaceId, title: r.title, kind: r.kind, status,
      window_start_week: r.start, window_end_week: r.end, book_by_week: r.bookBy,
      starts_at: r.date ? opts.startsAt(r.date, r.time) : null,
      location: r.location, medical_notes: r.notes, provider: null, personal_note: null, result_summary: null,
      source: opts.source, plan_document_id: opts.planDocumentId, created_by: opts.userId,
    });
  }
  return out;
}
