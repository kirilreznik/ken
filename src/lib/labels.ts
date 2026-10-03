import type { AppointmentKind, DisplayStatus, DocCategory, Priority, TaskCategory } from "./types";

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

export const QUESTION_CATEGORIES = ["תוצאות", "אורח חיים", "תרופות ותוספים", "בדיקות", "הכנה ללידה", "תזונה", "אחר"];
