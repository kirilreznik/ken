"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { useSession } from "@/lib/session";
import { usePrepItems, useAppointments, useSave, useSuggestionStates, useTasks, usePregnancy } from "@/lib/data";
import { buildSuggestions, suggestionDueDate, type Suggestion } from "@/lib/suggestions";
import { TASK_CATEGORY_COLOR, TASK_CATEGORY_LABEL } from "@/lib/labels";

/** "הצעות לשבוע" — week-based checklist nudges the couple can add as tasks or dismiss. */
export function SuggestionsCard({ limit = 3 }: { limit?: number }) {
  const { space, user } = useSession();
  const wk = usePregnancy();
  const { data: appts } = useAppointments();
  const { data: tasks } = useTasks();
  const { data: prep } = usePrepItems();
  const { states, set } = useSuggestionStates();
  const saveTask = useSave("tasks");
  const [all, setAll] = useState(false);

  const list = useMemo(
    () => (wk ? buildSuggestions({ week: wk.week, appointments: appts, tasks, prep, states }) : []),
    [wk, appts, tasks, prep, states],
  );
  if (!wk || !space || !user || list.length === 0) return null;
  const shown = all ? list : list.slice(0, limit);

  const add = (s: Suggestion) => {
    saveTask.insert({
      title: s.title, category: s.category, priority: s.priority, due_week: s.dueWeek,
      due_date: suggestionDueDate(space.due_date, s.dueWeek), source_key: s.key, notes: s.why,
      done: false, done_at: null, done_by: null, trimester: wk.trimester, assignee: null,
      appointment_id: s.appointmentId ?? null, document_id: null, created_by: user.id,
    });
    set(s.key, "added");
  };

  return (
    <section aria-label="הצעות לשבוע" className="card p-5 md:p-6 flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-none bg-primary-100 text-primary"><Icon name="flag" /></span>
        <div className="flex-1"><h2 className="text-lg font-extrabold">הצעות לשבוע {wk.week}</h2><p className="text-[13px] text-ink-3">דברים שכדאי לסגור בתקופה הזו. אפשר להוסיף למשימות או לדלג.</p></div>
      </div>
      {shown.map((s) => (
        <div key={s.key} className="flex items-center gap-3 py-3 border-b border-line-2 last:border-0 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="font-bold">{s.title}</div>
            <div className="text-[13px] text-ink-3 mt-0.5 flex gap-2 flex-wrap items-center">
              <span className="inline-flex items-center gap-1.5 font-bold"><i className="w-[7px] h-[7px] rounded-full" style={{ background: TASK_CATEGORY_COLOR[s.category] }} />{TASK_CATEGORY_LABEL[s.category]}</span>
              <span>·</span><span style={s.priority === "urgent" ? { color: "var(--st-att)", fontWeight: 700 } : undefined}>עד שבוע {s.dueWeek}</span>
              <span>·</span><span>{s.why}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary h-9 min-h-0 px-3 text-sm" onClick={() => add(s)}><Icon name="plus" size={16} />למשימות</button>
            <button className="btn btn-ghost h-9 min-h-0 px-3 text-sm" onClick={() => set(s.key, "dismissed")} aria-label={`דילוג: ${s.title}`}>דילוג</button>
          </div>
        </div>
      ))}
      {list.length > limit && (
        <button className="text-sm font-bold text-primary self-start mt-2" onClick={() => setAll((v) => !v)}>{all ? "פחות" : `עוד ${list.length - limit} הצעות`}</button>
      )}
    </section>
  );
}
