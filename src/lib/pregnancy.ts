const DAY = 86_400_000;
export const TERM_DAYS = 280;

/** Parse YYYY-MM-DD as a local date (no timezone shift). */
export function parseDay(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function toDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);
}
export function addDays(d: Date, n: number) {
  const x = startOfDay(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Gestational age in days on a given date, derived from the estimated due date. */
export function gestationalDays(dueDate: string, on: Date = new Date()) {
  return TERM_DAYS - daysBetween(on, parseDay(dueDate));
}

export interface WeekInfo {
  days: number;
  week: number;
  day: number;
  trimester: 1 | 2 | 3;
  percent: number; // 0..100
  daysLeft: number;
  label: string; // "16+5"
}

export function weekInfo(dueDate: string, on: Date = new Date()): WeekInfo {
  const days = Math.max(0, gestationalDays(dueDate, on));
  const week = Math.floor(days / 7);
  const day = days % 7;
  const trimester = week < 14 ? 1 : week < 28 ? 2 : 3;
  return {
    days,
    week,
    day,
    trimester,
    percent: Math.min(100, Math.round((days / TERM_DAYS) * 100)),
    daysLeft: Math.max(0, TERM_DAYS - days),
    label: `${week}+${day}`,
  };
}

/** Pregnancy week a calendar date falls in. */
export function weekOf(dueDate: string, date: string | Date) {
  const d = typeof date === "string" ? parseDay(date) : date;
  return Math.floor(gestationalDays(dueDate, d) / 7);
}
export function weekLabelOf(dueDate: string, date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const g = gestationalDays(dueDate, d);
  return `${Math.floor(g / 7)}+${g % 7}`;
}
/** First day of a given pregnancy week. */
export function dateOfWeek(dueDate: string, week: number) {
  return addDays(parseDay(dueDate), week * 7 - TERM_DAYS);
}

/** Approximate size comparisons (general information). */
const SIZES: Record<number, [string, string]> = {
  4: ["גרגר פרג", "פחות ממילימטר"], 5: ["שומשום", "כ־2 מ״מ"], 6: ["עדשה", "כ־4 מ״מ"], 7: ["אוכמנית", "כ־1 ס״מ"],
  8: ["פטל", "כ־1.6 ס״מ"], 9: ["ענב", "כ־2.3 ס״מ"], 10: ["תות", "כ־3 ס״מ"], 11: ["תאנה", "כ־4 ס״מ"],
  12: ["ליים", "כ־5.4 ס״מ · כ־14 גרם"], 13: ["שזיף", "כ־7.4 ס״מ · כ־23 גרם"], 14: ["לימון", "כ־8.7 ס״מ · כ־43 גרם"],
  15: ["תפוח", "כ־10 ס״מ · כ־70 גרם"], 16: ["אבוקדו", "כ־11.5 ס״מ · כ־100 גרם"], 17: ["רימון", "כ־13 ס״מ · כ־140 גרם"],
  18: ["פלפל", "כ־14 ס״מ · כ־190 גרם"], 19: ["מנגו", "כ־15 ס״מ · כ־240 גרם"], 20: ["בננה", "כ־25 ס״מ · כ־300 גרם"],
  21: ["גזר", "כ־27 ס״מ · כ־360 גרם"], 22: ["פפאיה קטנה", "כ־28 ס״מ · כ־430 גרם"], 23: ["אשכולית", "כ־29 ס״מ · כ־500 גרם"],
  24: ["קלח תירס", "כ־30 ס״מ · כ־600 גרם"], 25: ["כרובית", "כ־35 ס״מ · כ־660 גרם"], 26: ["חסה", "כ־36 ס״מ · כ־760 גרם"],
  27: ["כרוב", "כ־37 ס״מ · כ־875 גרם"], 28: ["חציל", "כ־38 ס״מ · כ־1 ק״ג"], 29: ["דלורית", "כ־39 ס״מ · כ־1.15 ק״ג"],
  30: ["כרוב גדול", "כ־40 ס״מ · כ־1.3 ק״ג"], 31: ["אננס קטן", "כ־41 ס״מ · כ־1.5 ק״ג"], 32: ["מלון קטן", "כ־42 ס״מ · כ־1.7 ק״ג"],
  33: ["אננס", "כ־44 ס״מ · כ־1.9 ק״ג"], 34: ["מלון", "כ־45 ס״מ · כ־2.1 ק״ג"], 35: ["מלון דבש", "כ־46 ס״מ · כ־2.4 ק״ג"],
  36: ["פפאיה", "כ־47 ס״מ · כ־2.6 ק״ג"], 37: ["דלעת ערמונים", "כ־49 ס״מ · כ־2.9 ק״ג"], 38: ["דלעת קטנה", "כ־50 ס״מ · כ־3.1 ק״ג"],
  39: ["אבטיח קטן", "כ־51 ס״מ · כ־3.3 ק״ג"], 40: ["אבטיח", "כ־51 ס״מ · כ־3.5 ק״ג"],
};
export function sizeFor(week: number) {
  const w = Math.min(40, Math.max(4, week));
  const [fruit, measure] = SIZES[w];
  return { fruit, measure };
}

const DEV: Array<[number, string, string | null]> = [
  [4, "ההריון רק התחיל — השליה ומערכת הדם הראשונית מתחילות להיווצר.", null],
  [6, "הלב מתחיל לפעום, ואיברים מרכזיים מתחילים להיווצר.", "בדיקת אולטרסאונד ראשונה נעשית לרוב בשבועות 6–8."],
  [9, "הידיים והרגליים מתארכות והאצבעות מתחילות להיפרד.", "זה זמן טוב לפתוח תיק מעקב הריון."],
  [11, "כל האיברים העיקריים קיימים וממשיכים לגדול ולהבשיל.", "שקיפות עורפית נעשית בשבועות 11–14."],
  [14, "תנועות הפנים מתפתחות והשלד מתחיל להתקשות.", "סקירה מוקדמת נעשית לרוב בשבועות 14–17."],
  [16, "מערכת השמיעה מתפתחת והתינוק מתחיל להגיב לצלילים מבחוץ.", "תנועות ראשונות מורגשות לרוב בין שבוע 16 ל־22."],
  [20, "חצי הדרך. התינוק נע הרבה, ויש לו מחזורי שינה וערות.", "סקירה מאוחרת נעשית לרוב בשבועות 20–24."],
  [24, "הריאות ממשיכות להתפתח ושכבת שומן מתחילה להצטבר.", "העמסת סוכר נעשית לרוב בשבועות 24–28."],
  [28, "העיניים נפתחות ונסגרות, והמוח מתפתח במהירות.", "תחילת השליש השלישי."],
  [32, "התינוק עולה במשקל במהירות ותופס יותר מקום.", "זמן טוב להתחיל לארגן את תיק הלידה."],
  [36, "רוב האיברים בשלים; התינוק ממשיך לצבור משקל.", "תרבית GBS נעשית לרוב בשבועות 35–37."],
  [38, "התינוק מוכן — כל יום מכאן הוא בונוס.", "כדאי שתיק הלידה יחכה ליד הדלת."],
];
export function developmentFor(week: number) {
  let hit = DEV[0];
  for (const row of DEV) if (week >= row[0]) hit = row;
  return { text: hit[1], milestone: hit[2] };
}

/** Standard Israeli prenatal checklist used to seed a new space. */
export const STANDARD_TESTS: Array<{ title: string; kind: "ultrasound" | "blood" | "genetic" | "medical"; from: number; to: number }> = [
  { title: "שקיפות עורפית", kind: "ultrasound", from: 11, to: 14 },
  { title: "סקר שליש ראשון — בדיקת דם", kind: "blood", from: 11, to: 14 },
  { title: "סקירה מוקדמת", kind: "ultrasound", from: 14, to: 17 },
  { title: "תבחין משולש", kind: "blood", from: 16, to: 20 },
  { title: "סקירת מערכות מאוחרת", kind: "ultrasound", from: 20, to: 24 },
  { title: "העמסת סוכר", kind: "blood", from: 24, to: 28 },
  { title: "ספירת דם ונוגדנים", kind: "blood", from: 27, to: 29 },
  { title: "תרבית GBS", kind: "medical", from: 35, to: 37 },
];
