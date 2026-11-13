// "על שם קרוב משפחה": names that share a relative's first letter or meaning. The meaning comes
// from the deck name's meaning groups (data/names/content-src/meanings.json), its other forms
// (the name sheet's similar names), or, for an older name that isn't in the deck, the short
// table of Yiddish and Ladino names (צבי־הירש, זאב־וולף…). The relative's name never leaves
// the device: it lives in the saved filters only.
import meaningData from "./meaning-groups.json";
import { normalizeName } from "./custom";
import { firstLetter } from "./filters";
import { hebrewKey } from "./search";

export interface OlderName {
  spellings: string[];
  lang: string;
  means: string;
  groups: string[];
}

const GROUPS: Readonly<Record<string, string>> = meaningData.groups;
const OLDER: readonly OlderName[] = meaningData.relatives;

/** The Hebrew label of a meaning group ("אור"), or null for an unknown id. */
export function meaningLabel(id: string): string | null {
  return GROUPS[id] ?? null;
}

/** The filter as saved: the relative's name, which links are on, and the meaning names resolved when it was applied. */
export interface RelativeFilter {
  name: string;
  letter: boolean;
  meaning: boolean;
  /** Deck names that share the meaning (other forms of the name included); empty when `meaning` is off. */
  names: string[];
}

/** The fields of a card the lookup reads. */
export interface RelativeCard {
  stats: { name: string };
  content: { meanings?: readonly string[] };
}

export interface RelativeMatch {
  /** The name as typed, cleaned (no niqqud, single spaces). */
  name: string;
  /** Its first letter, for "אותה אות ראשונה"; null when it has no Hebrew letter. */
  letter: string | null;
  /** Meaning group ids, in data order. */
  groups: string[];
  /** The older name it was found as (Yiddish or Ladino), when it isn't in the deck. */
  older: OlderName | null;
  /** Deck names sharing a meaning group, the name itself and its other forms. */
  names: string[];
}

function findOlder(name: string): OlderName | null {
  const key = hebrewKey(name);
  if (!key) return null;
  return OLDER.find((o) => o.spellings.some((s) => hebrewKey(s) === key)) ?? null;
}

/**
 * What a relative's name links to. `forms` gives a deck name's other forms (the details file's
 * similar names), when loaded.
 */
export function matchRelative(
  input: string,
  cards: readonly RelativeCard[],
  forms: (name: string) => readonly string[] = () => [],
): RelativeMatch {
  const name = normalizeName(input);
  const key = hebrewKey(name);
  const letter = key ? firstLetter(name) : null;
  const deck = new Map(cards.map((c) => [hebrewKey(c.stats.name), c]));
  const own = key ? deck.get(key) : undefined;
  const older = own ? null : findOlder(name);
  const groups = own ? [...(own.content.meanings ?? [])] : older ? [...older.groups] : [];
  const names = new Set<string>();
  if (own) {
    names.add(own.stats.name);
    for (const form of forms(own.stats.name)) if (deck.has(hebrewKey(form))) names.add(form);
  }
  if (groups.length) {
    for (const c of cards) if (c.content.meanings?.some((g) => groups.includes(g))) names.add(c.stats.name);
  }
  return { name, letter, groups, older, names: [...names] };
}

/** The filter to save, or null when nothing would be filtered (no name, or both links off). */
export function relativeFilter(match: RelativeMatch, letter: boolean, meaning: boolean): RelativeFilter | null {
  const useLetter = letter && match.letter !== null;
  const useMeaning = meaning && match.names.length > 0;
  if (!match.name || (!useLetter && !useMeaning)) return null;
  return { name: match.name, letter: useLetter, meaning: useMeaning, names: useMeaning ? match.names : [] };
}

/** Whether a deck name passes the relative filter: the same first letter, or a name that shares the meaning. */
export function matchesRelative(name: string, filter: RelativeFilter): boolean {
  if (filter.letter && firstLetter(name) === firstLetter(filter.name)) return true;
  return filter.meaning && filter.names.includes(name);
}

/** Reads a saved filter back; anything malformed is dropped. */
export function readRelative(raw: unknown): RelativeFilter | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.name !== "string" || !hebrewKey(r.name) || r.name.length > 40) return null;
  const names = Array.isArray(r.names) ? r.names.filter((n): n is string => typeof n === "string").slice(0, 2000) : [];
  const letter = r.letter === true;
  const meaning = r.meaning === true && names.length > 0;
  if (!letter && !meaning) return null;
  return { name: r.name, letter, meaning, names: meaning ? names : [] };
}

/** The chip on the swipe screen: "על שם רבקה". */
export function relativeChipLabel(filter: RelativeFilter): string {
  return `על שם ${filter.name}`;
}

/** The line under the field: what the deck will hold. */
export function relativeSummary(match: RelativeMatch): string | null {
  if (!match.name || !match.letter) return null;
  const labels = match.groups.map(meaningLabel).filter((l): l is string => l !== null);
  if (match.older) return `${match.name} ב${match.older.lang} פירושו ${match.older.means}.`;
  if (labels.length) return `המשמעות: ${labels.join(", ")}.`;
  return null;
}
