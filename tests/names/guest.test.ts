import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GUEST_ID,
  GUEST_LIMIT,
  carryGuestPrefs,
  createGuestVoteStore,
  guestLeftLine,
  guestPrompt,
  importGuestVotes,
  readGuestVotes,
  resetGuestForTests,
  votesToImport,
} from "@/lib/names/guest";
import { getPref, prefKey, setPref } from "@/lib/names/prefs";
import type { StoredVote } from "@/lib/names/voteStore";

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

beforeEach(async () => {
  vi.stubGlobal("localStorage", memoryStorage());
  await resetGuestForTests();
});

const vote = (name: string, v: StoredVote["vote"], at: string): StoredVote => ({ name, vote: v, custom: false, updatedAt: at });

describe("guest vote store", () => {
  it("keeps votes on the device across stores and counts each name once", async () => {
    const a = createGuestVoteStore();
    await a.load();
    a.setVote("נועה", "keep");
    a.setVote("איתי", "skip");
    a.removeVote("איתי"); // undo
    a.setVote("איתי", "love"); // decided again: still one decision
    expect(a.decidedCount()).toBe(2);
    await a.dispose();

    const b = createGuestVoteStore();
    await b.load();
    expect([...b.getState().votes.keys()]).toEqual(["נועה", "איתי"]);
    expect(b.getState().pendingCount).toBe(0);
    expect(b.decidedCount()).toBe(2);
  });

  it("keeps the count when only IndexedDB was cleared", async () => {
    const a = createGuestVoteStore();
    await a.load();
    for (let i = 0; i < 5; i++) a.setVote(`שם${i}`, "skip");
    await a.dispose();
    const ls = localStorage;
    await resetGuestForTests();
    vi.stubGlobal("localStorage", ls);
    localStorage.setItem("nest-names-guest-count", "5");
    const b = createGuestVoteStore();
    await b.load();
    expect(b.decidedCount()).toBe(5);
  });
});

describe("guestPrompt", () => {
  it("shows a card every 20 decisions until put aside, and the wall at the limit", () => {
    expect(guestPrompt(0, 0)).toBeNull();
    expect(guestPrompt(19, 0)).toBeNull();
    expect(guestPrompt(20, 0)).toBe("nudge");
    expect(guestPrompt(25, 20)).toBeNull();
    expect(guestPrompt(40, 20)).toBe("nudge");
    expect(guestPrompt(GUEST_LIMIT - 1, 80)).toBeNull();
    expect(guestPrompt(GUEST_LIMIT, GUEST_LIMIT)).toBe("wall");
    expect(guestPrompt(GUEST_LIMIT + 7, 0)).toBe("wall");
  });

  it("says how many decisions are left", () => {
    expect(guestLeftLine(20)).toBe("נשארו עוד 80 החלטות לפני שצריך להתחבר.");
    expect(guestLeftLine(99)).toBe("נשארה עוד החלטה אחת לפני שצריך להתחבר.");
  });
});

describe("importing guest votes", () => {
  it("never replaces a vote the account already has, and keeps the order", () => {
    const guest = [vote("ב", "keep", "2026-11-13T10:00:02Z"), vote("א", "love", "2026-11-13T10:00:01Z"), vote("ג", "skip", "2026-11-13T10:00:03Z")];
    const account = new Map([["ג", {}]]);
    expect(votesToImport(guest, account).map((v) => v.name)).toEqual(["א", "ב"]);
  });

  it("writes the guest votes into the account store, then removes them from the device", async () => {
    const g = createGuestVoteStore();
    await g.load();
    g.setVote("נועה", "keep");
    g.setVote("איתי", "hidden");
    await g.dispose();

    const written: [string, string][] = [];
    const n = await importGuestVotes({ setVote: (name, v) => void written.push([name, v]) }, new Map([["איתי", {}]]));
    expect(n).toBe(1);
    expect(written).toEqual([["נועה", "keep"]]);
    expect(await readGuestVotes()).toEqual([]);
    // The count stays: signing out doesn't give a fresh 100.
    const after = createGuestVoteStore();
    await after.load();
    expect(after.decidedCount()).toBe(2);
  });
});

describe("carryGuestPrefs", () => {
  it("moves guest prefs to the account without overwriting the account's own", () => {
    setPref(GUEST_ID, "surname", "כהן");
    setPref(GUEST_ID, "twins", true);
    setPref("u1", "twins", false);
    carryGuestPrefs("u1");
    expect(getPref("u1", "surname")).toBe("כהן");
    expect(getPref("u1", "twins")).toBe(false);
    expect(localStorage.getItem(prefKey(GUEST_ID, "surname"))).toBeNull();
  });
});
