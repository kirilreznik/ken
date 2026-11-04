"use client";

import Link from "next/link";
import { useState } from "react";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import { withJoin } from "@/lib/names/join";
import { GOOGLE_FAILED_MESSAGE, oauthRedirectTo } from "@/lib/names/routing";
import { getSupabase } from "@/lib/names/supabase";

export const EMAIL_SIGN_IN_PATH = "/names/sign-in/email";

/** The two sign-in buttons of FR-W1 (no SMS, PRD 3.1.3). */
export default function WelcomeActions() {
  const join = usePendingJoin();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // FR-W2: Supabase sends the browser to Google, then back to /names/auth/callback (PKCE).
  async function signInWithGoogle() {
    const supabase = getSupabase();
    if (!supabase || busy) return;
    setBusy(true);
    setFailed(false);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: oauthRedirectTo(process.env.NEXT_PUBLIC_SITE_URL, window.location.origin, join) },
    });
    if (error) {
      setBusy(false);
      setFailed(true);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {failed ? (
        <p role="alert" className="text-body text-ink">
          {GOOGLE_FAILED_MESSAGE}
        </p>
      ) : null}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy}
        aria-busy={busy}
        className="flex h-14 items-center justify-center gap-3 rounded-pill bg-ink px-6 text-button text-surface shadow-button disabled:opacity-70"
      >
        <span className="flex size-7 items-center justify-center rounded-pill bg-surface" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static brand mark */}
          <img src="/names/brand/google-g.svg" alt="" width={16} height={16} />
        </span>
        כניסה עם Google
      </button>
      <Link
        href={withJoin(EMAIL_SIGN_IN_PATH, join)}
        className="names-glass-soft flex h-14 items-center justify-center gap-3 rounded-pill px-6 text-button text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
        כניסה עם קוד במייל
      </Link>
    </div>
  );
}
