import type { LegalDoc } from "@/lib/names/legal";
import { CBS_ACCESSED } from "@/lib/names/report";
import { TERMS_VERSION } from "./versions";

/** Shown with the draft banner until the legal review (SETUP §3.3); then false and bump the version. */
export const LEGAL_DRAFT = true;

export const TERMS_OF_USE_VERSION = TERMS_VERSION;

/**
 * Terms of use draft (FR-W31): general information, no medical advice, CBS attribution, AI-written
 * texts may be wrong, acceptable use, account deletion, operator and contact from env.
 */
export const terms: LegalDoc = {
  title: "תנאי שימוש",
  description: "התנאים לשימוש בבחירת שם של Nest: מידע כללי, מקור הנתונים, שימוש הוגן ומחיקת החשבון.",
  version: TERMS_OF_USE_VERSION,
  updated: "4 בנובמבר 2026",
  intro:
    "בחירת שם היא חלק מ־Nest ומופעלת על ידי {operator}. השימוש בשירות כפוף לתנאים האלה ולמדיניות הפרטיות.",
  sections: [
    {
      title: "מה השירות",
      paragraphs: [
        "כלי לבחירת שם לתינוק או לתינוקת, לבד או ביחד: עוברים על שמות, שומרים, מדלגים ומגלים התאמות. המידע בשירות הוא מידע כללי בלבד ואינו ייעוץ רפואי או מקצועי.",
      ],
    },
    {
      title: "גיל",
      paragraphs: ["צריך להיות בני או בנות 18 ומעלה ולאשר את התנאים ואת מדיניות הפרטיות."],
    },
    {
      title: "מקור הנתונים",
      paragraphs: [
        `מספרי הלידות לקוחים מנתוני הלשכה המרכזית לסטטיסטיקה, הודעה לתקשורת 391/2025, שמות שניתנו ליילודים 1949–2024 (נשלף ב־${CBS_ACCESSED}). השימוש בנתונים לא מעיד על תמיכה של הלמ"ס ב־Nest. הנתונים מוצגים כפי שהם, ויכולות להיות בהם טעויות.`,
      ],
    },
    {
      title: "הפירושים",
      paragraphs: [
        "הפירושים, מקור השם ומשמעותו נכתבו בעזרת בינה מלאכותית ועשויים להכיל טעויות. אפשר לדווח על טעות מתוך \"על הנתונים\".",
      ],
    },
    {
      title: "שימוש הוגן",
      items: [
        "להשתמש בשירות לבחירת שם, לבד או ביחד.",
        "לא להוסיף שמות או לכתוב דיווחים פוגעניים.",
        "לא לנסות לגשת לחשבונות או למידע של אחרים, ולא לפגוע בפעילות השירות.",
        "לשתף קישור הזמנה רק עם מי שרוצים לבחור איתו או איתה.",
      ],
    },
    {
      title: "החשבון",
      paragraphs: [
        "אפשר לצאת מהחשבון או למחוק אותו בכל רגע מההגדרות. המחיקה מוחקת את כל הבחירות שלך; מרחב משותף נשאר אצל הצד השני.",
      ],
    },
    {
      title: "שינויים בשירות ובתנאים",
      paragraphs: [
        "השירות עשוי להשתנות. כשהתנאים משתנים, הגרסה והתאריך בעמוד הזה מתעדכנים.",
      ],
    },
    {
      title: "יצירת קשר",
      paragraphs: ["מפעיל השירות: {operator}. לשאלות ולבקשות: {contact}."],
    },
  ],
};
