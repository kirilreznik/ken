import type { NameStats, SexTag } from "./types";

/** Below this many all-time births the tag follows the majority sex (E16 §2). */
export const SEX_TAG_MIN_BIRTHS = 200;
/** Share of one sex at or above which a name is tagged with it. */
export const SEX_TAG_SHARE = 0.9;

type SexCounts = Pick<NameStats, "m" | "f">;

/**
 * "בן" when ≥ 90% of births are boys, "בת" when ≥ 90% are girls, else "מתאים לכולם".
 * Names with fewer than 200 births use the majority sex; a tie stays "מתאים לכולם".
 */
export function sexTag({ m, f }: SexCounts): SexTag {
  const total = m + f;
  if (total < SEX_TAG_MIN_BIRTHS) {
    if (m > f) return "בן";
    if (f > m) return "בת";
    return "מתאים לכולם";
  }
  if (m / total >= SEX_TAG_SHARE) return "בן";
  if (f / total >= SEX_TAG_SHARE) return "בת";
  return "מתאים לכולם";
}

export interface SexSplit {
  /** Exact share of births that are boys, 0..1, for the bar width. */
  boysShare: number;
  /** "71%", or "פחות מ־1%" / "מעל 99%" at the extremes. */
  boysLabel: string;
  girlsLabel: string;
}

const UNDER_1 = "פחות מ־1%";
const OVER_99 = "מעל 99%";

/** Boys/girls percent labels for the bar (E16 FR-5b), whole numbers that add up to 100. */
export function sexSplit({ m, f }: SexCounts): SexSplit {
  const total = m + f;
  const boysShare = total > 0 ? m / total : 0;
  const boys = boysShare * 100;
  if (boys < 1) return { boysShare, boysLabel: UNDER_1, girlsLabel: OVER_99 };
  if (boys > 99) return { boysShare, boysLabel: OVER_99, girlsLabel: UNDER_1 };
  const rounded = Math.round(boys);
  return { boysShare, boysLabel: `${rounded}%`, girlsLabel: `${100 - rounded}%` };
}
