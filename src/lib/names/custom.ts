/** E16 FR-12 / PRD FR-W18: "הוספת שם" for a name that isn't in the data. */

export const CUSTOM_NAME_MAX = 20;

export type CustomNameError = "empty" | "not-hebrew" | "too-long" | "duplicate";

export const CUSTOM_NAME_ERRORS: Record<CustomNameError, string> = {
  empty: "צריך לכתוב שם.",
  "not-hebrew": "השם צריך להיות באותיות בעברית.",
  "too-long": `השם ארוך מדי. אפשר עד ${CUSTOM_NAME_MAX} תווים.`,
  duplicate: "השם הזה כבר ברשימה ״שמרתי״.",
};

export type CustomNameResult =
  | { ok: true; name: string; isDataName: boolean }
  | { ok: false; error: CustomNameError; message: string };

// Niqqud and cantillation marks; keeps maqaf (U+05BE) and the punctuation points.
const MARKS = /[֑-ׇֽֿׁׂׅׄ]/g;
// A letter first; geresh/gershayim anywhere after it; a space or hyphen only between letters.
const SHAPE = /^[א-ת](?:[א-ת'"]|[ -](?=[א-ת]))*$/;

/**
 * The spelling names.json uses: no niqqud, ASCII ' and " for geresh and gershayim,
 * '-' for maqaf, single inner spaces.
 */
export function normalizeName(input: string): string {
  return input
    .normalize("NFC")
    .replace(MARKS, "")
    .replace(/[׳‘’`]/g, "'")
    .replace(/[״“”]/g, '"')
    .replace(/[־‐-–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function fail(error: CustomNameError): CustomNameResult {
  return { ok: false, error, message: CUSTOM_NAME_ERRORS[error] };
}

/**
 * `names`: the data names (names.json). `myList`: names already on the user's list.
 * A name found in the data comes back as the data name (`isDataName: true`); otherwise
 * it is saved as a custom name with no count and no intro.
 */
export function validateCustomName(
  input: string,
  names: { has(name: string): boolean },
  myList: Iterable<string>,
): CustomNameResult {
  const name = normalizeName(input);
  if (name === "") return fail("empty");
  if (!SHAPE.test(name)) return fail("not-hebrew");
  if (name.length > CUSTOM_NAME_MAX) return fail("too-long");
  for (const listed of myList) {
    if (normalizeName(listed) === name) return fail("duplicate");
  }
  return { ok: true, name, isDataName: names.has(name) };
}
