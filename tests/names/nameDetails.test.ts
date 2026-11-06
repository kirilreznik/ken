import { afterEach, describe, expect, it, vi } from "vitest";

const manifest = { names: "names.a.json", content: "content.b.json", details: "details.c.json", builtAt: "x" };
const detailsFile = {
  _about: "test",
  names: { נועם: { story: "סיפור", similar: ["נעם"] }, נעם: { story: null, similar: ["נועם"] } },
};

function serve(failDetails: () => boolean) {
  return vi.fn(async (url: string) => {
    if (url === "/names/data/manifest.json") return new Response(JSON.stringify(manifest));
    if (url === "/names/data/details.c.json")
      return failDetails() ? new Response("", { status: 503 }) : new Response(JSON.stringify(detailsFile));
    return new Response("", { status: 404 });
  });
}

const detailsCalls = (fetchMock: ReturnType<typeof serve>) =>
  fetchMock.mock.calls.filter((c) => c[0] === "/names/data/details.c.json").length;

async function fresh() {
  vi.resetModules();
  const data = await import("@/lib/names/data");
  const hook = await import("@/components/names/useNameDetails");
  return { ...data, ...hook };
}

afterEach(() => vi.unstubAllGlobals());

describe("loadDetails", () => {
  it("fetches the manifest's details file once across many calls", async () => {
    const fetchMock = serve(() => false);
    vi.stubGlobal("fetch", fetchMock);
    const { loadDetails } = await fresh();
    const [a, b, c] = await Promise.all([loadDetails(), loadDetails(), loadDetails()]);
    expect(await loadDetails()).toBe(a);
    expect(b).toBe(a);
    expect(c).toBe(a);
    expect(a.get("נועם")).toEqual({ story: "סיפור", similar: ["נעם"] });
    expect(a.get("נעם")?.story).toBeNull();
    expect(detailsCalls(fetchMock)).toBe(1);
  });

  it("retries on the next call after a failed load", async () => {
    let fail = true;
    const fetchMock = serve(() => fail);
    vi.stubGlobal("fetch", fetchMock);
    const { loadDetails } = await fresh();
    await expect(loadDetails()).rejects.toThrow();
    fail = false;
    expect((await loadDetails()).size).toBe(2);
    expect(detailsCalls(fetchMock)).toBe(2);
  });
});

describe("useNameDetails store", () => {
  it("stays idle and fetches nothing until started", async () => {
    const fetchMock = serve(() => false);
    vi.stubGlobal("fetch", fetchMock);
    const { getDetailsSnapshot } = await fresh();
    expect(getDetailsSnapshot()).toEqual({ details: null, state: "idle" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("goes loading then ready, and starting again doesn't fetch again", async () => {
    const fetchMock = serve(() => false);
    vi.stubGlobal("fetch", fetchMock);
    const { startDetails, getDetailsSnapshot, subscribeDetails } = await fresh();
    const seen: string[] = [];
    const unsubscribe = subscribeDetails(() => seen.push(getDetailsSnapshot().state));
    const first = startDetails();
    expect(getDetailsSnapshot().state).toBe("loading");
    await Promise.all([first, startDetails(), startDetails()]);
    expect(getDetailsSnapshot().state).toBe("ready");
    expect(getDetailsSnapshot().details?.size).toBe(2);
    await startDetails();
    expect(seen).toEqual(["loading", "ready"]);
    expect(detailsCalls(fetchMock)).toBe(1);
    unsubscribe();
  });

  it("shows error, then loads on the next start", async () => {
    let fail = true;
    const fetchMock = serve(() => fail);
    vi.stubGlobal("fetch", fetchMock);
    const { startDetails, getDetailsSnapshot } = await fresh();
    await startDetails();
    expect(getDetailsSnapshot()).toEqual({ details: null, state: "error" });
    fail = false;
    await startDetails();
    expect(getDetailsSnapshot().state).toBe("ready");
    expect(detailsCalls(fetchMock)).toBe(2);
  });
});
