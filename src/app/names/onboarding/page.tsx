import type { Metadata } from "next";
import { RequireAuth } from "@/components/names/AuthGuard";
import Onboarding from "@/components/names/Onboarding";

export const metadata: Metadata = {
  title: "רגע לפני שמתחילים",
  robots: { index: false, follow: false },
};

/** FR-W7: display name and the required confirmations, never a due date. */
export default function OnboardingPage() {
  return (
    <RequireAuth>
      <Onboarding />
    </RequireAuth>
  );
}
