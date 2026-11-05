import type { Metadata } from "next";
import GoodbyeScreen from "@/components/names/GoodbyeScreen";

export const metadata: Metadata = {
  title: "החשבון נמחק",
  robots: { index: false, follow: false },
};

/** FR-W25: after account deletion. */
export default function GoodbyePage() {
  return <GoodbyeScreen />;
}
