"use client";

import { useEffect, useState } from "react";
import { buildCards } from "@/lib/names/card";
import { loadContent, loadNames } from "@/lib/names/data";
import type { Card } from "@/lib/names/types";

let cardsPromise: Promise<Card[]> | null = null;

/** Loads the static names data once per page load; a failed load is retried next time. */
function loadCards(): Promise<Card[]> {
  cardsPromise ??= Promise.all([loadNames(), loadContent()])
    .then(([names, content]) => buildCards(names, content))
    .catch((err: unknown) => {
      cardsPromise = null;
      throw err;
    });
  return cardsPromise;
}

/** The deck's cards (the names with content), or null while loading; `error` when the data couldn't load. */
export function useCards(): { cards: Card[] | null; error: boolean } {
  const [state, setState] = useState<{ cards: Card[] | null; error: boolean }>({ cards: null, error: false });
  useEffect(() => {
    let alive = true;
    loadCards().then(
      (cards) => alive && setState({ cards, error: false }),
      () => alive && setState({ cards: null, error: true }),
    );
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
