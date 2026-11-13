import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs script without types
import { sectorReason } from "../../scripts/names-content/sector.mjs";

const reason = sectorReason as (row: [number, number, number, number] | null) => string;

describe("Jewish-sector rule", () => {
  it("keeps names only given in the Jewish sector", () => {
    expect(reason(null)).toBe("only-jewish");
  });

  it("keeps names mostly given in the Jewish sector", () => {
    expect(reason([5844, 10634, 637, 4637])).toBe("all-time");
  });

  it("keeps shared names with real Jewish use since 2000 (לין)", () => {
    expect(reason([2350, 8935, 1196, 7515])).toBe("recent");
  });

  it("drops names with only a sliver of Jewish births", () => {
    expect(reason([45, 130529, 0, 72164])).toBe("below");
    // Enough Jewish babies since 2000, but under 10% of the name's births.
    expect(reason([598, 15536, 435, 10367])).toBe("below");
  });
});
