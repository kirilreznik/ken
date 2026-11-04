import { describe, expect, it } from "vitest";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/content/names-legal/versions";
import { canSubmit, isValidDisplayName, onboardingMetadata, suggestedDisplayName } from "@/lib/names/onboarding";

const valid = { displayName: "נועה", ageConfirmed: true, termsAccepted: true, updatesOptIn: false };

describe("suggestedDisplayName", () => {
  it("takes the first word of Google's full_name, then name", () => {
    expect(suggestedDisplayName({ full_name: "  נועה לוי ", name: "x y" })).toBe("נועה");
    expect(suggestedDisplayName({ name: "Dana Cohen" })).toBe("Dana");
  });

  it("prefers a display name saved earlier", () => {
    expect(suggestedDisplayName({ display_name: "דני כהן", full_name: "Other" })).toBe("דני כהן");
  });

  it("is empty without metadata, never a made-up value", () => {
    expect(suggestedDisplayName({})).toBe("");
    expect(suggestedDisplayName(null)).toBe("");
    expect(suggestedDisplayName({ full_name: 3, email: "a@b.co" })).toBe("");
  });

  it("caps the prefill at 40 characters", () => {
    expect(suggestedDisplayName({ full_name: "א".repeat(50) })).toHaveLength(40);
  });
});

describe("validation", () => {
  it("needs 1-40 characters after trimming", () => {
    expect(isValidDisplayName("  ")).toBe(false);
    expect(isValidDisplayName("א")).toBe(true);
    expect(isValidDisplayName("א".repeat(40))).toBe(true);
    expect(isValidDisplayName("א".repeat(41))).toBe(false);
  });

  it("needs both required confirmations; the opt-in is optional", () => {
    expect(canSubmit(valid)).toBe(true);
    expect(canSubmit({ ...valid, ageConfirmed: false })).toBe(false);
    expect(canSubmit({ ...valid, termsAccepted: false })).toBe(false);
    expect(canSubmit({ ...valid, displayName: " " })).toBe(false);
    expect(canSubmit({ ...valid, updatesOptIn: true })).toBe(true);
  });
});

describe("onboardingMetadata", () => {
  const now = new Date("2026-11-04T10:00:00.000Z");

  it("writes the consent record without updates_opt_in_at when opted out", () => {
    expect(onboardingMetadata({ ...valid, displayName: " נועה " }, now)).toEqual({
      display_name: "נועה",
      age_confirmed_at: "2026-11-04T10:00:00.000Z",
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
      terms_accepted_at: "2026-11-04T10:00:00.000Z",
      updates_opt_in: false,
      signup_source: "names-pwa",
    });
  });

  it("adds updates_opt_in_at when opted in", () => {
    const data = onboardingMetadata({ ...valid, updatesOptIn: true }, now);
    expect(data.updates_opt_in).toBe(true);
    expect(data.updates_opt_in_at).toBe("2026-11-04T10:00:00.000Z");
  });

  it("never carries a due date", () => {
    expect(Object.keys(onboardingMetadata(valid, now)).some((k) => /due|week|pregnan/i.test(k))).toBe(false);
  });
});
