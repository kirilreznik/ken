// Hebrew name (with niqqud) → Latin letters by the Academy of the Hebrew Language's
// transliteration rules, simplified version ("תעתיק פשוט", 2006/2011): no diacritics,
// no apostrophe for א/ע, no doubled letters for dagesh forte.
//
// Consonants: ב b/v, ג g, ג׳ j, ד d, ה h, ו v, ז z, ז׳ zh, ח h, ט t, י y, כ k/kh, ל l, מ m,
// נ n, ס s, ע –, פ p/f, צ ts, צ׳ ch, ק k, ר r, שׁ sh, שׂ s, ת t, ת׳ th.
// Vowels: patah, kamats, hataf patah a; segol, tsere, hataf segol e; hirik i; holam, kamats
// katan, hataf kamats o; kubuts, shuruk u; a vocal shva e (see shvaSounds).
//
// The rules can't know how a borrowed name is said (לין, ג׳ורג׳): those go in latin-overrides.json.

const DAGESH = "ּ";
const SHIN_DOT = "ׁ";
const SIN_DOT = "ׂ";
const SHVA = "ְ";
const HOLAM = "ֹ";
const HOLAM_VAV = "ֺ";
const GERESH = /[׳'׳]/;

const VOWELS = {
  "ַ": "a", // patah
  "ָ": "a", // kamats
  "ֲ": "a", // hataf patah
  "ֶ": "e", // segol
  "ֵ": "e", // tsere
  "ֱ": "e", // hataf segol
  "ִ": "i", // hirik
  "ֹ": "o", // holam
  "ֺ": "o", // holam haser for vav
  "ׇ": "o", // kamats katan
  "ֳ": "o", // hataf kamats
  "ֻ": "u", // kubuts
};

const FINAL = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

/** Splits a pointed word into letters, each with its marks. */
export function letters(word) {
  const out = [];
  for (const ch of word.normalize("NFC")) {
    if (/[א-ת]/.test(ch)) out.push({ base: FINAL[ch] ?? ch, final: ch in FINAL, marks: "", geresh: false });
    else if (/[֑-ׇ]/.test(ch)) { if (out.length) out[out.length - 1].marks += ch; }
    else if (GERESH.test(ch)) { if (out.length) out[out.length - 1].geresh = true; }
  }
  return out;
}

const KAMATS = "\u05B8";
const vowelOf = (l) => {
  for (const m of l.marks) if (VOWELS[m]) return VOWELS[m];
  return null;
};
/** The vowel said on letter i: a kamats before a silent shva is a kamats katan (עָמְרִי Omri). */
function vowelAt(ls, i) {
  const l = ls[i];
  const v = vowelOf(l);
  const next = ls[i + 1];
  // Not before a י (קָטְיָה Katya, דָּנְיָה Danya): those are borrowed names said with a.
  if (v === "a" && has(l, KAMATS) && next && has(next, SHVA) && ls[i + 2] && ls[i + 2].base !== "י") return "o";
  return v;
}
/** The vowel before letter i, looking through a silent א or ע (יַנַּאי Yanai). */
function vowelBefore(ls, i) {
  let j = i - 1;
  while (j >= 0 && "אע".includes(ls[j].base) && !vowelOf(ls[j]) && !has(ls[j], SHVA)) j--;
  if (j < 0) return null;
  return vowelAt(ls, j) ?? (ls[j].base === "ו" && (has(ls[j], HOLAM) || has(ls[j], HOLAM_VAV)) ? "o" : ls[j].base === "ו" && has(ls[j], DAGESH) ? "u" : null);
}
const has = (l, mark) => !!l && l.marks.includes(mark);

function consonant(l, index) {
  // A pointed name marks a hard ב/כ/פ with a dagesh, also at the start (פְרִידָא is Frida);
  // an unpointed letter at the start is read hard.
  const d = has(l, DAGESH) || (index === 0 && l.marks === "");
  switch (l.base) {
    case "א": case "ע": return "";
    case "ב": return d ? "b" : "v";
    case "ג": return l.geresh ? "j" : "g";
    case "ד": return "d";
    case "ה": return "h";
    case "ו": return "v";
    case "ז": return l.geresh ? "zh" : "z";
    case "ח": return "h";
    case "ט": return "t";
    case "י": return "y";
    case "כ": return d ? "k" : "kh";
    case "ל": return "l";
    case "מ": return "m";
    case "נ": return "n";
    case "ס": return "s";
    case "פ": return d ? "p" : "f";
    case "צ": return l.geresh ? "ch" : "ts";
    case "ק": return "k";
    case "ר": return "r";
    case "ש": return has(l, SIN_DOT) ? "s" : "sh";
    case "ת": return l.geresh ? "th" : "t";
    default: return "";
  }
}

// Modern Hebrew says a word-initial shva when the letter is י ל מ נ ר, before א ה ע,
// before the same letter, or when the two consonants can't start a syllable together.
const EASY_SECOND = new Set(["l", "r", "m", "n", "v", "y", "f"]);
const SIBILANT = new Set(["s", "sh", "ts", "z"]);
function initialShvaSaid(first, second, c1, c2) {
  if ("ילמנר".includes(first.base)) return true;
  if ("אהע".includes(second.base)) return true;
  if (first.base === second.base) return true;
  if (SIBILANT.has(c1) && !SIBILANT.has(c2)) return false;
  if (c2 === "s" || c2 === "sh" || c2 === "z") return false; // קְסֶנְיָה Ksenya
  if (EASY_SECOND.has(c2)) return false;
  return true;
}

/** Transliterates one pointed word. */
export function latinWord(word) {
  const ls = letters(word);
  let out = "";
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    const prev = ls[i - 1];
    const next = ls[i + 1];
    const v = vowelAt(ls, i);

    // ו as a vowel: shuruk (וּ with no vowel of its own) or holam male (וֹ).
    if (l.base === "ו" && i > 0) {
      const prevVowel = vowelOf(prev);
      if (has(l, DAGESH) && !v && !has(l, SHVA)) {
        if (!prevVowel || has(prev, SHVA)) { out += "u"; continue; }
      }
      if ((has(l, HOLAM) || has(l, HOLAM_VAV)) && !has(l, DAGESH)) {
        if (!prevVowel || has(prev, SHVA)) { out += "o"; continue; }
      }
      if (!v && !has(l, SHVA) && !has(l, DAGESH)) {
        if (!next) { out += "v"; continue; } // זִיו Ziv
        // Unpointed ו after a consonant with no vowel: a holam male written defectively.
        if (prev && !prevVowel && !has(prev, SHVA) && prev.base !== "ו") { out += "o"; continue; }
        if (prev && prev.base === "ו") continue; // וו = v, already written
      }
    }
    if (l.base === "ו" && i === 0 && has(l, DAGESH) && !v) { out += "u"; continue; }

    // י with no vowel after a vowel: a vowel letter (hirik, tsere) or a diphthong (ai, oi, ui).
    if (l.base === "י" && i > 0 && !v && !has(l, DAGESH)) {
      if (prev.base === "י" && !vowelOf(prev)) continue; // ייי: one sound
      const pv = vowelBefore(ls, i);
      if (pv === "i") continue; // hirik male
      // ֵי before a said א/ע is a plain e (לֵיאוֹ Leo); ָיו at the end is "av" (שְׂלָיו Slav).
      if (pv === "e" && next && "אע".includes(next.base)) continue;
      if (pv === "a" && next && next.base === "ו" && !ls[i + 2] && !vowelOf(next)) continue;
      if (pv === "e" || pv === "a" || pv === "o" || pv === "u") { out += "i"; continue; } // Eitan, Gai, Roi
      if (!pv && next && !has(l, SHVA)) { out += "i"; continue; } // unpointed hirik male
    }

    // Final ה with no mappiq is a vowel letter.
    if (l.base === "ה" && !next && !has(l, DAGESH)) {
      if (!v) continue;
    }

    // Furtive patah under a final ח/ע: the vowel comes first.
    if (!next && (l.base === "ח" || l.base === "ע") && v === "a" && prev && vowelOf(prev) && vowelOf(prev) !== "a") {
      out += "a" + consonant(l, i);
      continue;
    }

    const c = consonant(l, i);
    out += c;
    if (v) out += v;
    else if (has(l, SHVA) && next) {
      const c2 = consonant(next, i + 1);
      if (i === 0 && initialShvaSaid(l, next, c, c2)) out += "e";
      else if (i > 0 && l.base === next.base) out += "e";
    }
  }
  return out;
}

const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);

/** Transliterates a pointed name; words and hyphenated parts keep their separators. */
export function latin(niqqud) {
  return niqqud
    .split(/([\s\-־]+)/)
    .map((part) => (/^[\s\-־]+$/.test(part) ? (part.includes("־") ? "-" : part) : cap(latinWord(part))))
    .join("")
    // וו and יי written for one sound (סווטלנה, וויליאם).
    .replace(/vv/g, "v")
    .replace(/ii/g, "i");
}
