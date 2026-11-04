import "fake-indexeddb/auto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearLocalData } from "@/lib/names/auth";
import {
  createMatchesStore,
  keptByText,
  matchesIntro,
  matchSheetLine,
  matchToShow,
  MATCHES_INTERVAL_MS,
  newMatches,
  toMatches,
  updatedText,
  withSeen,
  VOTE_DEBOUNCE_MS,
  type MatchesStoreOptions,
} from "@/lib/names/matches";

type Row = { name: string; kept_by_count: number; loved_by_count: number; matched_at: string };
const row = (name: string, matched_at: string, kept = 2, loved = 0): Row => ({
  name,
  kept_by_count: kept,
  loved_by_count: loved,
  matched_at,
});

function fakeClient(rows: Row[] = []) {
  const server = { rows, fail: false };
  const rpc = vi.fn(async (fn: string, args: unknown) => {
    void fn;
    void args;
    if (server.fail) throw new TypeError("Failed to fetch");
    return { data: [...server.rows], error: null };
  });
  return { client: { rpc } as unknown as SupabaseClient, rpc, server };
}

let n = 0;
function makeStore(client: SupabaseClient, extra: Partial<MatchesStoreOptions> = {}) {
  n += 1;
  const ids = { spaceId: `space-${n}`, userId: `user-${n}` };
  const store = createMatchesStore({ ...ids, shared: true, client, now: () => 1_000, ...extra });
  return { store, ...ids };
}

// Real setImmediate: fake-indexeddb schedules with it.
const fakeTimers = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });

function stubBrowser(visibilityState = "visible") {
  const win = new EventTarget();
  const doc = Object.assign(new EventTarget(), { visibilityState });
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", doc);
  return { win, doc };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("helpers", () => {
  it("toMatches maps the rpc columns and sorts newest first", () => {
    const list = toMatches([row("זיו", "2026-11-01T10:00:00+00:00"), row("יעל", "2026-11-03T10:00:00+00:00", 3, 1)]);
    expect(list).toEqual([
      { name: "יעל", keptByCount: 3, lovedByCount: 1, matchedAt: "2026-11-03T10:00:00+00:00" },
      { name: "זיו", keptByCount: 2, lovedByCount: 0, matchedAt: "2026-11-01T10:00:00+00:00" },
    ]);
  });

  it("newMatches returns only names not seen yet, keeping the order", () => {
    const list = toMatches([row("זיו", "2026-11-01T10:00:00Z"), row("יעל", "2026-11-03T10:00:00Z"), row("נועם", "2026-11-02T10:00:00Z")]);
    expect(newMatches(list, ["זיו"]).map((m) => m.name)).toEqual(["יעל", "נועם"]);
    expect(newMatches(list, new Set(["זיו", "יעל", "נועם"]))).toEqual([]);
    expect(newMatches([], [])).toEqual([]);
  });

  it("says how many kept a name only from 3 up, and never who", () => {
    const [two, three] = toMatches([row("זיו", "2026-11-02T10:00:00Z", 2, 1), row("יעל", "2026-11-01T10:00:00Z", 3)]);
    expect(keptByText(two)).toBeNull();
    expect(keptByText(three)).toBe("3 שמרו");
    expect(matchSheetLine(two)).toBe("שניכם שמרתם את השם הזה.");
    expect(matchSheetLine(three)).toBe("3 שמרו את השם הזה.");
    expect(matchesIntro(2)).toBe("שמות ששניכם שמרתם. על שמות שדילגתם עליהם אף אחד לא יודע.");
    expect(matchesIntro(3)).toBe("שמות שלפחות שניים מכם שמרו. על שמות שדילגתם עליהם אף אחד לא יודע.");
  });

  it("matchToShow picks the newest unseen match; withSeen adds every match once", () => {
    const list = toMatches([row("זיו", "2026-11-01T10:00:00Z"), row("יעל", "2026-11-03T10:00:00Z")]);
    expect(matchToShow(list, [])?.name).toBe("יעל");
    expect(matchToShow(list, ["יעל"])?.name).toBe("זיו");
    expect(matchToShow(list, ["יעל", "זיו"])).toBeNull();
    expect(withSeen(["נועם", "יעל"], list)).toEqual(["נועם", "יעל", "זיו"]);
    expect(withSeen([], [])).toEqual([]);
  });

  it("updatedText shows the time today and the date before", () => {
    const at = new Date(2026, 10, 5, 9, 7).getTime();
    expect(updatedText(at, new Date(2026, 10, 5, 23, 0).getTime())).toBe("עודכן לאחרונה ב־09:07");
    expect(updatedText(at, new Date(2026, 10, 6, 8, 0).getTime())).toBe("עודכן לאחרונה ב־5.11, 09:07");
  });
});

describe("matches store", () => {
  it("loads with rpc('name_matches', { p_space }) and caches the result with fetchedAt", async () => {
    const fake = fakeClient([row("זיו", "2026-11-01T10:00:00Z")]);
    const { store, spaceId, userId } = makeStore(fake.client);
    expect(store.getState().ready).toBe(false);
    await store.load();
    expect(fake.rpc).toHaveBeenCalledWith("name_matches", { p_space: spaceId });
    expect(store.getState()).toMatchObject({ ready: true, fetchedAt: 1_000 });
    expect(store.getState().matches.map((m) => m.name)).toEqual(["זיו"]);
    await store.dispose();

    // Offline next time: the cache answers.
    const offline = fakeClient();
    offline.server.fail = true;
    const again = createMatchesStore({ spaceId, userId, shared: true, client: offline.client });
    await again.load();
    expect(again.getState()).toMatchObject({ ready: true, fetchedAt: 1_000 });
    expect(again.getState().matches.map((m) => m.name)).toEqual(["זיו"]);

    await clearLocalData(userId);
    const cleared = createMatchesStore({ spaceId, userId, shared: true, client: offline.client });
    await cleared.load();
    expect(cleared.getState()).toMatchObject({ ready: true, matches: [], fetchedAt: null });
  });

  it("a space of one makes no calls and has no matches", async () => {
    fakeTimers();
    stubBrowser();
    const fake = fakeClient([row("זיו", "2026-11-01T10:00:00Z")]);
    const { store } = makeStore(fake.client, { shared: false });
    await store.load();
    store.start();
    store.votesChanged();
    await store.refresh();
    window.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(MATCHES_INTERVAL_MS * 2);
    expect(fake.rpc).not.toHaveBeenCalled();
    expect(store.getState()).toMatchObject({ ready: true, matches: [], fetchedAt: null });
  });

  it("refetches 2 s after the last own vote change", async () => {
    fakeTimers();
    const fake = fakeClient();
    const { store } = makeStore(fake.client);
    await store.load();
    fake.rpc.mockClear();
    store.votesChanged();
    await vi.advanceTimersByTimeAsync(1_500);
    store.votesChanged();
    await vi.advanceTimersByTimeAsync(VOTE_DEBOUNCE_MS - 1);
    expect(fake.rpc).not.toHaveBeenCalled();
    fake.server.rows = [row("יעל", "2026-11-04T10:00:00Z")];
    await vi.advanceTimersByTimeAsync(1);
    expect(fake.rpc).toHaveBeenCalledTimes(1);
    expect(store.getState().matches.map((m) => m.name)).toEqual(["יעל"]);
  });

  it("refetches on focus and every 60 s while visible, not while hidden, and stops", async () => {
    fakeTimers();
    const { win, doc } = stubBrowser();
    const fake = fakeClient();
    const { store } = makeStore(fake.client);
    await store.load();
    fake.rpc.mockClear();
    const stop = store.start();

    win.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(0);
    expect(fake.rpc).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(MATCHES_INTERVAL_MS);
    expect(fake.rpc).toHaveBeenCalledTimes(2);

    doc.visibilityState = "hidden";
    await vi.advanceTimersByTimeAsync(MATCHES_INTERVAL_MS * 3);
    expect(fake.rpc).toHaveBeenCalledTimes(2);

    doc.visibilityState = "visible";
    doc.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(0);
    expect(fake.rpc).toHaveBeenCalledTimes(3);

    stop();
    win.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(MATCHES_INTERVAL_MS * 2);
    expect(fake.rpc).toHaveBeenCalledTimes(3);
  });

  it("keeps the last result when a fetch fails, and runs one more fetch for a request made during one", async () => {
    const fake = fakeClient([row("זיו", "2026-11-01T10:00:00Z")]);
    const { store } = makeStore(fake.client);
    await store.load();
    fake.server.fail = true;
    await store.refresh();
    expect(store.getState().matches.map((m) => m.name)).toEqual(["זיו"]);

    fake.server.fail = false;
    fake.rpc.mockClear();
    const first = store.refresh();
    void store.refresh();
    void store.refresh();
    await first;
    expect(fake.rpc).toHaveBeenCalledTimes(2);
  });

  it("notifies subscribers and goes quiet after dispose", async () => {
    fakeTimers();
    const fake = fakeClient([row("זיו", "2026-11-01T10:00:00Z")]);
    const { store } = makeStore(fake.client);
    const seen = vi.fn();
    store.subscribe(seen);
    await store.load();
    expect(seen).toHaveBeenCalled();
    store.votesChanged();
    await store.dispose();
    fake.rpc.mockClear();
    await vi.advanceTimersByTimeAsync(VOTE_DEBOUNCE_MS * 2);
    await store.refresh();
    expect(fake.rpc).not.toHaveBeenCalled();
  });
});
