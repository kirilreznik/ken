"use client";

import { OFFLINE_MESSAGE } from "@/lib/names/authErrors";
import PanelNote from "./auth/PanelNote";
import { useOnline } from "./useMatches";

/** Sign-in screens, offline: "אין חיבור לאינטרנט. אפשר להיכנס כשהחיבור יחזור." (FR-W29). The live region stays mounted. */
export default function ConnectionNote() {
  const online = useOnline();
  return (
    // display: contents, so the empty region adds no flex gap while online.
    <div role="status" aria-live="polite" className="contents">
      {online ? null : <PanelNote icon="offline">{OFFLINE_MESSAGE}</PanelNote>}
    </div>
  );
}
