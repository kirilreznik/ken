"use client";

import { OFFLINE_MESSAGE } from "@/lib/names/authErrors";
import { useOnline } from "./useMatches";

/** Sign-in screens, offline: "אין חיבור לאינטרנט. הכניסה צריכה חיבור." (FR-W29). The live region stays mounted. */
export default function ConnectionNote() {
  const online = useOnline();
  return (
    // display: contents, so the empty region adds no flex gap while online.
    <div role="status" aria-live="polite" className="contents">
      {online ? null : (
        <p className="m-0 flex items-start gap-2 text-body font-medium text-ink">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 flex-none">
            <path d="M2 8.8a15 15 0 0 1 4.2-2.6M9.5 5.2A15 15 0 0 1 22 8.8M5 12.5a10 10 0 0 1 3-1.9M13 10.3a10 10 0 0 1 6 2.2M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />
          </svg>
          {OFFLINE_MESSAGE}
        </p>
      )}
    </div>
  );
}
