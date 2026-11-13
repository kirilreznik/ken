import { describe, expect, it } from "vitest";
import {
  INVITE_PROMPT_SAVES,
  choiceClearedText,
  choiceRestoredText,
  clearChoiceLabel,
  RECAP_VOTES,
  countSession,
  decideLabel,
  decisionTitle,
  pauseAfterVote,
  pauseToShow,
  recapLine,
  sessionTotals,
  surveyDue,
} from "@/lib/names/launch";
import type { StoredVote } from "@/lib/names/voteStore";

const at = (min: number) => new Date(Date.UTC(2026, 10, 6, 12, min)).toISOString();
const start = Date.UTC(2026, 10, 6, 12, 10);

function votes(list: [string, StoredVote["vote"], number, boolean?][]): Map<string, StoredVote> {
  return new Map(list.map(([name, vote, min, custom]) => [name, { name, vote, updatedAt: at(min), custom: custom ?? false }]));
}

describe("sessionTotals", () => {
  it("counts this session's decisions on deck names, loved first then newest", () => {
    const t = sessionTotals(
      votes([
        ["אורי", "keep", 5], // before the session
        ["נועה", "keep", 11],
        ["יעל", "skip", 12],
        ["זיו", "love", 13],
        ["תמר", "keep", 14],
        ["שלי", "keep", 15, true], // custom
      ]),
      start,
    );
    expect(t).toEqual({ votes: 4, saves: 3, names: ["זיו", "תמר", "נועה"] });
  });
});

describe("pauseToShow", () => {
  const base = { solo: true, savedCount: 0, invitePromptShown: false, sessionId: "s1", sessionVotes: 0, recapSession: null };

  it("asks a solo user to choose together after the 5th save, once", () => {
    expect(pauseToShow({ ...base, savedCount: INVITE_PROMPT_SAVES - 1 })).toBeNull();
    expect(pauseToShow({ ...base, savedCount: INVITE_PROMPT_SAVES })).toBe("invite");
    expect(pauseToShow({ ...base, savedCount: 9, invitePromptShown: true })).toBeNull();
    expect(pauseToShow({ ...base, savedCount: 9, solo: false })).toBeNull();
  });

  it("shows the recap after 30 decisions, once per session", () => {
    expect(pauseToShow({ ...base, sessionVotes: RECAP_VOTES - 1 })).toBeNull();
    expect(pauseToShow({ ...base, sessionVotes: RECAP_VOTES })).toBe("recap");
    expect(pauseToShow({ ...base, sessionVotes: 40, recapSession: "s1" })).toBeNull();
    expect(pauseToShow({ ...base, sessionVotes: 40, recapSession: "s0" })).toBe("recap");
    expect(pauseToShow({ ...base, sessionVotes: 40, sessionId: null })).toBeNull();
  });

  it("puts the invite prompt first", () => {
    expect(pauseToShow({ ...base, savedCount: 6, sessionVotes: 40 })).toBe("invite");
  });
});

describe("countSession and surveyDue", () => {
  it("counts a new session id once", () => {
    let s = countSession({ last: null, count: 0 }, "a");
    expect(s).toEqual({ last: "a", count: 1 });
    s = countSession(s, "a");
    expect(s.count).toBe(1);
    s = countSession(s, "b");
    expect(s).toEqual({ last: "b", count: 2 });
  });

  it("offers the survey from the 2nd session with 50 decisions, until answered or turned down", () => {
    expect(surveyDue(1, 80, null)).toBe(false);
    expect(surveyDue(2, 49, null)).toBe(false);
    expect(surveyDue(2, 50, null)).toBe(true);
    expect(surveyDue(3, 90, "done")).toBe(false);
    expect(surveyDue(3, 90, "dismissed")).toBe(false);
  });
});

describe("copy", () => {
  it("is singular solo and plural together", () => {
    expect(decisionTitle(false)).toBe("בחרתי שם");
    expect(decisionTitle(true)).toBe("בחרנו שם");
    expect(decideLabel(true, "נועה")).toBe("בחרנו בשם נועה");
    expect(recapLine(30, 6)).toBe("עברת על 30 שמות ושמרת 6.");
    expect(recapLine(30, 1)).toBe("עברת על 30 שמות ושמרת אחד.");
    expect(recapLine(30, 0)).toBe("עברת על 30 שמות ועוד לא שמרת אף אחד בסבב הזה.");
  });

  it("names the chosen name when it is taken back, and when the undo brings it back", () => {
    expect(clearChoiceLabel("נועה")).toBe("ביטול הבחירה בשם נועה");
    expect(choiceClearedText("נועה")).toBe("הבחירה בשם נועה בוטלה");
    expect(choiceRestoredText("נועה")).toBe("השם נועה נבחר שוב");
  });
});

describe("pauseAfterVote", () => {
  const base = { solo: true, savedCount: 4, invitePromptShown: false, sessionId: "s1", sessionVotes: 3, recapSession: null };
  const stored = (vote: StoredVote["vote"], min: number, custom = false): StoredVote => ({ name: "x", vote, updatedAt: at(min), custom });

  it("sees the 5th save before the store does", () => {
    expect(pauseAfterVote(base, { previous: undefined, saves: true, startedAt: start })).toBe("invite");
    expect(pauseAfterVote(base, { previous: undefined, saves: false, startedAt: start })).toBeNull();
    // Re-saving a name that was already saved adds nothing.
    expect(pauseAfterVote(base, { previous: stored("keep", 20), saves: true, startedAt: start })).toBeNull();
  });

  it("sees the 30th decision of the session", () => {
    const input = { ...base, savedCount: 0, sessionVotes: RECAP_VOTES - 1 };
    expect(pauseAfterVote(input, { previous: undefined, saves: false, startedAt: start })).toBe("recap");
    // A name decided earlier in this session is counted already.
    expect(pauseAfterVote(input, { previous: stored("pass", 20), saves: false, startedAt: start })).toBeNull();
    // One decided before the session started is new to it.
    expect(pauseAfterVote(input, { previous: stored("pass", 0), saves: false, startedAt: start })).toBe("recap");
    expect(pauseAfterVote(input, { previous: undefined, saves: false, startedAt: null })).toBeNull();
  });
});
