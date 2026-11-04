import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { bearerToken, createDeleteAccount, DELETE_WINDOW_MS } from "@/lib/names/server/deleteAccount";

function fakeAdmin({
  user = { id: "u1" } as { id: string } | null,
  rpcError = null as unknown,
  deleteError = null as unknown,
} = {}) {
  const getUser = vi.fn(async () => ({ data: { user }, error: user ? null : { status: 401 } }));
  const rpc = vi.fn(async () => ({ data: null, error: rpcError }));
  const deleteUser = vi.fn(async () => ({ data: {}, error: deleteError }));
  const client = { auth: { getUser, admin: { deleteUser } }, rpc } as unknown as SupabaseClient;
  return { client, getUser, rpc, deleteUser };
}

const req = (auth?: string) =>
  new Request("https://example.test/api/names/account", {
    method: "DELETE",
    headers: auth ? { Authorization: auth } : {},
  });

describe("bearerToken", () => {
  it("reads the token", () => {
    expect(bearerToken("Bearer abc.def")).toBe("abc.def");
    expect(bearerToken("bearer abc")).toBe("abc");
  });
  it("rejects anything else", () => {
    expect(bearerToken(null)).toBeNull();
    expect(bearerToken("Bearer")).toBeNull();
    expect(bearerToken("Basic abc")).toBeNull();
    expect(bearerToken("Bearer a b")).toBeNull();
  });
});

describe("account deletion", () => {
  it("prepares and deletes the verified user", async () => {
    const fake = fakeAdmin();
    const handler = createDeleteAccount({ getAdmin: () => fake.client });
    const res = await handler(req("Bearer tok"));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(fake.getUser).toHaveBeenCalledWith("tok");
    expect(fake.rpc).toHaveBeenCalledWith("prepare_account_deletion", { p_user: "u1" });
    expect(fake.deleteUser).toHaveBeenCalledWith("u1");
    expect(fake.rpc.mock.invocationCallOrder[0]).toBeLessThan(fake.deleteUser.mock.invocationCallOrder[0]);
  });

  it("answers 401 without a token or with a bad one", async () => {
    const fake = fakeAdmin({ user: null });
    const handler = createDeleteAccount({ getAdmin: () => fake.client });
    expect((await handler(req())).status).toBe(401);
    expect((await handler(req("Bearer bad"))).status).toBe(401);
    expect(fake.rpc).not.toHaveBeenCalled();
    expect(fake.deleteUser).not.toHaveBeenCalled();
  });

  it("answers 500 without detail when unconfigured or a step fails", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await createDeleteAccount({ getAdmin: () => null })(req("Bearer t"))).status).toBe(500);

    const rpcFails = fakeAdmin({ rpcError: { code: "P0001", message: "secret detail" } });
    const res = await createDeleteAccount({ getAdmin: () => rpcFails.client })(req("Bearer t"));
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("");
    expect(rpcFails.deleteUser).not.toHaveBeenCalled();

    const deleteFails = fakeAdmin({ deleteError: { status: 500 } });
    expect((await createDeleteAccount({ getAdmin: () => deleteFails.client })(req("Bearer t"))).status).toBe(500);
    quiet.mockRestore();
  });

  it("allows one call per user per minute", async () => {
    let t = 1_000;
    const fake = fakeAdmin();
    const handler = createDeleteAccount({ getAdmin: () => fake.client, now: () => t });
    expect((await handler(req("Bearer t"))).status).toBe(204);
    t += DELETE_WINDOW_MS - 1;
    expect((await handler(req("Bearer t"))).status).toBe(429);
    expect(fake.rpc).toHaveBeenCalledTimes(1);
    t += 1;
    expect((await handler(req("Bearer t"))).status).toBe(204);
  });

  it("limits each user separately", async () => {
    const a = fakeAdmin({ user: { id: "a" } });
    const b = fakeAdmin({ user: { id: "b" } });
    let client = a.client;
    const handler = createDeleteAccount({ getAdmin: () => client, now: () => 0 });
    expect((await handler(req("Bearer a"))).status).toBe(204);
    client = b.client;
    expect((await handler(req("Bearer b"))).status).toBe(204);
  });
});
