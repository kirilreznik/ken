"use client";

import { useSyncExternalStore } from "react";
import { dismissToast, getToast, subscribeToast } from "@/lib/names/toast";

const serverToast = () => null;

/**
 * The one toast (showToast in src/lib/names/toast.ts): an ink pill near the bottom. The
 * role="status" region is always mounted so screen readers announce each new message, and
 * it stays usable while a sheet makes the rest of the page inert.
 */
export function ToastRegion() {
  const toast = useSyncExternalStore(subscribeToast, getToast, serverToast);
  return (
    <div
      role="status"
      aria-live="polite"
      data-names-layer-keep
      className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex justify-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      {toast ? (
        <div
          key={toast.id}
          className="names-toast-in pointer-events-auto flex min-h-11 max-w-md items-center gap-3 rounded-pill bg-ink py-1.5 ps-5 pe-2 text-body font-bold text-surface shadow-button"
        >
          <span className="py-1">{toast.message}</span>
          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                toast.action?.onAction();
                dismissToast(toast.id);
              }}
              className="min-h-11 shrink-0 rounded-pill px-3 underline underline-offset-4 focus-visible:outline-surface"
            >
              {toast.action.label}
            </button>
          ) : (
            <span aria-hidden="true" className="w-3" />
          )}
        </div>
      ) : null}
    </div>
  );
}
