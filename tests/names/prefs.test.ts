import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { start, pick, currentPair } from "@/lib/names/duel";
import { defaultFilters } from "@/lib/names/filters";
import { clearAll, defaultPref, getPref, openPrefs, prefKey, removePref, setPref, subscribePrefs } from "@/lib/names/prefs";

/** Minimal in-memory Storage. */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
}

let ls: MemoryStorage;
beforeEach(() => {
  ls = new MemoryStorage();
  vi.stubGlobal("localStorage", ls);
  for (const u of [U, "u", "user-2"]) openPrefs(u);
});
afterEach(() => vi.unstubAllGlobals());

const U = "user-1";

describe("defaults", () => {
  it("returns the defaults when nothing is stored", () => {
    expect(getPref(U, "surname")).toBe("");
    expect(getPref(U, "filters")).toEqual(defaultFilters());
    expect(getPref(U, "background")).toBe("fabric");
    expect(getPref(U, "introSeen")).toBe(false);
    expect(getPref(U, "seenMatches")).toEqual([]);
    expect(getPref(U, "duelState")).toBeNull();
    expect(getPref(U, "installHintDismissed")).toBe(false);
    expect(getPref(U, "lastSpace")).toBeNull();
    expect(getPref(U, "invitePromptShown")).toBe(false);
    expect(getPref(U, "recapSession")).toBeNull();
    expect(getPref(U, "sessions")).toEqual({ last: null, count: 0 });
    expect(getPref(U, "survey")).toBeNull();
    expect(getPref(U, "chosen")).toBeNull();
    expect(defaultPref("background")).toBe("fabric");
  });

  it("returns defaults without localStorage (server)", () => {
    vi.stubGlobal("localStorage", undefined);
    expect(getPref(U, "background")).toBe("fabric");
    expect(setPref(U, "background", "none")).toBe(false);
    expect(() => clearAll(U)).not.toThrow();
  });

  it("returns defaults when storage throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    vi.stubGlobal("localStorage", broken);
    expect(getPref(U, "introSeen")).toBe(false);
    expect(setPref(U, "introSeen", true)).toBe(false);
  });
});

describe("get/set round trip", () => {
  it("stores JSON under nest-names:{userId}:{key}", () => {
    expect(setPref(U, "background", "nursery")).toBe(true);
    expect(ls.getItem("nest-names:user-1:background")).toBe('"nursery"');
    expect(prefKey(U, "surname")).toBe("nest-names:user-1:surname");
  });

  it("round-trips every key", () => {
    const filters = { ...defaultFilters(), sex: "בת" as const, letter: "א", origin: "J" as const };
    let duel = start(["נועם", "יעל", "אריאל"], 7);
    duel = pick(duel, currentPair(duel)!.a);
    setPref(U, "surname", "כהן");
    setPref(U, "filters", filters);
    setPref(U, "background", "own");
    setPref(U, "introSeen", true);
    setPref(U, "seenMatches", ["נועם", "יעל"]);
    setPref(U, "duelState", { last: "saved", saved: duel });
    setPref(U, "installHintDismissed", true);
    expect(getPref(U, "surname")).toBe("כהן");
    expect(getPref(U, "filters")).toEqual(filters);
    expect(getPref(U, "background")).toBe("own");
    expect(getPref(U, "introSeen")).toBe(true);
    expect(getPref(U, "seenMatches")).toEqual(["נועם", "יעל"]);
    expect(getPref(U, "duelState")).toEqual({ last: "saved", saved: duel });
    expect(getPref(U, "installHintDismissed")).toBe(true);
  });

  it("keeps the last space and drops malformed members", () => {
    const member = { userId: "u1", displayName: "QA", joinedAt: "2026-11-01T00:00:00Z" };
    setPref(U, "lastSpace", { spaceId: "s1", members: [member] });
    expect(getPref(U, "lastSpace")).toEqual({ spaceId: "s1", members: [member] });
    ls.setItem(prefKey(U, "lastSpace"), JSON.stringify({ spaceId: "s1", members: [member, { userId: 3 }] }));
    expect(getPref(U, "lastSpace")?.members).toEqual([member]);
    ls.setItem(prefKey(U, "lastSpace"), JSON.stringify({ spaceId: "", members: [] }));
    expect(getPref(U, "lastSpace")).toBeNull();
  });

  it("keeps users apart", () => {
    setPref(U, "surname", "כהן");
    expect(getPref("user-2", "surname")).toBe("");
  });

  it("removePref resets one key", () => {
    setPref(U, "introSeen", true);
    removePref(U, "introSeen");
    expect(getPref(U, "introSeen")).toBe(false);
  });
});

describe("safe parse", () => {
  const raw = (key: string, text: string) => ls.setItem(`nest-names:${U}:${key}`, text);

  it("falls back on broken JSON", () => {
    raw("background", "{not json");
    raw("filters", "[");
    expect(getPref(U, "background")).toBe("fabric");
    expect(getPref(U, "filters")).toEqual(defaultFilters());
  });

  it("falls back on wrong types and unknown values", () => {
    raw("background", '"beach"');
    raw("surname", "42");
    raw("introSeen", '"yes"');
    raw("seenMatches", '{"a":1}');
    expect(getPref(U, "background")).toBe("fabric");
    expect(getPref(U, "surname")).toBe("");
    expect(getPref(U, "introSeen")).toBe(false);
    expect(getPref(U, "seenMatches")).toEqual([]);
  });

  it("drops non-strings from seenMatches", () => {
    raw("seenMatches", '["נועם", 3, null, "יעל"]');
    expect(getPref(U, "seenMatches")).toEqual(["נועם", "יעל"]);
  });

  it("keeps valid filter groups and resets invalid ones", () => {
    raw("filters", JSON.stringify({ sex: "בן", popularity: "huge", trend: "יציב", letter: "אב", length: "ארוך", origin: "X" }));
    expect(getPref(U, "filters")).toEqual({ ...defaultFilters(), sex: "בן", trend: "יציב", length: "ארוך" });
  });

  it("rejects a malformed duel", () => {
    raw("duelState", JSON.stringify({ version: 2 }));
    expect(getPref(U, "duelState")).toBeNull();
    raw("duelState", "null");
    expect(getPref(U, "duelState")).toBeNull();
    raw("duelState", JSON.stringify({ last: "saved", saved: { version: 2 } }));
    expect(getPref(U, "duelState")).toBeNull();
  });

  it("reads a single saved duel as the duel of its source", () => {
    const duel = { ...start(["נועם", "יעל", "אריאל"], 7), source: "matches" as const };
    raw("duelState", JSON.stringify(duel));
    expect(getPref(U, "duelState")).toEqual({ last: "matches", matches: duel });
  });
});

describe("clearAll", () => {
  it("removes every nest-names key of that user only", () => {
    setPref(U, "surname", "כהן");
    setPref(U, "background", "none");
    ls.setItem(`nest-names:${U}:somethingElse`, "1");
    setPref("user-2", "surname", "לוי");
    ls.setItem("nest-names-auth", "{}");
    ls.setItem("other", "x");
    clearAll(U);
    expect(getPref(U, "surname")).toBe("");
    expect(ls.getItem(`nest-names:${U}:somethingElse`)).toBeNull();
    expect(getPref("user-2", "surname")).toBe("לוי");
    expect(ls.getItem("nest-names-auth")).toBe("{}");
    expect(ls.getItem("other")).toBe("x");
    expect(ls.length).toBe(3);
  });

  it("drops a late write after sign-out until the user signs in again", () => {
    clearAll("late");
    expect(setPref("late", "lastSpace", { spaceId: "s", members: [] })).toBe(false);
    expect(ls.getItem(prefKey("late", "lastSpace"))).toBeNull();
    expect(setPref("other", "surname", "כהן")).toBe(true);
    openPrefs("late");
    expect(setPref("late", "surname", "לוי")).toBe(true);
    expect(getPref("late", "surname")).toBe("לוי");
  });
});

describe("subscribePrefs", () => {
  it("notifies on set, remove and clearAll until unsubscribed", () => {
    const calls = vi.fn();
    const stop = subscribePrefs(calls);
    setPref("u", "background", "none");
    removePref("u", "background");
    clearAll("u");
    expect(calls).toHaveBeenCalledTimes(3);
    stop();
    setPref("u", "background", "fabric");
    expect(calls).toHaveBeenCalledTimes(3);
  });
});

describe("launch pack prefs", () => {
  it("keep valid values and drop broken ones", () => {
    setPref(U, "chosen", { spaceId: "s1", name: "נועה" });
    expect(getPref(U, "chosen")).toEqual({ spaceId: "s1", name: "נועה" });
    localStorage.setItem(prefKey(U, "chosen"), JSON.stringify({ spaceId: "", name: "x" }));
    expect(getPref(U, "chosen")).toBeNull();
    localStorage.setItem(prefKey(U, "sessions"), JSON.stringify({ last: "a", count: -3 }));
    expect(getPref(U, "sessions")).toEqual({ last: "a", count: 0 });
    localStorage.setItem(prefKey(U, "survey"), JSON.stringify("maybe"));
    expect(getPref(U, "survey")).toBeNull();
  });
});
