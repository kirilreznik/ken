import "fake-indexeddb/auto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearLocalData } from "@/lib/names/auth";
import {
  applyOutbox,
  backoffMs,
  createVoteStore,
  enqueue,
  type OutboxItem,
  type VoteStoreOptions,
} from "@/lib/names/voteStore";

type Result = { error: { code?: string; message: string } | null };
type Call = { op: "upsert" | "delete"; name: string; vote?: string; row?: Record<string, unknown>; options?: unknown };

/** A name_votes client that records writes and answers from a queue of results (ok by default). */
function fakeClient({ rows = [] as unknown[], results = [] as (Result | Error)[] } = {}) {
  const calls: Call[] = [];
  const next = async (): Promise<Result> => {
    const r = results.shift() ?? { error: null };
    if (r instanceof Error) throw r;
    return r;
  };
  const from = vi.fn(() => ({
    upsert: (row: Record<string, unknown>, options: unknown) => {
      calls.push({ op: "upsert", name: row.name as string, vote: row.vote as string, row, options });
      return next();
    },
    delete: () => {
      const filters: Record<string, unknown> = {};
      const chain = {
        eq: (col: string, value: unknown) => {
          filters[col] = value;
          if (Object.keys(filters).length < 3) return chain;
          calls.push({ op: "delete", name: filters.name as string, row: { ...filters } });
          return next();
        },
      };
      return chain;
    },
    select: () => {
      const query = { eq: () => query, order: async () => ({ data: rows, error: null }) };
      return query;
    },
  }));
  return { client: { from } as unknown as SupabaseClient, calls, results };
}

let n = 0;
function makeStore(client: SupabaseClient, extra: Partial<VoteStoreOptions> = {}) {
  n += 1;
  let t = Date.parse("2026-11-04T10:00:00Z");
  const now = () => (t += 1);
  const report = vi.fn(async () => {});
  const store = createVoteStore({ spaceId: `space-${n}`, userId: `user-${n}`, client, now, report, ...extra });
  return { store, report, advance: (ms: number) => (t += ms) };
}

const names = (s: { getState(): { votes: ReadonlyMap<string, unknown> } }) => [...s.getState().votes.keys()];

afterEach(() => vi.unstubAllGlobals());

describe("pure helpers", () => {
  const item = (id: string, name: string, op: OutboxItem["op"] = "upsert"): OutboxItem => ({
    id,
    op,
    name,
    vote: op === "upsert" ? "keep" : undefined,
    updatedAt: "2026-11-04T10:00:00Z",
    attempts: 0,
    retryAt: 0,
  });

  it("enqueue keeps one queued change per name, except the one in flight", () => {
    let q = enqueue([], item("1", "זיו"));
    q = enqueue(q, item("2", "יעל"));
    q = enqueue(q, item("3", "זיו", "delete"));
    expect(q.map((o) => o.id)).toEqual(["2", "3"]);
    expect(enqueue(q, item("4", "יעל"), "2").map((o) => o.id)).toEqual(["2", "3", "4"]);
  });

  it("applyOutbox applies in order and moves changed votes to the end", () => {
    const base = new Map([
      ["זיו", { name: "זיו", vote: "skip" as const, custom: false, updatedAt: "x" }],
      ["יעל", { name: "יעל", vote: "keep" as const, custom: false, updatedAt: "x" }],
    ]);
    const out = applyOutbox(base, [item("1", "זיו"), item("2", "יעל", "delete")]);
    expect([...out.entries()].map(([k, v]) => `${k}:${v.vote}`)).toEqual(["זיו:keep"]);
  });

  it("backoff doubles up to five minutes", () => {
    expect([1, 2, 3, 4].map(backoffMs)).toEqual([1000, 2000, 4000, 8000]);
    expect(backoffMs(30)).toBe(300_000);
  });
});

describe("createVoteStore", () => {
  it("loads own votes for the space, oldest first", async () => {
    const { client } = fakeClient({
      rows: [
        { name: "זיו", vote: "keep", custom: false, updated_at: "2026-11-01T10:00:00Z" },
        { name: "שירה", vote: "love", custom: true, updated_at: "2026-11-02T10:00:00Z" },
      ],
    });
    const { store } = makeStore(client);
    expect(store.getState().ready).toBe(false);
    await store.load();
    expect(store.getState().ready).toBe(true);
    expect(names(store)).toEqual(["זיו", "שירה"]);
    expect(store.getState().votes.get("שירה")).toMatchObject({ vote: "love", custom: true });
  });

  it("with no cached copy, stays not ready until the server answered", async () => {
    let answer: (v: { data: unknown[]; error: null }) => void = () => {};
    const select = () => {
      const query = { eq: () => query, order: () => new Promise((resolve) => (answer = resolve)) };
      return query;
    };
    const client = { from: () => ({ select }) } as unknown as SupabaseClient;
    const { store } = makeStore(client);
    const loading = store.load();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(store.getState().ready).toBe(false);
    answer({ data: [{ name: "זיו", vote: "keep", custom: false, updated_at: "2026-11-01T10:00:00Z" }], error: null });
    await loading;
    expect(store.getState().ready).toBe(true);
    expect(names(store)).toEqual(["זיו"]);
  });

  it("with no cached copy and a failed read, says so and retries on the 30 s timer (NP-073)", async () => {
    const answers: { data: unknown[] | null; error: { message: string } | null }[] = [
      { data: null, error: { message: "500" } },
      { data: null, error: { message: "500" } },
      { data: [{ name: "זיו", vote: "keep", custom: false, updated_at: "2026-11-01T10:00:00Z" }], error: null },
    ];
    const select = () => {
      const query = { eq: () => query, order: async () => answers.shift() };
      return query;
    };
    const client = { from: () => ({ select }) } as unknown as SupabaseClient;
    const { store } = makeStore(client);
    await store.load();
    expect(store.getState()).toMatchObject({ ready: true, loadFailed: true });
    expect(store.getState().votes.size).toBe(0);
    // Fake timers only after load: fake-indexeddb runs on real ones.
    vi.useFakeTimers();
    vi.stubGlobal("window", new EventTarget());
    vi.stubGlobal("document", Object.assign(new EventTarget(), { visibilityState: "visible" }));
    const stop = store.start();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(store.getState().loadFailed).toBe(true);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(store.getState().loadFailed).toBe(false);
    expect(names(store)).toEqual(["זיו"]);
    stop();
    vi.useRealTimers();
  });

  it("a failed read with a cached copy isn't a load failure", async () => {
    const first = makeStore(fakeClient({ rows: [{ name: "זיו", vote: "keep", custom: false, updated_at: "2026-11-01T10:00:00Z" }] }).client);
    await first.store.load();
    await new Promise((r) => setTimeout(r, 20));
    const select = () => {
      const query = { eq: () => query, order: async () => ({ data: null, error: { message: "500" } }) };
      return query;
    };
    const failing = { from: () => ({ select }) } as unknown as SupabaseClient;
    const again = createVoteStore({ spaceId: `space-${n}`, userId: `user-${n}`, client: failing, report: vi.fn() });
    await again.load();
    expect(again.getState()).toMatchObject({ ready: true, loadFailed: false });
    expect(names(again)).toEqual(["זיו"]);
  });

  it("gives same-millisecond changes increasing times", async () => {
    const { client, calls } = fakeClient();
    const store = createVoteStore({ spaceId: "s", userId: "u", client, now: () => 1_000, report: vi.fn() });
    store.setVote("זיו", "keep");
    store.setVote("יעל", "keep");
    await store.flush();
    expect(calls.map((c) => c.row?.updated_at)).toEqual(["1970-01-01T00:00:01.000Z", "1970-01-01T00:00:01.001Z"]);
  });

  it("keeps an earlier time for a moved guest vote and sends it as created_at too", async () => {
    const { client, calls } = fakeClient();
    const store = createVoteStore({ spaceId: "s", userId: "u", client, now: () => 5_000_000, report: vi.fn() });
    store.setVote("זיו", "keep", false, "1970-01-01T00:00:02.000Z");
    store.setVote("יעל", "keep", false, "not a date");
    store.setVote("נועה", "keep", false, "2999-01-01T00:00:00.000Z"); // a future time is not kept
    await store.flush();
    expect(calls.map((c) => [c.row?.updated_at, c.row?.created_at])).toEqual([
      ["1970-01-01T00:00:02.000Z", "1970-01-01T00:00:02.000Z"],
      ["1970-01-01T01:23:20.001Z", undefined],
      ["1970-01-01T01:23:20.002Z", undefined],
    ]);
    expect(store.getState().votes.get("זיו")?.updatedAt).toBe("1970-01-01T00:00:02.000Z");
  });

  it("updates local state at once and notifies subscribers", async () => {
    const { client } = fakeClient();
    const { store } = makeStore(client);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setVote("זיו", "keep");
    expect(store.getState().votes.get("זיו")?.vote).toBe("keep");
    expect(store.getState().pendingCount).toBe(1);
    expect(listener).toHaveBeenCalled();
    await store.flush();
    expect(store.getState().pendingCount).toBe(0);
  });

  it("flushes in order with upsert on (space_id,user_id,name) and a delete for removals", async () => {
    const { client, calls } = fakeClient();
    const { store } = makeStore(client);
    store.setVote("זיו", "keep");
    store.setVote("יעל", "skip");
    store.setVote("נועם", "love", true);
    await store.flush();
    store.removeVote("יעל");
    await store.flush();
    expect(calls.map((c) => `${c.op}:${c.name}`)).toEqual(["upsert:זיו", "upsert:יעל", "upsert:נועם", "delete:יעל"]);
    expect(calls[0].options).toEqual({ onConflict: "space_id,user_id,name" });
    expect(calls[2].row).toMatchObject({ vote: "love", custom: true, space_id: "space-" + n, user_id: "user-" + n });
    expect(calls[0].row?.updated_at).toMatch(/^2026-11-04T10:00:00\.\d{3}Z$/);
    expect(calls[3].row).toEqual({ space_id: "space-" + n, user_id: "user-" + n, name: "יעל" });
    expect(names(store)).toEqual(["זיו", "נועם"]);
  });

  it("keeps a failed request queued with backoff, then retries in order", async () => {
    const { client, calls } = fakeClient({ results: [{ error: { message: "Failed to fetch" } }] });
    const { store, report, advance } = makeStore(client);
    store.setVote("זיו", "keep");
    store.setVote("יעל", "keep");
    await store.flush();
    expect(calls.map((c) => c.name)).toEqual(["זיו"]);
    expect(store.getState().pendingCount).toBe(2);

    await store.flush(); // still backing off
    expect(calls).toHaveLength(1);

    advance(backoffMs(1));
    await store.flush();
    expect(calls.map((c) => c.name)).toEqual(["זיו", "זיו", "יעל"]);
    expect(store.getState().pendingCount).toBe(0);
    expect(report).not.toHaveBeenCalled();
  });

  it("retries a thrown network error and a forced flush ignores the backoff", async () => {
    const { client, calls } = fakeClient({ results: [new TypeError("Failed to fetch")] });
    const { store } = makeStore(client);
    store.setVote("זיו", "keep");
    await store.flush();
    expect(store.getState().pendingCount).toBe(1);
    await store.flush({ force: true });
    expect(calls).toHaveLength(2);
    expect(store.getState().pendingCount).toBe(0);
  });

  it("coalesces several changes to one name into one request", async () => {
    const { client, calls } = fakeClient();
    const { store } = makeStore(client);
    vi.stubGlobal("navigator", { onLine: false });
    store.setVote("זיו", "keep");
    store.setVote("זיו", "skip");
    store.setVote("זיו", "love");
    expect(store.getState().pendingCount).toBe(1);
    vi.stubGlobal("navigator", { onLine: true });
    await store.flush({ force: true });
    expect(calls.map((c) => `${c.op}:${c.vote}`)).toEqual(["upsert:love"]);
  });

  it("removal after keep: queued together becomes a single delete; after a sync, a delete follows", async () => {
    const { client, calls } = fakeClient();
    const { store } = makeStore(client);
    vi.stubGlobal("navigator", { onLine: false });
    store.setVote("זיו", "keep");
    store.removeVote("זיו");
    vi.stubGlobal("navigator", { onLine: true });
    await store.flush();
    expect(calls.map((c) => c.op)).toEqual(["delete"]);

    store.setVote("יעל", "keep");
    await store.flush();
    store.removeVote("יעל");
    await store.flush();
    expect(calls.map((c) => `${c.op}:${c.name}`)).toEqual(["delete:זיו", "upsert:יעל", "delete:יעל"]);
    expect(store.getState().votes.has("יעל")).toBe(false);
  });

  it("a change made while a request is in flight is sent after it", async () => {
    const { client, calls } = fakeClient();
    const { store } = makeStore(client);
    store.setVote("זיו", "keep"); // starts sending
    store.setVote("זיו", "skip"); // queued behind it, not merged into it
    await store.flush();
    expect(calls.map((c) => c.vote)).toEqual(["keep", "skip"]);
  });

  it("drops a superseded failed request instead of retrying it", async () => {
    const { client, calls } = fakeClient({ results: [{ error: { message: "timeout" } }] });
    const { store } = makeStore(client);
    store.setVote("זיו", "keep");
    store.setVote("זיו", "skip");
    await store.flush();
    expect(calls.map((c) => c.vote)).toEqual(["keep", "skip"]);
    expect(store.getState().pendingCount).toBe(0);
  });

  it("drops an RLS / not-member error and reports it without personal data", async () => {
    const { client, calls } = fakeClient({
      results: [{ error: { code: "42501", message: 'new row violates row-level security policy for table "name_votes"' } }],
    });
    const { store, report } = makeStore(client);
    store.setVote("זיו", "keep");
    store.setVote("יעל", "skip");
    await store.flush();
    expect(calls.map((c) => c.name)).toEqual(["זיו", "יעל"]);
    expect(store.getState().pendingCount).toBe(0);
    expect(report).toHaveBeenCalledTimes(1);
    const sent = JSON.stringify(report.mock.calls);
    expect(sent).toContain("42501");
    expect(sent).not.toMatch(/זיו|keep|user-|space-/);
  });

  it("survives a reload: the outbox and cache come back from IndexedDB", async () => {
    const offline = fakeClient({ results: [{ error: { message: "offline" } }] });
    const first = makeStore(offline.client);
    await first.store.load();
    first.store.setVote("זיו", "keep");
    first.store.setVote("יעל", "love");
    await first.store.flush();
    await new Promise((r) => setTimeout(r, 20));

    const online = fakeClient({ rows: [] });
    const again = createVoteStore({ spaceId: `space-${n}`, userId: `user-${n}`, client: online.client, report: vi.fn() });
    await again.load();
    expect(names(again)).toEqual(["זיו", "יעל"]);
    await again.flush({ force: true });
    expect(online.calls.map((c) => c.name)).toEqual(["זיו", "יעל"]);
    expect(again.getState().pendingCount).toBe(0);
    await again.dispose();
    again.setVote("נועם", "keep"); // ignored after dispose

    await clearLocalData(`user-${n}`);
    const cleared = createVoteStore({ spaceId: `space-${n}`, userId: `user-${n}`, client: null });
    await cleared.load();
    expect(cleared.getState().votes.size).toBe(0);
    expect(cleared.getState().pendingCount).toBe(0);
  });

  it("start() flushes on online and every 30 s, and stops", async () => {
    vi.useFakeTimers();
    const target = new EventTarget();
    vi.stubGlobal("window", target);
    vi.stubGlobal("document", Object.assign(new EventTarget(), { visibilityState: "visible" }));
    const { client } = fakeClient();
    const { store } = makeStore(client);
    const stop = store.start();
    vi.stubGlobal("navigator", { onLine: false });
    store.setVote("זיו", "keep");
    vi.stubGlobal("navigator", { onLine: true });
    expect(store.getState().pendingCount).toBe(1);
    target.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);
    expect(store.getState().pendingCount).toBe(0);

    vi.stubGlobal("navigator", { onLine: false });
    store.setVote("יעל", "keep");
    vi.stubGlobal("navigator", { onLine: true });
    await vi.advanceTimersByTimeAsync(30_000);
    expect(store.getState().pendingCount).toBe(0);

    stop();
    vi.stubGlobal("navigator", { onLine: false });
    store.setVote("נועם", "keep");
    vi.stubGlobal("navigator", { onLine: true });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(store.getState().pendingCount).toBe(1);
    vi.useRealTimers();
  });
});
