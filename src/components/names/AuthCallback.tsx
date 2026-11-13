"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import AuthLayout from "@/components/names/auth/AuthLayout";
import Wordmark from "@/components/names/auth/Wordmark";
import { Button } from "@/components/names/ui";
import { EMAIL_SIGN_IN_PATH } from "@/components/names/WelcomeActions";
import { CLOSED_PARAM, WAIT_DEADLINE_MS, WELCOME_PATH } from "@/lib/names/auth";
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
 * routes per FR-W6. An error from Google/Supabase in the URL, no session once loading ends
 * (e.g. the code verifier is missing), or no user after WAIT_DEADLINE_MS shows the failure with a
 * way back and the email code as a second way in.
 */
export default function AuthCallback() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const join = usePendingJoin();
  const urlError = useSyncExternalStore(noSubscribe, readError, serverError);
  const [timedOut, setTimedOut] = useState(false);
  const failed = urlError !== null || (!loading && !session) || timedOut;
  const tracked = useRef(false);

  // NP-020: a hung exchange stops waiting and shows the failure.
  const waiting = !failed && !user;
  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(() => setTimedOut(true), WAIT_DEADLINE_MS);
    return () => window.clearTimeout(timer);
  }, [waiting]);

  // NP-018: the failure has its own tab title; the page's metadata title is the waiting one.
  const showFailure = failed && urlError !== "signups-closed";
  useEffect(() => {
    if (showFailure) document.title = `${GOOGLE_FAILED_MESSAGE} · בחירת שם`;
  }, [showFailure]);

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

  if (showFailure) {
    return (
      <AuthLayout title={GOOGLE_FAILED_MESSAGE} lead="אפשר לנסות שוב או להיכנס עם קוד במייל." hero={wordmark}>
        <div className="flex flex-col items-center gap-2">
          <Button href={withJoin(WELCOME_PATH, join)} className="w-full">
            חזרה לכניסה
          </Button>
          <Button variant="link" href={withJoin(EMAIL_SIGN_IN_PATH, join)}>
            כניסה עם קוד במייל
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="נכנסים…" hero={wordmark}>
      <div role="status" className="flex items-center gap-3 text-body text-ink-soft">
        <span aria-hidden="true" className="names-spinner size-5 rounded-pill border-2 border-ink-soft/30 border-t-ink" />
        רק רגע, מסיימים את הכניסה
      </div>
    </AuthLayout>
  );
}
