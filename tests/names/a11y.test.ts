import { describe, expect, it } from "vitest";
import namesFile from "../../data/names/names.json";
import contentFile from "./fixtures/name-content-sample.json";
import { barLabel, cardLabel, savedLabel, statusText } from "@/lib/names/a11y";
import { contentNames, parseContent, parseNames, type RawContentFile, type RawNamesFile } from "@/lib/names/data";
import { countLine, trend } from "@/lib/names/popularity";
import { sexSplit, sexTag } from "@/lib/names/sex";

const names = parseNames(namesFile as RawNamesFile);
const content = parseContent(contentFile as RawContentFile);
const cards = contentNames(content).map((name) => {
  const stats = names.get(name)!;
  return {
    stats,
    content: content.get(name)!,
    derived: { sexTag: sexTag(stats), countLine: countLine(stats), trend: trend(stats), ...sexSplit(stats) },
  };
});
const byName = new Map(cards.map((c) => [c.stats.name, c]));

const CARD_LABELS: Record<string, string> = {
  זיו: "זיו, מתאים לכולם, זיו הוא אור, זוהר וברק. שם קצר שניתן לבנים ולבנות, ניתן ל־302 תינוקות ב־2024, יציב",
  נועם: "נועם, מתאים לכולם, נעימות, עדינות. שם עברי שנפוץ כבר עשרות שנים, ניתן ל־",
  יעל: "יעל, בת, יעל היא עז הבר שחיה במצוקים, גם בעין גדי, ניתן ל־",
  לביא: "לביא, בן, לביא הוא אריה. שם שכמעט לא ניתן לפני 2010 והפך לאחד הנפוצים, ניתן ל־1,523 תינוקות ב־2024, יציב",
  תמר: "תמר, בת, עץ התמר ופריו, מסמלי הארץ, ניתן ל־",
  שקד: "שקד, מתאים לכולם, עץ השקד, שפורח ראשון בסוף החורף, ניתן ל־",
  אריאל: "אריאל, מתאים לכולם, אריה של אל. אחד השמות הנפוצים בישראל היום, ניתן ל־",
  אביגיל: "אביגיל, בת, אבי גיל: אבי הוא שמחה. שם שהפך נפוץ מאוד מאז שנות ה־2000, ניתן ל־",
  עמית: "עמית, מתאים לכולם, עמית הוא חבר, רע, מי שהולך לצדך, ניתן ל־",
  אלה: "אלה, בת, עץ האלה, עץ חסון ועתיק בנוף של ארץ ישראל, ניתן ל־",
};

describe("cardLabel", () => {
  it("covers the 10 content names", () => {
    expect(new Set(cards.map((c) => c.stats.name))).toEqual(new Set(Object.keys(CARD_LABELS)));
  });

  it.each(Object.entries(CARD_LABELS))("%s", (name, start) => {
    const card = byName.get(name)!;
    const label = cardLabel(card);
    expect(label.startsWith(start)).toBe(true);
    const t = card.derived.trend;
    const tail = t ? `${card.derived.countLine}, ${t.word}` : card.derived.countLine;
    expect(label.endsWith(tail)).toBe(true);
    expect(label).toMatch(/ניתן ל־[\d,]+ תינוקות ב־2024/u);
    expect(label).not.toContain(".,");
  });

  it("orders name, sex tag, intro, count, trend", () => {
    const amit = byName.get("עמית")!;
    expect(cardLabel(amit)).toBe(
      `עמית, מתאים לכולם, עמית הוא חבר, רע, מי שהולך לצדך, ${amit.derived.countLine}, בירידה`,
    );
  });

  it("omits the trend when it is null", () => {
    const card = { ...byName.get("זיו")!, derived: { ...byName.get("זיו")!.derived, trend: null } };
    expect(cardLabel(card)).toBe("זיו, מתאים לכולם, זיו הוא אור, זוהר וברק. שם קצר שניתן לבנים ולבנות, ניתן ל־302 תינוקות ב־2024");
  });
});

describe("barLabel", () => {
  it.each(cards.map((c) => [c.stats.name, c] as const))("%s matches its percentages", (_name, card) => {
    const { boysLabel, girlsLabel } = card.derived;
    const num = (l: string) => l.replace("%", "");
    expect(barLabel(card.derived)).toBe(`מאז 1949 ניתן ל־${num(boysLabel)} אחוז בנים ול־${num(girlsLabel)} אחוז בנות`);
  });

  it("reads whole percents", () => {
    expect(barLabel(sexSplit({ m: 71, f: 29 }))).toBe("מאז 1949 ניתן ל־71 אחוז בנים ול־29 אחוז בנות");
  });

  it("uses 'פחות מ־1' and 'מעל 99' at the extremes", () => {
    expect(barLabel(sexSplit({ m: 0, f: 500 }))).toBe("מאז 1949 ניתן ל־פחות מ־1 אחוז בנים ול־מעל 99 אחוז בנות");
    expect(barLabel(sexSplit({ m: 15234, f: 70 }))).toBe("מאז 1949 ניתן ל־מעל 99 אחוז בנים ול־פחות מ־1 אחוז בנות");
  });

  it("לביא reads over 99 percent boys", () => {
    expect(barLabel(byName.get("לביא")!.derived)).toBe("מאז 1949 ניתן ל־מעל 99 אחוז בנים ול־פחות מ־1 אחוז בנות");
  });
});

describe("statusText", () => {
  it.each(cards.map((c) => c.stats.name))("%s", (name) => {
    expect(statusText("keep", name)).toBe(`${name} נשמר`);
    expect(statusText("love", name)).toBe(`${name} נשמר, ראשון ברשימה`);
    expect(statusText("hidden", name)).toBe(`${name} לא יוצג שוב`);
    expect(statusText("skip", name)).toBe(`דילגת על ${name}`);
    expect(statusText("undo", name)).toBe(`בוטל: ${name}`);
  });
});

describe("savedLabel", () => {
  it("states the saved count", () => {
    expect(savedLabel(0)).toBe("השמות שלי: 0 נשמרו");
    expect(savedLabel(12)).toBe("השמות שלי: 12 נשמרו");
  });
});
