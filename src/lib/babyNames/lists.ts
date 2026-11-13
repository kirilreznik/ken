/** The five public list pages under /baby-names, all built from the deck names. */
import { allNamePages, type NamePage } from "./data";

export type ListId = "girls" | "boys" | "unisex" | "biblical" | "rising";

export interface NameList {
  id: ListId;
  /** The page's h1 and the card title on the hub. */
  title: string;
  /** The <title>, written for the search people type. */
  metaTitle: string;
  /** One or two sentences under the h1, and the meta description. */
  lead: string;
  /** How the list was made, under the list. */
  method: string;
  /** What the row's number column says for a name. */
  stat: (p: NamePage) => string;
  pages: () => NamePage[];
}

const fmt = new Intl.NumberFormat("he-IL");

/** Rising names need at least this many births in 2024, so tiny names don't top the list. */
export const RISING_MIN_2024 = 50;

const in2024 = (p: NamePage) => (p.count2024 > 0 ? `${fmt.format(p.count2024)} ב־2024` : "פחות מ־5 ב־2024");

/** Each list's names are computed once per build. */
function memo(make: () => NamePage[]): () => NamePage[] {
  let value: NamePage[] | null = null;
  return () => (value ??= make());
}

export const LISTS: NameList[] = [
  {
    id: "girls",
    title: "שמות לבנות",
    metaTitle: "שמות לבנות: 100 השמות הנפוצים ב־2024",
    lead: "100 שמות הבנות שניתנו הכי הרבה בישראל ב־2024, לפי נתוני הלמ״ס, עם משמעות קצרה לכל שם.",
    method: "שמות שלפחות 90% מהתינוקות שקיבלו אותם מאז 1949 הן בנות, לפי מספר התינוקות ב־2024.",
    stat: in2024,
    pages: memo(() => allNamePages().filter((p) => p.sexTag === "בת" && p.count2024 > 0).slice(0, 100)),
  },
  {
    id: "boys",
    title: "שמות לבנים",
    metaTitle: "שמות לבנים: 100 השמות הנפוצים ב־2024",
    lead: "100 שמות הבנים שניתנו הכי הרבה בישראל ב־2024, לפי נתוני הלמ״ס, עם משמעות קצרה לכל שם.",
    method: "שמות שלפחות 90% מהתינוקות שקיבלו אותם מאז 1949 הם בנים, לפי מספר התינוקות ב־2024.",
    stat: in2024,
    pages: memo(() => allNamePages().filter((p) => p.sexTag === "בן" && p.count2024 > 0).slice(0, 100)),
  },
  {
    id: "unisex",
    title: "שמות יוניסקס",
    metaTitle: "שמות יוניסקס: שמות שמתאימים לבנים ולבנות",
    lead: "שמות שניתנו גם לבנים וגם לבנות, עם החלוקה האמיתית בין בנים לבנות לפי נתוני הלמ״ס.",
    method: "שמות שאף מין לא מגיע בהם ל־90% מהתינוקות מאז 1949, לפי מספר התינוקות ב־2024.",
    stat: (p) => `${p.split.boysLabel} בנים · ${p.split.girlsLabel} בנות`,
    pages: memo(() => allNamePages().filter((p) => p.sexTag === "מתאים לכולם" && p.count2024 > 0).slice(0, 100)),
  },
  {
    id: "biblical",
    title: "שמות מהתנ״ך",
    metaTitle: "שמות תנכיים לבנים ולבנות, עם המקור בתנ״ך",
    lead: "שמות של דמויות ומקומות מהתנ״ך שהורים בישראל נותנים היום, כל אחד עם המקום שבו הוא מופיע.",
    method: "שמות שיש להם הערה מהתנ״ך, שנבדקה מול נוסח התנ״ך, לפי מספר התינוקות ב־2024.",
    stat: (p) => p.content.bible?.ref ?? in2024(p),
    pages: memo(() => allNamePages().filter((p) => p.content.bible?.text.trim() && p.count2024 > 0).slice(0, 150)),
  },
  {
    id: "rising",
    title: "שמות בעלייה",
    metaTitle: "שמות בעלייה: השמות שהכי עלו בישראל בשנים האחרונות",
    lead: "השמות שניתנו הרבה יותר בשנים 2022–2024 מאשר חמש שנים קודם, לפי נתוני הלמ״ס.",
    method: `ממוצע 2022–2024 לעומת ממוצע 2017–2019, שמות שעלו ב־25% לפחות וניתנו ל־${RISING_MIN_2024} תינוקות לפחות ב־2024.`,
    stat: (p) => `+${fmt.format(Math.round((p.trend?.change ?? 0) * 100))}%`,
    pages: memo(() =>
      allNamePages()
        .filter((p) => p.trend?.word === "בעלייה" && p.count2024 >= RISING_MIN_2024)
        .sort((a, b) => (b.trend?.change ?? 0) - (a.trend?.change ?? 0))
        .slice(0, 60)),
  },
];

export function listById(id: ListId): NameList {
  const list = LISTS.find((l) => l.id === id);
  if (!list) throw new Error(`Unknown name list ${id}`);
  return list;
}

export const listHref = (id: ListId) => `/baby-names/${id}`;
