"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import AuthLayout from "@/components/names/auth/AuthLayout";
import Wordmark from "@/components/names/auth/Wordmark";
import { Button } from "@/components/names/ui";
import { CLOSED_PARAM, WELCOME_PATH } from "@/lib/names/auth";
import { authErrorKind, reportAuthError, urlAuthError } from "@/lib/names/authErrors";
import { withJoin } from "@/lib/names/join";
import { getPref } from "@/lib/names/prefs";
import { GOOGLE_FAILED_MESSAGE, hasAcceptedTerms, nextRoute } from "@/lib/names/routing";
import { useAuth } from "./AuthProvider";
import { track } from "@/lib/names/track";

const noSubscribe = () => () => {};
const readUrlError = () => urlAuthError(window.location.search, window.location.hash);
// A string snapshot (the error kind) keeps useSyncExternalStore stable.
const readError = () => {
  const err = readUrlError();
  return err ? authErrorKind(err) : null;
};
const serverError = () => null;

const wordmark = <Wordmark />;

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
  const tracked = useRef(false);

  // FR-W5: closed sign-ups go to welcome with the waitlist notice; anything unexpected is reported
  // by its code only. The screen itself only ever shows the Hebrew failure.
  useEffect(() => {
    if (urlError === "signups-closed") router.replace(withJoin(`${WELCOME_PATH}?${CLOSED_PARAM}=1`, join));
    else if (urlError === "other") reportAuthError("sign-in-google-callback", readUrlError());
    if (urlError) track("signin_failed", { method: "google", step: urlError === "signups-closed" ? "closed" : "callback" });
  }, [urlError, join, router]);

  useEffect(() => {
    if (urlError || loading || !user) return;
    if (!tracked.current) {
      tracked.current = true;
      track("signin_completed", { method: "google", new_user: !hasAcceptedTerms(user) });
    }
    router.replace(nextRoute(user, { introSeen: getPref(user.id, "introSeen") }, join));
  }, [urlError, loading, user, join, router]);

  if (failed && urlError !== "signups-closed") {
    return (
      <AuthLayout title={GOOGLE_FAILED_MESSAGE} lead="אפשר לנסות שוב או להיכנס עם קוד במייל." hero={wordmark}>
        <Button href={withJoin(WELCOME_PATH, join)}>חזרה לכניסה</Button>
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
