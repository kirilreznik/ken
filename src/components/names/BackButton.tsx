"use client";

import { useRouter } from "next/navigation";
import { ChevronIcon, IconButton } from "@/components/names/ui";
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
      <ChevronIcon dir="back" />
    </IconButton>
  );
}
