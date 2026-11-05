import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RedirectIfSignedIn } from "@/components/names/AuthGuard";
import ClosedNotice from "@/components/names/ClosedNotice";
import ExpiredNotice from "@/components/names/ExpiredNotice";
import PreviewCard from "@/components/names/PreviewCard";
import WelcomeActions from "@/components/names/WelcomeActions";
import AuthLayout from "@/components/names/auth/AuthLayout";

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
    <RedirectIfSignedIn>
      <AuthLayout
        title={TITLE}
        lead={PITCH}
        hero={
          <div className="flex flex-col items-center gap-6">
            <Image src="/names/brand/nest-wordmark.svg" alt="Nest" width={85} height={32} priority unoptimized />
            <PreviewCard />
          </div>
        }
        footer={
          <p className="text-center text-caption text-ink-soft">
            בהמשך מאשרים את{" "}
            <Link href="/names/terms" className="-my-3 inline-flex min-h-11 items-center font-bold text-ink underline underline-offset-2">
              תנאי השימוש
            </Link>{" "}
            ו
            <Link href="/names/privacy" className="-my-3 inline-flex min-h-11 items-center font-bold text-ink underline underline-offset-2">
              מדיניות הפרטיות
            </Link>
          </p>
        }
      >
        <ClosedNotice />
        <ExpiredNotice />
        <WelcomeActions />
      </AuthLayout>
    </RedirectIfSignedIn>
  );
}
