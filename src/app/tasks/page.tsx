"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { Avatar, EmptyState, PriorityTag } from "@/components/ui";
import { useQuick } from "@/components/QuickActions";
import { sortTasks, usePregnancy, useSave, useTasks } from "@/lib/data";
import { useSession } from "@/lib/session";
import { daysBetween, parseDay, weekOf } from "@/lib/pregnancy";
import { fmtShort, relDays } from "@/lib/format";
import { TASK_CATEGORY_COLOR, TASK_CATEGORY_LABEL } from "@/lib/labels";
import type { Task, TaskCategory } from "@/lib/types";

type View = "date" | "trimester";

function TaskRow({ t, onToggle, onOpen }: { t: Task; onToggle: (t: Task) => void; onOpen: (t: Task) => void }) {
  const { members, nameOf } = useSession();
  const now = new Date();
    const overdue = t.due_date && !t.done && daysBetween(now, parseDay(t.due_date)) < 0;
    return (
      <div className="flex items-center gap-3.5 px-4 md:px-5 py-3.5 min-h-16 border-b border-line-2 last:border-0">
        <input type="checkbox" className="cb" checked={t.done} onChange={() => onToggle(t)} aria-label={t.done ? `ביטול סימון: ${t.title}` : `סימון כבוצע: ${t.title}`} />
        <button className="flex-1 min-w-0 text-start" onClick={() => onOpen(t)}>
          <div className={`font-bold ${t.done ? "line-through text-[#8a8177]" : ""}`}>{t.title}</div>
          <div className="flex gap-2 items-center text-[13px] text-ink-3 mt-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-bold"><i className="w-[7px] h-[7px] rounded-full" style={{ background: TASK_CATEGORY_COLOR[t.category] }} />{TASK_CATEGORY_LABEL[t.category]}</span>
            {t.due_date && !t.done && <><span>·</span><span style={overdue || t.priority === "urgent" ? { color: "var(--st-att)", fontWeight: 700 } : undefined}>{overdue ? `עבר מועד · ${fmtShort(t.due_date)}` : relDays(t.due_date) === "היום" ? "היום" : `עד ${fmtShort(t.due_date)}`}</span></>}
            {t.done && t.done_at && <><span>·</span><span>בוצע {relDays(t.done_at)}{t.done_by ? ` ע״י ${nameOf(t.done_by)}` : ""}</span></>}
            {t.notes && !t.done && <><span>·</span><Icon name="pen" size={13} /></>}
          </div>
        </button>
        {!t.done && t.priority !== "normal" && t.priority !== "low" && <PriorityTag p={t.priority} />}
        {t.assignee ? <Avatar name={nameOf(t.assignee)} tone={members.findIndex((m) => m.user_id === t.assignee)} /> : <span className="text-xs font-bold text-ink-3">שנינו</span>}
      </div>
    );
  }

export default function Tasks() {
  const { user, space } = useSession();
  const wk = usePregnancy();
  const quick = useQuick();
  const save = useSave("tasks");
  const { data: tasks, isLoading } = useTasks();
  const [view, setView] = useState<View>("date");
  const [cat, setCat] = useState<TaskCategory | "all">("all");
  const [mine, setMine] = useState(false);
  const [showDone, setShowDone] = useState(false);
  if (!space || !wk) return null;

  const all = sortTasks((tasks ?? []).filter((t) => (cat === "all" || t.category === cat) && (!mine || t.assignee === user?.id || !t.assignee)));
  const open = all.filter((t) => !t.done);
  const done = all.filter((t) => t.done).sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""));
  const now = new Date();
  const bucket = (t: Task) => {
    if (!t.due_date) return "later";
    const d = daysBetween(now, parseDay(t.due_date));
    return d <= 0 ? "today" : d <= 14 ? "soon" : "later";
  };
  const triOf = (t: Task) => t.trimester ?? (t.due_date ? (weekOf(space.due_date, t.due_date) < 14 ? 1 : weekOf(space.due_date, t.due_date) < 28 ? 2 : 3) : null);
  const groups = view === "date"
    ? [
        { key: "today", title: "היום", sub: "וגם מה שעבר מועדו", items: open.filter((t) => bucket(t) === "today") },
        { key: "soon", title: "בקרוב", sub: "14 הימים הקרובים", items: open.filter((t) => bucket(t) === "soon") },
        { key: "later", title: "בהמשך", sub: "", items: open.filter((t) => bucket(t) === "later") },
      ]
    : [1, 2, 3].map((n) => ({ key: `t${n}`, title: `שליש ${["ראשון", "שני", "שלישי"][n - 1]}${wk.trimester === n ? " · עכשיו" : ""}`, sub: "", items: open.filter((t) => triOf(t) === n) }))
        .concat([{ key: "none", title: "ללא מועד", sub: "", items: open.filter((t) => triOf(t) == null) }]);

  const toggle = (t: Task) => save.update(t.id, t.done ? { done: false, done_at: null, done_by: null } : { done: true, done_at: new Date().toISOString(), done_by: user!.id });
  const myOpen = (tasks ?? []).filter((t) => !t.done && t.assignee === user?.id).length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]"><h1 className="font-serif text-[34px] md:text-[40px] leading-tight">משימות</h1><p className="text-ink-3 mt-1">{open.length} פתוחות · {done.length} הושלמו{myOpen ? ` · ${myOpen} שלך` : ""}</p></div>
        <div className="seg"><button aria-pressed={view === "date"} onClick={() => setView("date")}>לפי מועד</button><button aria-pressed={view === "trimester"} onClick={() => setView("trimester")}>לפי שליש</button></div>
        <button className="btn btn-primary" onClick={() => quick({ kind: "task" })}><Icon name="plus" />משימה חדשה</button>
      </header>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        <button className="chip" aria-pressed={mine} onClick={() => setMine(!mine)}><Icon name="users" size={16} />שלי</button>
        <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>הכל</button>
        {(Object.keys(TASK_CATEGORY_LABEL) as TaskCategory[]).map((c) => (
          <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}><i className="w-2 h-2 rounded-full" style={{ background: TASK_CATEGORY_COLOR[c] }} />{TASK_CATEGORY_LABEL[c]}</button>
        ))}
      </div>

      {isLoading && !tasks ? null : (tasks ?? []).length === 0 ? (
        <EmptyState title="עוד אין משימות" text="הוסיפו משימות לשניכם — טפסים, קניות, הרשמות — ותראו מה פתוח בכל רגע." action={<button className="btn btn-primary mt-2" onClick={() => quick({ kind: "task" })}><Icon name="plus" />משימה ראשונה</button>} />
      ) : (
        <>
          {groups.filter((g) => g.items.length).map((g) => (
            <section key={g.key} className="flex flex-col gap-2.5">
              <div className="flex items-baseline gap-2.5 px-1"><h2 className="text-lg font-extrabold">{g.title}</h2><span className="text-sm text-ink-3 font-semibold">{g.sub || `${g.items.length}`}</span></div>
              <div className="card overflow-hidden">{g.items.map((t) => <TaskRow key={t.id} t={t} onToggle={toggle} onOpen={(x) => quick({ kind: "task", initial: x })} />)}</div>
            </section>
          ))}
          {open.length === 0 && <p className="text-ink-3 px-1">אין משימות פתוחות בסינון הזה.</p>}
          {done.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <button className="card flex items-center gap-3 px-5 py-4 font-extrabold text-ink-2 bg-surface-2 shadow-none" aria-expanded={showDone} onClick={() => setShowDone(!showDone)}>
                <Icon name="check" style={{ color: "var(--primary)" }} />הושלם<span className="text-ink-3 font-semibold">{done.length} משימות</span>
                <Icon name="chevD" className="ms-auto" style={showDone ? { transform: "rotate(180deg)" } : undefined} />
              </button>
              {showDone && <div className="card overflow-hidden">{done.map((t) => <TaskRow key={t.id} t={t} onToggle={toggle} onOpen={(x) => quick({ kind: "task", initial: x })} />)}</div>}
            </section>
          )}
        </>
      )}
    </div>
  );
}
