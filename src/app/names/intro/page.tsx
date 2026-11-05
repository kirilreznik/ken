import type { Metadata } from "next";
import { RequireAuth } from "@/components/names/AuthGuard";
import Intro from "@/components/names/Intro";
import ScreenBackground from "@/components/names/ScreenBackground";

export const metadata: Metadata = {
  title: "איך זה עובד",
  robots: { index: false, follow: false },
};

/** FR-W9: the one-time intro (board 1), on the user's background. */
export default function IntroPage() {
  return (
    <RequireAuth>
      <ScreenBackground blobs="intro">
        <Intro />
      </ScreenBackground>
    </RequireAuth>
  );
}
