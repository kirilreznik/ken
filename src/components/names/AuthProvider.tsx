"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { clearLocalData } from "@/lib/names/auth";
import { openPrefs } from "@/lib/names/prefs";
import { AUTH_STORAGE_KEY, getSupabase } from "@/lib/names/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  /** True until the stored session has been read (and refreshed if needed). */
  loading: boolean;
  /** The session ended without the user signing out: the refresh token was rejected (FR-W8). */
  expired: boolean;
  /** Clears this user's prefs, IndexedDB data and the session on this device. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function hasStoredSession(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const signingOut = useRef(false);

  useEffect(() => {
    // Read before the client exists: its init removes a session whose refresh fails.
    const hadStored = hasStoredSession();
    const supabase = getSupabase();
    // Null only on the server or unconfigured, and the layout renders no provider then.
    if (!supabase) return;
    // No Supabase calls inside this callback (auth-js holds a lock while it runs).
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "INITIAL_SESSION") {
        if (!next && hadStored) setExpired(true);
        setLoading(false);
      } else if (event === "SIGNED_OUT" && !signingOut.current) {
        setExpired(true);
      } else if (next) {
        setExpired(false);
      }
      if (next) openPrefs(next.user.id);
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    const userId = session?.user.id;
    signingOut.current = true;
    try {
      if (userId) await clearLocalData(userId);
      // Local scope: signs this device out even offline; other devices keep their sessions.
      await supabase?.auth.signOut({ scope: "local" });
      setSession(null);
      setExpired(false);
    } finally {
      signingOut.current = false;
    }
  }, [session]);

  const value = useMemo<AuthState>(
    () => ({ session, user: session?.user ?? null, loading, expired, signOut }),
    [session, loading, expired, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
