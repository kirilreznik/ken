import type { Metadata } from "next";
import FeedbackScreen from "@/components/names/FeedbackScreen";

export const metadata: Metadata = {
  title: "משוב",
  robots: { index: false, follow: false },
};

/** Feedback form, open to guests and signed-in people (saved through /api/names/feedback). */
export default function FeedbackPage() {
  return <FeedbackScreen />;
}
