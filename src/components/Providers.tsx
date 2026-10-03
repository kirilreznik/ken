"use client";

import { useEffect, useState } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useQueryClient } from "@tanstack/react-query";
import { makeQueryClient, persister } from "@/lib/queryClient";
import { SessionProvider, useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { processUploads } from "@/lib/uploads";
import { QuickProvider } from "./QuickActions";
import { installGlobalReporters } from "@/lib/report";

function Realtime() {
  const { space } = useSession();
  const qc = useQueryClient();
  useEffect(() => {
    if (!space) return;
    const sid = space.id;
    const ch = supabase.channel(`space-${sid}`);
    for (const table of ["appointments", "documents", "tasks", "questions", "prep_items", "contacts", "journal_entries", "birth_plans", "suggestion_states", "prep_offers", "prep_inbox"] as const) {
      ch.on("postgres_changes", { event: "*", schema: "public", table, filter: `space_id=eq.${sid}` }, () =>
        qc.invalidateQueries({ queryKey: [table, sid] }),
      );
    }
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "spaces", filter: `id=eq.${sid}` }, () =>
      qc.invalidateQueries({ queryKey: ["membership"] }),
    );
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [space, qc]);

  useEffect(() => {
    const run = () => { void processUploads(qc); qc.resumePausedMutations(); };
    run();
    window.addEventListener("online", run);
    return () => window.removeEventListener("online", run);
  }, [qc]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(makeQueryClient);
  useEffect(() => installGlobalReporters(), []);
  useEffect(() => {
    try {
      const p = localStorage.getItem("kan-palette");
      if (p) document.documentElement.dataset.palette = p;
    } catch {}
  }, []);
  return (
    <PersistQueryClientProvider
      client={qc}
      persistOptions={{
        persister, maxAge: 1000 * 60 * 60 * 24 * 7, buster: "kan-v1",
        dehydrateOptions: { shouldDehydrateQuery: (q) => q.state.status === "success" && q.queryKey[0] !== "signed" && q.meta?.persist !== false },
      }}
      onSuccess={() => qc.resumePausedMutations().then(() => qc.invalidateQueries())}
    >
      <SessionProvider>
        <Realtime />
        <QuickProvider>{children}</QuickProvider>
      </SessionProvider>
    </PersistQueryClientProvider>
  );
}
