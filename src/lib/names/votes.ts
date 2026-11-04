import type { Vote } from "./types";

/** How many decisions "ביטול" can take back (E16 FR-7). */
export const UNDO_LIMIT = 10;

/** One step of the undo stack: the name and the vote it had before (null = no vote). */
export interface UndoEntry {
  name: string;
  previous: Vote | null;
}

/**
 * The user's votes and undo stack. `votes` keeps the order the votes were made in: a changed
 * vote moves to the end, so the latest decision is last.
 */
export interface VoteState {
  votes: ReadonlyMap<string, Vote>;
  /** Oldest first; at most UNDO_LIMIT entries. */
  undo: readonly UndoEntry[];
}

export function emptyVoteState(votes: ReadonlyMap<string, Vote> = new Map()): VoteState {
  return { votes, undo: [] };
}

/** Love counts as keep (E16 FR-6). */
export function isSaved(vote: Vote | null | undefined): boolean {
  return vote === "keep" || vote === "love";
}

function withVote(votes: ReadonlyMap<string, Vote>, name: string, vote: Vote | null): Map<string, Vote> {
  const next = new Map(votes);
  next.delete(name);
  if (vote !== null) next.set(name, vote);
  return next;
}

/** Records a vote (the latest vote wins) and pushes an undo entry, dropping the oldest past 10. */
export function applyVote(
  state: VoteState,
  name: string,
  vote: Vote,
): { state: VoteState; entry: UndoEntry } {
  const entry: UndoEntry = { name, previous: state.votes.get(name) ?? null };
  const undo = [...state.undo, entry].slice(-UNDO_LIMIT);
  return { state: { votes: withVote(state.votes, name, vote), undo }, entry };
}

export function canUndo(state: VoteState): boolean {
  return state.undo.length > 0;
}

/**
 * Takes back the last decision: restores the previous vote, or removes the vote when the
 * name had none. Returns the entry undone, or null when there is nothing to undo.
 */
export function undo(state: VoteState): { state: VoteState; entry: UndoEntry | null } {
  const entry = state.undo.at(-1);
  if (!entry) return { state, entry: null };
  return {
    state: { votes: withVote(state.votes, entry.name, entry.previous), undo: state.undo.slice(0, -1) },
    entry,
  };
}

/** The "שמרתי" list: loved names first, then kept, each in the order they were voted. */
export function savedNames(votes: ReadonlyMap<string, Vote>): { name: string; vote: "keep" | "love" }[] {
  const loved: { name: string; vote: "love" }[] = [];
  const kept: { name: string; vote: "keep" }[] = [];
  for (const [name, vote] of votes) {
    if (vote === "love") loved.push({ name, vote });
    else if (vote === "keep") kept.push({ name, vote });
  }
  return [...loved, ...kept];
}
