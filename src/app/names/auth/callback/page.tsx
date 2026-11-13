import type { Metadata } from "next";
import AuthCallback from "@/components/names/AuthCallback";

export const metadata: Metadata = {
  title: "נכנסים",
  robots: { index: false, follow: false },
};

/** FR-W2: Google returns here; the browser client exchanges the PKCE code, then FR-W6 routes on. */
export default function AuthCallbackPage() {
  return <AuthCallback />;
}
