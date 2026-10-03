export type Palette = "neutral" | "girl" | "boy";

export interface Space {
  id: string;
  name: string;
  due_date: string; // YYYY-MM-DD
  palette: Palette;
  created_by: string;
  created_at: string;
}

export interface Member {
  space_id: string;
  user_id: string;
  display_name: string;
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
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type DocCategory = "blood" | "ultrasound" | "scan" | "genetic" | "referral" | "summary" | "receipt" | "other";

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

export type TableName = "appointments" | "documents" | "tasks" | "questions";
export type RowOf<T extends TableName> = T extends "appointments" ? Appointment
  : T extends "documents" ? DocumentRow
  : T extends "tasks" ? Task
  : Question;
