"use client";

import { useState } from "react";
import ConnectionNote from "@/components/names/ConnectionNote";
import PanelNote from "@/components/names/auth/PanelNote";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import { Button } from "@/components/names/ui";
import { buttonClass } from "@/components/names/ui/classes";
import { APP_PATH } from "@/lib/names/auth";
import { CLOSED_PARAM, WELCOME_PATH } from "@/lib/names/auth";
import { OFFLINE_MESSAGE, handleAuthError, isOffline } from "@/lib/names/authErrors";
import { withJoin } from "@/lib/names/join";
import { GOOGLE_FAILED_MESSAGE, oauthRedirectTo } from "@/lib/names/routing";
import { requestSignupPass } from "@/lib/names/signupPass";
import { getSupabase } from "@/lib/names/supabase";
import { track } from "@/lib/names/track";
import { failureKind } from "@/lib/names/signinFrom";

export const EMAIL_SIGN_IN_PATH = "/names/sign-in/email";

const GOOGLE_NEXT_STEP = "אפשר לנסות שוב או להיכנס עם קוד במייל.";

/**
 * The two sign-in buttons of FR-W1 (no SMS, PRD 3.1.3). The join screen passes its code, which isn't in ?join=.
 * `guestLink` (welcome only) adds "continue without an account" to the swipe screen as a guest.
 */
export default function WelcomeActions({ joinCode, guestLink = false }: { joinCode?: string | null; guestLink?: boolean }) {
  const pending = usePendingJoin();
  const join = joinCode ?? pending;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fail(err: unknown) {
    setBusy(false);
    const { kind, message } = handleAuthError("sign-in-google", err);
    track("signin_failed", { method: "google", step: "oauth", kind: failureKind(kind) });
    if (message === null) {
      // A full load: ClosedNotice reads ?closed=1 once, on mount.
      window.location.replace(withJoin(`${WELCOME_PATH}?${CLOSED_PARAM}=1`, join));
      return;
    }
    // Google's own failures read better as "Google sign-in failed" than as the generic line,
    // followed by the next step, as on the callback's failure screen (COPY-G1-07).
    setError(kind === "other" ? `${GOOGLE_FAILED_MESSAGE}. ${GOOGLE_NEXT_STEP}` : message);
  }

  // FR-W2: Supabase sends the browser to Google, then back to /names/auth/callback (PKCE).
  async function signInWithGoogle() {
    const supabase = getSupabase();
    if (!supabase || busy) return;
    if (isOffline()) {
      setError(OFFLINE_MESSAGE);
      return;
    }
    setBusy(true);
    setError(null);
    track("signin_started", { method: "google" });
    try {
      // A new account through an invite link needs this pass (Google can't carry the code).
      await requestSignupPass(supabase, join);
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: oauthRedirectTo(process.env.NEXT_PUBLIC_SITE_URL, window.location.origin, join) },
      });
      if (err) fail(err);
    } catch (err) {
      fail(err);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ConnectionNote />
      {/* ConnectionNote says it while offline; don't repeat it, or keep it once back online. */}
      {error && error !== OFFLINE_MESSAGE ? (
        <PanelNote icon="alert" role="alert">
          {error}
        </PanelNote>
      ) : null}
      <Button onClick={signInWithGoogle} disabled={busy} aria-busy={busy}>
        {/* me-1 adds to the pill's gap: 12 px between the mark and the label, as before. */}
        <span className="me-1 flex size-7 items-center justify-center rounded-pill bg-surface" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static brand mark */}
          <img src="/names/brand/google-g.svg" alt="" width={16} height={16} />
        </span>
        {/* While the browser waits for Google, say it's moving on (INT-G1-04); disabled gives the shared look. */}
        {busy ? "מעבירים ל־Google…" : "כניסה עם Google"}
      </Button>
      <Button variant="secondary" href={withJoin(EMAIL_SIGN_IN_PATH, join)}>
        <svg className="me-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
        כניסה עם קוד במייל
      </Button>
      {/* A full load, not a client navigation: an expired session's state starts over as a guest.
          Not while an invite is pending: joining a space needs an account. */}
      {guestLink && !join ? (
        <a href={APP_PATH} data-control className={buttonClass("link")}>
          להמשיך בלי חשבון
        </a>
      ) : null}
    </div>
  );
}
