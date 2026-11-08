import { mulberry32 } from "./deck";

/** The duel ends in a ranked list of at most this many names (E16 FR-13). */
export const DUEL_TOP = 5;

/**
 * A duel in progress, plain JSON so it can be saved under the `duel` local pref and resumed.
 *
 * The engine is a binary insertion into a ranked list capped at DUEL_TOP: names enter one by
 * one in a seeded order, and each pick halves the slots the current candidate can take. Once
 * the list is full, the slot after the last one means "not in the top 5".
 */
export interface DuelState {
  version: 1;
  seed: number;
  /** Every name in the duel, in the seeded order they enter. */
  names: string[];
  /** Index in `names` of the current candidate (names.length when done). */
  next: number;
  /** Ranked so far, best first, at most DUEL_TOP. */
  ranked: string[];
  /** The candidate's possible slots in `ranked`, lo..hi inclusive. */
  lo: number;
  hi: number;
  /** Picks made so far. */
  picks: number;
  /** The list the duel runs over (FR-W21 toggle). Missing in older saves: "saved". */
  source?: DuelSource;
}

/** "שמרתי" or "התאמות". */
export type DuelSource = "saved" | "matches";

export interface DuelPair {
  a: string;
  b: string;
}

export interface DuelProgress {
  /** 1-based number of the round on screen (the last round once done). */
  round: number;
  /** Rounds in total: picks so far plus the most the rest can take. Never grows. */
  total: number;
  /** 0..100, for the progress bar. */
  percent: number;
}

const unique = (names: readonly string[]) => [...new Set(names.filter((n) => n.length > 0))];

function seededOrder(names: readonly string[], seed: number): string[] {
  const out = unique(names).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const random = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Opens the slot range for names[next], or ends the duel when no candidate is left. */
function enter(state: DuelState): DuelState {
  if (state.next >= state.names.length) return { ...state, lo: 0, hi: 0 };
  return { ...state, lo: 0, hi: Math.min(state.ranked.length, DUEL_TOP) };
}

/** Places the candidate when its range is a single slot, then moves to the next one. */
function settle(state: DuelState): DuelState {
  let s = state;
  while (s.next < s.names.length && s.lo === s.hi) {
    const ranked = [...s.ranked];
    if (s.lo < DUEL_TOP) ranked.splice(s.lo, 0, s.names[s.next]);
    s = enter({ ...s, ranked: ranked.slice(0, DUEL_TOP), next: s.next + 1 });
  }
  return s;
}

/** Starts a duel over the given names (duplicates dropped). Fewer than 2 names: done at once. */
export function start(names: readonly string[], seed: number): DuelState {
  const order = seededOrder(names, seed >>> 0);
  const base: DuelState = { version: 1, seed: seed >>> 0, names: order, next: 0, ranked: [], lo: 0, hi: 0, picks: 0 };
  return settle(enter(base));
}

export function isDone(state: DuelState): boolean {
  return state.next >= state.names.length;
}

const mid = (state: DuelState) => Math.floor((state.lo + state.hi) / 2);

/** The two names on screen, or null once done. The sides are shuffled per round by the seed. */
export function currentPair(state: DuelState): DuelPair | null {
  if (isDone(state)) return null;
  const candidate = state.names[state.next];
  const opponent = state.ranked[mid(state)];
  const flip = mulberry32((state.seed ^ Math.imul(state.picks + 1, 0x9e3779b1)) >>> 0)() < 0.5;
  return flip ? { a: opponent, b: candidate } : { a: candidate, b: opponent };
}

/** Records a pick. A winner that isn't one of the current two leaves the state unchanged. */
export function pick(state: DuelState, winner: string): DuelState {
  if (isDone(state)) return state;
  const candidate = state.names[state.next];
  const m = mid(state);
  const opponent = state.ranked[m];
  if (winner !== candidate && winner !== opponent) return state;
  const range = winner === candidate ? { hi: m } : { lo: m + 1 };
  return settle({ ...state, ...range, picks: state.picks + 1 });
}

/** The ranked list so far, best first, at most DUEL_TOP. Final once isDone. */
export function ranking(state: DuelState): string[] {
  return [...state.ranked];
}

const log2ceil = (slots: number) => (slots <= 1 ? 0 : Math.ceil(Math.log2(slots)));

/** The most picks the rest of the duel can take. */
export function remainingMax(state: DuelState): number {
  if (isDone(state)) return 0;
  let total = log2ceil(state.hi - state.lo + 1);
  // Until the list is full every candidate enters it, so its length ahead is known.
  let length = Math.min(state.ranked.length + 1, DUEL_TOP);
  for (let i = state.next + 1; i < state.names.length; i++) {
    total += log2ceil(length + 1);
    length = Math.min(length + 1, DUEL_TOP);
  }
  return total;
}

/** "סיבוב {round} מתוך {total}" and the bar. */
export function progress(state: DuelState): DuelProgress {
  const total = state.picks + remainingMax(state);
  const round = isDone(state) ? state.picks : state.picks + 1;
  const percent = total === 0 ? 100 : Math.round((state.picks / total) * 100);
  return { round, total, percent };
}

/** The duel's names as a sorted set, to compare with the list the user would duel now. */
export function sameNames(state: DuelState, names: readonly string[]): boolean {
  const a = [...state.names].sort();
  const b = unique(names).sort();
  return a.length === b.length && a.every((n, i) => n === b[i]);
}

export function serialize(state: DuelState): string {
  return JSON.stringify(state);
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0;

/** Reads a saved duel. Anything malformed or inconsistent returns null (start over). */
export function deserialize(text: string | null | undefined): DuelState | null {
  if (!text) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null) return null;
  const s = raw as Record<string, unknown>;
  if (s.version !== 1 || !isCount(s.seed) || !isStringArray(s.names) || !isStringArray(s.ranked)) return null;
  if (!isCount(s.next) || !isCount(s.lo) || !isCount(s.hi) || !isCount(s.picks)) return null;
  const names = s.names;
  const ranked = s.ranked;
  if (new Set(names).size !== names.length || s.next > names.length) return null;
  if (ranked.length > DUEL_TOP || ranked.some((n) => !names.slice(0, s.next as number).includes(n))) return null;
  if (s.next < names.length) {
    if (s.lo >= s.hi || s.hi > Math.min(ranked.length, DUEL_TOP)) return null;
  }
  if (s.source !== undefined && s.source !== "saved" && s.source !== "matches") return null;
  const state: DuelState = {
    version: 1,
    seed: s.seed,
    names,
    next: s.next,
    ranked,
    lo: s.lo,
    hi: s.hi,
    picks: s.picks,
  };
  if (s.source) state.source = s.source;
  return state;
}

export function sourceOf(state: DuelState): DuelSource {
  return state.source ?? "saved";
}

/**
 * The duel to show for a list: the saved one when it ran over the same source and the same
 * names, otherwise a new one with `seed`. `restarted` is true when a started, unfinished duel
 * over this source was dropped because the list changed since.
 */
export function resumeOrStart(
  saved: DuelState | null,
  source: DuelSource,
  names: readonly string[],
  seed: number,
): { state: DuelState; restarted: boolean } {
  if (saved && sourceOf(saved) === source && sameNames(saved, names)) return { state: saved, restarted: false };
  const restarted = !!saved && sourceOf(saved) === source && saved.picks > 0 && !isDone(saved);
  return { state: { ...start(names, seed), source }, restarted };
}

/** The duelState pref: one duel per source, so switching the toggle never drops the other one. */
export interface DuelSaves {
  /** The source played last (the one to open with). */
  last: DuelSource;
  saved?: DuelState;
  matches?: DuelState;
}

/** Reads the pref. A single duel (saves before INT-G3-01) becomes the duel of its source. */
export function readDuelSaves(raw: unknown): DuelSaves | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if ("version" in r) {
    const one = deserialize(JSON.stringify(r));
    return one ? { last: sourceOf(one), [sourceOf(one)]: one } : null;
  }
  const out: Partial<DuelSaves> = {};
  for (const source of ["saved", "matches"] as const) {
    const duel = r[source] == null ? null : deserialize(JSON.stringify(r[source]));
    if (duel && sourceOf(duel) === source) out[source] = duel;
  }
  const last = r.last === "saved" || r.last === "matches" ? r.last : out.saved ? "saved" : "matches";
  return out.saved || out.matches ? { ...out, last } : null;
}

/** The saves with `state` as its source's duel, played last. */
export function withDuel(saves: DuelSaves | null, state: DuelState): DuelSaves {
  const source = sourceOf(state);
  return { ...saves, [source]: state, last: source };
}

/** The saved duel over `source`, or the one played last when no source is given. */
export function savedDuel(saves: DuelSaves | null, source?: DuelSource): DuelState | null {
  if (!saves) return null;
  return saves[source ?? saves.last] ?? null;
}

/**
 * The source to open with: `?from=` when that list can duel, then the saved duel's source,
 * then "שמרתי" unless only "התאמות" has 2+ names. "התאמות" needs 2+ matches.
 */
export function duelSource(
  param: string | null,
  saved: DuelState | null,
  savedCount: number,
  matchCount: number,
): DuelSource {
  const can = (s: DuelSource) => (s === "matches" ? matchCount >= 2 : true);
  if ((param === "saved" || param === "matches") && can(param)) return param;
  if (saved && can(sourceOf(saved))) return sourceOf(saved);
  return savedCount < 2 && matchCount >= 2 ? "matches" : "saved";
}

/** The duel's empty card: the rule, and how many the list has when it has one (COPY-G3-02). */
export function duelTooFewText(source: DuelSource, count: number): string {
  if (source === "matches") return count === 1 ? "לדו־קרב צריך לפחות שתי התאמות, ויש אחת." : "לדו־קרב צריך לפחות שתי התאמות.";
  return count === 1 ? "לדו־קרב צריך לפחות שני שמות ברשימה, ויש בה אחד." : "לדו־קרב צריך לפחות שני שמות ברשימה.";
}

export function roundText(p: DuelProgress): string {
  return `סיבוב ${p.round} מתוך ${p.total}`;
}

/** What a screen reader hears after a pick: the new round and its two names, or the end. */
export function duelAnnouncement(state: DuelState): string {
  const pair = currentPair(state);
  if (!pair) return `הדו־קרב הסתיים. ${ranking(state).map((n, i) => `${i + 1}. ${n}`).join(", ")}`;
  return `${roundText(progress(state))}: ${pair.a} או ${pair.b}`;
}
