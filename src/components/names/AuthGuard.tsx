"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { welcomeUrl } from "@/lib/names/auth";
import { getPref } from "@/lib/names/prefs";
import { ONBOARDING_PATH, hasAcceptedTerms, nextRoute } from "@/lib/names/routing";
import { GuestAllowed, useAuth, useStoredSession } from "./AuthProvider";
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

/**
 * Wraps the pages a visitor may use before signing in (the swipe screen and their lists):
 * signed out, they run as a guest with votes on the device (lib/names/guest.ts). A session
 * without accepted terms still goes to onboarding, and an expired session to welcome.
 */
export function AllowGuest({ children }: { children: React.ReactNode }) {
  const { session, user, loading, expired } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const blocked = !!session && !hasAcceptedTerms(user);
  const signedOutAfterExpiry = !session && expired;

  useEffect(() => {
    if (loading) return;
    if (signedOutAfterExpiry) router.replace(welcomeUrl(pathname, { expired }));
    else if (blocked) router.replace(ONBOARDING_PATH);
  }, [loading, signedOutAfterExpiry, blocked, expired, pathname, router]);

  if (loading || blocked || signedOutAfterExpiry) return <AuthSkeleton />;
  return <GuestAllowed>{children}</GuestAllowed>;
}

const subscribeNever = () => () => {};

/**
 * A signed-out screen rendered on the server. Until hydration it carries data-names-gate, which
 * auth/StoredSessionHint hides when the device keeps a session, so a signed-in visitor never
 * sees it paint before the redirect. After hydration the attribute is gone.
 */
export function SignedOutView({ children }: { children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  return (
    <div className="contents" data-names-gate={hydrated ? undefined : ""}>
      {children}
    </div>
  );
}

/**
 * Wraps welcome: a signed-in visitor goes on as FR-W6 says (onboarding, invite, intro or the app).
 * Without a stored session the page shows at once, also in the server HTML; the skeleton only
 * covers a session that is still loading.
 */
export function RedirectIfSignedIn({ children }: { children: React.ReactNode }) {
  const { session, user, loading } = useAuth();
  const stored = useStoredSession();
  const router = useRouter();
  const join = usePendingJoin();

  useEffect(() => {
    if (!loading && session && user) router.replace(nextRoute(user, { introSeen: getPref(user.id, "introSeen") }, join));
  }, [loading, session, user, join, router]);

  if (session || (loading && stored)) return <AuthSkeleton />;
  return <SignedOutView>{children}</SignedOutView>;
}
