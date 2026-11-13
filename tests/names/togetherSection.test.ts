import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import TogetherSection from "@/components/names/detail/TogetherSection";
import { togetherFor } from "@/lib/names/detail";
import type { Match } from "@/lib/names/matches";

const match = (name: string, keptByCount: number) => ({ name, keptByCount, lovedByCount: 0 }) as unknown as Match;
const render = (name: string, matches: Match[], members: number) =>
  renderToStaticMarkup(createElement(TogetherSection, { together: togetherFor(name, matches, members) }));

describe("TogetherSection (FR-D12)", () => {
  it("shows 'ביחד' and the two-member badge, 'התאמה' in bold, ink on sand with a heart", () => {
    const html = render("נועם", [match("נועם", 2)], 2);
    expect(html).toContain('<h3 class="text-tag text-ink-soft">ביחד</h3>');
    expect(html).toContain("bg-sand");
    expect(html).toContain("text-ink");
    expect(html).toContain('<b class="font-bold">התאמה</b> · שניים שמרו את השם הזה');
    expect(html).toContain("<svg");
    expect(html).not.toMatch(/green/);
  });

  it("counts the members from 3 up", () => {
    expect(render("נועם", [match("נועם", 3)], 3)).toContain("</b> · 3 שמרו את השם הזה");
  });

  it("is hidden for a name that isn't a match and in a space of one", () => {
    expect(render("נועם", [match("יעל", 2)], 2)).toBe("");
    expect(render("נועם", [match("נועם", 2)], 1)).toBe("");
  });
});
