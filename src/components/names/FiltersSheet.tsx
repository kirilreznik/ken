"use client";

import Link from "next/link";
import { Suspense, useId, useMemo, useState, type ReactNode } from "react";
import LetterRangeSlider from "@/components/names/LetterRangeSlider";
import ThemeIcon from "@/components/names/ThemeIcon";
import { BottomSheet, Button, checkboxClass, closeSheet } from "@/components/names/ui";
import { useLayerOpen } from "@/components/names/ui/layers";
import { deckCount, hiddenCount } from "@/lib/names/deck";
import {
  RANGE_MAX,
  RANGE_MIN,
  SECTOR_LABELS,
  applyLabel,
  defaultFilters,
  lengthValue,
  letterOptions,
  letterValue,
  sexToken,
  type Filters,
  type NameLength,
  type Sector,
} from "@/lib/names/filters";
import { HIDE_HINT } from "@/lib/names/lists";
import { getPref, setPref } from "@/lib/names/prefs";
import { track } from "@/lib/names/track";
import { THEME_IDS, THEME_LABELS, type ThemeId } from "@/lib/names/themes";
import type { Card, PopularityBand, SexTag, TrendWord, Vote } from "@/lib/names/types";

type FiltersSheetProps = {
  userId: string | null;
  cards: readonly Card[] | null;
  votes: ReadonlyMap<string, Vote>;
};

interface Option<T> {
  value: T;
  label: ReactNode;
}

const SEX: Option<SexTag | null>[] = [
  { value: null, label: "כל השמות" },
  { value: "בן", label: "בן" },
  { value: "בת", label: "בת" },
  { value: "מתאים לכולם", label: "מתאים לכולם" },
];

// Every group starts with "כל השמות", so clearing a choice never depends on tapping it again.
const BANDS: Option<PopularityBand | null>[] = [
  { value: null, label: "כל השמות" },
  { value: "נפוץ", label: "נפוץ" },
  { value: "בינוני", label: "בינוני" },
  { value: "נדיר", label: "נדיר" },
];

const arrow = (a: string, word: string) => (
  <>
    <span aria-hidden="true">{a}</span> {word}
  </>
);

const TRENDS: Option<TrendWord | null>[] = [
  { value: null, label: "כל השמות" },
  { value: "בעלייה", label: arrow("↗", "בעלייה") },
  { value: "יציב", label: arrow("→", "יציב") },
  { value: "בירידה", label: arrow("↘", "בירידה") },
];

const ORIGINS: Option<Sector | null>[] = [
  { value: null, label: "כל השמות" },
  ...(Object.entries(SECTOR_LABELS) as [Sector, string][]).map(([value, label]) => ({ value, label })),
];

const LENGTHS: Option<NameLength | null>[] = [
  { value: null, label: lengthValue(null) },
  { value: "קצר", label: lengthValue("קצר") },
  { value: "ארוך", label: lengthValue("ארוך") },
];

// Board 3's chips: 40 px pills, white with a line border or ink when on; ::before makes the
// hit area 44 px tall.
function chipClass(on: boolean): string {
  return [
    "relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-pill px-3.5 text-person font-bold",
    "before:absolute before:inset-x-0 before:-inset-y-0.5 before:content-['']",
    "transition-transform duration-(--nest-duration-press) motion-safe:active:scale-95",
    on ? "border border-ink bg-ink text-surface" : "border border-line bg-surface text-ink",
  ].join(" ");
}

function ChipGroup<T>({
  legend,
  options,
  value,
  onChange,
  toggle = false,
}: {
  legend: string;
  options: Option<T | null>[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** No "all" chip: pressing the chip that is on turns the group back to all. */
  toggle?: boolean;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2.5 p-0 text-card-title">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={on}
              className={chipClass(on)}
              onClick={() => onChange(toggle && on ? null : o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * "נושאים": several themes can be on at once (a name passes with any of them). "כל השמות"
 * clears them, and turning the last one off is the same as "כל השמות".
 */
function ThemeGroup({ value, onChange }: { value: ThemeId[] | null; onChange: (value: ThemeId[] | null) => void }) {
  const hintId = useId();
  const toggle = (id: ThemeId) => {
    const now = value ?? [];
    const next = now.includes(id) ? now.filter((t) => t !== id) : [...now, id];
    onChange(next.length ? THEME_IDS.filter((t) => next.includes(t)) : null);
  };
  const chip = (key: string, on: boolean, icon: ThemeId | "all", label: string, onClick: () => void) => (
    <button key={key} type="button" aria-pressed={on} className={`${chipClass(on)} gap-1.5`} onClick={onClick}>
      <ThemeIcon theme={icon} />
      {label}
    </button>
  );
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby={hintId}>
      <legend className="mb-0.5 p-0 text-card-title">נושאים</legend>
      <p id={hintId} className="mb-2.5 text-caption text-stone">
        ניתן לבחור כמה נושאים
      </p>
      <div className="flex flex-wrap gap-2">
        {chip("all", value === null, "all", "כל השמות", () => onChange(null))}
        {THEME_IDS.map((id) => chip(id, value?.includes(id) ?? false, id, THEME_LABELS[id], () => toggle(id)))}
      </div>
    </fieldset>
  );
}

function Chevron() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-none"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

type Picker = "letter" | "length" | null;

/**
 * "סינון" (board 3, FR-W16): sex chips, theme chips (several at once), popularity, trend and
 * origin chips, first letter and length (or a custom letter range)
 * pickers, "שמות שהסתרתי ({n})" and the apply button with the live count. Changes are a draft
 * until "הצגת {n} שמות" saves them to the device pref; closing the sheet another way drops them.
 */
export default function FiltersSheet(props: FiltersSheetProps) {
  // useSearchParams needs a Suspense boundary on prerendered routes (Next 16).
  return (
    <Suspense fallback={null}>
      <FiltersGate {...props} />
    </Suspense>
  );
}

// Mounting only while open makes every opening start a fresh draft from the saved filters.
function FiltersGate(props: FiltersSheetProps) {
  return useLayerOpen("sheet", "filters") ? <FiltersPanel {...props} /> : null;
}

function FiltersPanel({ userId, cards, votes }: FiltersSheetProps) {
  const [draft, setDraft] = useState<Filters>(() => (userId ? getPref(userId, "filters") : defaultFilters()));
  const [picker, setPicker] = useState<Picker>(null);
  const pickerId = useId();
  const hiddenHintId = useId();

  const set = <K extends keyof Filters>(key: K) => (value: Filters[K] | null) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const letters = useMemo(() => {
    const list = letterOptions((cards ?? []).map((c) => c.stats.name));
    return draft.letter && !list.includes(draft.letter) ? [...list, draft.letter] : list;
  }, [cards, draft.letter]);

  const n = cards ? deckCount(cards, votes, draft) : null;
  const hidden = hiddenCount(votes);

  function apply() {
    if (userId) {
      if (getPref(userId, "filters").sex !== draft.sex) track("filter_sex", { sex: sexToken(draft.sex) });
      setPref(userId, "filters", draft);
    }
    closeSheet("filters");
  }

  function reset() {
    setDraft(defaultFilters());
    setPicker(null);
  }

  const customLength = draft.letterRange !== null;
  function setCustomLength(on: boolean) {
    setDraft((d) => ({ ...d, length: null, letterRange: on ? { min: RANGE_MIN, max: RANGE_MAX } : null }));
  }

  const tile = (id: Exclude<Picker, null>, label: string, value: string) => (
    <button
      type="button"
      aria-expanded={picker === id}
      aria-controls={pickerId}
      onClick={() => setPicker((p) => (p === id ? null : id))}
      className={`flex min-h-14 flex-col items-start justify-center gap-0.5 rounded-md border bg-surface px-3.5 py-2 text-start ${
        picker === id ? "border-ink" : "border-line"
      }`}
    >
      <span className="text-caption text-stone">{label}</span>
      <span className="text-card-title text-ink">{value}</span>
    </button>
  );

  return (
    <BottomSheet
      name="filters"
      title="סינון"
      closeButton
      headerEnd={
        <button
          type="button"
          onClick={reset}
          className="min-h-11 min-w-11 rounded-pill px-1 text-person font-bold text-ink-soft underline underline-offset-4"
        >
          איפוס
        </button>
      }
      footer={
        <>
          <Button className="w-full" onClick={apply} disabled={n === null}>
            {n === null ? "הצגת שמות" : applyLabel(n)}
          </Button>
          <p role="status" className="sr-only">
            {n === null ? "" : `${n} שמות מתאימים`}
          </p>
        </>
      }
    >
      <ChipGroup legend="לבן או לבת" options={SEX} value={draft.sex} onChange={set("sex")} />
      <ThemeGroup value={draft.themes} onChange={set("themes")} />
      <ChipGroup legend="כמה נפוץ" options={BANDS} value={draft.popularity} onChange={set("popularity")} />
      <ChipGroup legend="מגמה" options={TRENDS} value={draft.trend} onChange={set("trend")} />
      <ChipGroup legend="נפוץ בקרב" options={ORIGINS} value={draft.origin} onChange={set("origin")} />

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          {tile("letter", "אות ראשונה", letterValue(draft.letter))}
          {tile("length", "אורך", lengthValue(draft.length, draft.letterRange))}
        </div>
        <div id={pickerId} hidden={!picker}>
          {picker === "letter" ? (
            <ChipGroup
              legend="אות ראשונה"
              options={[{ value: null, label: letterValue(null) }, ...letters.map((l) => ({ value: l, label: l }))]}
              value={draft.letter}
              onChange={set("letter")}
            />
          ) : picker === "length" ? (
            <div className="flex flex-col gap-3">
              {customLength ? null : (
                <ChipGroup legend="אורך" options={LENGTHS} value={draft.length} onChange={set("length")} />
              )}
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 self-start text-person font-bold text-ink">
                <input
                  type="checkbox"
                  checked={customLength}
                  onChange={(e) => setCustomLength(e.target.checked)}
                  className={checkboxClass()}
                />
                מספר אותיות מותאם אישית
              </label>
              {draft.letterRange ? (
                <LetterRangeSlider value={draft.letterRange} onChange={set("letterRange")} />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Link
          href="/names/hidden"
          data-control
          aria-describedby={hiddenHintId}
          className="flex min-h-12 items-center justify-between rounded-md bg-canvas px-3.5 text-peek font-bold text-ink"
        >
          <span>שמות שהסתרתי</span>
          <span className="flex items-center gap-1.5 font-medium text-ink-soft">
            <bdi>{hidden}</bdi>
            <Chevron />
          </span>
        </Link>
        <p id={hiddenHintId} className="m-0 px-3.5 text-caption text-stone">
          {HIDE_HINT}
        </p>
      </div>
    </BottomSheet>
  );
}
