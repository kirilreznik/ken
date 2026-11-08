"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { AuthSkeleton } from "@/components/names/AuthGuard";
import AuthLayout from "@/components/names/auth/AuthLayout";
import { buttonClass } from "@/components/names/ui/classes";
import { APP_PATH } from "@/lib/names/auth";
import { DELETED_LEAD, DELETED_TITLE, subscribeAccountDeleted, wasAccountDeleted } from "@/lib/names/accountDeletion";

/** The goodbye screen after account deletion (FR-W25), on the welcome frame, with the way back to the landing. */
export function GoodbyeView() {
  return (
    <AuthLayout title={DELETED_TITLE} lead={DELETED_LEAD}>
      <p role="status" className="sr-only">
        {DELETED_TITLE}
      </p>
      {/* A full page load, so nothing of the deleted account stays in memory. */}
      <a href="/" data-control className={buttonClass("primary", "lg")}>
        לדף הבית של Nest
      </a>
    </AuthLayout>
  );
}

/** `/names/goodbye`: shown after a deletion or to a signed-out visitor; a signed-in visitor goes back to the app. */
export default function GoodbyeScreen() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const deleted = useSyncExternalStore(subscribeAccountDeleted, wasAccountDeleted, () => false);
  const signedIn = !deleted && !!session;

  useEffect(() => {
    if (!loading && signedIn) router.replace(APP_PATH);
  }, [loading, signedIn, router]);

  if (!deleted && (loading || session)) return <AuthSkeleton />;
  return <GoodbyeView />;
}

/** Wraps the settings route: once the server confirms a deletion, the goodbye view replaces the sign-in guard. */
export function DeletedGate({ children }: { children: React.ReactNode }) {
  const deleted = useSyncExternalStore(subscribeAccountDeleted, wasAccountDeleted, () => false);
  return deleted ? <GoodbyeView /> : <>{children}</>;
}
