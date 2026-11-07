import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SourceSection from "@/components/names/detail/SourceSection";

describe("SourceSection (FR-D17)", () => {
  it("names the source and offers the about and report sheets as 44 px buttons", () => {
    const html = renderToStaticMarkup(createElement(SourceSection));
    expect(html).toContain("מקור: הלשכה המרכזית לסטטיסטיקה");
    expect(html).toContain(">על הנתונים</button>");
    expect(html).toContain(">דיווח על טעות</button>");
    expect(html.match(/type="button"/g)).toHaveLength(2);
    expect(html.match(/min-h-11/g)).toHaveLength(2);
  });
});
