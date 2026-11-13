"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthSkeleton, SignedOutView } from "@/components/names/AuthGuard";
import { useAuth, useStoredSession } from "@/components/names/AuthProvider";
import PreviewCard from "@/components/names/PreviewCard";
import WelcomeActions from "@/components/names/WelcomeActions";
import AuthLayout from "@/components/names/auth/AuthLayout";
import LegalLine from "@/components/names/auth/LegalLine";
import Wordmark from "@/components/names/auth/Wordmark";
import { Button } from "@/components/names/ui";
import { APP_PATH, WAIT_DEADLINE_MS, WELCOME_PATH } from "@/lib/names/auth";
import { reportClientLog } from "@/lib/names/clientLog";
import {
  JOIN_COPY,
  JOIN_INVITED_LEAD,
  JOIN_INVITED_TITLE,
  VOTES_MOVE_TEXT,
  clearPendingJoin,
  normalizeJoinCode,
  rememberJoinCode,
  type JoinOutcome,
} from "@/lib/names/join";
import { joinWithCode } from "@/lib/names/joinSpace";
import { getPref } from "@/lib/names/prefs";
import { INTRO_PATH, ONBOARDING_PATH, hasAcceptedTerms, nextRoute } from "@/lib/names/routing";
import { track } from "@/lib/names/track";

const wordmark = <Wordmark />;

function displayNameOf(metadata: Record<string, unknown> | undefined): string {
  const value = metadata?.display_name;
  return typeof value === "string" ? value.trim() : "";
}

/** A finished (or failed) join: title, lead and one action. */
function Outcome({ title, lead, children }: { title: string; lead: React.ReactNode; children: React.ReactNode }) {
  return (
    <AuthLayout title={title} lead={lead} hero={wordmark}>
      {children}
    </AuthLayout>
  );
}

/**
 * FR-W24, /names/join/{code}. Signed out: keep the code (sessionStorage + ?join= on every sign-in
 * path) and show the invitation with the sign-in buttons. Signed in without terms: onboarding
 * first (it routes back here). Signed in: names_join, then the result.
 */
export default function JoinScreen({ code: rawCode }: { code: string }) {
  const { session, user, loading } = useAuth();
  const stored = useStoredSession();
  const router = useRouter();
  const code = normalizeJoinCode(rawCode);
  const onboarded = hasAcceptedTerms(user);
  const userId = user?.id ?? null;
  const displayName = displayNameOf(user?.user_metadata);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; outcome: JoinOutcome } | null>(null);
  const key = `${userId}:${code}:${attempt}`;
  const outcome = result?.key === key ? result.outcome : null;

  // Keep the code for the sign-in round trip (PRD 3.2.5); a bad code is dropped.
  useEffect(() => {
    if (loading) return;
    if (!code) clearPendingJoin();
    else if (!session || !onboarded) rememberJoinCode(code);
    if (code && session && !onboarded) router.replace(ONBOARDING_PATH);
  }, [loading, code, session, onboarded, router]);

  useEffect(() => {
    if (loading || !session || !onboarded || !userId || !code) return;
    let alive = true;
    // NP-020: a hung names_join shows the error with its retry; a late answer still replaces it.
    const timer = window.setTimeout(() => {
      if (alive) setResult((prev) => (prev?.key === key ? prev : { key, outcome: { kind: "error" } }));
    }, WAIT_DEADLINE_MS);
    void joinWithCode(userId, code, displayName).then((next) => {
      window.clearTimeout(timer);
      if (!alive) return;
      if (next.kind === "error") void reportClientLog({ area: "join", message: "names_join failed" });
      if (next.kind === "joined") track("join_completed", { votes_moved: next.votesMoved });
      else if (next.kind !== "already") track("join_failed", { reason: next.kind });
      setResult({ key, outcome: next });
    });
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [loading, session, onboarded, userId, code, displayName, key]);

  // NP-023: one status region, mounted on first render, whose text changes with the outcome.
  const [status, body] = view();
  return (
    <>
      <p role="status" className="sr-only">
        {status}
      </p>
      {body}
    </>
  );

  function view(): [string, React.ReactNode] {
    // Without a stored session the signed-out screens show at once, also in the server HTML.
    if (loading && stored) return ["", <AuthSkeleton key="skeleton" />];

    const startHref = user ? nextRoute(user, { introSeen: getPref(user.id, "introSeen") }, null) : APP_PATH;
    // The button says where it goes: on to the intro, or back to the deck (NP-024).
    const startLabel = startHref === INTRO_PATH ? "המשך" : "לבחירת שמות";

    if (!code || outcome?.kind === "invalid") {
      const copy = JOIN_COPY.invalid;
      const invalid = (
        <Outcome title={copy.title} lead={copy.lead}>
          {session ? <Button href={startHref}>{startLabel}</Button> : <Button href={WELCOME_PATH}>לכניסה</Button>}
        </Outcome>
      );
      return [`${copy.title}. ${copy.lead}`, session ? invalid : <SignedOutView>{invalid}</SignedOutView>];
    }

    if (!session) {
      return [
        "",
        <SignedOutView key="invited">
          <AuthLayout
            title={JOIN_INVITED_TITLE}
            lead={JOIN_INVITED_LEAD}
            hero={
              <>
                {wordmark}
                <PreviewCard />
              </>
            }
            footer={<LegalLine />}
          >
            <WelcomeActions joinCode={code} />
          </AuthLayout>
        </SignedOutView>,
      ];
    }

    if (!onboarded) return ["", <AuthSkeleton key="skeleton" />];

    if (!outcome) {
      const waiting = "רק רגע, מצטרפים לבחירה";
      return [
        waiting,
        <AuthLayout key="waiting" title={JOIN_INVITED_TITLE} hero={wordmark}>
          <div aria-hidden="true" className="flex items-center gap-3 text-body text-ink-soft">
            <span className="names-spinner size-5 rounded-pill border-2 border-ink-soft/30 border-t-ink" />
            {waiting}
          </div>
        </AuthLayout>,
      ];
    }

    if (outcome.kind === "offline" || outcome.kind === "error") {
      const copy = JOIN_COPY[outcome.kind];
      return [
        `${copy.title}. ${copy.lead}`,
        <Outcome key="outcome" title={copy.title} lead={copy.lead}>
          <Button onClick={() => setAttempt((n) => n + 1)}>ניסיון חוזר</Button>
        </Outcome>,
      ];
    }

    const copy = JOIN_COPY[outcome.kind];
    const moved = outcome.kind === "joined" && outcome.votesMoved;
    return [
      [`${copy.title}.`, copy.lead, moved ? VOTES_MOVE_TEXT : ""].join(" ").trim(),
      <Outcome
        key="outcome"
        title={copy.title}
        lead={
          <>
            <p>{copy.lead}</p>
            {moved ? <p className="mt-2">{VOTES_MOVE_TEXT}</p> : null}
          </>
        }
      >
        <Button href={startHref}>{startLabel}</Button>
      </Outcome>,
    ];
  }
}
