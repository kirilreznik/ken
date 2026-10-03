"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, supabaseConfigured } from "./supabase";
import type { Member, Space } from "./types";
import { applyPalette } from "./data";

export type SessionStatus = "loading" | "unconfigured" | "signedOut" | "noSpace" | "ready";

interface SessionValue {
  status: SessionStatus;
  user: User | null;
  space: Space | null;
  members: Member[];
  me: Member | null;
  partner: Member | null;
  nameOf: (userId: string | null | undefined) => string;
  refresh: () => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const membership = useQuery({
    queryKey: ["membership", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: mine, error } = await supabase
        .from("space_members")
        .select("space_id, display_name, spaces(*)")
        .eq("user_id", user!.id)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!mine) return null;
      const { data: members, error: e2 } = await supabase
        .from("space_members")
        .select("space_id, user_id, display_name")
        .eq("space_id", mine.space_id);
      if (e2) throw e2;
      return { space: mine.spaces as unknown as Space, members: (members ?? []) as Member[] };
    },
  });

  const value = useMemo<SessionValue>(() => {
    const space = membership.data?.space ?? null;
    const members = membership.data?.members ?? [];
    const me = members.find((m) => m.user_id === user?.id) ?? null;
    const partner = members.find((m) => m.user_id !== user?.id) ?? null;
    let status: SessionStatus = "loading";
    if (!supabaseConfigured) status = "unconfigured";
    else if (!authReady) status = "loading";
    else if (!user) status = "signedOut";
    else if (membership.data === undefined) status = "loading";
    else status = space ? "ready" : "noSpace";
    return {
      status, user, space, members, me, partner,
      nameOf: (id) => members.find((m) => m.user_id === id)?.display_name ?? "",
      refresh: () => qc.invalidateQueries({ queryKey: ["membership"] }),
      signOut: async () => { await supabase.auth.signOut(); qc.clear(); },
    };
  }, [authReady, user, membership.data, qc]);

  // Apply the chosen palette to <html>.
  useEffect(() => {
    const p = value.space?.palette;
    if (p) applyPalette(p);
  }, [value.space?.palette]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession outside SessionProvider");
  return v;
}
