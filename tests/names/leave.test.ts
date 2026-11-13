import { describe, expect, it } from "vitest";
import { leaveBody, leaveReason, leaveSpace } from "@/lib/names/leave";
import type { SupabaseClient } from "@supabase/supabase-js";

const client = (result: unknown) => ({ rpc: () => ({ abortSignal: async () => result }) }) as unknown as SupabaseClient;

describe("leave a shared space", () => {
  it("names who stays, or says it neutrally", () => {
    expect(leaveBody(["נועה"])).toContain("ההתאמות עם נועה יימחקו");
    expect(leaveBody([""])).toContain("ההתאמות עם מי שבוחר איתך יימחקו");
    expect(leaveBody(["נועה", "דן"])).toContain("נועה, דן");
  });

  it("reads names_leave errors", () => {
    expect(leaveReason({ message: "not_shared" })).toBe("not_shared");
    expect(leaveReason({ message: "not_names_space" })).toBe("not_names_space");
    expect(leaveReason({ code: "PGRST202", message: "Could not find the function" })).toBe("missing_rpc");
    expect(leaveReason({ message: "boom" })).toBe("error");
  });

  it("returns the new space, or what went wrong", async () => {
    expect(await leaveSpace(client({ data: "new-space", error: null }))).toEqual({ kind: "left", spaceId: "new-space" });
    expect(await leaveSpace(client({ data: null, error: { message: "not_shared" } }))).toEqual({ kind: "not-shared" });
    expect(await leaveSpace(client({ data: null, error: { code: "PGRST202", message: "" } }))).toEqual({ kind: "error", reason: "missing_rpc" });
  });
});
