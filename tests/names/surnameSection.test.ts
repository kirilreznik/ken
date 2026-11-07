import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SurnameSection from "@/components/names/detail/SurnameSection";
import { SURNAME_PATH } from "@/lib/names/routing";

const render = (surname: string | null) => renderToStaticMarkup(createElement(SurnameSection, { name: "אריאל", surname }));

describe("SurnameSection (FR-D8)", () => {
  it("shows the name with the saved surname on a peach-pale well", () => {
    const html = render("  לוי  ");
    expect(html).toContain("עם שם המשפחה");
    expect(html).toMatch(/class="[^"]*bg-peach-pale[^"]*text-title[^"]*">אריאל לוי<\/p>/);
    expect(html).not.toContain("הוספת שם משפחה");
  });

  it("links to the surname field when none is saved", () => {
    for (const surname of [null, "", "   "]) {
      const html = render(surname);
      expect(html).toContain(`href="${SURNAME_PATH}"`);
      expect(html).toContain("הוספת שם משפחה");
      expect(html).not.toContain("עם שם המשפחה");
    }
  });
});
