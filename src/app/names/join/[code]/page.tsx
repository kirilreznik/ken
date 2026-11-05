import type { Metadata } from "next";
import JoinScreen from "@/components/names/JoinScreen";

export const metadata: Metadata = {
  title: "הזמנה לבחירה",
  robots: { index: false, follow: false },
};

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** FR-W24: an invite link. Signed out it keeps the code through sign-in; signed in it joins the space. */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <JoinScreen code={decode(code)} />;
}
