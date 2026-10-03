import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { get, set, del, createStore } from "idb-keyval";
import { supabase } from "./supabase";
import type { TableName } from "./types";

export type SaveVars = { table: TableName; mode: "insert" | "update" | "delete"; row: Record<string, unknown> & { id: string } };

export function makeQueryClient() {
  const qc = new QueryClient({
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
    mutationFn: async ({ table, mode, row }: SaveVars) => {
      if (mode === "insert") {
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
