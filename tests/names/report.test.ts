import { afterEach, describe, expect, it, vi } from "vitest";
import { reportPath, sendClientLog } from "@/lib/names/clientLog";
import { REPORT_MAX, buildReport, reportButtonLabel, reportTitle, validateReport } from "@/lib/names/report";

describe("report copy", () => {
  it("names the card in the title when there is one", () => {
    expect(reportTitle("זיו")).toBe("דיווח על טעות בשם זיו");
    expect(reportTitle(null)).toBe("דיווח על טעות");
    expect(reportTitle("")).toBe("דיווח על טעות");
  });

  it("uses the board's button over a card and FR-W30's on the page", () => {
    expect(reportButtonLabel(true)).toBe("דיווח על טעות בשם הזה");
    expect(reportButtonLabel(false)).toBe("יש טעות? אפשר לדווח");
  });
});

describe("validateReport", () => {
  it("needs some text, up to the limit", () => {
    expect(validateReport("   ")).toBe("empty");
    expect(validateReport("הפירוש לא נכון")).toBeNull();
    expect(validateReport("א".repeat(REPORT_MAX))).toBeNull();
    expect(validateReport("א".repeat(REPORT_MAX + 1))).toBe("too-long");
  });
});

describe("buildReport", () => {
  it("has only the area, the name and the message", () => {
    expect(buildReport("זיו", "  הפירוש לא נכון  ")).toEqual({ area: "names-report", name: "זיו", message: "הפירוש לא נכון" });
  });

  it("leaves the name out when there is none", () => {
    expect(buildReport(null, "טעות")).toEqual({ area: "names-report", message: "טעות" });
    expect(buildReport("  ", "טעות")).toEqual({ area: "names-report", message: "טעות" });
  });

  it("normalizes a typed name", () => {
    expect(buildReport(" נוֹעַם ", "x").name).toBe("נועם");
  });
});

describe("sendClientLog", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("drops invite codes from the path", () => {
    expect(reportPath("/names/join/ABCD1234")).toBe("/names/join");
    expect(reportPath("/names/about")).toBe("/names/about");
  });

  it("posts only area, name, message, path and appVersion and reports success", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubGlobal("location", { pathname: "/names" });
    const fetch = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetch);
    await expect(sendClientLog({ area: "names-report", name: "זיו", message: "טעות" })).resolves.toBe(true);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.supabase.co/functions/v1/client-log");
    expect(Object.keys(JSON.parse(init.body as string)).sort()).toEqual(["appVersion", "area", "message", "name", "path"]);
  });

  it("resolves false on an error status or a network failure", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));
    await expect(sendClientLog({ area: "a", message: "m" })).resolves.toBe(false);
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    await expect(sendClientLog({ area: "a", message: "m" })).resolves.toBe(false);
  });
});
