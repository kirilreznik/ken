"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AppointmentSheet, QuestionSheet, TaskSheet, UploadSheet } from "./sheets";
import type { Appointment, Question, Task } from "@/lib/types";

type Open =
  | { kind: "appointment"; initial?: Partial<Appointment> | null }
  | { kind: "task"; initial?: Partial<Task> | null }
  | { kind: "upload"; appointmentId?: string | null }
  | { kind: "question"; initial?: Partial<Question> | null }
  | null;

const Ctx = createContext<{ open: (o: Exclude<Open, null>) => void } | null>(null);

export function QuickProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Open>(null);
  const open = useCallback((o: Exclude<Open, null>) => setState(o), []);
  const close = () => setState(null);
  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <AppointmentSheet open={state?.kind === "appointment"} onClose={close} initial={state?.kind === "appointment" ? state.initial : null} />
      <TaskSheet open={state?.kind === "task"} onClose={close} initial={state?.kind === "task" ? state.initial : null} />
      <UploadSheet open={state?.kind === "upload"} onClose={close} appointmentId={state?.kind === "upload" ? state.appointmentId : null} />
      <QuestionSheet open={state?.kind === "question"} onClose={close} initial={state?.kind === "question" ? state.initial : null} />
    </Ctx.Provider>
  );
}

export function useQuick() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useQuick outside QuickProvider");
  return v.open;
}
