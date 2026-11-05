import { describe, expect, it } from "vitest";
import { ERROR_AREA, renderErrorReport } from "@/lib/names/errorReport";

describe("renderErrorReport", () => {
  it("reports the error type, never the message", () => {
    const report = renderErrorReport(new TypeError("cannot read זיו of user@example.com"));
    expect(report).toEqual({ area: ERROR_AREA, message: "render TypeError" });
    expect(JSON.stringify(report)).not.toContain("example.com");
  });

  it("adds Next's digest when there is one", () => {
    const error = Object.assign(new Error("x"), { digest: "1234567890" });
    expect(renderErrorReport(error).message).toBe("render Error (1234567890)");
  });

  it("falls back to a plain type for odd names and digests", () => {
    expect(renderErrorReport({ name: "Custom error with spaces", digest: "a b" }).message).toBe("render Error");
    expect(renderErrorReport(null).message).toBe("render Error");
    expect(renderErrorReport({ name: 5 }).message).toBe("render Error");
  });

  it("has no name field, so nothing from the screen goes along", () => {
    expect(renderErrorReport(new Error("x"))).not.toHaveProperty("name");
  });
});
