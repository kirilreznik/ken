import { describe, expect, it } from "vitest";
import { buildRows, defaultBookBy, planChanges, standardPlan } from "@/lib/plan";
import type { Appointment, PlanResult } from "@/lib/types";

const appt = (p: Partial<Appointment>): Appointment => ({ id: "x", space_id: "s", title: "", kind: "ultrasound", status: "future", starts_at: null,
  window_start_week: null, window_end_week: null, provider: null, location: null, medical_notes: null, personal_note: null, result_summary: null, ...p } as Appointment);
const due = "2027-03-15";

describe("plan import", () => {
  const result: PlanResult = { items: [
    { title: "סקירת מערכות מוקדמת", kind: "ultrasound", window_start_week: 14, window_end_week: 16, book_by_week: 10 },
    { title: "שקיפות עורפית", kind: "ultrasound", window_start_week: 11, window_end_week: 13 },
    { title: "העמסת סוכר 100 גרם", kind: "blood", window_start_week: 24, window_end_week: 28, notes: "בצום" },
    { title: "בדיקת מי שפיר", kind: "genetic", window_start_week: 17, window_end_week: 22, optional: true },
    { title: "ביקור רופאה", kind: "doctor", date: "2026-10-20", time: "8:30" },
  ] };
  const existing = [
    appt({ id: "early", title: "סקירה מוקדמת", window_start_week: 14, window_end_week: 17 }),
    appt({ id: "nt", title: "שקיפות עורפית", window_start_week: 11, window_end_week: 14, status: "completed" }),
    appt({ id: "late", title: "סקירת מערכות מאוחרת", window_start_week: 20, window_end_week: 24 }),
  ];

  it("matches existing tests by name and timing, without duplicates", () => {
    const rows = buildRows(result, { dueDate: due, week: 12, appointments: existing });
    const by = Object.fromEntries(rows.map((r) => [r.title, r]));
    expect(by["סקירת מערכות מוקדמת"].matchId).toBe("early");
    expect(by["סקירת מערכות מוקדמת"].action).toBe("update");
    expect(by["שקיפות עורפית"].action).toBe("done");
    expect(by["העמסת סוכר 100 גרם"].action).toBe("create");
    expect(by["העמסת סוכר 100 גרם"].matchId).toBeNull();
    expect(rows.filter((r) => r.matchId === "late")).toHaveLength(0);
  });

  it("uses the AI's match id when given and valid", () => {
    const rows = buildRows({ items: [{ title: "US 20", kind: "ultrasound", window_start_week: 20, window_end_week: 23, match_id: "late" }] }, { dueDate: due, week: 12, appointments: existing });
    expect(rows[0].matchId).toBe("late");
  });

  it("marks windows that already passed (mid-pregnancy upload)", () => {
    const rows = buildRows(result, { dueDate: due, week: 20, appointments: [] });
    const nt = rows.find((r) => r.title === "שקיפות עורפית")!;
    expect(nt.action).toBe("past");
    expect(nt.include).toBe(false);
  });

  it("derives weeks from a scheduled date and normalizes time", () => {
    const visit = buildRows(result, { dueDate: due, week: 16, appointments: [] }).find((r) => r.kind === "doctor")!;
    expect(visit.start).toBe(19);
    expect(visit.time).toBe("08:30");
    expect(visit.action).toBe("create");
  });

  it("defaults book-by to 3 weeks ahead for ultrasound, never in the past", () => {
    expect(defaultBookBy("ultrasound", 20, 10)).toBe(17);
    expect(defaultBookBy("blood", 24, 10)).toBe(23);
    expect(defaultBookBy("ultrasound", 14, 13)).toBe(13);
  });

  it("produces inserts and non-destructive updates", () => {
    const rows = buildRows(result, { dueDate: due, week: 12, appointments: existing });
    const ch = planChanges(rows, { week: 12, appointments: existing, source: "plan", planDocumentId: "doc", userId: "u", spaceId: "s", startsAt: (d, t) => `${d}T${t}` });
    expect(ch.updates).toEqual([{ id: "early", patch: expect.objectContaining({ window_start_week: 14, window_end_week: 16, book_by_week: 10, plan_document_id: "doc" }) }]);
    const sugar = ch.inserts.find((i) => i.title?.startsWith("העמסת"))!;
    expect(sugar.status).toBe("future");
    expect(sugar.medical_notes).toBe("בצום");
    const visit = ch.inserts.find((i) => i.kind === "doctor")!;
    expect(visit.status).toBe("scheduled");
    expect(visit.starts_at).toBe("2026-10-20T08:30");
  });

  it("standard plan has every standard test", () => {
    expect(standardPlan().items.length).toBeGreaterThanOrEqual(8);
  });
});
