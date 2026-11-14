import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { feedbackFrom, feedbackPayload, sendFeedback, validateFeedback } from "@/lib/names/feedback";
import { createFeedback, resendNotifier } from "@/lib/names/server/feedback";

vi.mock("server-only", () => ({}));

function fakeAdmin({ user = null as { id: string } | null, result = "ok" as unknown, rpcError = null as unknown } = {}) {
  const getUser = vi.fn(async () => ({ data: { user }, error: user ? null : { status: 401 } }));
  const rpc = vi.fn(async () => ({ data: result, error: rpcError }));
  const client = { auth: { getUser }, rpc } as unknown as SupabaseClient;
  return { client, getUser, rpc };
}

const req = (body: unknown, auth?: string) =>
  new Request("https://example.test/api/names/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.9, 10.0.0.1", ...(auth ? { Authorization: auth } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("feedback validation", () => {
  it("needs a message and a well-formed optional address", () => {
    expect(validateFeedback("  ", "")).toBe("empty");
    expect(validateFeedback("א".repeat(1001), "")).toBe("too-long");
    expect(validateFeedback("טוב", "not-an-email")).toBe("contact");
    expect(validateFeedback("טוב", "")).toBeNull();
    expect(validateFeedback("טוב", " a@b.co ")).toBeNull();
  });
  it("keeps only /names paths as the origin", () => {
    expect(feedbackFrom("/names/settings")).toBe("/names/settings");
    expect(feedbackFrom("/names")).toBe("/names");
    expect(feedbackFrom("https://evil.test")).toBeNull();
    expect(feedbackFrom("/names/../x")).toBeNull();
    expect(feedbackFrom(null)).toBeNull();
  });
  it("builds a trimmed payload", () => {
    const p = feedbackPayload({ kind: "idea", message: "  שלום ", contact: " ", from: "/names" });
    expect(p).toMatchObject({ kind: "idea", message: "שלום", contact: null, from: "/names" });
    expect(p).not.toHaveProperty("website");
  });
});

describe("sendFeedback", () => {
  it("maps statuses and sends the token", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 204 }));
    expect(await sendFeedback(feedbackPayload({ kind: null, message: "x", contact: "", from: null }), "tok", fetcher as unknown as typeof fetch)).toBe("ok");
    const init = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    const limited = vi.fn(async () => new Response(null, { status: 429 }));
    expect(await sendFeedback(feedbackPayload({ kind: null, message: "x", contact: "", from: null }), null, limited as unknown as typeof fetch)).toBe("limited");
    const broken = vi.fn(async () => {
      throw new TypeError("network");
    });
    expect(await sendFeedback(feedbackPayload({ kind: null, message: "x", contact: "", from: null }), null, broken as unknown as typeof fetch)).toBe("error");
  });
});

describe("POST /api/names/feedback", () => {
  it("saves a guest's feedback with a hashed IP and no user", async () => {
    const fake = fakeAdmin();
    const res = await createFeedback({ getAdmin: () => fake.client, ipSalt: () => "salt" })(
      req({ kind: "idea", message: " רעיון ", contact: "a@b.co", from: "/names/about", appVersion: "abc1234" }),
    );
    expect(res.status).toBe(204);
    expect(fake.getUser).not.toHaveBeenCalled();
    const [fn, args] = fake.rpc.mock.calls[0] as unknown as [string, Record<string, unknown>];
    expect(fn).toBe("names_feedback_add");
    expect(args).toMatchObject({ p_user: null, p_kind: "idea", p_message: "רעיון", p_contact: "a@b.co", p_path: "/names/about", p_version: "abc1234" });
    expect(args.p_ip).toMatch(/^[0-9a-f]{32}$/);
    expect(JSON.stringify(args)).not.toContain("203.0.113.9");
  });

  it("marks a valid session as signed in and still sends with an invalid one", async () => {
    const signed = fakeAdmin({ user: { id: "u1" } });
    await createFeedback({ getAdmin: () => signed.client })(req({ message: "x" }, "Bearer tok"));
    expect((signed.rpc.mock.calls[0] as unknown as [string, Record<string, unknown>])[1].p_user).toBe("u1");
    const expired = fakeAdmin({ user: null });
    const res = await createFeedback({ getAdmin: () => expired.client })(req({ message: "x" }, "Bearer old"));
    expect(res.status).toBe(204);
    expect((expired.rpc.mock.calls[0] as unknown as [string, Record<string, unknown>])[1].p_user).toBeNull();
  });

  it("refuses bad input and drops unknown fields", async () => {
    const fake = fakeAdmin();
    const handler = createFeedback({ getAdmin: () => fake.client });
    expect((await handler(req("not json"))).status).toBe(400);
    expect((await handler(req({ message: "" }))).status).toBe(400);
    expect((await handler(req({ message: "x", contact: "nope" }))).status).toBe(400);
    expect((await handler(req("x".repeat(9000)))).status).toBe(413);
    expect(fake.rpc).not.toHaveBeenCalled();
    await handler(req({ message: "x", kind: "spam", from: "https://evil.test", appVersion: "<script>" }));
    expect((fake.rpc.mock.calls[0] as unknown as [string, Record<string, unknown>])[1]).toMatchObject({ p_kind: null, p_path: null, p_version: null });
  });

  it("pretends to accept a filled honeypot without saving", async () => {
    const fake = fakeAdmin();
    const res = await createFeedback({ getAdmin: () => fake.client })(req({ message: "x", website: "http://spam" }));
    expect(res.status).toBe(204);
    expect(fake.rpc).not.toHaveBeenCalled();
  });

  it("returns 429 when limited and 500 when the save fails", async () => {
    expect((await createFeedback({ getAdmin: () => fakeAdmin({ result: "limited" }).client })(req({ message: "x" }))).status).toBe(429);
    expect((await createFeedback({ getAdmin: () => fakeAdmin({ rpcError: { code: "42501" } }).client })(req({ message: "x" }))).status).toBe(500);
    expect((await createFeedback({ getAdmin: () => null })(req({ message: "x" }))).status).toBe(503);
  });

  it("notifies after saving, and a failing notifier doesn't fail the request", async () => {
    const notify = vi.fn(async () => {
      throw new Error("down");
    });
    const res = await createFeedback({ getAdmin: () => fakeAdmin().client, notify })(req({ kind: "problem", message: "תקוע", contact: "a@b.co" }));
    expect(res.status).toBe(204);
    expect(notify).toHaveBeenCalledWith({ kind: "problem", message: "תקוע", contact: "a@b.co", signedIn: false, from: null });
  });
});

describe("resendNotifier", () => {
  it("is off without a key or a recipient", () => {
    expect(resendNotifier({})).toBeUndefined();
    expect(resendNotifier({ RESEND_API_KEY: "k" })).toBeUndefined();
  });
  it("emails the owner with the reply address as reply_to", async () => {
    const fetcher = vi.fn(async () => new Response("{}", { status: 200 }));
    const notify = resendNotifier({ RESEND_API_KEY: "k", NAMES_FEEDBACK_NOTIFY_TO: "owner@example.com" }, fetcher as unknown as typeof fetch)!;
    await notify({ kind: "idea", message: "רעיון", contact: "a@b.co", signedIn: true, from: "/names" });
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ to: ["owner@example.com"], reply_to: "a@b.co", from: "Nest <no-reply@nestjourney.app>" });
    expect(body.subject).toContain("רעיון");
    expect(body.text).toContain("רעיון");
  });
});
