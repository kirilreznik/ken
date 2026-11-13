import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DETAILS_OFFLINE } from "@/components/names/detail/DetailsPending";
import MeaningSection from "@/components/names/detail/MeaningSection";
import type { DetailsState } from "@/components/names/useNameDetails";

const INTRO = "אריה של אל.";
const STORY = "סיפור קצר על השם.";
const render = (story: string | null, state: DetailsState, intro = INTRO) =>
  renderToStaticMarkup(createElement(MeaningSection, { intro, story, state }));

describe("MeaningSection (FR-D9)", () => {
  it("shows the label, the intro, then the story", () => {
    const html = render(STORY, "ready");
    expect(html).toContain("מה השם אומר");
    expect(html.indexOf(INTRO)).toBeGreaterThan(html.indexOf("מה השם אומר"));
    expect(html.indexOf(STORY)).toBeGreaterThan(html.indexOf(INTRO));
    expect(html).not.toContain("data-details-loading");
    expect(html).not.toContain(DETAILS_OFFLINE);
  });

  it("shows a quiet sand placeholder with no text while loading", () => {
    for (const state of ["idle", "loading"] as const) {
      const html = render(null, state);
      expect(html).toContain(INTRO);
      expect(html).toMatch(/data-details-loading="true" aria-hidden="true"/);
      expect(html).toContain("bg-sand");
      expect(html).toContain('aria-busy="true"');
      expect(html).not.toContain(DETAILS_OFFLINE);
    }
  });

  it("shows the offline line when the details failed", () => {
    const html = render(null, "error");
    expect(html).toContain(INTRO);
    expect(html).toContain(DETAILS_OFFLINE);
    expect(html).not.toContain("data-details-loading");
  });

  it("shows the intro alone when the story is null", () => {
    const html = render(null, "ready");
    expect(html).toContain(INTRO);
    expect(html).not.toContain("data-details-loading");
    expect(html).not.toContain(DETAILS_OFFLINE);
    expect(html.match(/<p /g)).toHaveLength(1);
  });

  it("is hidden with no intro and no story", () => {
    expect(render(null, "ready", "  ")).toBe("");
  });
});
