"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { welcomeUrl } from "@/lib/names/auth";
import { getPref } from "@/lib/names/prefs";
import { ONBOARDING_PATH, hasAcceptedTerms, nextRoute } from "@/lib/names/routing";
import { useAuth } from "./AuthProvider";
import { usePendingJoin } from "./auth/usePendingJoin";

/** Calm full-screen placeholder while the session loads: canvas plus a faint card outline, so nothing jumps. */
export function AuthSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-dvh items-center justify-center bg-canvas p-6">
      <div aria-hidden="true" className="aspect-[3/4] w-full max-w-sm rounded-lg bg-surface/60 shadow-card" />
      <span className="sr-only">בטעינה</span>
    </div>
  );
}

/**
 * Wraps app pages: no session → welcome (with ?next= for join links, ?expired=1 after FR-W8);
 * a session without accepted terms → onboarding (FR-W6). Onboarding itself passes allowWithoutTerms.
 */
export function RequireAuth({ children, allowWithoutTerms = false }: { children: React.ReactNode; allowWithoutTerms?: boolean }) {
  const { session, user, loading, expired } = useAuth();
  const router = useRouter();
  const blocked = !allowWithoutTerms && !!session && !hasAcceptedTerms(user);

  useEffect(() => {
    if (loading) return;
    if (!session) router.replace(welcomeUrl(window.location.pathname, { expired }));
    else if (blocked) router.replace(ONBOARDING_PATH);
  }, [loading, session, blocked, expired, router]);

  if (loading || !session || blocked) return <AuthSkeleton />;
  return <>{children}</>;
}

/** Wraps welcome: a signed-in visitor goes on as FR-W6 says (onboarding, invite, intro or the app). */
export function RedirectIfSignedIn({ children }: { children: React.ReactNode }) {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const join = usePendingJoin();

  useEffect(() => {
    if (!loading && session && user) router.replace(nextRoute(user, { introSeen: getPref(user.id, "introSeen") }, join));
  }, [loading, session, user, join, router]);

  if (loading || session) return <AuthSkeleton />;
  return <>{children}</>;
}
