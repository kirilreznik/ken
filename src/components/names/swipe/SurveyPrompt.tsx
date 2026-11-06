"use client";

import { useEffect } from "react";
import { IconButton, openSheet } from "@/components/names/ui";
import { track } from "@/lib/names/track";

/**
 * A slim invitation to the beta survey above the card. It doesn't cover the card or the
 * buttons: swiping goes on, and the survey opens only when tapped.
 */
export default function SurveyPrompt({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => track("survey_prompt", { action: "shown" }), []);

  return (
    <div className="mx-5 mb-1.5 flex items-center gap-2 rounded-pill names-glass-soft ps-4 pe-1 max-[20rem]:mx-3">
      <button
        type="button"
        onClick={() => {
          track("survey_prompt", { action: "open" });
          openSheet("survey");
        }}
        className="min-h-11 min-w-0 flex-1 text-start text-person font-bold text-ink underline-offset-4 hover:underline"
      >
        5 שאלות קצרות כדי לשפר את האפליקציה?
      </button>
      <IconButton
        aria-label="לא עכשיו, להסתיר את השאלון"
        onClick={() => {
          track("survey_prompt", { action: "dismiss" });
          onDismiss();
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </IconButton>
    </div>
  );
}
