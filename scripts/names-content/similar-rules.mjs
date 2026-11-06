// Candidate rules for similar names (PRD name-detail §6.3). Generous on purpose: they only
// propose forms of the same name, and each content batch decides which ones really are.
//
// Two names are candidates when, after normalize(), they are equal, or one of them is the
// other plus or minus a feminine ending (־ה, ־ית, ־ת, ־יה, ־לה) or a theophoric part
// (־אל, ־יה, ־יהו, יהו־, יו־, אלי־). Affixes are compared both ways, so יונתן and יהונתן meet
// at נתן. A stem left after removing an affix must keep at least 2 letters once normalized.

const FINALS = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };
const FEMININE = ["ה", "ית", "ת", "יה", "לה"];
const THEOPHORIC_END = ["אל", "יה", "יהו"];
const THEOPHORIC_START = ["יהו", "יו", "אלי"];
const MIN_STEM = 2;

/**
 * Final letters to regular, strip one final ה or א, then strip ו and י (matres lectionis)
 * everywhere but the first letter, so doubled ו/י spellings collapse too.
 */
export function normalize(name) {
  let s = name.trim().replace(/[ךםןףץ]/g, (c) => FINALS[c]);
  if (s.length > 1 && /[הא]$/.test(s)) s = s.slice(0, -1);
  return s.charAt(0) + s.slice(1).replace(/[וי]/g, "");
}

const forms = new Map();

/** The normalized name plus every normalized stem left after removing one affix. */
function formsOf(name) {
  let set = forms.get(name);
  if (set) return set;
  const raw = name.trim().replace(/[ךםןףץ]/g, (c) => FINALS[c]);
  set = new Set([normalize(name)]);
  const add = (stem) => {
    const n = normalize(stem);
    if (n.length >= MIN_STEM) set.add(n);
  };
  for (const end of [...FEMININE, ...THEOPHORIC_END]) {
    if (raw.length > end.length && raw.endsWith(end)) add(raw.slice(0, -end.length));
  }
  for (const start of THEOPHORIC_START) {
    if (raw.length > start.length && raw.startsWith(start)) add(raw.slice(start.length));
  }
  forms.set(name, set);
  return set;
}

/** Whether b could be a form of a (symmetric; never a name with itself). */
export function isCandidate(a, b) {
  if (a.trim() === b.trim()) return false;
  const fa = formsOf(a);
  for (const f of formsOf(b)) if (fa.has(f)) return true;
  return false;
}
