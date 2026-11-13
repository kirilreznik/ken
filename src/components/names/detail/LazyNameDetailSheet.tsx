"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ComponentType } from "react";
import { closeSheet } from "@/components/names/ui";
import { showToast } from "@/lib/names/toast";
import { NAME_SHEET } from "@/lib/names/urlLayer";
import type { NameDetailSheetProps } from "./NameDetailSheet";

export const SHEET_OFFLINE = "אין חיבור לאינטרנט. אפשר לפתוח את הפרטים כשהחיבור יחזור.";

let chunk: Promise<ComponentType<NameDetailSheetProps>> | null = null;

/**
 * Starts loading the sheet's code (PRD §8: it stays out of the swipe screen's first load). Safe
 * to call often; the screens call it when a card or a row is touched or focused. A failed load
 * (offline before the code was ever cached) is tried again on the next call.
 */
export function preloadNameDetail(): Promise<ComponentType<NameDetailSheetProps>> {
  chunk ??= import("./NameDetailSheet").then(
    (mod) => mod.default,
    (error: unknown) => {
      chunk = null;
      throw error;
    },
  );
  return chunk;
}

/**
 * "פרטי השם" loaded on demand: nothing renders and no sheet code loads until the URL first asks
 * for the name sheet. After that it stays mounted, so it slides out and opens again at once.
 */
export default function LazyNameDetailSheet(props: NameDetailSheetProps) {
  // useSearchParams needs a Suspense boundary on prerendered routes (Next 16).
  return (
    <Suspense fallback={null}>
      <Gate {...props} />
    </Suspense>
  );
}

function Gate(props: NameDetailSheetProps) {
  const wanted = useSearchParams().get("sheet") === NAME_SHEET;
  const [Sheet, setSheet] = useState<ComponentType<NameDetailSheetProps> | null>(null);

  useEffect(() => {
    if (!wanted || Sheet) return;
    let live = true;
    preloadNameDetail().then(
      (loaded) => {
        if (live) setSheet(() => loaded);
      },
      () => {
        // Without its code the sheet can't open: drop the layer and say why.
        if (!live) return;
        closeSheet(NAME_SHEET);
        showToast(SHEET_OFFLINE);
      },
    );
    return () => {
      live = false;
    };
  }, [wanted, Sheet]);

  return Sheet ? <Sheet {...props} /> : null;
}
