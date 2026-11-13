import type { Metadata } from "next";
import { AllowGuest } from "@/components/names/AuthGuard";
import HiddenScreen from "@/components/names/HiddenScreen";

export const metadata: Metadata = {
  title: "שמות שהסתרתי",
  robots: { index: false, follow: false },
};

/** FR-W22: the hidden names, each with "החזרה". */
export default function HiddenPage() {
  return (
    <AllowGuest>
      <HiddenScreen />
    </AllowGuest>
  );
}
