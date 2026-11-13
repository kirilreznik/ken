import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPref, setPref } from "@/lib/names/prefs";
import { pairing, pairsAmong, rhymeTail, twinsFor, type TwinCard } from "@/lib/names/twins";

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
beforeEach(() => vi.stubGlobal("localStorage", memoryStorage()));
afterEach(() => vi.unstubAllGlobals());


const card = (name: string, he: string, extra: Partial<TwinCard["content"]> = {}, sexTag: "בן" | "בת" = "בן"): TwinCard => ({
  stats: { name },
  content: { latin: { he }, ...extra },
  derived: { sexTag },
});

const ariel = card("אריאל", "Ariel", { meanings: ["lion"] });
const uriel = card("אוריאל", "Uriel", { meanings: ["light"] });
const lavi = card("לביא", "Lavi", { meanings: ["lion"] });
const ariela = card("אריאלה", "Ariela", { meanings: ["lion"] }, "בת");
const maya = card("מאיה", "Maya", {}, "בת");
const noya = card("נויה", "Noya", {}, "בת");
const dan = card("דן", "Dan");

describe("pairing", () => {
  it("rhymes on the last syllable", () => {
    expect(rhymeTail("Ariel")).toBe("riel");
    expect(rhymeTail("Maya")).toBe("ya");
    expect(pairing(maya, noya)?.reasons).toEqual(["מתחרזים"]);
  });
  it("pairs on letter, meaning and says why", () => {
    expect(pairing(ariel, uriel)).toBeNull();
    expect(pairing(ariel, lavi)?.reasons).toEqual(["אותה משמעות: אריה"]);
    expect(pairing(ariel, card("אדם", "Adam"))?.reasons).toEqual(["אותה אות ראשונה"]);
  });
  it("never pairs a name with another form of itself", () => {
    expect(pairing(ariel, ariela, (n) => (n === "אריאל" ? ["אריאלה"] : []))).toBeNull();
    expect(pairing(dan, card("דן", "Dan"))).toBeNull();
  });
});

describe("twinsFor and pairsAmong", () => {
  const all = [ariel, lavi, ariela, maya, noya, dan];
  it("follows the sex filter and leaves out skipped names", () => {
    const votes = new Map([["לביא", "skip" as const]]);
    expect(twinsFor(ariel, all, { votes }).map((t) => t.name)).toEqual(["אריאלה"]);
    expect(twinsFor(ariel, all, { sex: ["בן"] }).map((t) => t.name)).toEqual(["לביא"]);
  });
  it("makes pairs from saved names, best first", () => {
    expect(pairsAmong([maya, noya, dan]).map((p) => p.names)).toEqual([["מאיה", "נויה"]]);
  });
  it("keeps the settings switch on the device", () => {
    expect(getPref("u2", "twins")).toBe(false);
    setPref("u2", "twins", true);
    expect(getPref("u2", "twins")).toBe(true);
  });
});
