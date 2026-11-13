import type { Metadata } from "next";
import { Suspense } from "react";
import { AllowGuest } from "@/components/names/AuthGuard";
import ListsScreen from "@/components/names/lists/ListsScreen";

export const metadata: Metadata = {
  title: "השמות שלי",
  robots: { index: false, follow: false },
};

/** FR-W18: "השמות שלי", segments via ?tab=saved|matches|duel. */
export default function ListsPage() {
  return (
    <AllowGuest>
      {/* useSearchParams needs a Suspense boundary on prerendered routes (Next 16). */}
      <Suspense fallback={null}>
        <ListsScreen />
      </Suspense>
    </AllowGuest>
  );
}
