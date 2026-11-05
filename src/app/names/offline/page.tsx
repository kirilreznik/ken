import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אין חיבור לאינטרנט",
  robots: { index: false, follow: false },
};

/**
 * Precached by the service worker and served offline in place of a /names page that was
 * never opened online (public/names/sw.js), so the browser's own error page never shows.
 */
export default function NamesOffline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-title">אין חיבור לאינטרנט</h1>
      <p className="max-w-80 text-body text-ink-soft">
        העמוד הזה עוד לא שמור במכשיר. אפשר לחזור לבחירת שם, או לנסות שוב כשהחיבור יחזור.
      </p>
      <Link href="/names" className="inline-flex min-h-11 items-center px-4 text-card-title underline underline-offset-4">
        לבחירת שם
      </Link>
    </main>
  );
}
