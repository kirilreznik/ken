"use client";

import { useEffect } from "react";
import { reportClientLog } from "@/lib/names/clientLog";
import { SW_SCOPE, SW_URL, shouldRegisterWorker } from "@/lib/names/serviceWorker";

/** Registers the names service worker once the page has loaded (production only). */
export default function RegisterWorker() {
  useEffect(() => {
    if (!shouldRegisterWorker(process.env.NODE_ENV, "serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker
        .register(SW_URL, { scope: SW_SCOPE, updateViaCache: "none" })
        .catch(() => reportClientLog({ area: "sw", message: "register failed" }));
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);
  return null;
}
