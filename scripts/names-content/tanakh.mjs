// Tanakh text for checking Bible references on name cards (E16b).
// Source: Sefaria's public export (merged Hebrew text, Miqra according to the Masorah),
// downloaded once into .cache/tanakh/ (git-ignored).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const cacheDir = resolve(root, ".cache/tanakh");
const BASE = "https://storage.googleapis.com/sefaria-export/json/Tanakh";

/** [Sefaria title, section, Hebrew name used in refs]. */
export const BOOKS = [
  ["Genesis", "Torah", "בראשית"],
  ["Exodus", "Torah", "שמות"],
  ["Leviticus", "Torah", "ויקרא"],
  ["Numbers", "Torah", "במדבר"],
  ["Deuteronomy", "Torah", "דברים"],
  ["Joshua", "Prophets", "יהושע"],
  ["Judges", "Prophets", "שופטים"],
  ["I Samuel", "Prophets", "שמואל א"],
  ["II Samuel", "Prophets", "שמואל ב"],
  ["I Kings", "Prophets", "מלכים א"],
  ["II Kings", "Prophets", "מלכים ב"],
  ["Isaiah", "Prophets", "ישעיהו"],
  ["Jeremiah", "Prophets", "ירמיהו"],
  ["Ezekiel", "Prophets", "יחזקאל"],
  ["Hosea", "Prophets", "הושע"],
  ["Joel", "Prophets", "יואל"],
  ["Amos", "Prophets", "עמוס"],
  ["Obadiah", "Prophets", "עובדיה"],
  ["Jonah", "Prophets", "יונה"],
  ["Micah", "Prophets", "מיכה"],
  ["Nahum", "Prophets", "נחום"],
  ["Habakkuk", "Prophets", "חבקוק"],
  ["Zephaniah", "Prophets", "צפניה"],
  ["Haggai", "Prophets", "חגי"],
  ["Zechariah", "Prophets", "זכריה"],
  ["Malachi", "Prophets", "מלאכי"],
  ["Psalms", "Writings", "תהילים"],
  ["Proverbs", "Writings", "משלי"],
  ["Job", "Writings", "איוב"],
  ["Song of Songs", "Writings", "שיר השירים"],
  ["Ruth", "Writings", "רות"],
  ["Lamentations", "Writings", "איכה"],
  ["Ecclesiastes", "Writings", "קהלת"],
  ["Esther", "Writings", "אסתר"],
  ["Daniel", "Writings", "דניאל"],
  ["Ezra", "Writings", "עזרא"],
  ["Nehemiah", "Writings", "נחמיה"],
  ["I Chronicles", "Writings", "דברי הימים א"],
  ["II Chronicles", "Writings", "דברי הימים ב"],
];

const byTitle = new Map(BOOKS.map((b) => [b[0], b]));

/** Downloads any missing book into the cache. */
export async function ensureTanakh() {
  mkdirSync(cacheDir, { recursive: true });
  for (const [title, section] of BOOKS) {
    const file = resolve(cacheDir, `${title}.json`);
    if (existsSync(file)) continue;
    const url = `${BASE}/${section}/${encodeURIComponent(title)}/Hebrew/merged.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Tanakh download failed: ${url} ${res.status}`);
    writeFileSync(file, await res.text());
  }
}

const books = new Map();

/** Chapters of a book: an array of chapters, each an array of cleaned verses (niqqud, no cantillation). */
export function book(title) {
  if (!byTitle.has(title)) throw new Error(`Unknown book: ${title}`);
  if (!books.has(title)) {
    const raw = JSON.parse(readFileSync(resolve(cacheDir, `${title}.json`), "utf8"));
    books.set(title, raw.text.map((ch) => ch.map(cleanVerse)));
  }
  return books.get(title);
}

/** Verse text with vowels, without cantillation, markup, ketiv or paragraph marks. */
export function cleanVerse(html) {
  return html
    .replace(/<sup class="footnote-marker">.*?<\/sup>/g, "")
    .replace(/<i class="footnote">.*?<\/i>/g, "")
    .replace(/<span class="mam-kq-k">.*?<\/span>/g, "")
    .replace(/<span class="mam-spi-[a-z]+">.*?<\/span>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[[\]]/g, "")
    .replace(/[֑-ֽ֯͏׀]/g, "") // cantillation, meteg, CGJ, paseq
    .replace(/ׇ/g, "ָ") // qamatz qatan -> qamatz (font support)
    .replace(/[׃]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Consonants only, maqaf as a space; used to compare words. */
export function consonants(text) {
  return text
    .replace(/[֑-ׇ]/g, (c) => (c === "־" ? " " : ""))
    .replace(/[^א-ת ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function verse(title, ch, v) {
  return book(title)[ch - 1]?.[v - 1] ?? null;
}

const ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDREDS = ["", "ק", "ר", "ש", "ת"];

/** 1..176 as Hebrew numerals without geresh: 15 = טו, 16 = טז. */
export function hebNum(n) {
  let out = HUNDREDS[Math.floor(n / 100)];
  const rest = n % 100;
  if (rest === 15) return out + "טו";
  if (rest === 16) return out + "טז";
  return out + TENS[Math.floor(rest / 10)] + ONES[rest % 10];
}

/** "בראשית מט, ט", "שופטים ד–ה", "שמואל א כה". */
export function hebRef({ book: title, ch, chTo, v }) {
  const name = byTitle.get(title)[2];
  if (v) return `${name} ${hebNum(ch)}, ${hebNum(v)}`;
  if (chTo) return `${name} ${hebNum(ch)}–${hebNum(chTo)}`;
  return `${name} ${hebNum(ch)}`;
}

/**
 * Finds `words` (consonants, in order) inside the verse and returns the matching span with vowels,
 * or null. The divine name is written ה׳, like the sample cards.
 */
export function quoteFromVerse(title, ch, v, words) {
  const text = verse(title, ch, v);
  if (!text) return null;
  const tokens = text.replace(/־/g, "־ ").split(" ").filter(Boolean);
  const keys = tokens.map((t) => consonants(t));
  const want = consonants(words).split(" ");
  for (let i = 0; i + want.length <= keys.length; i++) {
    if (want.every((w, j) => keys[i + j] === w)) {
      return tokens
        .slice(i, i + want.length)
        .map(divineName)
        .join(" ")
        .replace(/־ /g, "־")
        .replace(/[,.;:]+$/, "");
    }
  }
  return null;
}

/** Writes the divine name as ה׳ (with any one- or two-letter prefix and its vowels kept). */
function divineName(token) {
  const m = /^([ובלכמשה]{0,2})יהוה$/.exec(consonants(token));
  if (!m) return token;
  let letters = 0;
  let cut = 0;
  for (; cut < token.length; cut++) {
    if (/[\u05D0-\u05EA]/.test(token[cut])) {
      if (letters === m[1].length) break;
      letters++;
    }
  }
  return token.slice(0, cut) + "ה׳" + (token.endsWith("\u05BE") ? "\u05BE" : "");
}

/** True when `name` (consonants) appears as a word, with or without a one-letter prefix, in the chapters. */
export function nameInChapters(title, ch, chTo, name) {
  const want = consonants(name);
  const chapters = book(title).slice(ch - 1, chTo ?? ch);
  if (chapters.length === 0) return false;
  return chapters.some((verses) =>
    verses.some((vText) =>
      consonants(vText)
        .split(" ")
        .some((w) => w === want || (w.length === want.length + 1 && "והבלכמש".includes(w[0]) && w.slice(1) === want)),
    ),
  );
}

export function hasVerse(title, ch, v) {
  return verse(title, ch, v) !== null;
}
