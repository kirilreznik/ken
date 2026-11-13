import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import DecisionButtons, { pressedAct } from "@/components/names/DecisionButtons";
import type { Vote } from "@/lib/names/types";

const render = (pressed?: Vote | null) =>
  renderToStaticMarkup(createElement(DecisionButtons, { onDecide: () => {}, pressed }));

/** The opening tag of the button with this data-act. */
function tag(html: string, act: string): string {
  const m = html.match(new RegExp(`<button[^>]*data-act="${act}"[^>]*>`));
  if (!m) throw new Error(`no ${act} button`);
  return m[0];
}
const CHECK = "M5 12.5l4.5 4.5L19 7.5";

describe("DecisionButtons", () => {
  it("keeps the swipe screen's order, labels and data-act, with no aria-pressed", () => {
    const html = render();
    expect([...html.matchAll(/data-act="(\w+)"/g)].map((m) => m[1])).toEqual(["keep", "love", "skip"]);
    expect(tag(html, "keep")).toContain('aria-label="שמירה לרשימה"');
    expect(tag(html, "love")).toContain('aria-label="אהבתי מאוד"');
    expect(tag(html, "skip")).toContain('aria-label="דילוג"');
    expect(tag(html, "skip")).toContain('aria-haspopup="menu"');
    expect(html).not.toContain("aria-pressed");
    expect(html).not.toContain(CHECK);
    expect(html).not.toContain("ring-2");
  });

  it("marks the current vote as pressed, with a ring and a check (not color alone)", () => {
    const html = render("love");
    expect(tag(html, "love")).toContain('aria-pressed="true"');
    expect(tag(html, "love")).toContain("ring-2 ring-ink");
    expect(tag(html, "keep")).toContain('aria-pressed="false"');
    expect(tag(html, "skip")).toContain('aria-pressed="false"');
    expect(tag(html, "keep")).not.toContain("ring-2");
    expect(html.split(CHECK)).toHaveLength(2);
  });

  it("shows every button unpressed when the name has no vote yet", () => {
    const html = render(null);
    for (const act of ["keep", "love", "skip"]) expect(tag(html, act)).toContain('aria-pressed="false"');
    expect(html).not.toContain(CHECK);
  });

  it("reads a hidden name as skip", () => {
    expect(pressedAct("hidden")).toBe("skip");
    expect(pressedAct("keep")).toBe("keep");
    expect(pressedAct(null)).toBeNull();
    expect(pressedAct(undefined)).toBeNull();
    expect(tag(render("hidden"), "skip")).toContain('aria-pressed="true"');
  });
});
