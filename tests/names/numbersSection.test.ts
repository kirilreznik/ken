import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import NumbersSection from "@/components/names/detail/NumbersSection";

const years = (last: number) => [...Array.from({ length: 24 }, () => 10), last];
const render = (y: number[] | undefined, rank: number | null) =>
  renderToStaticMarkup(createElement(NumbersSection, { stats: { y }, rank }));
const line = (html: string) => html.match(/<p data-numbers-line[^>]*>(.*?)<\/p>/u)?.[1] ?? null;
const text = (html: string | null) => html?.replace(/<[^>]+>/gu, "") ?? null;

describe("NumbersSection (FR-D13)", () => {
  it("labels the chart and shows the 2024 count with its rank", () => {
    const html = render(years(2099), 2);
    expect(html).toContain("כמה תינוקות קיבלו את השם בכל שנה");
    expect(text(line(html))).toBe("ב־2024: 2,099 תינוקות, #2 בשנת 2024");
    expect(line(html)).toContain('<bdi dir="ltr">2,099</bdi>');
    expect(line(html)).toContain('<bdi dir="ltr">#2</bdi>');
  });

  it("leaves the rank out when the name isn't ranked", () => {
    expect(text(line(render(years(1), null)))).toBe("ב־2024: תינוק אחד");
  });

  it("shows only the no-data line when the name has no years", () => {
    const html = render(undefined, null);
    expect(line(html)).toBeNull();
    expect(html).toContain("אין נתונים לשנים");
  });
});
