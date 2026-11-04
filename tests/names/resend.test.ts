import { describe, expect, it } from "vitest";
import {
  RESEND_READY_TEXT,
  RESEND_SECONDS,
  cleanCode,
  resendAnnouncement,
  resendWaitText,
  secondsLeft,
} from "@/lib/names/resend";

describe("secondsLeft", () => {
  it("counts down from 60 and stops at 0", () => {
    expect(secondsLeft(0, 0)).toBe(RESEND_SECONDS);
    expect(secondsLeft(0, 400)).toBe(60);
    expect(secondsLeft(0, 1000)).toBe(59);
    expect(secondsLeft(0, 59_500)).toBe(1);
    expect(secondsLeft(0, 60_000)).toBe(0);
    expect(secondsLeft(0, 90_000)).toBe(0);
  });
});

describe("resendWaitText", () => {
  it("says the wait in words", () => {
    expect(resendWaitText(45)).toBe("אפשר לשלוח שוב בעוד 45 שניות");
    expect(resendWaitText(1)).toBe("אפשר לשלוח שוב בעוד שנייה");
    expect(resendWaitText(0)).toBe(RESEND_READY_TEXT);
  });
});

describe("resendAnnouncement", () => {
  it("announces at the start, every 15 s and at the end only", () => {
    const said: number[] = [];
    for (let s = 60; s >= 0; s--) {
      const a = resendAnnouncement(s);
      if (a) said.push(s);
    }
    expect(said).toEqual([60, 45, 30, 15, 0]);
  });
});

describe("cleanCode", () => {
  it("keeps up to 6 digits", () => {
    expect(cleanCode("123 456")).toBe("123456");
    expect(cleanCode("12-34-56-78")).toBe("123456");
    expect(cleanCode("abc")).toBe("");
    expect(cleanCode("קוד: 987654")).toBe("987654");
  });
});
