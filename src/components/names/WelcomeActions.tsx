"use client";

import Link from "next/link";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import { withJoin } from "@/lib/names/join";

export const EMAIL_SIGN_IN_PATH = "/names/sign-in/email";

/** The two sign-in buttons of FR-W1 (no SMS, PRD 3.1.3). Google is wired in US-026. */
export default function WelcomeActions() {
  const join = usePendingJoin();

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="flex h-14 items-center justify-center gap-3 rounded-pill bg-ink px-6 text-button text-surface shadow-button"
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
