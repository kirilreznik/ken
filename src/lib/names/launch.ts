/**
 * The launch pack (product review steps 4, 5 and 8): when the swipe screen pauses for the
 * "choose together" prompt or the round recap, and when the beta survey is offered.
 * Everything is derived from the vote store's votes, so a decision made anywhere (card,
 * buttons, keys, a detail sheet) counts the same.
 */

import type { StoredVote } from "./voteStore";

/** The solo "choose together" prompt comes after this many saved names. */
export const INVITE_PROMPT_SAVES = 5;
/** The round recap comes after this many decisions in one session. */
export const RECAP_VOTES = 30;
/** The survey waits for the 2nd session and this many decisions in all. */
export const SURVEY_MIN_SESSION = 2;
export const SURVEY_MIN_VOTES = 50;
/** Saved names shown on the recap panel. */
export const RECAP_NAMES = 8;

export type Pause = "invite" | "recap";

const time = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
};

const saved = (v: StoredVote) => v.vote === "keep" || v.vote === "love";

/** Decisions on deck names made since the session started (custom names left out). */
export function sessionTotals(votes: ReadonlyMap<string, StoredVote>, startedAt: number): { votes: number; saves: number; names: string[] } {
  let count = 0;
  const names: { name: string; at: number; love: boolean }[] = [];
  for (const v of votes.values()) {
    const at = time(v.updatedAt);
    if (at < startedAt || v.custom) continue;
    count += 1;
    if (saved(v)) names.push({ name: v.name, at, love: v.vote === "love" });
  }
  // Loved first, then the newest.
  names.sort((a, b) => Number(b.love) - Number(a.love) || b.at - a.at);
  return { votes: count, saves: names.length, names: names.map((n) => n.name) };
}

export interface PauseInput {
  /** The space has one member (and that is known, not a failed load). */
  solo: boolean;
  savedCount: number;
  invitePromptShown: boolean;
  sessionId: string | null;
  sessionVotes: number;
  recapSession: string | null;
}

/** Which pause the swipe screen should show now, if any. The invite prompt goes first. */
export function pauseToShow(input: PauseInput): Pause | null {
  if (input.solo && !input.invitePromptShown && input.savedCount >= INVITE_PROMPT_SAVES) return "invite";
  if (input.sessionId && input.recapSession !== input.sessionId && input.sessionVotes >= RECAP_VOTES) return "recap";
  return null;
}

/** The session count after seeing session `id` (a new id is one more session). */
export function countSession(prev: { last: string | null; count: number }, id: string): { last: string; count: number } {
  return prev.last === id ? { last: id, count: Math.max(prev.count, 1) } : { last: id, count: prev.count + 1 };
}

/** Whether to offer the survey: 2nd session or later, 50+ decisions, never answered or turned down. */
export function surveyDue(sessions: number, totalVotes: number, survey: "done" | "dismissed" | null): boolean {
  return survey === null && sessions >= SURVEY_MIN_SESSION && totalVotes >= SURVEY_MIN_VOTES;
}

/** Recap headline: "עברת על 30 שמות ושמרת 6". */
export function recapLine(votes: number, saves: number): string {
  const seen = votes === 1 ? "שם אחד" : `${votes} שמות`;
  if (saves === 0) return `עברת על ${seen}, עוד בלי שמירות בסבב הזה.`;
  return `עברת על ${seen} ושמרת ${saves === 1 ? "אחד" : saves}.`;
}

/** The title of the decision moment: plural when choosing together. */
export function decisionTitle(shared: boolean): string {
  return shared ? "בחרנו שם" : "בחרתי שם";
}

/** The label of the "this is the name" action for `name`. */
export function decideLabel(shared: boolean, name: string): string {
  return shared ? `בחרנו בשם ${name}` : `בחרתי בשם ${name}`;
}
