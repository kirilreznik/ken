import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearInviteCache, createInvite, expiryText, inviteUrl, memberLabel, membersForList } from "@/lib/names/invite";

const members = [
  { userId: "u2", displayName: "דני", joinedAt: "2026-11-01T10:00:00Z" },
  { userId: "u1", displayName: "נועה", joinedAt: "2026-11-02T10:00:00Z" },
  { userId: "u3", displayName: " ", joinedAt: "2026-11-03T10:00:00Z" },
];

function fakeClient(results: unknown[]) {
  const rpc = vi.fn(async () => results.shift() ?? { data: [{ code: "ABCD1234", expires_at: "2026-11-12T10:00:00Z" }], error: null });
  return { client: { rpc } as unknown as Pick<SupabaseClient, "rpc">, rpc };
}

beforeEach(() => clearInviteCache());

describe("inviteUrl", () => {
  it("builds https://{site}/names/join/{CODE} from the site url, else the origin", () => {
    expect(inviteUrl("https://nestjourney.app/", "http://localhost:3000", "ABCD1234")).toBe("https://nestjourney.app/names/join/ABCD1234");
    expect(inviteUrl("  ", "http://localhost:3000", "ABCD1234")).toBe("http://localhost:3000/names/join/ABCD1234");
    expect(inviteUrl(undefined, "http://localhost:3000", "a b")).toBe("http://localhost:3000/names/join/a%20b");
  });
});

describe("expiryText", () => {
  it("formats the expiry date in he-IL", () => {
    const fmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jerusalem" });
    expect(expiryText("2026-11-12T10:00:00Z", fmt)).toBe("בתוקף עד 12 בנובמבר 2026");
  });
});

describe("members", () => {
  it("lists the user first with (אני), then the others in joining order", () => {
    const list = membersForList(members, "u1");
    expect(list.map((m) => memberLabel(m, "u1"))).toEqual(["נועה (אני)", "דני", "בלי שם"]);
  });
});

describe("createInvite", () => {
  it("calls names_invite and reads the code and expiry", async () => {
    const { client, rpc } = fakeClient([]);
    await expect(createInvite("s1", 1, client)).resolves.toEqual({ code: "ABCD1234", expiresAt: "2026-11-12T10:00:00Z" });
    expect(rpc).toHaveBeenCalledWith("names_invite");
  });

  it("reuses the invite for the same space and member count, asks again after someone joins", async () => {
    const { client, rpc } = fakeClient([]);
    await Promise.all([createInvite("s1", 1, client), createInvite("s1", 1, client)]);
    expect(rpc).toHaveBeenCalledTimes(1);
    await createInvite("s1", 2, client);
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it("retries after an error or an empty answer", async () => {
    const { client, rpc } = fakeClient([{ data: null, error: new Error("boom") }, { data: [], error: null }]);
    await expect(createInvite("s1", 1, client)).rejects.toThrow("boom");
    await expect(createInvite("s1", 1, client)).rejects.toThrow("no code");
    await expect(createInvite("s1", 1, client)).resolves.toMatchObject({ code: "ABCD1234" });
    expect(rpc).toHaveBeenCalledTimes(3);
  });

  it("fails without a client", async () => {
    await expect(createInvite("s1", 1, null)).rejects.toThrow();
  });
});
