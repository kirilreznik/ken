"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_PATH, welcomeUrl } from "@/lib/names/auth";
import { useAuth } from "./AuthProvider";

/** Calm full-screen placeholder while the session loads: canvas plus a faint card outline, so nothing jumps. */
export function AuthSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-dvh items-center justify-center bg-canvas p-6">
      <div aria-hidden="true" className="aspect-[3/4] w-full max-w-sm rounded-lg bg-surface/60 shadow-card" />
      <span className="sr-only">טוען</span>
    </div>
  );
}

/** Wraps app pages: no session → welcome (with ?next= for join links, ?expired=1 after FR-W8). */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading, expired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace(welcomeUrl(window.location.pathname, { expired }));
  }, [loading, session, expired, router]);

  if (loading || !session) return <AuthSkeleton />;
  return <>{children}</>;
}

/** Wraps welcome: a signed-in visitor goes on to the app (US-031 adds the full FR-W6 routing). */
export function RedirectIfSignedIn({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) router.replace(APP_PATH);
  }, [loading, session, router]);

  if (loading || session) return <AuthSkeleton />;
  return <>{children}</>;
}
