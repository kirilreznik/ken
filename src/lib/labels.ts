import type { AppointmentKind, DisplayStatus, DocCategory, JournalKind, PrepCategory, PrepStatus, Priority, TaskCategory } from "./types";

export const KIND_LABEL: Record<AppointmentKind, string> = {
  doctor: "תור לרופא",
  ultrasound: "אולטרסאונד",
  blood: "בדיקת דם",
  genetic: "בדיקה גנטית",
  medical: "בדיקה רפואית",
  other: "אחר",
};

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  future: "עתידי",
  need: "צריך לקבוע",
  scheduled: "נקבע",
  done: "בוצע",
  pending: "ממתין לתוצאה",
  completed: "הושלם",
  attention: "דורש טיפול",
};

/** The happy-path flow shown as a stepper. */
export const STATUS_FLOW: DisplayStatus[] = ["need", "scheduled", "done", "pending", "completed"];

export const DOC_CATEGORY_LABEL: Record<DocCategory, string> = {
  blood: "בדיקות דם",
  ultrasound: "אולטרסאונד",
  scan: "סקירות",
  genetic: "גנטיקה",
  referral: "הפניות",
  summary: "סיכומי רופא",
  receipt: "קבלות / החזרים",
  other: "אחר",
};

export const TASK_CATEGORY_LABEL: Record<TaskCategory, string> = {
  medical: "רפואי",
  pregnancy: "הריון",
  admin: "בירוקרטיה",
  baby: "תינוק",
  home: "בית",
  birth: "הכנה ללידה",
};
export const TASK_CATEGORY_COLOR: Record<TaskCategory, string> = {
  medical: "#35526E",
  pregnancy: "var(--primary)",
  admin: "#6A4A78",
  baby: "#A85A36",
  home: "#8A6A2A",
  birth: "#3D3832",
};

export const PRIORITY_LABEL: Record<Priority, string> = { urgent: "דחוף", high: "גבוהה", normal: "רגילה", low: "נמוכה" };

export const PREP_CATEGORY_LABEL: Record<PrepCategory, string> = {
  stroller: "עגלה",
  car_seat: "כיסא בטיחות",
  sleep: "שינה",
  clothes: "בגדים",
  bath: "אמבטיה",
  feeding: "האכלה",
  nursery: "חדר תינוק",
  birth_bag: "תיק לידה",
  misc: "שונות",
};

export const PREP_STATUS_LABEL: Record<PrepStatus, string> = {
  need: "צריך",
  reviewing: "בבדיקה",
  chosen: "נבחר",
  bought: "נקנה",
  not_needed: "לא צריך",
};
export const PREP_STATUS_ORDER: PrepStatus[] = ["need", "reviewing", "chosen", "bought", "not_needed"];
/** Ready = chosen or bought (not_needed items are excluded from the total). */
export const isPrepReady = (s: PrepStatus) => s === "chosen" || s === "bought";

export const JOURNAL_KIND_LABEL: Record<JournalKind, string> = {
  note: "רשומה",
  milestone: "אבן דרך",
  ultrasound: "אולטרסאונד",
  photo: "תמונה",
};

export const BIRTH_PREFERENCE_SUGGESTIONS = [
  "פתוחה לאפידורל", "מעדיפה בלי אפידורל", "מגע עור לעור מיד", "חיתוך חבל טבור מושהה",
  "בן/בת הזוג חותכים את חבל הטבור", "תאורה עמומה", "מוזיקה שלנו בחדר", "תנועה חופשית בצירים",
  "הנקה בשעה הראשונה", "לינה משותפת",
];

export const QUESTION_CATEGORIES = ["תוצאות", "אורח חיים", "תרופות ותוספים", "בדיקות", "הכנה ללידה", "תזונה", "אחר"];
