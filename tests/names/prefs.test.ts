import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { start, pick, currentPair } from "@/lib/names/duel";
import { defaultFilters } from "@/lib/names/filters";
import { clearAll, defaultPref, getPref, prefKey, removePref, setPref } from "@/lib/names/prefs";

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
    setPref(U, "duelState", duel);
    setPref(U, "installHintDismissed", true);
    expect(getPref(U, "surname")).toBe("כהן");
    expect(getPref(U, "filters")).toEqual(filters);
    expect(getPref(U, "background")).toBe("own");
    expect(getPref(U, "introSeen")).toBe(true);
    expect(getPref(U, "seenMatches")).toEqual(["נועם", "יעל"]);
    expect(getPref(U, "duelState")).toEqual(duel);
    expect(getPref(U, "installHintDismissed")).toBe(true);
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
});
