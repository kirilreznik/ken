import { describe, expect, it } from "vitest";
import { summaryRange, weekSummary, summaryLine, weekRangeLabel } from "@/lib/summary";
import { buildIcs, fold } from "@/lib/ics";
import type { Appointment, Task } from "@/lib/types";

describe("weekly summary", () => {
  it("looks ahead to Sunday when run on Saturday", () => {
    expect(summaryRange("2026-10-03")).toEqual({ from: "2026-10-04", to: "2026-10-10" }); // Saturday
    expect(summaryRange("2026-10-06")).toEqual({ from: "2026-10-04", to: "2026-10-10" }); // Tuesday
  });
  it("counts appointments, tasks and overdue", () => {
    const s = weekSummary({
      dueDate: "2027-03-15", today: "2026-10-03",
      appointments: [{ id: "a", status: "scheduled", starts_at: "2026-10-05T08:00:00Z", title: "סקירה" } as Appointment],
      tasks: [{ id: "t1", done: false, due_date: "2026-10-07" } as Task, { id: "t2", done: false, due_date: "2026-10-01" } as Task, { id: "t3", done: true, due_date: "2026-10-07" } as Task],
    });
    expect(s.appointments).toHaveLength(1);
    expect(s.tasks).toHaveLength(1);
    expect(s.overdue).toHaveLength(1);
    expect(summaryLine(s)).toContain("תור אחד");
    expect([s.week, s.weekTo]).toEqual([16, 17]); // Sun 4.10 = 16+5, Sat 10.10 = 17+4
    expect(weekRangeLabel(s)).toBe("שבוע 16–17");
  });
});

describe("calendar feed", () => {
  const data = {
    name: "ההריון שלנו", due_date: "2027-03-15", show_titles: false,
    appointments: [{ id: "a", title: "סקירת מערכות, מאוחרת; עם ד״ר כהן", kind: "ultrasound", starts_at: "2026-10-05T08:00:00Z", provider: "ד״ר כהן", location: "תל אביב", updated_at: null }],
    tasks: [{ id: "t", title: "קורס הכנה", due_date: "2026-10-07", created_at: null }],
  };
  it("hides titles and places by default", () => {
    const ics = buildIcs(data, { host: "ken.test", now: new Date("2026-10-03T00:00:00Z") });
    expect(ics).toContain("SUMMARY:תור");
    expect(ics).not.toContain("סקירת");
    expect(ics).not.toContain("LOCATION");
    expect(ics).not.toContain("תאריך לידה");
    expect(ics).toContain("DTSTART:20261005T080000Z");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261007");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
  it("escapes and folds long Hebrew lines on character boundaries", () => {
    const ics = buildIcs({ ...data, show_titles: true }, { host: "ken.test" });
    expect(ics).toContain("\\,");
    expect(ics).toContain("\\;");
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(ics.replace(/\r\n /g, "")).toContain("SUMMARY:סקירת מערכות\\, מאוחרת\\; עם ד״ר כהן");
  });
  it("fold leaves short lines alone", () => expect(fold("A:b")).toBe("A:b"));
});
