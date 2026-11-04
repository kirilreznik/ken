import { describe, expect, it } from "vitest";
import { fullName, positionText } from "@/lib/names/card";

describe("positionText", () => {
  it("uses the demo's wording", () => {
    expect(positionText(1, 10)).toBe("שם 1 מתוך 10");
    expect(positionText(3, 4)).toBe("שם 3 מתוך 4");
  });
});

describe("fullName", () => {
  it("adds the surname after the name", () => {
    expect(fullName("זיו", "לוי")).toBe("זיו לוי");
  });

  it("trims and collapses spaces in the surname", () => {
    expect(fullName("יעל", "  בן   דוד ")).toBe("יעל בן דוד");
  });

  it("is null without a surname", () => {
    expect(fullName("זיו", "")).toBeNull();
    expect(fullName("זיו", "   ")).toBeNull();
    expect(fullName("זיו", null)).toBeNull();
    expect(fullName("זיו", undefined)).toBeNull();
  });
});
