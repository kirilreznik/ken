import type { Metadata } from "next";
import EmailSignIn from "@/components/names/EmailSignIn";

export const metadata: Metadata = {
  title: "כניסה עם קוד במייל",
  robots: { index: false, follow: false },
};

/** FR-W4: sign in with a 6-digit code sent to an email address. */
export default function EmailSignInPage() {
  return <EmailSignIn />;
}
