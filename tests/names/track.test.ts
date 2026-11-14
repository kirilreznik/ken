import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  NAMES_EVENTS,
  cleanProps,
  flush,
  isBot,
  queuedForTests,
  refOf,
  setInternalDevice,
  resetTrackForTests,
  screenOf,
  setTrackToken,
  sourceOf,
  track,
  trackPath,
  utmOf,
} from "@/lib/names/track";

describe("cleanProps", () => {
  it("keeps numbers, booleans, null and short ASCII tokens", () => {
    expect(cleanProps({ vote: "keep", position: 3, shared: false, from: null, path: "a/b:c.d-e_f" })).toEqual({
      vote: "keep",
      position: 3,
      shared: false,
      from: null,
      path: "a/b:c.d-e_f",
    });
  });

  it("drops anything that could carry a name or personal text", () => {
    expect(
      cleanProps({
        name: "זיו",
        email: "me@example.com",
        spaced: "two words",
        long: "a".repeat(65),
        "Bad Key": 1,
        nan: Number.NaN,
        skipped: undefined,
      }),
    ).toEqual({});
  });

  it("keeps at most 24 props", () => {
    const many = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`k${i}`, i]));
    expect(Object.keys(cleanProps(many))).toHaveLength(24);
  });
});

describe("trackPath and screenOf", () => {
  it("removes the invite code and keeps /names paths only", () => {
    expect(trackPath("/names")).toBe("/names");
    expect(trackPath("/names/lists")).toBe("/names/lists");
    expect(trackPath("/names/join/ABC123")).toBe("/names/join");
    expect(trackPath("/pregnancy")).toBeNull();
    expect(trackPath("/names/%D7%96%D7%99%D7%95")).toBe("/names");
  });

  it("names the screen by its first segment", () => {
    expect(screenOf("/names")).toBe("swipe");
    expect(screenOf("/names/lists")).toBe("lists");
    expect(screenOf("/names/join/ABC123")).toBe("join");
    expect(screenOf("/names/sign-in/email")).toBe("sign-in");
    expect(screenOf("/other")).toBe("other");
  });
});

describe("sourceOf", () => {
  it("reads ?source= when it is a short token", () => {
    expect(sourceOf("?source=pwa")).toBe("pwa");
    expect(sourceOf("?join=ABC")).toBe("direct");
    expect(sourceOf(`?source=${encodeURIComponent("זיו")}`)).toBe("direct");
  });
});

describe("refOf", () => {
  it("names the referrer by type and never keeps its URL", () => {
    expect(refOf("", "nestjourney.app")).toBe("none");
    expect(refOf("https://nestjourney.app/baby-names/x", "nestjourney.app")).toBe("self");
    expect(refOf("https://www.google.co.il/", "nestjourney.app")).toBe("google");
    expect(refOf("https://gemini.google.com/app", "nestjourney.app")).toBe("ai");
    expect(refOf("https://l.facebook.com/l.php?u=x", "nestjourney.app")).toBe("facebook");
    expect(refOf("https://l.instagram.com/", "nestjourney.app")).toBe("instagram");
    expect(refOf("https://web.whatsapp.com/", "nestjourney.app")).toBe("whatsapp");
    expect(refOf("https://chatgpt.com/", "nestjourney.app")).toBe("ai");
    expect(refOf("https://someblog.co.il/post", "nestjourney.app")).toBe("other");
    expect(refOf("not a url", "nestjourney.app")).toBe("other");
  });
});

describe("utmOf", () => {
  it("keeps short utm tokens, lowercased, and drops the rest", () => {
    expect(utmOf("?utm_source=WhatsApp&utm_medium=group&utm_campaign=beta_1&utm_term=x")).toEqual({
      utm_source: "whatsapp",
      utm_medium: "group",
      utm_campaign: "beta_1",
    });
    expect(utmOf(`?utm_source=${encodeURIComponent("קבוצה")}&utm_campaign=${"a".repeat(41)}`)).toEqual({});
  });
});

describe("isBot", () => {
  it("spots crawlers and automated browsers, not phones", () => {
    expect(isBot({ userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" })).toBe(true);
    expect(isBot({ userAgent: "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0 Safari/537.36" })).toBe(true);
    expect(isBot({ userAgent: "Mozilla/5.0 (iPhone)", webdriver: true })).toBe(true);
    expect(isBot({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148" })).toBe(false);
    expect(isBot({ userAgent: "Mozilla/5.0 (Linux; Android 13; CUBOT X30) Chrome/120.0 Mobile Safari/537.36" })).toBe(false);
    expect(isBot(undefined)).toBe(false);
  });
});

describe("NAMES_EVENTS", () => {
  it("has only names the server accepts", () => {
    for (const name of Object.keys(NAMES_EVENTS)) expect(name).toMatch(/^[a-z][a-z0-9_]{1,47}$/);
  });

  it("has the name sheet events, and detail as a vote method", () => {
    for (const name of ["detail_opened", "detail_closed", "detail_section_seen", "detail_similar_tap", "detail_surname_add"]) {
      expect(NAMES_EVENTS).toHaveProperty(name);
    }
    expect(NAMES_EVENTS.vote).toContain("'detail'");
  });
});

describe("track", () => {
  const store = () => {
    const data = new Map<string, string>();
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    };
  };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    resetTrackForTests();
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://db.example");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_NAMES_ANALYTICS", "");
    vi.stubGlobal("window", {
      location: { pathname: "/names/join/ABC123", search: "" },
      localStorage: store(),
      sessionStorage: store(),
      addEventListener: () => {},
    });
    vi.stubGlobal("document", { addEventListener: () => {}, visibilityState: "visible" });
    fetchMock = vi.fn(async () => new Response("1", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("queues events with a device, a session and a scrubbed path, and drops unsafe props", () => {
    track("vote", { vote: "keep", name: "זיו" } as never);
    const [event] = queuedForTests();
    expect(event.event).toBe("vote");
    expect(event.props).toEqual({ vote: "keep" });
    expect(event.path).toBe("/names/join");
    expect(event.device_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(event.session_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("sends a batch to names_track with the user's token, without the token in the body", async () => {
    setTrackToken("user-token");
    track("first_vote");
    track("vote", { vote: "love" });
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://db.example/rest/v1/rpc/names_track");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer user-token");
    const body = JSON.parse(init.body as string) as { p_events: Record<string, unknown>[] };
    expect(body.p_events.map((e) => e.event)).toEqual(["first_vote", "vote"]);
    expect(JSON.stringify(body)).not.toContain("user-token");
    expect(queuedForTests()).toHaveLength(0);
  });

  it("keeps events signed out and in separate batches from signed-in ones", async () => {
    track("app_open");
    setTrackToken("user-token");
    track("signin_completed", { method: "email" });
    await flush();
    const auth = fetchMock.mock.calls.map(([, init]) => (init as RequestInit).headers as Record<string, string>);
    expect(auth.map((h) => h.Authorization)).toEqual(["Bearer anon-key", "Bearer user-token"]);
  });

  it("keeps the queue when offline and sends it later", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    track("vote", { vote: "skip" });
    await flush();
    expect(queuedForTests()).toHaveLength(1);
    await flush();
    expect(queuedForTests()).toHaveLength(0);
  });

  it("retries without the token when it has expired", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 401 }));
    setTrackToken("old-token");
    track("vote", { vote: "keep" });
    await flush();
    const auth = fetchMock.mock.calls.map(([, init]) => ((init as RequestInit).headers as Record<string, string>).Authorization);
    expect(auth).toEqual(["Bearer old-token", "Bearer anon-key"]);
  });

  it("queues the name sheet events with their props and drops a name in them", () => {
    track("detail_opened", { source: "similar", name: "זיו" } as never);
    track("detail_closed", { seconds: 12, full: true, surname: "כהן" } as never);
    track("detail_section_seen", { section: "story" });
    track("detail_similar_tap");
    track("detail_surname_add");
    track("vote", { vote: "love", method: "detail" });
    expect(queuedForTests().map((e) => [e.event, e.props])).toEqual([
      ["detail_opened", { source: "similar" }],
      ["detail_closed", { seconds: 12, full: true }],
      ["detail_section_seen", { section: "story" }],
      ["detail_similar_tap", {}],
      ["detail_surname_add", {}],
      ["vote", { vote: "love", method: "detail" }],
    ]);
  });

  it("marks every event from an internal device, until switched off", () => {
    setInternalDevice(true);
    track("vote", { vote: "keep" });
    expect(queuedForTests()[0].props).toEqual({ vote: "keep", internal: true });
    setInternalDevice(false);
    track("vote", { vote: "skip" });
    expect(queuedForTests()[1].props).toEqual({ vote: "skip" });
  });

  it("sends nothing from a crawler", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (compatible; bingbot/2.0)" });
    track("app_open", { source: "seo_name" });
    expect(queuedForTests()).toHaveLength(0);
  });

  it("does nothing when switched off", () => {
    vi.stubEnv("NEXT_PUBLIC_NAMES_ANALYTICS", "off");
    track("vote", { vote: "keep" });
    expect(queuedForTests()).toHaveLength(0);
  });
});
