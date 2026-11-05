import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearLocalData, isJoinPath, isPublicPath, safeNext, welcomeUrl } from "@/lib/names/auth";
import { loadOwnPhoto, saveOwnPhoto } from "@/lib/names/photo";
import { prefKey, setPref } from "@/lib/names/prefs";

describe("isPublicPath", () => {
  it.each([
    "/names/welcome",
    "/names/welcome/",
    "/names/sign-in/email",
    "/names/auth/callback",
    "/names/privacy",
    "/names/terms",
    "/names/about",
    "/names/join/ABCD1234",
  ])("%s is public", (p) => expect(isPublicPath(p)).toBe(true));

  it.each(["/names", "/names/", "/names/lists", "/names/intro", "/names/onboarding", "/names/settings", "/names/invite", "/names/hidden", "/names/welcomex", "/names/joiner"])(
    "%s needs a session",
    (p) => expect(isPublicPath(p)).toBe(false),
  );
});

describe("isJoinPath", () => {
  it("matches only /names/join/{code}", () => {
    expect(isJoinPath("/names/join/ABCD1234")).toBe(true);
    expect(isJoinPath("/names/join")).toBe(false);
    expect(isJoinPath("/names/join/A/B")).toBe(false);
  });
});

describe("welcomeUrl", () => {
  it("is plain welcome for app pages", () => {
    expect(welcomeUrl("/names")).toBe("/names/welcome");
    expect(welcomeUrl("/names/lists")).toBe("/names/welcome");
  });
  it("keeps join links in ?next=", () => {
    expect(welcomeUrl("/names/join/ABCD1234")).toBe("/names/welcome?next=%2Fnames%2Fjoin%2FABCD1234");
  });
  it("adds expired=1 after a rejected refresh token", () => {
    expect(welcomeUrl("/names", { expired: true })).toBe("/names/welcome?expired=1");
  });
});

describe("safeNext", () => {
  it("accepts /names paths", () => {
    expect(safeNext("/names/join/ABCD1234")).toBe("/names/join/ABCD1234");
    expect(safeNext("/names")).toBe("/names");
    expect(safeNext("/names/lists?tab=duel")).toBe("/names/lists?tab=duel");
  });
  it.each([null, "", "https://evil.example/names", "//evil.example/names", "/\\evil.example", "/pregnancy", "/namesx", "/names/../api/x", "names/lists"])(
    "rejects %s",
    (v) => expect(safeNext(v)).toBeNull(),
  );
});

describe("clearLocalData", () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      get length() {
        return store.size;
      },
      key: (i: number) => [...store.keys()][i] ?? null,
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("removes this user's prefs and photo, and nobody else's", async () => {
    setPref("u1", "surname", "כהן");
    setPref("u2", "surname", "לוי");
    store.set("nest-names-auth", "{}");
    await saveOwnPhoto("u1", new Blob(["a"]));
    await saveOwnPhoto("u2", new Blob(["b"]));

    await clearLocalData("u1");

    expect(store.has(prefKey("u1", "surname"))).toBe(false);
    expect(store.has(prefKey("u2", "surname"))).toBe(true);
    expect(store.has("nest-names-auth")).toBe(true);
    expect(await loadOwnPhoto("u1")).toBeNull();
    expect(await loadOwnPhoto("u2")).not.toBeNull();
  });
});
