import "fake-indexeddb/auto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createVoteStore, isNewer, mergeRemote, type OutboxItem, type StoredVote } from "@/lib/names/voteStore";

type Row = { name: string; vote: string; custom: boolean; updated_at: string };
type Handler = (payload: Record<string, unknown>) => void;

/** name_votes with a server copy (`rows`), a Realtime channel to push events through, and write hooks. */
function fakeClient(rows: Row[] = []) {
  const server = { rows };
  const writes: string[] = [];
  let handler: Handler | null = null;
  let status: ((s: string) => void) | null = null;
  let filter: unknown = null;
  let hold: Promise<void> | null = null;
  let readHold: Promise<void> | null = null;
  const removeChannel = vi.fn(async () => "ok");
  const channelObj = {
    on: (_type: string, f: unknown, h: Handler) => {
      filter = f;
      handler = h;
      return channelObj;
    },
    subscribe: (cb: (s: string) => void) => {
      status = cb;
      cb("SUBSCRIBED");
      return channelObj;
    },
  };
  const channel = vi.fn(() => channelObj);
  const reads = { count: 0 };
  const from = () => ({
    upsert: async (row: Row) => {
      if (hold) await hold;
      writes.push(`upsert:${row.name}:${row.vote}:${row.updated_at}`);
      return { error: null };
    },
    delete: () => {
      const chain = { eq: () => chain, then: (r: (v: unknown) => void) => r({ error: null }) };
      return chain;
    },
    select: () => {
      const query = {
        eq: () => query,
        order: async () => {
          reads.count += 1;
          const data = [...server.rows];
          if (readHold) await readHold;
          return { data, error: null };
        },
      };
      return query;
    },
  });
  return {
    client: { from, channel, removeChannel } as unknown as SupabaseClient,
    server,
    writes,
    reads,
    channel,
    removeChannel,
    filter: () => filter,
    push: (payload: Record<string, unknown>) => handler?.(payload),
    reconnect: () => status?.("SUBSCRIBED"),
    /** Reads take the server copy now and answer on release. */
    holdReads: () => {
      let release = () => {};
      readHold = new Promise<void>((r) => (release = r));
      return () => {
        readHold = null;
        release();
      };
    },
    holdWrites: () => {
      let release = () => {};
      hold = new Promise<void>((r) => (release = r));
      return () => {
        hold = null;
        release();
      };
    },
  };
}

let n = 0;
function makeStore(client: SupabaseClient) {
  n += 1;
  let t = Date.parse("2026-11-04T10:00:00Z");
  const ids = { spaceId: `space-${n}`, userId: `user-${n}` };
  const store = createVoteStore({ ...ids, client, now: () => (t += 1), report: vi.fn(async () => {}) });
  return { store, ...ids };
}

const v = (name: string, vote: StoredVote["vote"], updatedAt: string): StoredVote => ({ name, vote, custom: false, updatedAt });
const voteOf = (s: { getState(): { votes: ReadonlyMap<string, StoredVote> } }, name: string) => s.getState().votes.get(name)?.vote;

function stubBrowser() {
  const doc = Object.assign(new EventTarget(), { visibilityState: "visible" });
  vi.stubGlobal("window", new EventTarget());
  vi.stubGlobal("document", doc);
  return { doc };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("merge helpers", () => {
  it("isNewer compares client and Postgres timestamps by time, not text", () => {
    expect(isNewer("2026-11-04T10:00:00.002+00:00", "2026-11-04T10:00:00.001Z")).toBe(true);
    expect(isNewer("2026-11-04T10:00:00.001+00:00", "2026-11-04T10:00:00.001Z")).toBe(false);
    expect(isNewer("2026-11-04T12:00:00+02:00", "2026-11-04T10:00:00.001Z")).toBe(false);
  });

  it("mergeRemote: later change wins, old local-only votes go, fresh ones and the outbox stay", () => {
    const local = new Map([
      ["זיו", v("זיו", "love", "2026-11-04T10:00:05Z")],
      ["יעל", v("יעל", "keep", "2026-11-04T10:00:01Z")],
      ["נועם", v("נועם", "keep", "2026-11-04T09:00:00Z")], // deleted on another device
      ["אור", v("אור", "keep", "2026-11-04T10:00:09Z")], // made during the read
    ]);
    const remote = new Map([
      ["זיו", v("זיו", "keep", "2026-11-04T10:00:02Z")],
      ["יעל", v("יעל", "skip", "2026-11-04T10:00:07Z")],
    ]);
    const queued: OutboxItem = {
      id: "q",
      op: "upsert",
      name: "תמר",
      vote: "keep",
      updatedAt: "2026-11-04T08:00:00Z",
      attempts: 0,
      retryAt: 0,
    };
    const merged = mergeRemote(local, remote, [queued], Date.parse("2026-11-04T10:00:08Z"));
    expect([...merged.values()].map((x) => `${x.name}:${x.vote}`)).toEqual(["זיו:love", "יעל:skip", "אור:keep", "תמר:keep"]);
  });
});

describe("realtime", () => {
  it("subscribes to own name_votes rows and unsubscribes on stop", () => {
    stubBrowser();
    const fake = fakeClient();
    const { store, userId } = makeStore(fake.client);
    const stop = store.start();
    expect(fake.channel).toHaveBeenCalledTimes(1);
    expect(fake.filter()).toEqual({ event: "*", schema: "public", table: "name_votes", filter: `user_id=eq.${userId}` });
    stop();
    expect(fake.removeChannel).toHaveBeenCalledTimes(1);
  });

  it("applies a newer remote vote, ignores its own echo and older ones and other spaces", async () => {
    stubBrowser();
    const fake = fakeClient();
    const { store, spaceId, userId } = makeStore(fake.client);
    await store.load();
    store.start();
    const seen = vi.fn();
    store.subscribe(seen);
    const row = (name: string, vote: string, updated_at: string, space = spaceId) => ({
      eventType: "UPDATE",
      new: { space_id: space, user_id: userId, name, vote, custom: false, updated_at },
    });

    fake.push(row("זיו", "love", "2026-11-04T11:00:00.123456+00:00"));
    expect(voteOf(store, "זיו")).toBe("love");
    expect(seen).toHaveBeenCalled();

    store.setVote("זיו", "skip"); // local time 10:00, older than the remote vote
    await store.flush();
    expect(voteOf(store, "זיו")).toBe("skip"); // a local change always shows
    const echo = fake.writes.at(-1)!.split(":").slice(3).join(":");
    fake.push(row("זיו", "skip", echo));
    expect(voteOf(store, "זיו")).toBe("skip");

    fake.push(row("זיו", "keep", "2026-11-04T09:00:00Z")); // older than the local change
    expect(voteOf(store, "זיו")).toBe("skip");

    fake.push(row("יעל", "keep", "2026-11-04T12:00:00Z", "other-space"));
    expect(store.getState().votes.has("יעל")).toBe(false);
  });

  it("ignores a late echo of a vote that was undone, whether the delete is sent or still queued", async () => {
    stubBrowser();
    const fake = fakeClient();
    const { store, spaceId, userId } = makeStore(fake.client);
    await store.load();
    store.start();
    const insert = (name: string, vote: string, updated_at: string) => ({
      eventType: "INSERT",
      new: { space_id: spaceId, user_id: userId, name, vote, custom: false, updated_at },
    });
    const lastTime = () => fake.writes.at(-1)!.split(":").slice(3).join(":");

    // Delete already sent when the echo arrives.
    store.setVote("שקד", "skip");
    await store.flush();
    const skipAt = lastTime();
    store.removeVote("שקד"); // undo
    await store.flush();
    fake.push(insert("שקד", "skip", skipAt));
    expect(store.getState().votes.has("שקד")).toBe(false);

    // Delete still queued when the echo arrives.
    store.setVote("נועם", "keep");
    await store.flush();
    const keepAt = lastTime();
    const release = fake.holdWrites();
    store.removeVote("נועם");
    fake.push(insert("נועם", "keep", keepAt));
    expect(store.getState().votes.has("נועם")).toBe(false);
    release();
    await store.flush();
    expect(store.getState().votes.has("נועם")).toBe(false);

    // A genuinely newer vote (another device, after the undo) still applies.
    fake.push(insert("שקד", "love", "2026-11-04T12:00:00Z"));
    expect(voteOf(store, "שקד")).toBe("love");
  });

  it("a newer remote vote replaces an older queued change, which is never sent", async () => {
    stubBrowser();
    const fake = fakeClient();
    const { store, spaceId, userId } = makeStore(fake.client);
    await store.load();
    store.start();
    vi.stubGlobal("navigator", { onLine: false });
    store.setVote("זיו", "keep");
    expect(store.getState().pendingCount).toBe(1);
    fake.push({
      eventType: "INSERT",
      new: { space_id: spaceId, user_id: userId, name: "זיו", vote: "love", custom: false, updated_at: "2026-11-04T11:00:00Z" },
    });
    expect(store.getState().pendingCount).toBe(0);
    expect(voteOf(store, "זיו")).toBe("love");
    vi.stubGlobal("navigator", { onLine: true });
    await store.flush({ force: true });
    expect(fake.writes).toEqual([]);
  });

  it("writes the newer remote vote back when it arrives while an older one is being sent", async () => {
    stubBrowser();
    const fake = fakeClient();
    const { store, spaceId, userId } = makeStore(fake.client);
    await store.load();
    store.start();
    const release = fake.holdWrites();
    store.setVote("זיו", "keep"); // in flight
    fake.push({
      eventType: "UPDATE",
      new: { space_id: spaceId, user_id: userId, name: "זיו", vote: "love", custom: false, updated_at: "2026-11-04T11:00:00Z" },
    });
    release();
    await store.flush();
    await store.flush();
    expect(fake.writes.map((w) => w.split(":").slice(0, 3).join(":"))).toEqual(["upsert:זיו:keep", "upsert:זיו:love"]);
    expect(fake.writes[1]).toContain("2026-11-04T11:00:00Z");
    expect(voteOf(store, "זיו")).toBe("love");
  });

  it("a remote delete re-reads the server; a rejoin re-reads too", async () => {
    // Real setImmediate: fake-indexeddb schedules with it.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
    stubBrowser();
    const fake = fakeClient([{ name: "זיו", vote: "keep", custom: false, updated_at: "2026-11-04T09:00:00Z" }]);
    const { store } = makeStore(fake.client);
    await store.load();
    store.start();
    expect(voteOf(store, "זיו")).toBe("keep");
    const before = fake.reads.count;

    fake.server.rows = [];
    fake.push({ eventType: "DELETE", old: { id: "row-id" } });
    fake.push({ eventType: "DELETE", old: { id: "row-id-2" } });
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fake.reads.count).toBe(before + 1); // a burst shares one read
    expect(store.getState().votes.has("זיו")).toBe(false);

    fake.server.rows = [{ name: "יעל", vote: "love", custom: false, updated_at: "2026-11-04T09:30:00Z" }];
    fake.reconnect();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(voteOf(store, "יעל")).toBe("love");
  });

  it("focus and becoming visible re-read the server (deletes from another device)", async () => {
    const { doc } = stubBrowser();
    const fake = fakeClient([{ name: "זיו", vote: "keep", custom: false, updated_at: "2026-11-04T09:00:00Z" }]);
    const { store } = makeStore(fake.client);
    await store.load();
    const stop = store.start();
    fake.server.rows = [];
    window.dispatchEvent(new Event("focus"));
    await store.reconcile();
    expect(store.getState().votes.has("זיו")).toBe(false);

    fake.server.rows = [{ name: "יעל", vote: "keep", custom: false, updated_at: "2026-11-04T09:10:00Z" }];
    const before = fake.reads.count;
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(fake.reads.count).toBe(before);
    doc.visibilityState = "visible";
    doc.dispatchEvent(new Event("visibilitychange"));
    await store.reconcile();
    expect(voteOf(store, "יעל")).toBe("keep");
    stop();
  });

  it("a change made right after load() finishes is sent (no lost flush request)", async () => {
    const fake = fakeClient();
    const { store } = makeStore(fake.client);
    await store.load();
    store.setVote("זיו", "keep");
    await store.flush();
    expect(fake.writes).toHaveLength(1);
    expect(store.getState().pendingCount).toBe(0);
  });

  it("a read sent before an undo doesn't bring the undone vote back once the delete has landed", async () => {
    stubBrowser();
    const fake = fakeClient();
    const { store } = makeStore(fake.client);
    await store.load();
    store.setVote("גבריאל", "skip");
    await store.flush();
    const skipAt = fake.writes.at(-1)!.split(":").slice(3).join(":");
    fake.server.rows = [{ name: "גבריאל", vote: "skip", custom: false, updated_at: skipAt }];
    const release = fake.holdReads();
    const read = store.reconcile(); // e.g. the page became visible again
    store.removeVote("גבריאל"); // undo
    await store.flush();
    expect(store.getState().pendingCount).toBe(0);
    fake.server.rows = [];
    release();
    await read;
    expect(store.getState().votes.has("גבריאל")).toBe(false);

    // A vote made on another device after the undo still arrives.
    fake.server.rows = [{ name: "גבריאל", vote: "love", custom: false, updated_at: "2026-11-04T12:00:00Z" }];
    await store.reconcile();
    expect(voteOf(store, "גבריאל")).toBe("love");
  });

  it("a vote not yet on the server survives a re-read", async () => {
    stubBrowser();
    const fake = fakeClient();
    const { store } = makeStore(fake.client);
    await store.load();
    vi.stubGlobal("navigator", { onLine: false });
    store.setVote("זיו", "keep");
    await store.reconcile();
    expect(voteOf(store, "זיו")).toBe("keep");
    expect(store.getState().pendingCount).toBe(1);
  });
});
