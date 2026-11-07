import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SimilarSection from "@/components/names/detail/SimilarSection";
import { Chip } from "@/components/names/ui";
import type { SimilarName } from "@/lib/names/detail";

const render = (similar: SimilarName[]) => renderToStaticMarkup(createElement(SimilarSection, { similar }));

describe("SimilarSection (FR-D16)", () => {
  it("shows 'שמות קרובים' and a chip per name with its sex tag in words", () => {
    const html = render([
      { name: "אריאלה", sexTag: "בת" },
      { name: "ארי", sexTag: "בן" },
    ]);
    expect(html).toContain('<h3 class="text-tag text-ink-soft">שמות קרובים</h3>');
    expect(html).toContain('aria-label="אריאלה, בת, פרטי השם"');
    expect(html).toContain('aria-label="ארי, בן, פרטי השם"');
    expect(html).toContain("· בת");
    expect(html).toContain("· בן");
    expect(html.indexOf("אריאלה")).toBeLessThan(html.indexOf("ארי, בן"));
  });

  it("uses buttons at least 44 px tall that wrap, with no toggle state", () => {
    const html = render([{ name: "אריאלה", sexTag: "בת" }]);
    expect(html).toContain('type="button"');
    expect(html).toContain("min-h-11");
    expect(html).toContain("flex-wrap");
    expect(html).not.toContain("aria-pressed");
  });

  it("is hidden when there are no similar names", () => {
    expect(render([])).toBe("");
  });
});

describe("Chip", () => {
  it("keeps aria-pressed for toggles", () => {
    expect(renderToStaticMarkup(createElement(Chip, { selected: true }, "x"))).toContain('aria-pressed="true"');
    expect(renderToStaticMarkup(createElement(Chip, { selected: false }, "x"))).toContain('aria-pressed="false"');
  });
});
