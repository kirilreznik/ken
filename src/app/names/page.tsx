import type { Metadata } from "next";
import { RequireAuth } from "@/components/names/AuthGuard";
import ScreenBackground from "@/components/names/ScreenBackground";
import SwipeScreen from "@/components/names/swipe/SwipeScreen";

export const metadata: Metadata = {
  title: { absolute: "בחירת שם" },
  robots: { index: false, follow: false },
};

/** FR-W10: the swipe screen. */
export default function NamesPage() {
  return (
    <RequireAuth>
      <ScreenBackground>
        <SwipeScreen />
      </ScreenBackground>
    </RequireAuth>
  );
}
