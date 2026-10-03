"use client";

import { useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "./supabase";
import { useSession } from "./session";
import { weekInfo } from "./pregnancy";
import type { Appointment, DisplayStatus, DocumentRow, Question, RowOf, TableName, Task } from "./types";
import type { SaveVars } from "./queryClient";

export function useRows<T extends TableName>(table: T) {
  const { space } = useSession();
  return useQuery({
    queryKey: [table, space?.id],
    enabled: !!space,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").eq("space_id", space!.id);
      if (error) throw error;
      return data as RowOf<T>[];
    },
  });
}

export const useAppointments = () => useRows("appointments");
export const useDocuments = () => useRows("documents");
export const useTasks = () => useRows("tasks");
export const useQuestions = () => useRows("questions");

/** Insert / update / delete with optimistic cache updates; queued while offline. */
export function useSave<T extends TableName>(table: T) {
  const qc = useQueryClient();
  const { space } = useSession();
  const key = [table, space?.id];
  const m = useMutation<void, Error, SaveVars, { prev?: RowOf<T>[] }>({
    mutationKey: ["save"],
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<RowOf<T>[]>(key);
      qc.setQueryData<RowOf<T>[]>(key, (old = []) => {
        const id = vars.row.id;
        if (vars.mode === "delete") return old.filter((r) => r.id !== id);
        const i = old.findIndex((r) => r.id === id);
        if (i === -1) return [...old, vars.row as unknown as RowOf<T>];
        const copy = old.slice();
        copy[i] = { ...copy[i], ...(vars.row as object) } as RowOf<T>;
        return copy;
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
  return {
    insert: (row: Partial<RowOf<T>> & { id?: string }) => {
      const full = { id: crypto.randomUUID(), space_id: space!.id, ...row } as Record<string, unknown> & { id: string };
      m.mutate({ table, mode: "insert", row: full });
      return full.id;
    },
    update: (id: string, patch: Partial<RowOf<T>>) => m.mutate({ table, mode: "update", row: { ...(patch as object), id } }),
    remove: (id: string) => m.mutate({ table, mode: "delete", row: { id } }),
    isPending: m.isPending,
  };
}

/** Number of local changes not yet confirmed by the server. */
export function usePendingSync() {
  const pending = useMutationState({ filters: { mutationKey: ["save"], status: "pending" } });
  return pending.length;
}

/** Sort key for new items (seconds since epoch). */
export const nowSort = () => Date.now() / 1000;

/** Apply palette to <html> and remember it for the next cold start. */
export function applyPalette(p: string) {
  document.documentElement.dataset.palette = p;
  try { localStorage.setItem("kan-palette", p); } catch {}
}

/** Short-lived signed URL for a stored document (online only). */
export function useSignedUrl(doc: DocumentRow | null, enabled: boolean) {
  return useQuery({
    queryKey: ["signed", doc?.storage_path],
    enabled: !!doc && enabled,
    staleTime: 8 * 60_000,
    gcTime: 9 * 60_000,
    queryFn: () => signedUrl(doc!),
    meta: { persist: false },
  });
}

/* ───────────── Derived helpers ───────────── */

export function displayStatus(a: Appointment, currentWeek: number): DisplayStatus {
  if (a.status === "future" && a.window_start_week != null && currentWeek >= a.window_start_week) {
    return a.window_end_week != null && currentWeek >= a.window_end_week - 1 ? "attention" : "need";
  }
  if (a.status === "need" && a.window_end_week != null && currentWeek >= a.window_end_week - 1) return "attention";
  if (a.status === "scheduled" && a.starts_at && new Date(a.starts_at).getTime() < Date.now() - 3 * 3600_000) return "done";
  return a.status;
}

export function usePregnancy() {
  const { space } = useSession();
  return useMemo(() => (space ? weekInfo(space.due_date) : null), [space]);
}

export function sortAppointments(list: Appointment[]) {
  return list.slice().sort((a, b) => {
    const ta = a.starts_at ? new Date(a.starts_at).getTime() : Infinity;
    const tb = b.starts_at ? new Date(b.starts_at).getTime() : Infinity;
    if (ta !== tb) return ta - tb;
    return (a.window_start_week ?? 99) - (b.window_start_week ?? 99);
  });
}

export function nextAppointment(list: Appointment[] | undefined) {
  const now = Date.now();
  return sortAppointments(list ?? []).find((a) => a.status === "scheduled" && a.starts_at && new Date(a.starts_at).getTime() >= now - 2 * 3600_000) ?? null;
}

export const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 } as const;
export function sortTasks(list: Task[]) {
  return list.slice().sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const da = a.due_date ?? "9999";
    const db = b.due_date ?? "9999";
    if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority] && (a.priority === "urgent" || b.priority === "urgent"))
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    return da.localeCompare(db) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}

export function openQuestionsFor(questions: Question[] | undefined, appointmentId: string | null) {
  return (questions ?? []).filter((q) => !q.resolved && (appointmentId ? q.appointment_id === appointmentId || q.appointment_id == null : true))
    .sort((a, b) => a.sort - b.sort);
}

export async function signedUrl(doc: DocumentRow, seconds = 600) {
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, seconds);
  if (error) throw error;
  return data.signedUrl;
}
