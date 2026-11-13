import { describe, expect, it } from "vitest";
import { clarityAllowed, clarityProjectId, withDropParams } from "@/lib/names/clarity";

describe("clarityProjectId", () => {
  it("accepts a Clarity project id only", () => {
    expect(clarityProjectId(" abc123xyz ")).toBe("abc123xyz");
    expect(clarityProjectId("")).toBeNull();
    expect(clarityProjectId(undefined)).toBeNull();
    expect(clarityProjectId("x\"><script>")).toBeNull();
  });
});

describe("clarityAllowed", () => {
  it("records the swiper's screens", () => {
    expect(clarityAllowed("/names", "")).toBe(true);
    expect(clarityAllowed("/names", "?source=pwa")).toBe(true);
    expect(clarityAllowed("/names/lists", "?tab=duel&from=saved")).toBe(true);
    expect(clarityAllowed("/names", "?sheet=match")).toBe(true);
  });

  it("never starts on a URL with an invite code or a sign-in token", () => {
    expect(clarityAllowed("/names/join/ABC123", "")).toBe(false);
    expect(clarityAllowed("/names/auth/callback", "?code=x")).toBe(false);
    expect(clarityAllowed("/names/sign-in", "?join=ABC123")).toBe(false);
    expect(clarityAllowed("/names", "?utm_source=x")).toBe(false);
  });

  it("stays off the rest of the site", () => {
    expect(clarityAllowed("/pregnancy", "")).toBe(false);
  });
});

describe("withDropParams", () => {
  it("adds the name parameter to the tag's start config, keeping its own drop list", () => {
    expect(withDropParams(["start", { projectId: "abc123", track: true }])).toEqual([
      "start",
      { projectId: "abc123", track: true, drop: ["n"] },
    ]);
    expect(withDropParams(["start", { projectId: "abc123", drop: ["x", "n"] }])).toEqual([
      "start",
      { projectId: "abc123", drop: ["x", "n"] },
    ]);
  });

  it("leaves every other call alone", () => {
    expect(withDropParams(["set", "C_IS", "0"])).toEqual(["set", "C_IS", "0"]);
    expect(withDropParams(["start"])).toEqual(["start"]);
  });
});
