import { RequireAuth } from "@/components/names/AuthGuard";
import ScreenBackground from "@/components/names/ScreenBackground";
import SwipeScreen from "@/components/names/swipe/SwipeScreen";

export default function NamesPage() {
  return (
    <RequireAuth>
      <ScreenBackground>
        <SwipeScreen />
      </ScreenBackground>
    </RequireAuth>
  );
}
