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
