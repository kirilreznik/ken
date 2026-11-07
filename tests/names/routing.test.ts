import { describe, expect, it } from "vitest";
import { INTRO_PATH, ONBOARDING_PATH, SURNAME_PATH, hasAcceptedTerms, introFromSheet, joinPath, nextRoute, oauthRedirectTo } from "@/lib/names/routing";

const onboarded = { user_metadata: { terms_accepted_at: "2026-11-04T10:00:00.000Z" } };

describe("nextRoute (FR-W6)", () => {
  it("sends a user without accepted terms to onboarding, even with a pending invite", () => {
    expect(nextRoute({ user_metadata: {} }, { introSeen: true }, "AB12cd34")).toBe(ONBOARDING_PATH);
    expect(nextRoute({ user_metadata: null }, { introSeen: false }, null)).toBe(ONBOARDING_PATH);
    expect(nextRoute({}, { introSeen: true }, null)).toBe(ONBOARDING_PATH);
    expect(nextRoute({ user_metadata: { terms_accepted_at: "" } }, { introSeen: true }, null)).toBe(ONBOARDING_PATH);
    expect(nextRoute({ user_metadata: { terms_accepted_at: 1 } }, { introSeen: true }, null)).toBe(ONBOARDING_PATH);
  });

  it("goes to the pending invite before the intro", () => {
    expect(nextRoute(onboarded, { introSeen: false }, "AB12cd34")).toBe("/names/join/AB12cd34");
  });

  it("ignores an invalid pending code", () => {
    expect(nextRoute(onboarded, { introSeen: true }, "../x")).toBe("/names");
  });

  it("shows the intro once per device, then the swipe screen", () => {
    expect(nextRoute(onboarded, { introSeen: false }, null)).toBe(INTRO_PATH);
    expect(nextRoute(onboarded, { introSeen: true }, null)).toBe("/names");
  });

  it("joinPath encodes the code", () => {
    expect(joinPath("a b")).toBe("/names/join/a%20b");
  });
});

describe("hasAcceptedTerms", () => {
  it("needs a non-empty timestamp string", () => {
    expect(hasAcceptedTerms(onboarded)).toBe(true);
    expect(hasAcceptedTerms({ user_metadata: { terms_accepted_at: "" } })).toBe(false);
    expect(hasAcceptedTerms({ user_metadata: { terms_accepted_at: null } })).toBe(false);
    expect(hasAcceptedTerms({ user_metadata: null })).toBe(false);
    expect(hasAcceptedTerms(null)).toBe(false);
    expect(hasAcceptedTerms(undefined)).toBe(false);
  });
});

describe("oauthRedirectTo", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and falls back to the origin", () => {
    expect(oauthRedirectTo("https://nestjourney.app/", "http://localhost:3000", null)).toBe(
      "https://nestjourney.app/names/auth/callback",
    );
    expect(oauthRedirectTo(undefined, "http://localhost:3000", null)).toBe("http://localhost:3000/names/auth/callback");
    expect(oauthRedirectTo("  ", "http://localhost:3000", null)).toBe("http://localhost:3000/names/auth/callback");
  });

  it("carries a pending invite code", () => {
    expect(oauthRedirectTo(undefined, "http://localhost:3000", "AB12cd34")).toBe(
      "http://localhost:3000/names/auth/callback?join=AB12cd34",
    );
  });
});

describe("introFromSheet (FR-D8)", () => {
  it("is true only for the intro opened from the name sheet", () => {
    expect(SURNAME_PATH.startsWith(`${INTRO_PATH}?`)).toBe(true);
    expect(introFromSheet(SURNAME_PATH.slice(INTRO_PATH.length))).toBe(true);
    expect(introFromSheet("from=name")).toBe(true);
    expect(introFromSheet("")).toBe(false);
    expect(introFromSheet("?from=settings")).toBe(false);
  });
});
