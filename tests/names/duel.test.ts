import { describe, expect, it } from "vitest";
import {
  DUEL_TOP,
  currentPair,
  deserialize,
  isDone,
  pick,
  progress,
  ranking,
  sameNames,
  serialize,
  start,
  type DuelState,
} from "@/lib/names/duel";

const POOL = ["אריאל", "יעל", "תמר", "לביא", "אביגיל", "אלה", "עמית", "נועם", "זיו", "שירה", "יונתן", "מאיה"];
const SEED = 1234567;

/** Picks by a hidden preference: the earlier in `prefer`, the better. */
const byPreference = (prefer: readonly string[]) => (s: DuelState) => {
  const pair = currentPair(s)!;
  return prefer.indexOf(pair.a) < prefer.indexOf(pair.b) ? pair.a : pair.b;
};

function run(state: DuelState, choose: (s: DuelState) => string, onStep?: (s: DuelState) => void): DuelState {
  let s = state;
  for (let guard = 0; !isDone(s) && guard < 1000; guard++) {
    s = pick(s, choose(s));
    onStep?.(s);
  }
  return s;
}

describe.each([2, 3, 5, 8, 12])("a duel of %i names", (n) => {
  const names = POOL.slice(0, n);
  const prefer = [...names].reverse();

  it("ends in the true top 5 (or fewer), best first", () => {
    const s = run(start(names, SEED), byPreference(prefer));
    expect(isDone(s)).toBe(true);
    expect(ranking(s)).toEqual(prefer.slice(0, Math.min(n, DUEL_TOP)));
    expect(currentPair(s)).toBeNull();
  });

  it("counts rounds: the total never grows and the last round fits in it", () => {
    let s = start(names, SEED);
    const first = progress(s);
    expect(first.round).toBe(1);
    expect(first.percent).toBe(0);
    let total = first.total;
    s = run(s, byPreference(prefer), (next) => {
      const p = progress(next);
      expect(p.total).toBeLessThanOrEqual(total);
      expect(p.round).toBeLessThanOrEqual(p.total);
      total = p.total;
    });
    const end = progress(s);
    expect(end.round).toBe(s.picks);
    expect(end.total).toBe(s.picks);
    expect(end.percent).toBe(100);
  });

  it("each pair is two different names from the list", () => {
    run(start(names, SEED), (s) => {
      const pair = currentPair(s)!;
      expect(pair.a).not.toBe(pair.b);
      expect(names).toContain(pair.a);
      expect(names).toContain(pair.b);
      return pair.b;
    });
  });
});

describe("worst-case round counts", () => {
  it.each([
    [2, 1],
    [3, 3],
    [5, 8],
    [8, 17],
    [12, 29],
  ])("%i names take at most %i rounds", (n, max) => {
    expect(progress(start(POOL.slice(0, n), SEED)).total).toBe(max);
  });
});

describe("fewer than 2 names", () => {
  it("is done at once", () => {
    expect(isDone(start([], SEED))).toBe(true);
    const one = start(["יעל"], SEED);
    expect(isDone(one)).toBe(true);
    expect(ranking(one)).toEqual(["יעל"]);
    expect(progress(one)).toEqual({ round: 0, total: 0, percent: 100 });
  });

  it("drops duplicates and empty names", () => {
    const s = start(["יעל", "יעל", ""], SEED);
    expect(s.names).toEqual(["יעל"]);
    expect(isDone(s)).toBe(true);
  });
});

describe("determinism", () => {
  const names = POOL.slice(0, 8);
  const pairs = (seed: number, input = names) => {
    const seen: string[] = [];
    run(start(input, seed), (s) => {
      const p = currentPair(s)!;
      seen.push(`${p.a}|${p.b}`);
      return p.a;
    });
    return seen;
  };

  it("the same seed gives the same pairs, whatever the input order", () => {
    expect(pairs(SEED)).toEqual(pairs(SEED));
    expect(pairs(SEED, [...names].reverse())).toEqual(pairs(SEED));
  });

  it("a different seed gives a different order", () => {
    expect(pairs(SEED + 1)).not.toEqual(pairs(SEED));
  });

  it("a pick that isn't on screen changes nothing", () => {
    const s = start(names, SEED);
    expect(pick(s, "לא בדו־קרב")).toBe(s);
    const done = run(s, (x) => currentPair(x)!.a);
    expect(pick(done, ranking(done)[0])).toBe(done);
  });
});

describe("save and resume", () => {
  const names = POOL;
  const prefer = ["זיו", "מאיה", "אלה", "תמר", "נועם", "יעל", "אריאל", "לביא", "אביגיל", "עמית", "שירה", "יונתן"];
  const choose = byPreference(prefer);

  it("resuming from JSON mid-way ends where an unbroken duel does", () => {
    const straight = run(start(names, SEED), choose);
    let s = start(names, SEED);
    for (let i = 0; i < 7; i++) s = pick(s, choose(s));
    const text = serialize(s);
    const resumed = deserialize(text);
    expect(resumed).toEqual(s);
    expect(progress(resumed!)).toEqual(progress(s));
    expect(currentPair(resumed!)).toEqual(currentPair(s));
    const end = run(resumed!, choose);
    expect(ranking(end)).toEqual(ranking(straight));
    expect(ranking(end)).toEqual(prefer.slice(0, DUEL_TOP));
    expect(end.picks).toBe(straight.picks);
  });

  it("a finished duel round-trips too", () => {
    const done = run(start(names, SEED), choose);
    expect(deserialize(serialize(done))).toEqual(done);
  });

  it("rejects malformed or inconsistent saves", () => {
    const s = pick(start(names, SEED), choose(start(names, SEED)));
    const bad = (patch: Partial<Record<keyof DuelState, unknown>>) => deserialize(JSON.stringify({ ...s, ...patch }));
    expect(deserialize(null)).toBeNull();
    expect(deserialize("")).toBeNull();
    expect(deserialize("{not json")).toBeNull();
    expect(deserialize("[]")).toBeNull();
    expect(bad({ version: 2 })).toBeNull();
    expect(bad({ names: ["יעל", "יעל"] })).toBeNull();
    expect(bad({ ranked: ["לא ברשימה"] })).toBeNull();
    expect(bad({ next: names.length + 1 })).toBeNull();
    expect(bad({ lo: 1, hi: 1 })).toBeNull();
    expect(bad({ picks: -1 })).toBeNull();
    expect(bad({ seed: "1" })).toBeNull();
  });

  it("sameNames tells whether the saved duel still matches the list", () => {
    const s = start(names, SEED);
    expect(sameNames(s, [...names].reverse())).toBe(true);
    expect(sameNames(s, names.slice(1))).toBe(false);
    expect(sameNames(s, [...names.slice(1), "חדש"])).toBe(false);
  });
});
