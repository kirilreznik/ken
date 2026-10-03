import { addDays, dateOfWeek, toDay } from "./pregnancy";
import { BIRTH_TASKS } from "./birthDefaults";
import type { Appointment, PrepItem, Priority, SuggestionState, Task, TaskCategory } from "./types";

/** A week-based checklist suggestion. `key` is stable so a decision (add/dismiss) sticks. */
export interface Suggestion {
  key: string;
  title: string;
  why: string;
  category: TaskCategory;
  /** Week by which it should be done. */
  dueWeek: number;
  priority: Priority;
  appointmentId?: string;
}

interface Rule { key: string; from: number; to: number; title: string; why: string; category: TaskCategory }

/** General planning milestones (information only — not medical advice). */
export const RULES: Rule[] = [
  { key: "sugg:open-file", from: 5, to: 10, category: "admin", title: "לפתוח תיק מעקב הריון בקופה", why: "כדי לקבל הפניות לבדיקות השגרתיות בזמן" },
  { key: "sugg:employer", from: 12, to: 20, category: "admin", title: "לעדכן את מקום העבודה ולבדוק זכויות", why: "כולל היעדרות לבדיקות והגנה מפני פיטורים" },
  { key: "sugg:hospital-choose", from: 22, to: 30, category: "birth", title: "לבחור בית חולים ללידה", why: "כדי להספיק סיור ורישום מוקדם" },
  { key: "sugg:leave-plan", from: 20, to: 26, category: "admin", title: "לתכנן את חופשת הלידה", why: "תאריכים, דמי לידה מביטוח לאומי וחלוקה בין בני הזוג" },
  { key: "sugg:prep-list", from: 20, to: 28, category: "baby", title: "לעבור על רשימת ההכנות לתינוק", why: "פריטים גדולים כמו עגלה ומיטה דורשים זמן משלוח" },
  { key: "sugg:class", from: 22, to: 30, category: "pregnancy", title: "להירשם לקורס הכנה ללידה", why: "קורסים מתמלאים — עדיף להירשם מוקדם" },
  { key: "sugg:cord-blood", from: 26, to: 32, category: "medical", title: "להחליט לגבי תרומה או שמירה של דם טבורי", why: "החלטה שכדאי לסגור לפני הלידה" },
  { key: "sugg:pediatrician", from: 28, to: 34, category: "baby", title: "לבחור רופא/ת ילדים", why: "יהיה צורך בביקור ראשון בימים הראשונים" },
  { key: "sugg:birth-plan", from: 28, to: 34, category: "birth", title: "לכתוב העדפות לידה", why: "אפשר להתחיל בעמוד הכנה ללידה" },
  { key: "sugg:wash", from: 33, to: 36, category: "baby", title: "לכבס ולסדר בגדים ומצעים לתינוק", why: "בכביסה עדינה, בלי מרכך" },
  { key: "sugg:freezer", from: 34, to: 37, category: "home", title: "להכין ארוחות להקפאה", why: "לשבועות הראשונים אחרי הלידה" },
  { key: "sugg:help", from: 34, to: 37, category: "home", title: "לתאם עזרה לשבועות הראשונים", why: "מי עוזר, מתי, ומי שומר על הבית בזמן הלידה" },
  ...BIRTH_TASKS.map((t) => ({ key: t.key, from: t.week - 2, to: t.week, title: t.title, why: "מהרשימה של הכנה ללידה", category: "birth" as const })),
];

/** How many weeks before the "book by" week the nudge appears. */
const BOOK_LEAD = 2;

export function buildSuggestions(opts: {
  week: number;
  appointments?: Appointment[];
  tasks?: Task[];
  prep?: PrepItem[];
  states?: SuggestionState[];
  /** Weeks before a window opens to book (space setting). */
  lead?: number;
}): Suggestion[] {
  const { week } = opts;
  const lead = opts.lead ?? 3;
  const decided = new Set((opts.states ?? []).map((s) => s.key));
  const taken = new Set((opts.tasks ?? []).map((t) => t.source_key).filter(Boolean));
  const linked = new Set((opts.tasks ?? []).filter((t) => !t.done).map((t) => t.appointment_id).filter(Boolean));
  const out: Suggestion[] = [];

  for (const r of RULES) {
    if (week < r.from || week > r.to + 2) continue;
    out.push({ key: r.key, title: r.title, why: r.why, category: r.category, dueWeek: r.to, priority: week > r.to ? "high" : "normal" });
  }

  for (const a of opts.appointments ?? []) {
    if (a.status !== "future" && a.status !== "need") continue;
    if (a.window_start_week == null) continue;
    const end = a.window_end_week ?? a.window_start_week + 1;
    const bookBy = a.book_by_week ?? a.window_start_week - lead;
    const opens = bookBy - BOOK_LEAD;
    if (week < opens || week > end) continue;
    if (linked.has(a.id)) continue;
    out.push({
      key: `sugg:book:${a.id}`,
      title: `לקבוע תור: ${a.title}`,
      why: `לקבוע עד שבוע ${bookBy} · החלון: שבועות ${a.window_start_week}–${end}`,
      category: "medical",
      dueWeek: Math.max(week, bookBy),
      priority: week >= end - 1 ? "urgent" : week >= bookBy ? "high" : "normal",
      appointmentId: a.id,
    });
  }

  const missing = (opts.prep ?? []).filter((p) => p.status === "need").length;
  if (week >= 32 && missing > 0) {
    out.push({ key: "sugg:prep-essentials", title: "להשלים את הפריטים החסרים בהכנות לתינוק", why: `${missing} פריטים עדיין מסומנים ״צריך״`, category: "baby", dueWeek: 36, priority: week >= 35 ? "high" : "normal" });
  }

  const rank = { urgent: 0, high: 1, normal: 2, low: 3 } as const;
  return out
    .filter((s) => !decided.has(s.key) && !taken.has(s.key))
    .sort((a, b) => rank[a.priority] - rank[b.priority] || a.dueWeek - b.dueWeek);
}

/** Due date for a suggestion: end of its due week, but never in the past. */
export function suggestionDueDate(dueDate: string, dueWeek: number, today = new Date()) {
  const end = addDays(dateOfWeek(dueDate, dueWeek + 1), -1);
  return toDay(end < today ? today : end);
}
