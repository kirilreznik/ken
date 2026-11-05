import { describe, expect, it, vi } from "vitest";
import { isOptedIn, optInMetadata, saveDisplayName, signInMethod } from "@/lib/names/settings";

describe("signInMethod", () => {
  it("shows Google for Google accounts", () => {
    expect(signInMethod({ email: "a@b.co", app_metadata: { provider: "google" } })).toEqual({ kind: "google" });
    expect(signInMethod({ email: "a@b.co", app_metadata: { provider: "email", providers: ["email", "google"] } })).toEqual({ kind: "google" });
  });

  it("shows the email otherwise", () => {
    expect(signInMethod({ email: "a@b.co", app_metadata: { provider: "email" } })).toEqual({ kind: "email", email: "a@b.co" });
    expect(signInMethod(null)).toEqual({ kind: "email", email: "" });
  });
});

describe("opt-in", () => {
  it("is on only for true", () => {
    expect(isOptedIn({ updates_opt_in: true })).toBe(true);
    expect(isOptedIn({ updates_opt_in: "true" })).toBe(false);
    expect(isOptedIn(undefined)).toBe(false);
  });

  it("stamps the time when turned on and clears it when off", () => {
    const now = new Date("2026-11-05T10:00:00Z");
    expect(optInMetadata(true, now)).toEqual({ updates_opt_in: true, updates_opt_in_at: "2026-11-05T10:00:00.000Z" });
    expect(optInMetadata(false, now)).toEqual({ updates_opt_in: false, updates_opt_in_at: null });
  });
});

describe("saveDisplayName", () => {
  function fakeClient(memberError: unknown = null, authError: unknown = null) {
    const calls: unknown[] = [];
    const query = {
      update: vi.fn((v: unknown) => (calls.push(["update", v]), query)),
      eq: vi.fn((k: string, v: unknown) => {
        calls.push(["eq", k, v]);
        return calls.filter((c) => (c as unknown[])[0] === "eq").length === 2 ? Promise.resolve({ error: memberError }) : query;
      }),
    };
    const client = {
      from: vi.fn((t: string) => (calls.push(["from", t]), query)),
      auth: { updateUser: vi.fn(async (v: unknown) => (calls.push(["updateUser", v]), { error: authError })) },
    };
    return { client, calls };
  }

  it("updates the own member row, then the metadata", async () => {
    const { client, calls } = fakeClient();
    await saveDisplayName(client as never, "s1", "u1", "דנה");
    expect(calls).toEqual([
      ["from", "space_members"],
      ["update", { display_name: "דנה" }],
      ["eq", "space_id", "s1"],
      ["eq", "user_id", "u1"],
      ["updateUser", { data: { display_name: "דנה" } }],
    ]);
  });

  it("stops when the member row fails", async () => {
    const { client } = fakeClient(new Error("rls"));
    await expect(saveDisplayName(client as never, "s1", "u1", "דנה")).rejects.toThrow("rls");
    expect(client.auth.updateUser).not.toHaveBeenCalled();
  });

  it("without a space only writes the metadata", async () => {
    const { client } = fakeClient();
    await saveDisplayName(client as never, null, "u1", "דנה");
    expect(client.from).not.toHaveBeenCalled();
    expect(client.auth.updateUser).toHaveBeenCalledOnce();
  });
});
