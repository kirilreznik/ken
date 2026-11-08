import type { Metadata } from "next";
import Wordmark from "@/components/names/auth/Wordmark";
import { Button } from "@/components/names/ui";

export const metadata: Metadata = {
  title: "אין חיבור לאינטרנט",
  robots: { index: false, follow: false },
};

/**
 * Precached by the service worker and served offline in place of a /names page that was
 * never opened online (public/names/sw.js), so the browser's own error page never shows.
 * It stays on the canvas (no photo to load), in the auth screens' column with their wordmark and ink button.
 */
export default function NamesOffline() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center gap-6 px-5 pt-[max(56px,env(safe-area-inset-top))] pb-[max(32px,env(safe-area-inset-bottom))] text-center">
      <Wordmark />
      <div className="flex flex-col gap-2">
        <h1 className="text-display">אין חיבור לאינטרנט</h1>
        <p className="text-card-title font-medium text-balance text-ink-soft">
          העמוד הזה עוד לא שמור במכשיר. אפשר לחזור לבחירת שם, או לנסות שוב כשהחיבור יחזור.
        </p>
      </div>
      <Button href="/names">לבחירת שם</Button>
    </main>
  );
}
