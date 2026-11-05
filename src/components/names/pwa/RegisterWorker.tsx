"use client";

import { useEffect } from "react";
import { reportClientLog } from "@/lib/names/clientLog";
import { SW_SCOPE, SW_URL, UPDATE_ACTION, UPDATE_TEXT, shouldRegisterWorker, watchForUpdates } from "@/lib/names/serviceWorker";
import { showToast } from "@/lib/names/toast";

/**
 * Registers the names service worker once the page has loaded (production only), checks
 * for a new one when the app comes back to the foreground, and offers "עדכון זמין" with
 * "רענון" when one is waiting (FR-W29).
 */
export default function RegisterWorker() {
  useEffect(() => {
    if (!shouldRegisterWorker(process.env.NODE_ENV, "serviceWorker" in navigator)) return;
    let stopped = false;
    let cleanup = () => {};
    const register = () => {
      navigator.serviceWorker
        .register(SW_URL, { scope: SW_SCOPE, updateViaCache: "none" })
        .then((reg) => {
          if (stopped) return;
          const stopWatch = watchForUpdates(
            reg,
            navigator.serviceWorker,
            (apply) => showToast(UPDATE_TEXT, { action: { label: UPDATE_ACTION, onAction: apply }, duration: 0 }),
            () => window.location.reload(),
          );
          const onVisible = () => {
            if (document.visibilityState === "visible" && navigator.onLine) reg.update().catch(() => {});
          };
          document.addEventListener("visibilitychange", onVisible);
          cleanup = () => {
            stopWatch();
            document.removeEventListener("visibilitychange", onVisible);
          };
        })
        .catch(() => reportClientLog({ area: "sw", message: "register failed" }));
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => {
      stopped = true;
      window.removeEventListener("load", register);
      cleanup();
    };
  }, []);
  return null;
}
