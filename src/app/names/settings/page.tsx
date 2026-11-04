import type { Metadata } from "next";
import { RequireAuth } from "@/components/names/AuthGuard";
import SettingsScreen from "@/components/names/SettingsScreen";

export const metadata: Metadata = {
  title: "הגדרות",
  robots: { index: false, follow: false },
};

/** FR-W25: account, opt-in, links, sign out and account deletion. */
export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsScreen />
    </RequireAuth>
  );
}
