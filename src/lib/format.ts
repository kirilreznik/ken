import { daysBetween, parseDay } from "./pregnancy";

const dayFmt = new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long" });
const dayYearFmt = new Intl.DateTimeFormat("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric" });
const fullNumFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
const monthFmt = new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric" });
const monthShort = new Intl.DateTimeFormat("he-IL", { month: "short" });
const weekdayShort = new Intl.DateTimeFormat("he-IL", { weekday: "short" });

const asDate = (d: string | Date) => (typeof d === "string" ? (d.length <= 10 ? parseDay(d) : new Date(d)) : d);

/** "יום שני, 12 באוקטובר" */
export const fmtDay = (d: string | Date) => dayFmt.format(asDate(d));
export const fmtDayYear = (d: string | Date) => dayYearFmt.format(asDate(d));
/** "12.10" */
export const fmtShort = (d: string | Date) => shortFmt.format(asDate(d)).replace(/\//g, ".");
/** "12.10.2026" */
export const fmtNum = (d: string | Date) => fullNumFmt.format(asDate(d)).replace(/\//g, ".");
export const fmtTime = (d: string | Date) => timeFmt.format(asDate(d));
export const fmtMonth = (d: Date) => monthFmt.format(d);
export const fmtMonthShort = (d: string | Date) => monthShort.format(asDate(d));
export const fmtWeekdayShort = (d: string | Date) => weekdayShort.format(asDate(d));

/** "היום" / "מחר" / "בעוד 9 ימים" / "לפני 3 ימים" */
export function relDays(d: string | Date, now = new Date()) {
  const n = daysBetween(now, asDate(d));
  if (n === 0) return "היום";
  if (n === 1) return "מחר";
  if (n === -1) return "אתמול";
  if (n === 2) return "מחרתיים";
  if (n > 0) return `בעוד ${n} ימים`;
  return `לפני ${-n} ימים`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
}

export const plural = (n: number, one: string, many: string) => (n === 1 ? one : `${n} ${many}`);
