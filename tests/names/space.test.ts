import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearSpaceCache, ensureSpace, isSharedSpace, members } from "@/lib/names/space";

const ROWS = [
  { user_id: "u1", display_name: "נועה", joined_at: "2026-11-01T10:00:00Z" },
  { user_id: "u2", display_name: null, joined_at: "2026-11-02T10:00:00Z" },
];

function fakeClient({ userId = "u1" as string | null, rpcResults = [] as unknown[], rows = ROWS as unknown } = {}) {
  const rpc = vi.fn(async () => rpcResults.shift() ?? { data: "space-1", error: null });
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(async () => ({ data: rows, error: null })),
  };
  const from = vi.fn(() => query);
  const auth = {
    getSession: vi.fn(async () => ({ data: { session: userId ? { user: { id: userId } } : null } })),
  };
  const client = { rpc, from, auth } as unknown as SupabaseClient;
  return { client, rpc, from, query, auth };
}

beforeEach(() => clearSpaceCache());

describe("ensureSpace", () => {
  it("calls names_space with the display name only, never a due date", async () => {
    const { client, rpc } = fakeClient();
    await expect(ensureSpace("נועה", client)).resolves.toBe("space-1");
    expect(rpc).toHaveBeenCalledWith("names_space", { p_display_name: "נועה" });
    expect(JSON.stringify(rpc.mock.calls)).not.toMatch(/due/i);
  });

  it("is cached for the session", async () => {
    const { client, rpc } = fakeClient();
    const [a, b] = await Promise.all([ensureSpace("נועה", client), ensureSpace("נועה", client)]);
    await ensureSpace("נועה", client);
    expect(a).toBe(b);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("calls again for another user or after clearSpaceCache", async () => {
    const one = fakeClient();
    await ensureSpace("נועה", one.client);
    const two = fakeClient({ userId: "u2", rpcResults: [{ data: "space-2", error: null }] });
    await expect(ensureSpace("דן", two.client)).resolves.toBe("space-2");
    clearSpaceCache();
    await ensureSpace("דן", two.client);
    expect(two.rpc).toHaveBeenCalledTimes(2);
  });

  it("doesn't cache a failure", async () => {
    const { client, rpc } = fakeClient({ rpcResults: [{ data: null, error: new Error("offline") }] });
    await expect(ensureSpace("נועה", client)).rejects.toThrow("offline");
    await expect(ensureSpace("נועה", client)).resolves.toBe("space-1");
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it("rejects without a session, a client or an id", async () => {
    await expect(ensureSpace("נועה", fakeClient({ userId: null }).client)).rejects.toThrow();
    await expect(ensureSpace("נועה", null)).rejects.toThrow();
    const empty = fakeClient({ rpcResults: [{ data: null, error: null }] });
    await expect(ensureSpace("נועה", empty.client)).rejects.toThrow();
  });
});

describe("members", () => {
  it("reads space_members of the space, oldest first", async () => {
    const { client, from, query } = fakeClient();
    await expect(members("space-1", { client })).resolves.toEqual([
      { userId: "u1", displayName: "נועה", joinedAt: "2026-11-01T10:00:00Z" },
      { userId: "u2", displayName: "", joinedAt: "2026-11-02T10:00:00Z" },
    ]);
    expect(from).toHaveBeenCalledWith("space_members");
    expect(query.select).toHaveBeenCalledWith("user_id, display_name, joined_at");
    expect(query.eq).toHaveBeenCalledWith("space_id", "space-1");
    expect(query.order).toHaveBeenCalledWith("joined_at", { ascending: true });
  });

  it("is cached per space; force refetches", async () => {
    const { client, from } = fakeClient();
    await members("space-1", { client });
    await members("space-1", { client });
    expect(from).toHaveBeenCalledTimes(1);
    await members("space-1", { client, force: true });
    await members("space-2", { client });
    expect(from).toHaveBeenCalledTimes(3);
  });
});

describe("isSharedSpace", () => {
  it("needs two or more members", () => {
    const m = { userId: "u", displayName: "", joinedAt: "" };
    expect(isSharedSpace([])).toBe(false);
    expect(isSharedSpace([m])).toBe(false);
    expect(isSharedSpace([m, m])).toBe(true);
  });
});
