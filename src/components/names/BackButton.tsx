"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/components/names/ui";
import { APP_PATH } from "@/lib/names/auth";
import { hasAppEntry } from "@/lib/names/appHistory";

/** In-page "חזרה" for board 5's list pages: back in history when the app was visited, else /names. */
export default function BackButton() {
  const router = useRouter();

  const back = () => {
    if (hasAppEntry()) router.back();
    else router.replace(APP_PATH);
  };

  return (
    <IconButton aria-label="חזרה" onClick={back}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ltr:-scale-x-100">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </IconButton>
  );
}
