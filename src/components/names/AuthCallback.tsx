"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import AuthLayout from "@/components/names/auth/AuthLayout";
import { WELCOME_PATH } from "@/lib/names/auth";
import { withJoin } from "@/lib/names/join";
import { getPref } from "@/lib/names/prefs";
import { GOOGLE_FAILED_MESSAGE, callbackError, nextRoute } from "@/lib/names/routing";
import { useAuth } from "./AuthProvider";

const noSubscribe = () => () => {};
const readError = () => callbackError(window.location.search, window.location.hash);
const serverError = () => null;

const wordmark = <Image src="/names/brand/nest-wordmark.svg" alt="Nest" width={85} height={32} priority unoptimized className="self-center" />;

/**
 * Waits for the session the auth client gets from the PKCE exchange (detectSessionInUrl), then
 * routes per FR-W6. An error from Google/Supabase in the URL, or no session once loading ends
 * (e.g. the code verifier is missing), shows the failure with a way back.
 */
export default function AuthCallback() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const join = usePendingJoin();
  const urlError = useSyncExternalStore(noSubscribe, readError, serverError);
  const failed = urlError !== null || (!loading && !session);

  useEffect(() => {
    if (urlError || loading || !user) return;
    router.replace(nextRoute(user, { introSeen: getPref(user.id, "introSeen") }, join));
  }, [urlError, loading, user, join, router]);

  if (failed) {
    return (
      <AuthLayout title={GOOGLE_FAILED_MESSAGE} lead="אפשר לנסות שוב או להיכנס עם קוד במייל." hero={wordmark}>
        <Link
          href={withJoin(WELCOME_PATH, join)}
          className="flex h-14 items-center justify-center rounded-pill bg-ink px-6 text-button text-surface shadow-button"
        >
          חזרה לכניסה
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="מתחברים…" hero={wordmark}>
      <div role="status" className="flex items-center gap-3 text-body text-ink-soft">
        <span aria-hidden="true" className="size-5 animate-spin rounded-pill border-2 border-ink-soft/30 border-t-ink" />
        רק רגע, מסיימים את הכניסה
      </div>
    </AuthLayout>
  );
}
