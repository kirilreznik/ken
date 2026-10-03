import { describe, expect, it } from "vitest";
import { dateOfWeek, parseDay, toDay, weekInfo, weekOf } from "@/lib/pregnancy";

describe("week math (from the due date)", () => {
  const due = "2027-03-15";
  it("is 40+0 on the due date", () => {
    const w = weekInfo(due, parseDay(due));
    expect(w.label).toBe("40+0");
    expect(w.daysLeft).toBe(0);
    expect(w.percent).toBe(100);
  });
  it("is 0+0 280 days before", () => {
    expect(weekInfo(due, parseDay("2026-06-08")).label).toBe("0+0");
  });
  it("counts days within a week", () => {
    expect(weekInfo(due, parseDay("2026-10-03")).label).toBe("16+5");
  });
  it("assigns trimesters at 14 and 28 weeks", () => {
    expect(weekInfo(due, dateOfWeek(due, 13)).trimester).toBe(1);
    expect(weekInfo(due, dateOfWeek(due, 14)).trimester).toBe(2);
    expect(weekInfo(due, dateOfWeek(due, 28)).trimester).toBe(3);
  });
  it("dateOfWeek and weekOf round-trip", () => {
    for (const w of [4, 12, 20, 36]) expect(weekOf(due, toDay(dateOfWeek(due, w)))).toBe(w);
  });
  it("survives a DST change (Israel, late March)", () => {
    expect(weekInfo(due, parseDay("2027-03-29")).days).toBe(294);
  });
});
