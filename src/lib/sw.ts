"use client";
import { useEffect, useState } from "react";
import { report } from "./report";

/** Registers /sw.js in production and exposes "update available". */
export function useServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let reloading = false;
    const onCtrl = () => { if (!reloading) { reloading = true; window.location.reload(); } };
    navigator.serviceWorker.addEventListener("controllerchange", onCtrl);

    const v = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
    navigator.serviceWorker.register(`/sw.js?v=${v}`).then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        nw?.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) setWaiting(nw);
        });
      });
      const t = setInterval(() => reg.update().catch(() => {}), 30 * 60_000);
      return () => clearInterval(t);
    }).catch((e) => report(e, "sw"));
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onCtrl);
  }, []);

  return {
    updateReady: !!waiting,
    applyUpdate: () => waiting?.postMessage("SKIP_WAITING"),
    dismiss: () => setWaiting(null),
  };
}
