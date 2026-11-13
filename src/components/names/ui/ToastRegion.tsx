"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { dismissToast, getToast, subscribeToast } from "@/lib/names/toast";

const serverToast = () => null;

const actionClass =
  "inline-flex min-h-11 shrink-0 items-center rounded-pill px-3 underline underline-offset-4 focus-visible:outline-surface";

/**
 * The one toast (showToast in src/lib/names/toast.ts): an ink pill near the bottom. The
 * role="status" region is always mounted so screen readers announce each new message, and
 * it stays usable while a sheet makes the rest of the page inert. It sits just above pinned
 * controls: a sheet's footer, the deck's action bar, the duel's "עצירה" (--names-toast-lift,
 * useToastLift in ./toastLift); one that stays until dismissed also above the deck card's
 * "לכל הפרטים" (--names-toast-lift-sticky).
 */
export function ToastRegion() {
  const toast = useSyncExternalStore(subscribeToast, getToast, serverToast);
  return (
    <div
      role="status"
      aria-live="polite"
      data-names-layer-keep
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-60 flex justify-center px-5 ${
        toast?.sticky
          ? "pb-[var(--names-toast-lift-sticky,max(1.5rem,env(safe-area-inset-bottom)))]"
          : "pb-[var(--names-toast-lift,max(1.5rem,env(safe-area-inset-bottom)))]"
      }`}
    >
      {toast ? (
        <div
          key={toast.id}
          // With a link too, the two controls drop under the message when they don't fit beside it.
          className={`names-toast-in pointer-events-auto flex min-h-11 max-w-md items-center gap-x-3 bg-ink py-1.5 ps-5 pe-2 text-body font-bold text-surface shadow-button ${
            toast.link ? "flex-wrap rounded-lg" : "rounded-pill"
          }`}
        >
          <span className="py-1">{toast.message}</span>
          {toast.action || toast.link ? (
            <span className="ms-auto flex shrink-0 items-center">
              {toast.action ? (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onAction();
                    dismissToast(toast.id);
                  }}
                  className={actionClass}
                >
                  {toast.action.label}
                </button>
              ) : null}
              {toast.link ? (
                <Link href={toast.link.href} onClick={() => dismissToast(toast.id)} className={actionClass}>
                  {toast.link.label}
                </Link>
              ) : null}
            </span>
          ) : (
            <span aria-hidden="true" className="w-3" />
          )}
        </div>
      ) : null}
    </div>
  );
}
