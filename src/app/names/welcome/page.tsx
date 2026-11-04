import type { Metadata } from "next";
import { RedirectIfSignedIn } from "@/components/names/AuthGuard";
import ExpiredNotice from "@/components/names/ExpiredNotice";

export const metadata: Metadata = { robots: { index: true, follow: true } };

// Placeholder until the welcome screen story (US-025).
export default function WelcomePage() {
  return (
    <RedirectIfSignedIn>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-title">בחירת שם</h1>
        <ExpiredNotice />
      </main>
    </RedirectIfSignedIn>
  );
}
