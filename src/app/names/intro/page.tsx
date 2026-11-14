import type { Metadata } from "next";
import { AllowGuest } from "@/components/names/AuthGuard";
import Intro from "@/components/names/Intro";
import ScreenBackground from "@/components/names/ScreenBackground";

export const metadata: Metadata = {
  title: "איך זה עובד",
  robots: { index: false, follow: false },
};

/** FR-W9: the one-time intro (board 1), on the user's background. Guests reach it from the name sheet's surname link. */
export default function IntroPage() {
  return (
    <AllowGuest>
      <ScreenBackground blobs="intro">
        <Intro />
      </ScreenBackground>
    </AllowGuest>
  );
}
