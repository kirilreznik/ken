import { beforeEach, describe, expect, it, vi } from "vitest";
import { failureKind, markSigninFrom, takeSigninFrom } from "@/lib/names/signinFrom";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, String(v)),
  };
}

beforeEach(() => {
  vi.stubGlobal("window", { sessionStorage: memoryStorage() });
});

describe("signinFrom", () => {
  it("returns the marked prompt once, then falls back", () => {
    markSigninFrom("wall", 1_000);
    expect(takeSigninFrom(false, 2_000)).toBe("wall");
    expect(takeSigninFrom(false, 3_000)).toBe("welcome");
    expect(takeSigninFrom(true, 3_000)).toBe("invite");
  });

  it("forgets a mark older than an hour", () => {
    markSigninFrom("ai", 0);
    expect(takeSigninFrom(false, 60 * 60 * 1000)).toBe("welcome");
  });

  it("works without storage", () => {
    vi.stubGlobal("window", {});
    markSigninFrom("nudge");
    expect(takeSigninFrom(false)).toBe("welcome");
  });

  it("maps error kinds to analytics tokens", () => {
    expect(failureKind("signups-closed")).toBe("closed");
    expect(failureKind("wrong-code")).toBe("wrong_code");
    expect(failureKind("rate-limit")).toBe("rate_limit");
    expect(failureKind("offline")).toBe("offline");
    expect(failureKind("something")).toBe("other");
  });
});
