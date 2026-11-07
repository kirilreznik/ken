import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FactsSection from "@/components/names/detail/FactsSection";

const years = (a: number, b: number) => [a, ...Array<number>(23).fill(50), b];
const render = (y: number[] | undefined, rank: number | null) =>
  renderToStaticMarkup(createElement(FactsSection, { stats: { m: 37_000, f: 11_793, y }, rank }));

describe("FactsSection (FR-D15)", () => {
  it("puts three wells in one row, numbers in LTR runs", () => {
    const html = render(years(100, 330), 2);
    expect(html).toContain("grid-cols-3");
    expect(html.match(/names-well/g)).toHaveLength(3);
    expect(html).toContain('<bdi dir="ltr">48,793</bdi>');
    expect(html).toContain('<bdi dir="ltr">#2</bdi>');
    expect(html).toContain('פי <bdi dir="ltr">3.3</bdi>');
    expect(render(years(100, 70), 2)).toContain('<bdi dir="ltr">30%</bdi> פחות');
  });

  it("lets the remaining tiles share the row", () => {
    expect(render(years(100, 0), null)).toContain("grid-cols-1");
    expect(render(years(10, 30), 400)).toContain("grid-cols-2");
  });
});
