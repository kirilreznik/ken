import { describe, expect, it } from "vitest";
import { AuthApiError, AuthRetryableFetchError } from "@supabase/auth-js";
import {
  OFFLINE_MESSAGE,
  RATE_LIMIT_MESSAGE,
  WRONG_CODE_MESSAGE,
  authErrorKind,
  authErrorMessage,
  isValidEmail,
} from "@/lib/names/authErrors";

describe("authErrorKind", () => {
  it("maps a wrong or expired code", () => {
    const e = new AuthApiError("Token has expired or is invalid", 403, "otp_expired");
    expect(authErrorKind(e)).toBe("wrong-code");
    expect(authErrorMessage(authErrorKind(e))).toBe(WRONG_CODE_MESSAGE);
  });
  it("maps rate limits", () => {
    expect(authErrorKind(new AuthApiError("email rate limit exceeded", 429, "over_email_send_rate_limit"))).toBe("rate-limit");
    expect(authErrorMessage("rate-limit")).toBe(RATE_LIMIT_MESSAGE);
  });
  it("maps closed sign-ups", () => {
    expect(authErrorKind(new AuthApiError("Signups not allowed for otp", 422, "otp_disabled"))).toBe("signups-closed");
    expect(authErrorKind(new AuthApiError("x", 422, "signup_disabled"))).toBe("signups-closed");
  });
  it("maps network failures", () => {
    expect(authErrorKind(new AuthRetryableFetchError("Failed to fetch", 0))).toBe("offline");
    expect(authErrorKind(new TypeError("Failed to fetch"))).toBe("offline");
    expect(authErrorMessage("offline")).toBe(OFFLINE_MESSAGE);
  });
  it("falls back to other", () => {
    expect(authErrorKind(new AuthApiError("boom", 500, "unexpected_failure"))).toBe("other");
  });
});

describe("isValidEmail", () => {
  it.each(["a@b.co", " name@example.com ", "x.y+z@sub.domain.org"])("accepts %s", (v) => expect(isValidEmail(v)).toBe(true));
  it.each(["", "a", "a@b", "a@b.c", "a b@c.com", "@c.com", "a@.com"])("rejects %s", (v) => expect(isValidEmail(v)).toBe(false));
});
