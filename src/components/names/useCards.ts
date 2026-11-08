"use client";

import { useCallback, useEffect, useState } from "react";
import { buildCards } from "@/lib/names/card";
import { loadContent, loadNames } from "@/lib/names/data";
import type { Card, NameStats } from "@/lib/names/types";

let namesPromise: Promise<Map<string, NameStats>> | null = null;
let cardsPromise: Promise<Card[]> | null = null;

/** Loads names.json once per page load; a failed load is retried next time. */
function loadAllNames(): Promise<Map<string, NameStats>> {
  namesPromise ??= loadNames().catch((err: unknown) => {
    namesPromise = null;
    throw err;
  });
  return namesPromise;
}

/** Loads the static names data once per page load; a failed load is retried next time. */
function loadCards(): Promise<Card[]> {
  cardsPromise ??= Promise.all([loadAllNames(), loadContent()])
    .then(([names, content]) => buildCards(names, content))
    .catch((err: unknown) => {
      cardsPromise = null;
      throw err;
    });
  return cardsPromise;
}

/**
 * The deck's cards (the names with content), or null while loading; `error` when the data
 * couldn't load. `retry()` loads again (a failed load isn't cached).
 */
export function useCards(): { cards: Card[] | null; error: boolean; retry: () => void } {
  const [state, setState] = useState<{ cards: Card[] | null; error: boolean }>({ cards: null, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    loadCards().then(
      (cards) => alive && setState({ cards, error: false }),
      () => alive && setState({ cards: null, error: true }),
    );
    return () => {
      alive = false;
    };
  }, [attempt]);
  const retry = useCallback(() => {
    setState({ cards: null, error: false });
    setAttempt((n) => n + 1);
  }, []);
  return { ...state, retry };
}

/** Births for every CBS name (list rows), or null while loading; `error` when the data couldn't load. */
export function useNameStats(): { names: Map<string, NameStats> | null; error: boolean } {
  const [state, setState] = useState<{ names: Map<string, NameStats> | null; error: boolean }>({ names: null, error: false });
  useEffect(() => {
    let alive = true;
    loadAllNames().then(
      (names) => alive && setState({ names, error: false }),
      () => alive && setState({ names: null, error: true }),
    );
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
