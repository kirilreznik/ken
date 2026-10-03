export type Palette = "neutral" | "girl" | "boy";

export interface Space {
  id: string;
  name: string;
  due_date: string; // YYYY-MM-DD
  palette: Palette;
  prep_budget?: number | null;
  calendar_token?: string | null;
  calendar_show_titles?: boolean;
  ai_reading_enabled?: boolean;
  created_by: string;
  created_at: string;
}

export type MemberRole = "pregnant" | "partner";
export interface Member {
  space_id: string;
  user_id: string;
  display_name: string;
  role?: MemberRole | null;
}

export type AppointmentKind = "doctor" | "ultrasound" | "blood" | "genetic" | "medical" | "other";
/** Stored status. "attention" is derived for display only. */
export type AppointmentStatus = "future" | "need" | "scheduled" | "done" | "pending" | "completed";
export type DisplayStatus = AppointmentStatus | "attention";

export interface Appointment {
  id: string;
  space_id: string;
  title: string;
  kind: AppointmentKind;
  status: AppointmentStatus;
  starts_at: string | null;
  window_start_week: number | null;
  window_end_week: number | null;
  provider: string | null;
  location: string | null;
  medical_notes: string | null;
  personal_note: string | null;
  result_summary: string | null;
  book_by_week?: number | null;
  source?: "plan" | "standard" | "manual" | null;
  plan_document_id?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type DocCategory = "blood" | "ultrasound" | "scan" | "genetic" | "referral" | "summary" | "receipt" | "plan" | "other";

export interface DocumentRow {
  id: string;
  space_id: string;
  title: string;
  category: DocCategory;
  doc_date: string;
  provider: string | null;
  note: string | null;
  tags: string[];
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  appointment_id: string | null;
  pinned_for_birth?: boolean;
  ai_status?: "pending" | "done" | "failed" | "dismissed" | null;
  ai_suggestion?: Record<string, unknown> | null;
  created_by?: string | null;
  created_at?: string;
}

export type TaskCategory = "medical" | "pregnancy" | "admin" | "baby" | "home" | "birth";
export type Priority = "urgent" | "high" | "normal" | "low";

export interface Task {
  id: string;
  space_id: string;
  title: string;
  category: TaskCategory;
  due_date: string | null;
  priority: Priority;
  notes: string | null;
  trimester: number | null;
  assignee: string | null;
  appointment_id: string | null;
  document_id: string | null;
  done: boolean;
  done_at: string | null;
  done_by: string | null;
  due_week?: number | null;
  source_key?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface Question {
  id: string;
  space_id: string;
  text: string;
  category: string | null;
  week: number | null;
  appointment_id: string | null;
  answer: string | null;
  resolved: boolean;
  sort: number;
  created_by?: string | null;
  created_at?: string;
}

export type PrepCategory = "stroller" | "car_seat" | "sleep" | "clothes" | "bath" | "feeding" | "nursery" | "birth_bag" | "misc";
export type PrepStatus = "need" | "reviewing" | "chosen" | "bought" | "not_needed";

export interface PrepItem {
  id: string;
  space_id: string;
  title: string;
  category: PrepCategory;
  status: PrepStatus;
  price: number | null;
  url: string | null;
  notes: string | null;
  recommended_by: string | null;
  image_path: string | null;
  compare_group: string | null;
  quantity: number;
  sort: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BirthPlan {
  space_id: string;
  hospital_name: string | null;
  hospital_ward: string | null;
  hospital_phone: string | null;
  hospital_address: string | null;
  tour_at: string | null;
  registration_done: boolean;
  caregiver_name: string | null;
  caregiver_phone: string | null;
  doula_status: string | null;
  route_notes: string | null;
  parking: string | null;
  travel_minutes_free: number | null;
  travel_minutes_peak: number | null;
  preferences: string[];
  preferences_note: string | null;
  updated_at?: string;
}

export interface Contact {
  id: string;
  space_id: string;
  name: string;
  role: string | null;
  phone: string | null;
  sort: number;
}

export type JournalKind = "note" | "milestone" | "ultrasound" | "photo";
export interface JournalEntry {
  id: string;
  space_id: string;
  author: string;
  entry_date: string;
  kind: JournalKind;
  title: string | null;
  body: string | null;
  photos: string[];
  visibility: "shared" | "private";
  hidden: boolean;
  include_in_book: boolean;
  appointment_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SuggestionState {
  space_id: string;
  key: string;
  status: "added" | "dismissed";
}

export type TableName = "appointments" | "documents" | "tasks" | "questions" | "prep_items" | "contacts" | "journal_entries";
export type RowOf<T extends TableName> = T extends "appointments" ? Appointment
  : T extends "documents" ? DocumentRow
  : T extends "tasks" ? Task
  : T extends "prep_items" ? PrepItem
  : T extends "contacts" ? Contact
  : T extends "journal_entries" ? JournalEntry
  : Question;

/** One row of the plan_imports table (AI or standard plan, reviewed before applying). */
export interface PlanImport {
  id: string;
  space_id: string;
  document_ids: string[];
  source: "document" | "standard";
  status: "pending" | "ready" | "applied" | "failed";
  result: PlanResult | null;
  error: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
export interface PlanResultItem {
  title: string;
  kind: AppointmentKind;
  window_start_week?: number | null;
  window_end_week?: number | null;
  window_start_date?: string | null;
  window_end_date?: string | null;
  book_by_week?: number | null;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  notes?: string | null;
  optional?: boolean;
  match_id?: string | null;
}
export interface PlanResult {
  due_date?: string | null;
  clinic?: string | null;
  general_notes?: string | null;
  items: PlanResultItem[];
}
