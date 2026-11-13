"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import CardBible from "@/components/names/card/CardBible";
import CardPeople from "@/components/names/card/CardPeople";
import DecisionButtons, { type Decision } from "@/components/names/DecisionButtons";
import { BottomSheet, IconButton, adoptNameLink, closeSheet, openNameSheet, tagClass } from "@/components/names/ui";
import { useNameStats } from "@/components/names/useCards";
import { useNameDetails } from "@/components/names/useNameDetails";
import { rank2024, rankMap, similarForDisplay, togetherFor } from "@/lib/names/detail";
import { createDetailVisits, type DetailSection, type DetailVisits } from "@/lib/names/detailVisit";
import { hiddenNames } from "@/lib/names/lists";
import type { Match } from "@/lib/names/matches";
import { track } from "@/lib/names/track";
import { NAME_PARAM, NAME_SHEET, previousName, readName } from "@/lib/names/urlLayer";
import type { Card, Vote } from "@/lib/names/types";
import FactsSection from "./FactsSection";
import MeaningSection from "./MeaningSection";
import NumbersSection from "./NumbersSection";
import SexSection from "./SexSection";
import SimilarSection from "./SimilarSection";
import SourceSection from "./SourceSection";
import SurnameSection from "./SurnameSection";
import TogetherSection from "./TogetherSection";

const DETENTS = ["70", "full"] as const;
// Half a section in view counts as seen (sections are shorter than twice the 70% sheet).
const SEEN_RATIO = 0.5;

const close = () => closeSheet(NAME_SHEET);

// PRD 3.2.1: a similar name pushes another entry over this one, so Back comes back here.
function openSimilar(name: string) {
  openNameSheet(name);
  track("detail_similar_tap");
  track("detail_opened", { source: "similar" });
}

export interface NameDetailSheetProps {
  cards: readonly Card[] | null;
  surname: string | null;
  /** The screen's `useMatches` matches (empty in a space of one) and its member count. */
  matches: readonly Match[];
  memberCount: number;
  /** The user's votes: the pinned buttons show the name's own as pressed; hidden names are never offered as similar names. */
  votes: ReadonlyMap<string, Vote>;
  /** A decision made with the pinned buttons, for the name the sheet shows. */
  onDecide?: (name: string, kind: Decision) => void;
}

/**
 * "פרטי השם" (boards 13–15, PRD 3.1.1): the tall sheet for ?sheet=name&n=<name>. It opens only
 * for a name that has a card in the deck; any other `n` drops the layer by replacing the URL.
 * A direct link becomes a pushed entry over the clean page, so Back and "סגירה" both end there.
 */
export default function NameDetailSheet(props: NameDetailSheetProps) {
  // useSearchParams needs a Suspense boundary on prerendered routes (Next 16).
  return (
    <Suspense fallback={null}>
      <NameGate {...props} />
    </Suspense>
  );
}

function NameGate({ cards, surname, matches, memberCount, votes, onDecide }: NameDetailSheetProps) {
  const params = useSearchParams();
  const open = params.get("sheet") === NAME_SHEET;
  const name = readName(params.toString());
  const byName = useMemo(() => new Map((cards ?? []).map((card) => [card.stats.name, card])), [cards]);
  const named = name ? (byName.get(name) ?? null) : null;
  // PRD 3.2.12: once closed, the sheet keeps showing the last name while it slides out.
  const [last, setLast] = useState<Card | null>(named);
  if (named && named !== last) setLast(named);
  const card = named ?? (open ? null : last);
  // Wait for the cards before deciding the name isn't in the deck.
  const unknown = open && cards !== null && !card;
  // The details file (stories, similar names) loads the first time a sheet opens.
  const details = useNameDetails({ enabled: open && card !== null });
  // The 2024 rank is among every CBS name (already loaded with the deck), not only deck names.
  const { names } = useNameStats();
  const rank = card && names ? rank2024(card.stats.name, rankMap(names)) : null;
  const hidden = useMemo(() => new Set(hiddenNames(votes)), [votes]);
  const similar = useMemo(
    () => (card && cards ? similarForDisplay(card.stats.name, details.details, cards, hidden) : []),
    [card, cards, details.details, hidden],
  );

  useEffect(() => {
    if (unknown) closeSheet(NAME_SHEET);
  }, [unknown]);

  // PRD 3.2.10: detail_closed once the URL holds no name; detail_section_seen once per name shown.
  const [visits] = useState(() => createDetailVisits(track));
  const lasting = params.has(NAME_PARAM);
  useEffect(() => visits.update(named?.stats.name ?? null, lasting), [visits, named, lasting]);
  // A link to another screen (the surname link) unmounts the sheet with `n` still in the URL:
  // that ends the visit too. A timer, so Strict Mode's remount (same visit) cancels it.
  const leaving = useRef<number | null>(null);
  useEffect(() => {
    if (leaving.current !== null) window.clearTimeout(leaving.current);
    return () => {
      leaving.current = window.setTimeout(() => visits.end(), 0);
    };
  }, [visits]);
  const [body, setBody] = useState<HTMLDivElement | null>(null);
  useSectionsSeen(visits, open ? body : null, `${card?.stats.name}|${details.state}|${similar.length}`);

  // FR-D6: a direct link opens once the deck has the name; Back then closes onto a clean page.
  const shown = named?.stats.name ?? null;
  useEffect(() => {
    if (shown !== null && adoptNameLink()) track("detail_opened", { source: "link" });
  }, [shown]);

  // NP-117: a similar name sits on the entry of the name it was opened from; one Back returns there.
  const from = usePreviousName();

  if (!card) return null;
  return (
    <BottomSheet
      name={NAME_SHEET}
      detents={DETENTS}
      onDetent={(detent) => {
        if (detent === "full") visits.full();
      }}
      contentKey={card.stats.name}
      closeInHeader
      header={(titleId) => <NameHeader card={card} titleId={titleId} from={named ? from : null} />}
      footer={
        <SheetDecisions vote={votes.get(card.stats.name) ?? null} onDecide={(kind) => onDecide?.(card.stats.name, kind)} />
      }
    >
      <div ref={setBody} data-detail-body className="flex flex-col gap-5">
        <SurnameSection name={card.stats.name} surname={surname} />
        <MeaningSection
          intro={card.content.intro}
          story={details.details?.get(card.stats.name)?.story ?? null}
          state={details.state}
        />
        <CardBible bible={card.content.bible} inSheet />
        <CardPeople people={card.content.people} />
        <TogetherSection together={togetherFor(card.stats.name, matches, memberCount)} />
        <NumbersSection stats={card.stats} rank={rank} />
        <SexSection {...card.derived} />
        <FactsSection stats={card.stats} rank={rank} />
        <SimilarSection similar={similar} onOpen={openSimilar} />
        <SourceSection />
      </div>
    </BottomSheet>
  );
}

// history.state has no change event of its own; every push, replace or Back also changes the
// search params, which re-render the sheet and read it again.
const noSubscription = () => () => {};
const previousNameNow = () => previousName(window.history.state);
const noPreviousName = () => null;

/** The name one Back returns to when the sheet shows a name opened over another name, else null. */
function usePreviousName(): string | null {
  return useSyncExternalStore(noSubscription, previousNameNow, noPreviousName);
}

/**
 * Sends `detail_section_seen` for each [data-detail-section] in `body` once half of it has been
 * in view (the implicit root clips to the sheet's scroller). `content` changes when sections
 * can appear: a new name, the details file loading, the similar names.
 */
function useSectionsSeen(visits: DetailVisits, body: HTMLElement | null, content: string) {
  useEffect(() => {
    if (!body) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < SEEN_RATIO) continue;
          visits.seen((entry.target as HTMLElement).dataset.detailSection as DetailSection);
          observer.unobserve(entry.target);
        }
      },
      { threshold: SEEN_RATIO },
    );
    body.querySelectorAll("[data-detail-section]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [visits, body, content]);
}

/**
 * FR-D18: the swipe screen's three buttons pinned under the scrolling content (the footer sits
 * outside the scroller, so it never covers the last section), the name's vote shown as pressed.
 * The screen decides what a choice does (PRD 3.2.5, 3.2.6). Under 17rem "דילוג" takes a line of its own.
 */
function SheetDecisions({ vote, onDecide }: { vote: Vote | null; onDecide: (kind: Decision) => void }) {
  return (
    <div data-clarity-unmask="true" className="grid grid-cols-3 gap-2 pt-3 max-[22.5rem]:gap-1.5 max-[17rem]:grid-cols-2 max-[17rem]:[&>:last-child]:col-span-2">
      <DecisionButtons onDecide={onDecide} pressed={vote} />
    </div>
  );
}

/**
 * FR-D7: the name, then its niqqud and the card's sex tag, and "סגירה" on the end side. The
 * heading names the dialog and takes focus on open (no outline: it isn't a control). A name
 * opened from another name's similar names has "חזרה ל־{from}" on the start side (NP-117).
 */
function NameHeader({ card, titleId, from }: { card: Card; titleId: string; from: string | null }) {
  const { stats, content, derived } = card;
  return (
    <div className="flex items-center gap-3">
      {from ? (
        <IconButton aria-label={`חזרה ל־${from}`} onClick={() => window.history.back()}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none ltr:-scale-x-100">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </IconButton>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 id={titleId} tabIndex={-1} data-autofocus className="text-hero-name break-words text-ink focus:outline-none">
          {stats.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {content.niqqud.trim() && content.niqqud !== stats.name ? (
            <span className="text-card-title break-words text-ink-soft">{content.niqqud}</span>
          ) : null}
          <span className={tagClass()}>{derived.sexTag}</span>
        </div>
      </div>
      <IconButton aria-label="סגירה" onClick={close}>
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="flex-none"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </IconButton>
    </div>
  );
}
