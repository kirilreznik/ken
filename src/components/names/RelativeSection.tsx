"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { inputClass } from "@/components/names/ui";
import { chipClass } from "@/components/names/ui/classes";
import { getDetailsSnapshot, startDetails, subscribeDetails } from "@/components/names/useNameDetails";
import { matchRelative, relativeFilter, relativeSummary, type RelativeFilter } from "@/lib/names/relative";
import type { Card } from "@/lib/names/types";
import { useSyncExternalStore } from "react";

const noDetails = () => null;

/** The details file's other forms of a name (loaded once the field is used). */
function useForms(enabled: boolean): (name: string) => readonly string[] {
  useEffect(() => {
    if (enabled) void startDetails();
  }, [enabled]);
  const details = useSyncExternalStore(subscribeDetails, () => getDetailsSnapshot().details, noDetails);
  return useMemo(() => (name: string) => details?.get(name)?.similar ?? [], [details]);
}

/**
 * "על שם קרוב משפחה" in the filters sheet: the relative's name, then "אותה אות ראשונה" and
 * "אותה משמעות" (both on by default). Writes the draft's `relative`; the name stays on the device.
 */
export default function RelativeSection({
  cards,
  value,
  onChange,
}: {
  cards: readonly Card[] | null;
  value: RelativeFilter | null;
  onChange: (value: RelativeFilter | null) => void;
}) {
  const [text, setText] = useState(value?.name ?? "");
  const [letter, setLetter] = useState(value ? value.letter : true);
  const [meaning, setMeaning] = useState(value ? value.meaning || !value.letter : true);
  const hintId = useId();
  const forms = useForms(text.trim() !== "");
  const match = useMemo(() => matchRelative(text, cards ?? [], forms), [text, cards, forms]);
  const hasMeaning = match.names.length > 0;
  const summary = relativeSummary(match);

  // Every change of the field or the chips rewrites the draft.
  useEffect(() => {
    onChange(relativeFilter(match, letter, meaning));
    // onChange is the parent's setter for this key; only the inputs matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, letter, meaning]);

  const named = match.name !== "" && match.letter !== null;

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby={hintId}>
      <legend className="mb-0.5 p-0 text-card-title">על שם קרוב משפחה</legend>
      <p id={hintId} className="mb-2.5 text-caption text-stone">
        השם של מי שרוצים לקרוא על שמו. נציג שמות באותה אות ראשונה או באותה משמעות. השם נשאר במכשיר.
      </p>
      <label htmlFor="relative-name" className="sr-only">
        השם של קרוב המשפחה
      </label>
      <input
        id="relative-name"
        type="text"
        dir="rtl"
        lang="he"
        autoComplete="off"
        enterKeyHint="done"
        maxLength={30}
        placeholder="למשל רבקה, צבי או הירש"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={inputClass()}
      />
      {named ? (
        <div className="mt-2.5 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={letter} className={chipClass(letter)} onClick={() => setLetter((v) => !v)}>
              אותה אות ראשונה · {match.letter}
            </button>
            <button
              type="button"
              aria-pressed={meaning && hasMeaning}
              aria-disabled={!hasMeaning || undefined}
              className={`${chipClass(meaning && hasMeaning)} aria-disabled:opacity-50`}
              onClick={() => hasMeaning && setMeaning((v) => !v)}
            >
              אותה משמעות
            </button>
          </div>
          <p className="m-0 text-caption text-ink-soft" aria-live="polite">
            {hasMeaning
              ? `${summary ?? ""} ${match.names.length === 1 ? "שם אחד באותה משמעות" : `${match.names.length} שמות באותה משמעות או בצורה אחרת של השם`}.`.trim()
              : "לשם הזה אין לנו עדיין משמעות. אפשר לחפש לפי האות הראשונה."}
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}
