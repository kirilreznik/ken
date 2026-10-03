import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { report } from "./report";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { get, set, del, createStore } from "idb-keyval";
import { supabase } from "./supabase";
import type { TableName } from "./types";

export type SaveVars = {
  table: TableName | "birth_plans" | "suggestion_states";
  mode: "insert" | "update" | "delete" | "upsert";
  row: Record<string, unknown> & { id?: string };
  onConflict?: string;
};

export function makeQueryClient() {
  const qc = new QueryClient({
    queryCache: new QueryCache({
      onError: (err, query) => report(err, "query", { key: String(query.queryKey[0]) }),
    }),
    mutationCache: new MutationCache({
      onError: (err, vars) => report(err, "sync", { table: (vars as SaveVars | undefined)?.table, mode: (vars as SaveVars | undefined)?.mode }),
    }),
    defaultOptions: {
      queries: {
        networkMode: "offlineFirst",
        staleTime: 30_000,
        gcTime: 1000 * 60 * 60 * 24 * 7,
        retry: 2,
      },
      mutations: { networkMode: "online", retry: 3 },
    },
  });

  // Defaults keyed by mutationKey so paused (offline) mutations can resume after an app restart.
  qc.setMutationDefaults(["save"], {
    mutationFn: async (vars: SaveVars) => {
      const { table, mode, row } = vars;
      if (mode === "upsert") {
        const { error } = await supabase.from(table).upsert(row, { onConflict: (vars as SaveVars).onConflict });
        if (error) throw error;
      } else if (mode === "insert") {
        const { error } = await supabase.from(table).insert(row);
        if (error && error.code !== "23505") throw error; // ignore duplicate on replay
      } else if (mode === "update") {
        const { id, ...patch } = row;
        const { error } = await supabase.from(table).update(patch).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).delete().eq("id", row.id);
        if (error) throw error;
      }
    },
  });
  return qc;
}

const store = typeof indexedDB !== "undefined" ? createStore("kan-cache", "query") : undefined;

export const persister = createAsyncStoragePersister({
  storage: {
    getItem: (k: string) => (store ? get<string>(k, store).then((v) => v ?? null) : Promise.resolve(null)),
    setItem: (k: string, v: string) => (store ? set(k, v, store) : Promise.resolve()),
    removeItem: (k: string) => (store ? del(k, store) : Promise.resolve()),
  },
  key: "kan-query-cache",
  throttleTime: 1000,
});
