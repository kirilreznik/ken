import type { Metadata } from "next";
import { RequireAuth } from "@/components/names/AuthGuard";
import InviteScreen from "@/components/names/InviteScreen";

export const metadata: Metadata = {
  title: "הזמנה לבחירה",
  robots: { index: false, follow: false },
};

/** FR-W23: a single-use invite link and the people already in the space. */
export default function InvitePage() {
  return (
    <RequireAuth>
      <InviteScreen />
    </RequireAuth>
  );
}
