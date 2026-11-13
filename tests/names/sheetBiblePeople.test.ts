import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CardBible from "@/components/names/card/CardBible";
import CardPeople from "@/components/names/card/CardPeople";

const BIBLE = { text: "פסוק לבדיקה.", ref: "ישעיהו כט, א" };
const PEOPLE = [
  { name: "אריאל זילבר", what: "זמר ויוצר" },
  { name: "אריאל זאבי", what: "ג׳ודוקא" },
  { name: "אריאל שלישי", what: "לא מוצג" },
];

const bible = (props: Parameters<typeof CardBible>[0]) => renderToStaticMarkup(createElement(CardBible, props));
const people = (props: Parameters<typeof CardPeople>[0]) => renderToStaticMarkup(createElement(CardPeople, props));

describe("CardBible in the sheet (FR-D10)", () => {
  it("puts the sheet label above the well, then the verse and its reference", () => {
    const html = bible({ bible: BIBLE, inSheet: true });
    expect(html.match(/מהתנ״ך/g)).toHaveLength(1);
    expect(html).toMatch(/^<section class="flex flex-col gap-2"><h3 class="text-tag text-ink-soft">מהתנ״ך<\/h3><div /);
    expect(html.indexOf(BIBLE.ref)).toBeGreaterThan(html.indexOf(BIBLE.text));
  });

  it("keeps the card look off the sheet", () => {
    const html = bible({ bible: BIBLE });
    expect(html).toContain('<h3 class="text-tag text-clay-deep">מהתנ״ך</h3>');
    expect(html).not.toContain("text-ink-soft\">מהתנ״ך");
  });

  it("is hidden when there is no verse", () => {
    expect(bible({ bible: undefined, inSheet: true })).toBe("");
  });
});

describe("CardPeople in the sheet (FR-D11)", () => {
  it("labels the section 'אנשים מוכרים בשם הזה' and shows up to 2 people", () => {
    const html = people({ people: PEOPLE, inSheet: true });
    expect(html).toContain('<h3 class="text-tag text-ink-soft">אנשים מוכרים בשם הזה</h3>');
    expect(html).toContain("אריאל זילבר");
    expect(html).toContain("אריאל זאבי");
    expect(html).not.toContain("אריאל שלישי");
  });

  it("keeps the card label off the sheet", () => {
    expect(people({ people: PEOPLE })).toContain("אנשים ידועים בשם הזה");
  });

  it("is hidden when there are no people", () => {
    expect(people({ people: [], inSheet: true })).toBe("");
  });
});
