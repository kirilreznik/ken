import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { SW_SCOPE, SW_URL, shouldRegisterWorker, watchForUpdates } from "@/lib/names/serviceWorker";

const ORIGIN = "https://nest.example";
const source = readFileSync(new URL("../../public/names/sw.js", import.meta.url), "utf8");

type Listener = (event: Record<string, unknown>) => void;

/** Runs sw.js against a stub worker scope and an in-memory Cache API. */
function loadWorker(manifest = { names: "names.abc.json", content: "content.def.json" }) {
  const listeners: Record<string, Listener> = {};
  const stores = new Map<string, Map<string, Response>>();
  const fetched: string[] = [];
  const keyOf = (req: Request | string) => (typeof req === "string" ? new URL(req, ORIGIN).href : req.url);
  const cacheFor = (name: string) => {
    const store = stores.get(name) ?? new Map<string, Response>();
    stores.set(name, store);
    return {
      match: async (req: Request | string) => store.get(keyOf(req))?.clone(),
      put: async (req: Request | string, res: Response) => void store.set(keyOf(req), res),
      addAll: async (reqs: (Request | string)[]) => {
        for (const req of reqs) store.set(keyOf(req), new Response("ok"));
      },
    };
  };
  const caches = {
    open: async (name: string) => cacheFor(name),
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
  };
  let offline = false;
  const fetchStub = async (req: Request | string) => {
    const url = keyOf(req);
    fetched.push(url);
    if (offline) throw new TypeError("Failed to fetch");
    const res = url.endsWith("/names/data/manifest.json") ? Response.json(manifest) : new Response("net");
    // Same-origin fetches in a worker come back as "basic" responses.
    return Object.defineProperty(res, "type", { value: "basic" });
  };
  let skipped = false;
  const self = {
    location: new URL(`${ORIGIN}${SW_URL}`),
    addEventListener: (type: string, fn: Listener) => void (listeners[type] = fn),
    skipWaiting: () => void (skipped = true),
    clients: { claim: async () => undefined },
  };
  runInNewContext(source, {
    self,
    caches,
    fetch: (req: Request | string) => fetchStub(typeof req === "string" ? new Request(new URL(req, ORIGIN)) : req),
    Request: class extends Request {
      constructor(input: string, init?: RequestInit) {
        super(new URL(input, ORIGIN), init);
      }
    },
    URL,
    Promise,
    Error,
    TypeError,
  });

  async function fire(type: string, extra: Record<string, unknown> = {}) {
    let waited: Promise<unknown> | undefined;
    listeners[type]({ ...extra, waitUntil: (p: Promise<unknown>) => void (waited = p) });
    await waited;
  }
  function onFetch(path: string, init: { method?: string; navigate?: boolean } = {}) {
    let responded: Promise<Response> | undefined;
    const request = new Request(path.startsWith("http") ? path : `${ORIGIN}${path}`, { method: init.method ?? "GET" });
    Object.defineProperty(request, "mode", { value: init.navigate ? "navigate" : "cors" });
    listeners.fetch({ request, respondWith: (p: Promise<Response>) => void (responded = p) });
    return responded;
  }
  return { stores, fetched, fire, onFetch, skipped: () => skipped, setOffline: (v: boolean) => void (offline = v) };
}

describe("serviceWorker registration", () => {
  it("registers in production only", () => {
    expect(SW_URL).toBe("/names/sw.js");
    expect(SW_SCOPE).toBe("/names");
    expect(shouldRegisterWorker("production", true)).toBe(true);
    expect(shouldRegisterWorker("development", true)).toBe(false);
    expect(shouldRegisterWorker("test", true)).toBe(false);
    expect(shouldRegisterWorker("production", false)).toBe(false);
  });
});

describe("public/names/sw.js", () => {
  it("precaches the shell pages, the hashed data files from the manifest, photos, fonts and icons", async () => {
    const sw = loadWorker();
    await sw.fire("install");
    const keys = [...sw.stores.values()].flatMap((s) => [...s.keys()]).map((k) => new URL(k).pathname);
    for (const path of [
      "/names",
      "/names/welcome",
      "/names/lists",
      "/names/intro",
      "/names/data/manifest.json",
      "/names/data/names.abc.json",
      "/names/data/content.def.json",
      "/landing/names-fabric.webp",
      "/landing/names-notebook.webp",
      "/landing/names-nursery.webp",
      "/landing/heebo-hebrew.woff2",
      "/landing/heebo-latin.woff2",
      "/names/icons/icon-192.png",
    ]) {
      expect(keys).toContain(path);
    }
    expect([...sw.stores.keys()].every((name) => name.startsWith("nest-names-"))).toBe(true);
  });

  it("deletes old names caches on activate and leaves other caches alone", async () => {
    const sw = loadWorker();
    await sw.fire("install");
    sw.stores.set("nest-names-shell-v0", new Map());
    sw.stores.set("other-app", new Map());
    await sw.fire("activate");
    expect(sw.stores.has("nest-names-shell-v0")).toBe(false);
    expect(sw.stores.has("other-app")).toBe(true);
    expect(sw.stores.size).toBe(3);
  });

  it("never handles /api, the auth callback, other origins or non-GET requests", () => {
    const sw = loadWorker();
    expect(sw.onFetch("/api/names/account")).toBeUndefined();
    expect(sw.onFetch("/api/client-log", { method: "POST" })).toBeUndefined();
    expect(sw.onFetch("/names/auth/callback?code=x", { navigate: true })).toBeUndefined();
    expect(sw.onFetch("https://abc.supabase.co/rest/v1/votes")).toBeUndefined();
    expect(sw.onFetch("/names/sw.js")).toBeUndefined();
    expect(sw.onFetch("/pregnancy", { navigate: true })).toBeUndefined();
  });

  it("serves static files cache-first", async () => {
    const sw = loadWorker();
    await sw.fire("install");
    const font = await sw.onFetch("/landing/heebo-hebrew.woff2");
    expect(await font?.text()).toBe("ok");
    expect(sw.fetched.some((u) => u.endsWith("/landing/heebo-hebrew.woff2"))).toBe(false);
    const chunk = await sw.onFetch("/_next/static/chunks/app.js");
    expect(await chunk?.text()).toBe("net");
    sw.fetched.length = 0;
    expect(await (await sw.onFetch("/_next/static/chunks/app.js"))?.text()).toBe("net");
    expect(sw.fetched).toHaveLength(0);
  });

  it("serves /names pages network-first with the cached page as the offline fallback", async () => {
    const sw = loadWorker();
    await sw.fire("install");
    expect(await (await sw.onFetch("/names?sheet=about", { navigate: true }))?.text()).toBe("net");
    sw.setOffline(true);
    expect(await (await sw.onFetch("/names?tab=duel", { navigate: true }))?.text()).toBe("net");
    expect(await (await sw.onFetch("/names/welcome", { navigate: true }))?.text()).toBe("ok");
    await expect(sw.onFetch("/names/hidden", { navigate: true })).rejects.toThrow();
  });

  it("skips waiting only when the page asks", () => {
    const sw = loadWorker();
    sw.fire("message", { data: { type: "other" } });
    expect(sw.skipped()).toBe(false);
    sw.fire("message", { data: { type: "SKIP_WAITING" } });
    expect(sw.skipped()).toBe(true);
  });
});

function fakeWorker(state = "installing") {
  const listeners: (() => void)[] = [];
  const messages: unknown[] = [];
  const worker = {
    state,
    postMessage: (m: unknown) => messages.push(m),
    addEventListener: (_t: string, l: () => void) => listeners.push(l),
    setState(next: string) {
      worker.state = next;
      for (const l of listeners) l();
    },
    messages,
  };
  return worker;
}

function fakeSetup(controller: unknown, waiting: ReturnType<typeof fakeWorker> | null = null) {
  const found = new Set<() => void>();
  const changed = new Set<() => void>();
  const reg = {
    waiting,
    installing: null as ReturnType<typeof fakeWorker> | null,
    addEventListener: (_t: "updatefound", l: () => void) => void found.add(l),
    removeEventListener: (_t: "updatefound", l: () => void) => void found.delete(l),
    update: async () => undefined,
  };
  const container = {
    controller,
    addEventListener: (_t: "controllerchange", l: () => void) => void changed.add(l),
    removeEventListener: (_t: "controllerchange", l: () => void) => void changed.delete(l),
  };
  return {
    reg,
    container,
    install(worker: ReturnType<typeof fakeWorker>) {
      reg.installing = worker;
      for (const l of found) l();
    },
    controllerChange() {
      for (const l of changed) l();
    },
  };
}

describe("watchForUpdates", () => {
  it("offers a worker already waiting behind a controller, then reloads after it takes over", () => {
    const waiting = fakeWorker("installed");
    const s = fakeSetup({}, waiting);
    const applies: (() => void)[] = [];
    let reloads = 0;
    watchForUpdates(s.reg as never, s.container, (apply) => applies.push(apply), () => reloads++);
    expect(applies).toHaveLength(1);
    s.controllerChange();
    expect(reloads).toBe(0);
    applies[0]();
    expect(waiting.messages).toEqual([{ type: "SKIP_WAITING" }]);
    s.controllerChange();
    expect(reloads).toBe(1);
  });

  it("offers a worker that finishes installing later, once", () => {
    const s = fakeSetup({});
    let offers = 0;
    watchForUpdates(s.reg as never, s.container, () => offers++, () => undefined);
    const worker = fakeWorker();
    s.install(worker);
    expect(offers).toBe(0);
    worker.setState("installed");
    worker.setState("installed");
    expect(offers).toBe(1);
  });

  it("offers nothing on a first install (no controller)", () => {
    const s = fakeSetup(null);
    let offers = 0;
    watchForUpdates(s.reg as never, s.container, () => offers++, () => undefined);
    const worker = fakeWorker();
    s.install(worker);
    worker.setState("installed");
    expect(offers).toBe(0);
  });

  it("stops listening", () => {
    const s = fakeSetup({});
    let offers = 0;
    const stop = watchForUpdates(s.reg as never, s.container, () => offers++, () => undefined);
    stop();
    const worker = fakeWorker();
    s.install(worker);
    worker.setState("installed");
    expect(offers).toBe(0);
  });
});
