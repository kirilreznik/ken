import type { PrepCategory } from "./types";

/** Starter checklist offered on first use (editable afterwards). */
export const PREP_DEFAULTS: Array<[PrepCategory, string, number?]> = [
  ["stroller", "עגלה"],
  ["car_seat", "כיסא בטיחות לרכב"],
  ["sleep", "מיטת תינוק"], ["sleep", "מזרן למיטה"], ["sleep", "סדינים", 3], ["sleep", "שק שינה", 2], ["sleep", "מוניטור"],
  ["clothes", "בגדי גוף 0–3 חודשים", 6], ["clothes", "אוברולים", 4], ["clothes", "כובעים", 2], ["clothes", "גרביים", 4], ["clothes", "בגד יציאה מבית החולים"],
  ["bath", "אמבטיה"], ["bath", "מגבות עם כובע", 2], ["bath", "תכשירי רחצה לתינוק"], ["bath", "מספריים לציפורניים"],
  ["feeding", "בקבוקים", 3], ["feeding", "מוצצים", 2], ["feeding", "כרית הנקה"], ["feeding", "חיתולי בד", 6],
  ["nursery", "שידת החתלה"], ["nursery", "משטח החתלה"], ["nursery", "פח חיתולים"], ["nursery", "מנורת לילה"],
  ["birth_bag", "חלוק ונעלי בית"], ["birth_bag", "מטען ארוך לטלפון"], ["birth_bag", "בגדים נוחים ליציאה"], ["birth_bag", "חטיפים ובקבוק מים"],
  ["birth_bag", "תעודות זהות וכרטיס מעקב הריון"], ["birth_bag", "חיתולים לנולד"],
  ["misc", "חיתולים", 2], ["misc", "מגבונים", 4], ["misc", "משחה לתפרחת חיתולים"], ["misc", "מנשא"],
];
