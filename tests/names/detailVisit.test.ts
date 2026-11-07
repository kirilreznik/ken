import { describe, expect, it } from "vitest";
import { createDetailVisits } from "@/lib/names/detailVisit";
import type { TrackProps } from "@/lib/names/track";

function setup() {
  const sent: [string, TrackProps | undefined][] = [];
  let t = 0;
  const visits = createDetailVisits((event, props) => sent.push([event, props]), () => t);
  return { sent, visits, at: (ms: number) => (t = ms) };
}

describe("createDetailVisits", () => {
  it("sends detail_closed with whole seconds and full when the URL loses the name", () => {
    const { sent, visits, at } = setup();
    visits.update(null, false);
    at(1000);
    visits.update("נועם", true);
    visits.update("נועם", true);
    at(13_600);
    visits.update(null, false);
    expect(sent).toEqual([["detail_closed", { seconds: 13, full: false }]]);
  });

  it("remembers a drag to full height until the close", () => {
    const { sent, visits, at } = setup();
    visits.update("יעל", true);
    visits.full();
    at(2400);
    visits.update(null, false);
    // A new visit starts at 70% again.
    visits.update("יעל", true);
    at(3000);
    visits.update(null, false);
    expect(sent).toEqual([
      ["detail_closed", { seconds: 2, full: true }],
      ["detail_closed", { seconds: 1, full: false }],
    ]);
  });

  it("keeps the visit while the about or report sheet holds the name", () => {
    const { sent, visits } = setup();
    visits.update("זיו", true);
    visits.seen("numbers");
    visits.update(null, true);
    visits.update("זיו", true);
    visits.seen("numbers");
    expect(sent).toEqual([["detail_section_seen", { section: "numbers" }]]);
  });

  it("sends each section once per name shown; a similar name has its own, Back to a name sends nothing again", () => {
    const { sent, visits } = setup();
    visits.seen("story");
    visits.update("אריאל", true);
    visits.seen("story");
    visits.seen("story");
    visits.seen("similar");
    visits.update("אריאלה", true);
    visits.seen("story");
    visits.update("אריאל", true);
    visits.seen("story");
    visits.seen("similar");
    visits.update(null, false);
    visits.seen("numbers");
    expect(sent.map(([event, props]) => [event, props?.section ?? null])).toEqual([
      ["detail_section_seen", "story"],
      ["detail_section_seen", "similar"],
      ["detail_section_seen", "story"],
      ["detail_closed", null],
    ]);
  });

  it("never sends a name", () => {
    const { sent, visits } = setup();
    visits.update("מרים", true);
    visits.seen("numbers");
    visits.update(null, false);
    expect(JSON.stringify(sent)).not.toContain("מרים");
  });
});
