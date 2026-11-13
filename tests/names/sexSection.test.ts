import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SexSection from "@/components/names/detail/SexSection";

const render = (boysShare: number, boysLabel: string, girlsLabel: string) =>
  renderToStaticMarkup(createElement(SexSection, { boysShare, boysLabel, girlsLabel }));

describe("SexSection (FR-D14)", () => {
  it("labels the bar and reads it as one image", () => {
    const html = render(0.77, "77%", "23%");
    expect(html).toContain("<h3");
    expect(html).toContain("בנים ובנות, מאז 1949");
    expect(html).toContain('role="img" aria-label="מאז 1949 ניתן ל־77 אחוז בנים ול־23 אחוז בנות"');
    expect(html).toContain("בנים 77%");
    expect(html).toContain("width:77%");
  });

  it("keeps the extreme labels", () => {
    const html = render(0.999, "מעל 99%", "פחות מ־1%");
    expect(html).toContain("בנות פחות מ־1%");
    expect(html).toContain("ל־מעל 99 אחוז בנים");
  });
});
