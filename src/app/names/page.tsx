import { RequireAuth } from "@/components/names/AuthGuard";
import ScreenBackground from "@/components/names/ScreenBackground";

export default function NamesPage() {
  return (
    <RequireAuth>
      <ScreenBackground>
        <main className="flex flex-1 items-center justify-center p-6">
          <h1 className="text-title">בחירת שם</h1>
        </main>
      </ScreenBackground>
    </RequireAuth>
  );
}
