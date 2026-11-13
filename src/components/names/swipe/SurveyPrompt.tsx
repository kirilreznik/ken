"use client";

import { useEffect } from "react";
import { ChevronIcon, CloseIcon, IconButton, openSheet } from "@/components/names/ui";
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
        aria-haspopup="dialog"
        className="flex min-h-11 min-w-0 flex-1 items-center gap-1.5 text-start text-person font-bold text-ink"
      >
        {/* A real question, underlined with a chevron so it reads as tappable (NP-130). */}
        <span className="min-w-0 underline decoration-stone underline-offset-4">אפשר לשאול 5 שאלות קצרות על בחירת השם?</span>
        <ChevronIcon dir="forward" size={16} className="flex-none text-ink-soft" />
      </button>
      <IconButton
        aria-label="לא עכשיו, להסתיר את השאלון"
        onClick={() => {
          track("survey_prompt", { action: "dismiss" });
          onDismiss();
        }}
      >
        <CloseIcon size={16} />
      </IconButton>
    </div>
  );
}
