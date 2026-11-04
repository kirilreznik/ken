import { describe, expect, it } from "vitest";
import {
  JOIN_STORAGE_KEY,
  callbackUrl,
  clearPendingJoin,
  isInvalidCodeError,
  joinOutcome,
  normalizeJoinCode,
  readPendingJoin,
  rememberJoinCode,
  withJoin,
} from "@/lib/names/join";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe("normalizeJoinCode", () => {
  it("accepts URL-safe codes and trims", () => {
    expect(normalizeJoinCode(" AB12cd34 ")).toBe("AB12cd34");
  });

  it("rejects empty, short, long and unsafe values", () => {
    for (const bad of [null, undefined, "", "ab", "a".repeat(65), "AB 12", "../x", "<script>", "קוד12345"]) {
      expect(normalizeJoinCode(bad), String(bad)).toBeNull();
    }
  });
});

describe("readPendingJoin", () => {
  it("prefers ?join= and stores it", () => {
    const s = memoryStorage();
    s.setItem(JOIN_STORAGE_KEY, "OLDCODE1");
    expect(readPendingJoin("?join=NEWCODE2&x=1", s)).toBe("NEWCODE2");
    expect(s.map.get(JOIN_STORAGE_KEY)).toBe("NEWCODE2");
  });

  it("falls back to sessionStorage", () => {
    const s = memoryStorage();
    rememberJoinCode("ABCD1234", s);
    expect(readPendingJoin("", s)).toBe("ABCD1234");
  });

  it("ignores a malformed param and keeps the stored code", () => {
    const s = memoryStorage();
    rememberJoinCode("ABCD1234", s);
    expect(readPendingJoin("?join=%3Cbad%3E", s)).toBe("ABCD1234");
  });

  it("returns null when nothing is pending, and after clearing", () => {
    const s = memoryStorage();
    expect(readPendingJoin("", s)).toBeNull();
    rememberJoinCode("ABCD1234", s);
    clearPendingJoin(s);
    expect(readPendingJoin("", s)).toBeNull();
  });

  it("works without storage", () => {
    expect(readPendingJoin("?join=ABCD1234", null)).toBe("ABCD1234");
    expect(readPendingJoin("", null)).toBeNull();
  });

  it("survives a throwing storage", () => {
    const s = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(readPendingJoin("?join=ABCD1234", s)).toBe("ABCD1234");
    expect(readPendingJoin("", s)).toBeNull();
    expect(() => clearPendingJoin(s)).not.toThrow();
  });
});

describe("withJoin and callbackUrl", () => {
  it("adds the code as a query param", () => {
    expect(withJoin("/names/sign-in/email", "ABCD1234")).toBe("/names/sign-in/email?join=ABCD1234");
    expect(withJoin("/names/welcome?expired=1", "ABCD1234")).toBe("/names/welcome?expired=1&join=ABCD1234");
    expect(withJoin("/names/welcome#top", "ABCD1234")).toBe("/names/welcome?join=ABCD1234#top");
  });

  it("leaves the path alone without a code", () => {
    expect(withJoin("/names/sign-in/email", null)).toBe("/names/sign-in/email");
  });

  it("builds the OAuth redirect", () => {
    expect(callbackUrl("https://nestjourney.app", null)).toBe("https://nestjourney.app/names/auth/callback");
    expect(callbackUrl("https://nestjourney.app/", "ABCD1234")).toBe(
      "https://nestjourney.app/names/auth/callback?join=ABCD1234",
    );
  });
});

describe("names_join results", () => {
  it("recognises invalid_code", () => {
    expect(isInvalidCodeError({ message: "invalid_code" })).toBe(true);
    expect(isInvalidCodeError({ message: "network" })).toBe(false);
    expect(isInvalidCodeError(null)).toBe(false);
  });

  it("says votes move only from a solo space with saved names", () => {
    expect(joinOutcome({ spaceId: "a", solo: true, saved: 2 }, "b")).toEqual({ kind: "joined", spaceId: "b", votesMoved: true });
    expect(joinOutcome({ spaceId: "a", solo: true, saved: 0 }, "b")).toEqual({ kind: "joined", spaceId: "b", votesMoved: false });
    expect(joinOutcome({ spaceId: "a", solo: false, saved: 0 }, "b")).toEqual({ kind: "joined", spaceId: "b", votesMoved: false });
    expect(joinOutcome({ spaceId: null, solo: false, saved: 0 }, "b")).toEqual({ kind: "joined", spaceId: "b", votesMoved: false });
  });

  it("treats the same space back as already a member", () => {
    expect(joinOutcome({ spaceId: "a", solo: true, saved: 3 }, "a")).toEqual({ kind: "already", spaceId: "a" });
  });
});
