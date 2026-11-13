"use client";

import { Suspense, useEffect, useState, type ComponentType } from "react";
import { closeSheet, useLayerOpen } from "@/components/names/ui/layers";
import { showToast } from "@/lib/names/toast";
import type { SheetName } from "@/lib/names/urlLayer";

export const LAZY_SHEET_OFFLINE = "אין חיבור לאינטרנט. אפשר לפתוח את זה כשהחיבור יחזור.";

/**
 * A rarely opened sheet kept out of the screen's first load (PRD §3.1.8). Its code loads when the
 * browser is idle after the screen paints, or at once if the URL already asks for the sheet, so
 * a tap usually finds it ready. The loaded sheet gates itself on the URL as before. A failed load
 * (offline before the code was ever cached) drops the layer, says why and tries again next time.
 */
export function lazySheet<P extends object>(name: SheetName, load: () => Promise<{ default: ComponentType<P> }>) {
  let chunk: Promise<ComponentType<P>> | null = null;
  const preload = () =>
    (chunk ??= load().then(
      (mod) => mod.default,
      (error: unknown) => {
        chunk = null;
        throw error;
      },
    ));

  function Gate(props: P) {
    const wanted = useLayerOpen("sheet", name);
    const [Sheet, setSheet] = useState<ComponentType<P> | null>(null);

    useEffect(() => {
      if (Sheet) return;
      let live = true;
      const start = () =>
        preload().then(
          (loaded) => {
            if (live) setSheet(() => loaded);
          },
          () => {
            if (!live || !wanted) return;
            closeSheet(name);
            showToast(LAZY_SHEET_OFFLINE);
          },
        );
      if (wanted) {
        start();
        return () => {
          live = false;
        };
      }
      // Safari has no requestIdleCallback: a short timeout after the screen settles does the same.
      const idle = typeof window.requestIdleCallback === "function";
      const id = idle ? window.requestIdleCallback(start, { timeout: 4000 }) : window.setTimeout(start, 1500);
      return () => {
        live = false;
        if (idle) window.cancelIdleCallback(id);
        else window.clearTimeout(id);
      };
    }, [wanted, Sheet]);

    return Sheet ? <Sheet {...props} /> : null;
  }

  function LazySheet(props: P) {
    // useLayerOpen reads the search params, which needs a Suspense boundary on prerendered routes.
    return (
      <Suspense fallback={null}>
        <Gate {...props} />
      </Suspense>
    );
  }
  return LazySheet;
}
