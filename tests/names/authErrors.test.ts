import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthApiError, AuthRetryableFetchError, AuthUnknownError } from "@supabase/auth-js";

vi.mock("@/lib/names/clientLog", () => ({ reportClientLog: vi.fn(async () => {}) }));

import { reportClientLog } from "@/lib/names/clientLog";
import {
  GENERIC_MESSAGE,
  OFFLINE_MESSAGE,
  RATE_LIMIT_MESSAGE,
  SEND_FAILED_MESSAGE,
  WRONG_CODE_MESSAGE,
  clearsCode,
  authErrorKind,
  authErrorMessage,
  handleAuthError,
  isOffline,
  isValidEmail,
  reportAuthError,
  urlAuthError,
  visibleSignInError,
} from "@/lib/names/authErrors";

const report = vi.mocked(reportClientLog);
beforeEach(() => report.mockClear());

// Shapes returned by supabase-js against Nest (EU) (shots/us029-shapes.mjs).
const live = {
  signupClosed: () => new AuthApiError("Signups not allowed for this instance", 422, "signup_disabled"),
  wrongCode: () => new AuthApiError("Token has expired or is invalid", 403, "otp_expired"),
  offline: () => new AuthRetryableFetchError("fetch failed", 0),
};

describe("authErrorKind", () => {
  it("maps a wrong or expired code", () => {
    expect(authErrorKind(live.wrongCode())).toBe("wrong-code");
    expect(authErrorKind(new AuthApiError("Invalid OTP", 400, undefined))).toBe("wrong-code");
    expect(authErrorMessage("wrong-code")).toBe(WRONG_CODE_MESSAGE);
  });

  it("maps rate limits", () => {
    expect(authErrorKind(new AuthApiError("email rate limit exceeded", 429, "over_email_send_rate_limit"))).toBe("rate-limit");
    expect(authErrorKind(new AuthApiError("Request rate limit reached", 429, "over_request_rate_limit"))).toBe("rate-limit");
    expect(authErrorKind(new AuthApiError("For security purposes, you can only request this after 42 seconds.", 429, undefined))).toBe(
      "rate-limit",
    );
    expect(authErrorMessage("rate-limit")).toBe(RATE_LIMIT_MESSAGE);
  });

  it("maps closed sign-ups by code or by message", () => {
    expect(authErrorKind(live.signupClosed())).toBe("signups-closed");
    expect(authErrorKind(new AuthApiError("Signups not allowed for otp", 422, "otp_disabled"))).toBe("signups-closed");
  });

  it("maps network failures from every browser", () => {
    expect(authErrorKind(live.offline())).toBe("offline");
    expect(authErrorKind(new AuthRetryableFetchError("Failed to fetch", 0))).toBe("offline");
    expect(authErrorKind(new TypeError("Load failed"))).toBe("offline");
    expect(authErrorKind(new TypeError("NetworkError when attempting to fetch resource."))).toBe("offline");
    expect(authErrorMessage("offline")).toBe(OFFLINE_MESSAGE);
  });

  it("treats a 5xx (retryable, with a status) as other, not offline", () => {
    expect(authErrorKind(new AuthRetryableFetchError("HTTP 503", 503))).toBe("other");
  });

  it("falls back to other", () => {
    expect(authErrorKind(new AuthApiError("boom", 500, "unexpected_failure"))).toBe("other");
    expect(authErrorKind(new AuthApiError("captcha protection: request disallowed", 400, "captcha_failed"))).toBe("other");
    expect(authErrorKind(new AuthUnknownError("Unexpected token <", null))).toBe("other");
    expect(authErrorKind(null)).toBe("other");
    expect(authErrorKind("weird")).toBe("other");
    expect(authErrorMessage("other")).toBe(GENERIC_MESSAGE);
  });
});

describe("urlAuthError", () => {
  it("reads closed sign-ups from the PKCE callback query", () => {
    const e = urlAuthError(
      "?error=access_denied&error_code=signup_disabled&error_description=Signups+not+allowed+for+this+instance",
      "",
    );
    expect(e).toEqual({ name: "access_denied", code: "signup_disabled", message: "Signups not allowed for this instance" });
    expect(authErrorKind(e)).toBe("signups-closed");
  });

  it("reads the hash form", () => {
    const e = urlAuthError("", "#error=server_error&error_code=bad_oauth_state&error_description=OAuth%20state%20invalid");
    expect(e?.code).toBe("bad_oauth_state");
    expect(authErrorKind(e)).toBe("other");
  });

  it("handles a bare error", () => {
    expect(urlAuthError("?error=access_denied", "")).toEqual({ name: "access_denied", code: undefined, message: "access_denied" });
  });

  it("is null without an error", () => {
    expect(urlAuthError("?code=abc&join=AB12cd34", "")).toBeNull();
    expect(urlAuthError("", "")).toBeNull();
  });
});

describe("handleAuthError", () => {
  it("gives the Hebrew line and reports nothing for known errors", () => {
    expect(handleAuthError("a", live.wrongCode())).toEqual({ kind: "wrong-code", message: WRONG_CODE_MESSAGE });
    expect(handleAuthError("a", live.offline())).toEqual({ kind: "offline", message: OFFLINE_MESSAGE });
    expect(report).not.toHaveBeenCalled();
  });

  it("returns no message for closed sign-ups (the caller goes to welcome?closed=1)", () => {
    expect(handleAuthError("a", live.signupClosed())).toEqual({ kind: "signups-closed", message: null });
  });

  it("reports unknown errors by code and status only", () => {
    expect(handleAuthError("sign-in-email-send", new AuthApiError("user someone@example.com is odd", 500, "unexpected_failure"))).toEqual({
      kind: "other",
      message: SEND_FAILED_MESSAGE,
    });
    expect(report).toHaveBeenCalledWith({ area: "sign-in-email-send", message: "auth error unexpected_failure 500" });
  });
});

describe("reportAuthError", () => {
  it("never sends free text that could hold personal data", () => {
    reportAuthError("x", { code: "someone@example.com", name: "Error" });
    reportAuthError("x", { message: "phone 0501234567" });
    expect(report.mock.calls).toEqual([[{ area: "x", message: "auth error Error" }], [{ area: "x", message: "auth error unknown" }]]);
    for (const [arg] of report.mock.calls) expect(JSON.stringify(arg)).not.toMatch(/@|050/);
  });
});

describe("isOffline", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  afterEach(() => {
    if (original) Object.defineProperty(globalThis, "navigator", original);
  });

  it("follows navigator.onLine", () => {
    Object.defineProperty(globalThis, "navigator", { value: { onLine: false }, configurable: true });
    expect(isOffline()).toBe(true);
    Object.defineProperty(globalThis, "navigator", { value: { onLine: true }, configurable: true });
    expect(isOffline()).toBe(false);
  });
});

describe("visibleSignInError", () => {
  it("shows the offline line when a request fails while the phone says it's online", () => {
    expect(visibleSignInError(OFFLINE_MESSAGE, true)).toBe(OFFLINE_MESSAGE);
  });

  it("leaves it to ConnectionNote while offline", () => {
    expect(visibleSignInError(OFFLINE_MESSAGE, false)).toBeNull();
  });

  it("shows every other error either way", () => {
    expect(visibleSignInError(WRONG_CODE_MESSAGE, true)).toBe(WRONG_CODE_MESSAGE);
    expect(visibleSignInError(GENERIC_MESSAGE, false)).toBe(GENERIC_MESSAGE);
    expect(visibleSignInError(null, true)).toBeNull();
  });
});

describe("isValidEmail", () => {
  it.each(["a@b.co", " name@example.com ", "x.y+z@sub.domain.org"])("accepts %s", (v) => expect(isValidEmail(v)).toBe(true));
  it.each(["", "a", "a@b", "a@b.c", "a b@c.com", "@c.com", "a@.com"])("rejects %s", (v) => expect(isValidEmail(v)).toBe(false));
});

describe("after a failed verify (NP-004)", () => {
  it("clears only a wrong code", () => {
    expect(clearsCode("wrong-code")).toBe(true);
    for (const kind of ["rate-limit", "offline", "other", "signups-closed"] as const) expect(clearsCode(kind)).toBe(false);
  });

  it("says to type the code again and doesn't ask for a resend that may still be locked", () => {
    expect(WRONG_CODE_MESSAGE).toContain("אפשר להקליד שוב");
    expect(WRONG_CODE_MESSAGE).toContain("כשהשליחה החוזרת תיפתח");
    expect(WRONG_CODE_MESSAGE).not.toContain("!");
  });
});
