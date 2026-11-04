import { describe, expect, it } from "vitest";
import { EMAIL_ERROR, emailError, isEmail, normalizeEmail } from "@/lib/names/email";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Dana.Levi@Example.COM \n")).toBe("dana.levi@example.com");
  });
});

describe("isEmail", () => {
  it("accepts ordinary addresses", () => {
    for (const ok of ["name@example.com", "a.b+tag@mail.co.il", "x_y-z@sub.domain.org", "1@2.io"]) {
      expect(isEmail(ok), ok).toBe(true);
    }
  });

  it("accepts uppercase and surrounding spaces", () => {
    expect(isEmail("NAME@EXAMPLE.COM")).toBe(true);
    expect(isEmail("  name@example.com  ")).toBe(true);
  });

  it("rejects empty input and inner spaces", () => {
    for (const bad of ["", "   ", "na me@example.com", "name@exa mple.com"]) {
      expect(isEmail(bad), bad).toBe(false);
    }
  });

  it("rejects a missing or doubled @", () => {
    for (const bad of ["name.example.com", "name", "a@b@example.com"]) {
      expect(isEmail(bad), bad).toBe(false);
    }
  });

  it("rejects a missing local part or domain", () => {
    for (const bad of ["@example.com", "name@", "name@example", "name@.com", "name@example.", "name@example..com"]) {
      expect(isEmail(bad), bad).toBe(false);
    }
  });
});

describe("emailError", () => {
  it("returns the Hebrew message for invalid input and null otherwise", () => {
    expect(emailError("name@")).toBe(EMAIL_ERROR);
    expect(EMAIL_ERROR).toBe("צריך כתובת אימייל, למשל name@example.com");
    expect(emailError("Name@Example.com")).toBeNull();
  });
});
