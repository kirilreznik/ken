"use client";

import { useMemo } from "react";
import { useUserId } from "@/components/names/AuthProvider";
import { Chip, openNameSheet } from "@/components/names/ui";
import { usePrefJson } from "@/components/names/usePrefJson";
import { track } from "@/lib/names/track";
import { twinsFor } from "@/lib/names/twins";
import type { Card, NameDetail, Vote } from "@/lib/names/types";
import Section from "./Section";

function openTwin(name: string) {
  openNameSheet(name);
  track("twin_opened");
  track("detail_opened", { source: "twins" });
}

/**
 * "זוג לתאומים" (only with "מצפים לתאומים" on in settings): up to six deck names that go well
 * with this one, each with why, opening that name's sheet over this one like a similar name.
 * Follows the sex filter; never offers hidden or skipped names, or another form of this name.
 */
export default function TwinsSection({
  card,
  cards,
  votes,
  details,
}: {
  card: Card;
  cards: readonly Card[] | null;
  votes: ReadonlyMap<string, Vote>;
  details: Map<string, NameDetail> | null;
}) {
  const userId = useUserId();
  const on = usePrefJson(userId, "twins") === "true";
  const filtersJson = usePrefJson(userId, "filters");
  const sex = filtersJson ? (JSON.parse(filtersJson) as { sex: Card["derived"]["sexTag"] | null }).sex : null;
  const twins = useMemo(
    () =>
      on && cards
        ? twinsFor(card, cards, { votes, sex, forms: (name) => details?.get(name)?.similar ?? [] })
        : [],
    [on, card, cards, votes, sex, details],
  );
  if (!on || twins.length === 0) return null;
  return (
    <Section label="זוג לתאומים">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {twins.map((t) => (
          <li key={t.name}>
            <Chip aria-label={`${t.name}, ${t.sexTag}. ${t.reasons.join(", ")}. פרטי השם`} className="min-h-11 w-full justify-start! gap-2 py-2 text-start" onClick={() => openTwin(t.name)}>
              <span className="break-words">{t.name}</span>
              <span className="font-normal text-ink-soft">· {t.sexTag}</span>
              <span className="ms-auto text-caption font-normal text-stone">{t.reasons.join(" · ")}</span>
            </Chip>
          </li>
        ))}
      </ul>
    </Section>
  );
}
