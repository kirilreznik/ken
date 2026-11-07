import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SheetPanel } from "@/components/names/ui/BottomSheet";

// SheetPanel's props type requires children; spreading keeps them out of the createElement call.
const body = { children: "x" };
const labelledBy = (html: string) => html.match(/role="dialog"[^>]*aria-labelledby="([^"]+)"/)?.[1];

describe("BottomSheet heading", () => {
  it("names the dialog by its title row", () => {
    const html = renderToStaticMarkup(createElement(SheetPanel, { name: "about", title: "אודות", ...body }));
    const id = labelledBy(html);
    expect(id).toBeTruthy();
    expect(html).toContain(`<h2 id="${id}" class="text-title">אודות</h2>`);
  });

  it("renders a custom header instead of the title row and names the dialog by the id it was given", () => {
    const html = renderToStaticMarkup(
      createElement(SheetPanel, {
        name: "about",
        header: (titleId: string) => createElement("h2", { id: titleId, "data-test": "name" }, "אריאל"),
        footer: createElement("button", { type: "button" }, "שמירה"),
        detents: ["70", "full"] as const,
        ...body,
      }),
    );
    const id = labelledBy(html);
    expect(id).toBeTruthy();
    expect(html).toContain(`<h2 id="${id}" data-test="name">אריאל</h2>`);
    expect(html).not.toContain('class="text-title"');
    // The footer stays outside the scrolling body, above the safe-area inset.
    expect(html).toMatch(/<div class="shrink-0 px-5 pb-\[max\(1\.75rem,env\(safe-area-inset-bottom\)\)\]"><button[^>]*>שמירה<\/button><\/div><\/section>/);
  });

  it("slides in while open and out while closing, inert and without taps (PRD 3.2.12)", () => {
    const open = renderToStaticMarkup(createElement(SheetPanel, { name: "name", title: "x", detents: ["70", "full"] as const, ...body }));
    expect(open).toContain("names-sheet-in");
    expect(open).toContain("names-scrim-in");
    expect(open).not.toContain("inert");
    const closing = renderToStaticMarkup(
      createElement(SheetPanel, { name: "name", title: "x", detents: ["70", "full"] as const, closing: true, ...body }),
    );
    expect(closing).toContain("names-sheet-out");
    expect(closing).toContain("names-scrim-out");
    expect(closing).toContain("pointer-events-none");
    expect(closing).toMatch(/role="dialog"[^>]*inert=""/);
  });

  it("opens with its text unselectable, so a quick double tap doesn't select a word in it (ND-BUG-007)", () => {
    const html = renderToStaticMarkup(createElement(SheetPanel, { name: "name", title: "x", ...body }));
    expect(html).toMatch(/data-names-layer[^>]*class="[^"]*select-none \[-webkit-touch-callout:none\]/);
  });
});
