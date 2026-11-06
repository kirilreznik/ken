import { describe, expect, it } from "vitest";
import { scrubAnalyticsEvent, scrubAnalyticsUrl } from "@/lib/names/analytics";

const O = "https://nest.example";

describe("scrubAnalyticsUrl", () => {
  it("drops query strings and hashes from /names URLs", () => {
    expect(scrubAnalyticsUrl(`${O}/names?sheet=filters`)).toBe(`${O}/names`);
    expect(scrubAnalyticsUrl(`${O}/names/sign-in?join=ABC123`)).toBe(`${O}/names/sign-in`);
    expect(scrubAnalyticsUrl(`${O}/names/auth/callback?code=x#access_token=y`)).toBe(
      `${O}/names/auth/callback`,
    );
  });

  it("keeps the allowlisted source and tab parameters", () => {
    expect(scrubAnalyticsUrl(`${O}/names?source=pwa`)).toBe(`${O}/names?source=pwa`);
    expect(scrubAnalyticsUrl(`${O}/names/lists?tab=matches&from=saved`)).toBe(`${O}/names/lists?tab=matches`);
    expect(scrubAnalyticsUrl(`${O}/names?join=ABC&source=pwa#x`)).toBe(`${O}/names?source=pwa`);
  });

  it("drops allowlisted parameters whose value isn't a short token", () => {
    expect(scrubAnalyticsUrl(`${O}/names?source=${encodeURIComponent("me@x.com")}`)).toBe(`${O}/names`);
    expect(scrubAnalyticsUrl(`${O}/names/lists?tab=${encodeURIComponent("זיו")}`)).toBe(`${O}/names/lists`);
    expect(scrubAnalyticsUrl(`${O}/names?source=${"a".repeat(33)}`)).toBe(`${O}/names`);
  });

  it("removes the invite code from /names/join/{code}", () => {
    expect(scrubAnalyticsUrl(`${O}/names/join/ABC123`)).toBe(`${O}/names/join`);
    expect(scrubAnalyticsUrl(`${O}/names/join/ABC123?x=1`)).toBe(`${O}/names/join`);
  });

  it("leaves other pages alone", () => {
    expect(scrubAnalyticsUrl(`${O}/pregnancy?utm_source=x`)).toBe(`${O}/pregnancy?utm_source=x`);
    expect(scrubAnalyticsUrl(`${O}/namesake?a=1`)).toBe(`${O}/namesake?a=1`);
    expect(scrubAnalyticsUrl("not a url")).toBe("not a url");
  });

  it("keeps the rest of the event", () => {
    const event = { type: "vital" as const, url: `${O}/names/join/ABC123`, route: "/names/join/[code]" };
    expect(scrubAnalyticsEvent(event)).toEqual({ ...event, url: `${O}/names/join` });
  });
});
