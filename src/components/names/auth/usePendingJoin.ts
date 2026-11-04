"use client";

import { useSyncExternalStore } from "react";
import { readPendingJoin } from "@/lib/names/join";

const noop = () => () => {};

/**
 * The invite code waiting for sign-in (PRD 3.2.5): ?join= on this page, else sessionStorage
 * nest-names-join. Reading ?join= also stores it, so every later sign-in step still has it.
 */
export function usePendingJoin(): string | null {
  return useSyncExternalStore(
    noop,
    () => readPendingJoin(window.location.search),
    () => null,
  );
}
