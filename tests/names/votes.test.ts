import { describe, expect, it } from "vitest";
import type { Vote } from "@/lib/names/types";
import {
  UNDO_LIMIT,
  applyVote,
  canUndo,
  emptyVoteState,
  isSaved,
  savedNames,
  undo,
  type VoteState,
} from "@/lib/names/votes";

const vote = (state: VoteState, name: string, v: Vote) => applyVote(state, name, v).state;
const entries = (state: VoteState) => [...state.votes.entries()];

describe("applyVote", () => {
  const votes: Vote[] = ["keep", "love", "skip", "hidden"];

  it.each(votes)("records %s on a new name with previous = null", (v) => {
    const start = emptyVoteState();
    const { state, entry } = applyVote(start, "נועם", v);
    expect(state.votes.get("נועם")).toBe(v);
    expect(entry).toEqual({ name: "נועם", previous: null });
    expect(state.undo).toEqual([entry]);
    expect(start.votes.size).toBe(0);
    expect(start.undo).toEqual([]);
  });

  it.each(votes.flatMap((from) => votes.map((to) => [from, to] as const)))(
    "changes %s to %s, latest vote wins, previous recorded",
    (from, to) => {
      const s1 = vote(emptyVoteState(), "יעל", from);
      const { state, entry } = applyVote(s1, "יעל", to);
      expect(state.votes.get("יעל")).toBe(to);
      expect(state.votes.size).toBe(1);
      expect(entry).toEqual({ name: "יעל", previous: from });
    },
  );

  it("moves a changed vote to the end of the order", () => {
    let s = vote(emptyVoteState(), "א", "keep");
    s = vote(s, "ב", "keep");
    s = vote(s, "א", "skip");
    expect(entries(s)).toEqual([["ב", "keep"], ["א", "skip"]]);
  });

  it("starts from existing votes", () => {
    const s = emptyVoteState(new Map<string, Vote>([["זיו", "love"]]));
    expect(canUndo(s)).toBe(false);
    expect(applyVote(s, "זיו", "skip").entry.previous).toBe("love");
  });
});

describe("undo", () => {
  it("removes a first vote", () => {
    const s = vote(emptyVoteState(), "נועם", "keep");
    const { state, entry } = undo(s);
    expect(entry).toEqual({ name: "נועם", previous: null });
    expect(state.votes.has("נועם")).toBe(false);
    expect(canUndo(state)).toBe(false);
  });

  it("restores the previous vote after a vote change", () => {
    let s = vote(emptyVoteState(), "יעל", "love");
    s = vote(s, "יעל", "hidden");
    const once = undo(s).state;
    expect(once.votes.get("יעל")).toBe("love");
    const twice = undo(once).state;
    expect(twice.votes.has("יעל")).toBe(false);
  });

  it("restores a vote that existed before the session", () => {
    const s = vote(emptyVoteState(new Map<string, Vote>([["זיו", "keep"]])), "זיו", "skip");
    expect(undo(s).state.votes.get("זיו")).toBe("keep");
  });

  it("goes back in reverse order", () => {
    let s = emptyVoteState();
    for (const [n, v] of [["א", "keep"], ["ב", "skip"], ["ג", "love"]] as const) s = vote(s, n, v);
    const names: string[] = [];
    while (canUndo(s)) {
      const r = undo(s);
      names.push(r.entry!.name);
      s = r.state;
    }
    expect(names).toEqual(["ג", "ב", "א"]);
    expect(s.votes.size).toBe(0);
  });

  it("does nothing on an empty stack", () => {
    const s = emptyVoteState(new Map<string, Vote>([["זיו", "keep"]]));
    const r = undo(s);
    expect(r.entry).toBeNull();
    expect(r.state).toBe(s);
  });

  it(`keeps only the last ${UNDO_LIMIT} steps`, () => {
    let s = emptyVoteState();
    const names = Array.from({ length: 12 }, (_, i) => `שם${i}`);
    for (const n of names) s = vote(s, n, "keep");
    expect(UNDO_LIMIT).toBe(10);
    expect(s.undo).toHaveLength(10);
    expect(s.undo[0].name).toBe("שם2");
    for (let i = 0; i < 10; i++) s = undo(s).state;
    expect(canUndo(s)).toBe(false);
    expect(undo(s).entry).toBeNull();
    // The two oldest votes are past the cap and stay.
    expect(entries(s)).toEqual([["שם0", "keep"], ["שם1", "keep"]]);
  });
});

describe("saved list", () => {
  it("love counts as keep", () => {
    expect(isSaved("keep")).toBe(true);
    expect(isSaved("love")).toBe(true);
    expect(isSaved("skip")).toBe(false);
    expect(isSaved("hidden")).toBe(false);
    expect(isSaved(null)).toBe(false);
    expect(isSaved(undefined)).toBe(false);
  });

  it("lists loved names first, then kept, in vote order, without skipped or hidden", () => {
    let s = emptyVoteState();
    for (const [n, v] of [["א", "keep"], ["ב", "love"], ["ג", "skip"], ["ד", "keep"], ["ה", "love"], ["ו", "hidden"]] as const)
      s = vote(s, n, v);
    expect(savedNames(s.votes)).toEqual([
      { name: "ב", vote: "love" },
      { name: "ה", vote: "love" },
      { name: "א", vote: "keep" },
      { name: "ד", vote: "keep" },
    ]);
    s = vote(s, "א", "love");
    expect(savedNames(s.votes).map((x) => x.name)).toEqual(["ב", "ה", "א", "ד"]);
  });
});
