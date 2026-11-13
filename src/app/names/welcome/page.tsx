import type { Metadata } from "next";
import { RedirectIfSignedIn } from "@/components/names/AuthGuard";
import ClosedNotice from "@/components/names/ClosedNotice";
import ExpiredNotice from "@/components/names/ExpiredNotice";
import PreviewCard from "@/components/names/PreviewCard";
import WelcomeActions from "@/components/names/WelcomeActions";
import AuthLayout from "@/components/names/auth/AuthLayout";
import LegalLine from "@/components/names/auth/LegalLine";
import StoredSessionHint from "@/components/names/auth/StoredSessionHint";
import Wordmark from "@/components/names/auth/Wordmark";

const TITLE = "בחירת שם";
const PITCH = "שם אחד בכל פעם, עם מספרים אמיתיים מהלמ\"ס. לבד או ביחד.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: PITCH,
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: PITCH, type: "website", locale: "he_IL" },
};

/** FR-W1: what the swiper is and how to sign in, on the fabric photo with the liquid glass. */
export default function WelcomePage() {
  return (
    <>
      <StoredSessionHint />
      <RedirectIfSignedIn>
        <AuthLayout
          title={TITLE}
          lead={PITCH}
          hero={
            <>
              <Wordmark />
              <PreviewCard />
            </>
          }
          footer={<LegalLine />}
        >
          <ClosedNotice />
          <ExpiredNotice />
          <WelcomeActions guestLink />
        </AuthLayout>
      </RedirectIfSignedIn>
    </>
  );
}
