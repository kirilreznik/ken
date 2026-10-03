import { describe, expect, it } from "vitest";
import { buildSuggestions, suggestionDueDate } from "@/lib/suggestions";
import type { Appointment, Task } from "@/lib/types";

const appt = (p: Partial<Appointment>): Appointment => ({ id: "a1", space_id: "s", title: "העמסת סוכר", kind: "blood", status: "future", starts_at: null,
  window_start_week: 24, window_end_week: 28, provider: null, location: null, medical_notes: null, personal_note: null, result_summary: null, created_by: "u", created_at: "", updated_at: "", ...p } as Appointment);

describe("smart checklist", () => {
  it("shows rules inside their window only", () => {
    const keys = (w: number) => buildSuggestions({ week: w }).map((s) => s.key);
    expect(keys(21)).toContain("sugg:leave-plan");
    expect(keys(19)).not.toContain("sugg:leave-plan");
    expect(keys(29)).not.toContain("sugg:leave-plan");
  });
  it("marks late items as high priority", () => {
    expect(buildSuggestions({ week: 27 }).find((s) => s.key === "sugg:leave-plan")?.priority).toBe("high");
  });
  it("hides decided and already-added suggestions", () => {
    const tasks = [{ source_key: "sugg:class", done: false } as Task];
    const list = buildSuggestions({ week: 24, tasks, states: [{ space_id: "s", key: "sugg:prep-list", status: "dismissed" }] });
    expect(list.map((s) => s.key)).not.toContain("sugg:class");
    expect(list.map((s) => s.key)).not.toContain("sugg:prep-list");
  });
  it("nudges to book a test before its window opens", () => {
    expect(buildSuggestions({ week: 21, appointments: [appt({})] }).some((s) => s.key === "sugg:book:a1")).toBe(false);
    const s = buildSuggestions({ week: 22, appointments: [appt({})] }).find((x) => x.key === "sugg:book:a1");
    expect(s?.priority).toBe("normal");
    expect(buildSuggestions({ week: 27, appointments: [appt({})] }).find((x) => x.key === "sugg:book:a1")?.priority).toBe("urgent");
  });
  it("skips booked tests and tests with an open linked task", () => {
    expect(buildSuggestions({ week: 25, appointments: [appt({ status: "scheduled" })] }).some((s) => s.key.startsWith("sugg:book"))).toBe(false);
    expect(buildSuggestions({ week: 25, appointments: [appt({})], tasks: [{ appointment_id: "a1", done: false } as Task] }).some((s) => s.key.startsWith("sugg:book"))).toBe(false);
  });
  it("due date is the end of the due week, never in the past", () => {
    expect(suggestionDueDate("2027-03-15", 20, new Date(2026, 0, 1))).toBe("2026-11-01");
    expect(suggestionDueDate("2027-03-15", 20, new Date(2026, 11, 1))).toBe("2026-12-01");
  });
});
