// "חיפוש שם": type a name, jump to its card. Hebrew text matches by letters, ignoring niqqud,
// final-letter forms and ו/י spelling (מיכל finds מיכאל's neighbours, נעמי finds נעומי);
// Latin text matches the Academy and international spellings ("noa" finds נועה).

/** At most this many results. */
export const SEARCH_LIMIT = 20;

const MARKS = /[֑-ׇ]/g;
const FINALS: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

/** Hebrew letters only, finals as regular letters. */
export function hebrewKey(text: string): string {
  return text
    .normalize("NFC")
    .replace(MARKS, "")
    .replace(/[ךםןףץ]/g, (c) => FINALS[c])
    .replace(/[^א-ת]/g, "");
}

/** The Hebrew key without ו and י after the first letter: the spelling-free skeleton. */
export function skeletonKey(text: string): string {
  const key = hebrewKey(text);
  return key.slice(0, 1) + key.slice(1).replace(/[וי]/g, "");
}

/** Latin letters, lowercase, with spellings that sound alike folded together (Hannah/Hana, Tzvi/Tsvi). */
export function latinKey(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "")
    .replace(/ph/g, "f")
    .replace(/[ck]h/g, "h")
    .replace(/tz/g, "ts")
    .replace(/ck/g, "k")
    .replace(/c/g, "k")
    .replace(/q/g, "k")
    .replace(/w/g, "v")
    .replace(/(.)\1+/g, "$1")
    .replace(/(.)h$/, "$1");
}

export type QueryScript = "hebrew" | "latin" | "none";

export function queryScript(query: string): QueryScript {
  if (hebrewKey(query)) return "hebrew";
  if (latinKey(query)) return "latin";
  return "none";
}

export interface Searchable {
  stats: { name: string; y?: number[]; m: number; f: number };
  content: { latin?: { he?: string; intl?: string } };
}

/** Births in the last year with data, then all-time: the tie-break among equal matches. */
function weight(card: Searchable): number {
  const y = card.stats.y;
  return (y?.[y.length - 1] ?? 0) * 1e7 + card.stats.m + card.stats.f;
}

function rankHebrew(name: string, query: string): number | null {
  const q = hebrewKey(query);
  if (!q) return null;
  const key = hebrewKey(name);
  if (key === q) return 0;
  const qs = skeletonKey(query);
  const ks = skeletonKey(name);
  if (ks === qs) return 1;
  if (key.startsWith(q)) return 2;
  if (ks.startsWith(qs)) return 3;
  if (key.includes(q)) return 4;
  if (qs.length >= 2 && ks.includes(qs)) return 5;
  return null;
}

function rankLatin(card: Searchable, query: string): number | null {
  const q = latinKey(query);
  if (!q) return null;
  let best: number | null = null;
  for (const spelling of [card.content.latin?.he, card.content.latin?.intl]) {
    if (!spelling) continue;
    const key = latinKey(spelling);
    const rank = key === q ? 0 : key.startsWith(q) ? 2 : q.length >= 2 && key.includes(q) ? 4 : null;
    if (rank !== null && (best === null || rank < best)) best = rank;
  }
  return best;
}

/** The cards that match `query`, best first; empty for a blank query. */
export function searchCards<T extends Searchable>(cards: readonly T[], query: string, limit = SEARCH_LIMIT): T[] {
  const script = queryScript(query);
  if (script === "none") return [];
  const hits: { card: T; rank: number; weight: number }[] = [];
  for (const card of cards) {
    const rank = script === "hebrew" ? rankHebrew(card.stats.name, query) : rankLatin(card, query);
    if (rank !== null) hits.push({ card, rank, weight: weight(card) });
  }
  hits.sort((a, b) => a.rank - b.rank || b.weight - a.weight || a.card.stats.name.localeCompare(b.card.stats.name, "he"));
  return hits.slice(0, limit).map((h) => h.card);
}
