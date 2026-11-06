import { describe, expect, it } from "vitest";
import { parseDetails, type RawDetailsFile } from "@/lib/names/data";

describe("parseDetails", () => {
  it("keeps a normal entry as written", () => {
    const details = parseDetails({
      _about: "Stories and similar names",
      names: { אריאל: { story: "סיפור קצר על השם.", similar: ["אריאלה", "ארי"] } },
    });
    expect(details.size).toBe(1);
    expect(details.get("אריאל")).toEqual({ story: "סיפור קצר על השם.", similar: ["אריאלה", "ארי"] });
  });

  it("fills missing fields: no similar is [], a missing or non-string story is null", () => {
    const details = parseDetails({
      names: {
        נועה: { story: "סיפור." },
        יעל: { similar: ["יעלי"] },
        טל: { story: 12, storyNote: "unsure", similar: "תל" },
        דן: { story: null, similar: ["דני", 7, null] },
      },
    });
    expect(details.get("נועה")).toEqual({ story: "סיפור.", similar: [] });
    expect(details.get("יעל")).toEqual({ story: null, similar: ["יעלי"] });
    expect(details.get("טל")).toEqual({ story: null, similar: [] });
    expect(details.get("דן")).toEqual({ story: null, similar: ["דני"] });
  });

  it("drops entries that aren't objects and ignores _about", () => {
    const details = parseDetails({
      _about: "top-level note",
      names: { _about: { story: "x" }, a: null, b: "story", c: 3, d: ["x"], e: true, ok: { story: "s" } },
    });
    expect([...details.keys()]).toEqual(["ok"]);
  });

  it("returns an empty map for an empty or broken file", () => {
    expect(parseDetails({}).size).toBe(0);
    expect(parseDetails({ names: {} }).size).toBe(0);
    expect(parseDetails({ names: null } as unknown as RawDetailsFile).size).toBe(0);
    expect(parseDetails(null as unknown as RawDetailsFile).size).toBe(0);
  });
});
