import { describe, expect, it } from "vitest";
import { INTRO_PATH, ONBOARDING_PATH, joinPath, nextRoute, oauthRedirectTo } from "@/lib/names/routing";

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
