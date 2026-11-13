import { describe, expect, it } from "vitest";
import {
  DUEL_TOP,
  currentPair,
  deserialize,
  duelAnnouncement,
  duelSource,
  duelTooFewText,
  isDone,
  pick,
  progress,
  ranking,
  readDuelSaves,
  resumeOrStart,
  roundText,
  sameNames,
  savedDuel,
  serialize,
  start,
  withDuel,
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

describe("source and resume (FR-W21)", () => {
  const names = POOL.slice(0, 6);
  const prefer = [...names];
  const choose = byPreference(prefer);

  it("keeps the source through a save", () => {
    const s = { ...start(names, SEED), source: "matches" as const };
    expect(deserialize(serialize(s))).toEqual(s);
    expect(deserialize(JSON.stringify({ ...s, source: "other" }))).toBeNull();
  });

  it("resumes the saved duel only for the same source and names", () => {
    const { state: fresh, restarted: r0 } = resumeOrStart(null, "saved", names, SEED);
    expect(r0).toBe(false);
    expect(fresh.source).toBe("saved");
    const mid = pick(fresh, choose(fresh));
    expect(resumeOrStart(mid, "saved", [...names].reverse(), 99)).toEqual({ state: mid, restarted: false });
    // Another source starts its own duel and the saved one isn't "restarted".
    const other = resumeOrStart(mid, "matches", names, 99);
    expect(other.restarted).toBe(false);
    expect(other.state.source).toBe("matches");
    expect(other.state.picks).toBe(0);
    // The list changed under a started duel: start over and say so.
    const changed = resumeOrStart(mid, "saved", [...names, "חדש"], 99);
    expect(changed.restarted).toBe(true);
    expect(changed.state.names).toContain("חדש");
    // A save without a source is a "שמרתי" duel.
    const legacy = { ...mid };
    delete legacy.source;
    expect(resumeOrStart(legacy, "saved", names, 99).state).toBe(legacy);
  });

  it("keeps one duel per source through a switch and back (INT-G3-01)", () => {
    const run3 = (s: DuelState) => [0, 1, 2].reduce((d) => pick(d, choose(d)), s);
    const savedMid = run3(resumeOrStart(null, "saved", names, SEED).state);
    let saves = withDuel(null, savedMid);
    const matches = resumeOrStart(savedDuel(saves, "matches"), "matches", names.slice(0, 4), 99).state;
    saves = withDuel(saves, pick(matches, choose(matches)));
    expect(saves.last).toBe("matches");
    expect(savedDuel(saves)?.source).toBe("matches");
    expect(resumeOrStart(savedDuel(saves, "saved"), "saved", names, 99)).toEqual({ state: savedMid, restarted: false });
    expect(savedDuel(saves, "matches")?.picks).toBe(1);
    expect(readDuelSaves(JSON.parse(JSON.stringify(saves)))).toEqual(saves);
    // A duel saved under the wrong source key is dropped.
    expect(readDuelSaves({ last: "saved", saved: { ...savedMid, source: "matches" } })).toBeNull();
    // A single duel (older saves) is the duel of its source.
    expect(readDuelSaves(savedMid)).toEqual({ last: "saved", saved: savedMid });
    expect(readDuelSaves(null)).toBeNull();
  });

  it("a finished duel over a changed list starts over quietly", () => {
    const done = run({ ...start(names, SEED), source: "saved" }, choose);
    expect(resumeOrStart(done, "saved", names, 99).state).toBe(done);
    expect(resumeOrStart(done, "saved", names.slice(1), 99).restarted).toBe(false);
  });

  it("picks the source to open with", () => {
    const savedDuel = { ...start(names, SEED), source: "matches" as const };
    expect(duelSource(null, null, 5, 0)).toBe("saved");
    expect(duelSource(null, null, 1, 3)).toBe("matches");
    expect(duelSource("matches", null, 5, 3)).toBe("matches");
    expect(duelSource("matches", null, 5, 1)).toBe("saved");
    expect(duelSource(null, savedDuel, 5, 3)).toBe("matches");
    expect(duelSource(null, savedDuel, 5, 1)).toBe("saved");
    expect(duelSource("saved", savedDuel, 5, 3)).toBe("saved");
    expect(duelSource("bogus", null, 5, 3)).toBe("saved");
  });

  it("writes the round and the screen reader line", () => {
    const s = start(["תמר", "לביא"], SEED);
    expect(roundText(progress(s))).toBe("סיבוב 1 מתוך 1");
    const pair = currentPair(s)!;
    expect(duelAnnouncement(s)).toBe(`סיבוב 1 מתוך 1: ${pair.a} או ${pair.b}`);
    const done = pick(s, "תמר");
    expect(duelAnnouncement(done)).toBe("הדו־קרב הסתיים. 1. תמר, 2. לביא");
  });
});

describe("too few names (COPY-G3-02)", () => {
  it("says the rule, and the count when the list has one", () => {
    expect(duelTooFewText("saved", 0)).toBe("לדו־קרב צריך לפחות שני שמות ברשימה.");
    expect(duelTooFewText("saved", 1)).toBe("לדו־קרב צריך לפחות שני שמות ברשימה, ויש בה אחד.");
    expect(duelTooFewText("matches", 0)).toBe("לדו־קרב צריך לפחות שתי התאמות.");
    expect(duelTooFewText("matches", 1)).toBe("לדו־קרב צריך לפחות שתי התאמות, ויש אחת.");
  });
});
