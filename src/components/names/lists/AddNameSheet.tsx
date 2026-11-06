"use client";

import { Suspense, useState, type FormEvent } from "react";
import { BottomSheet, Button, closeSheet } from "@/components/names/ui";
import { useLayerOpen } from "@/components/names/ui/layers";
import { CUSTOM_NAME_MAX, validateCustomName } from "@/lib/names/custom";
import { track } from "@/lib/names/track";

type AddNameSheetProps = {
  /** The data names (names.json); null while loading. */
  names: { has(name: string): boolean } | null;
  /** The names on "שמרתי". */
  saved: readonly string[];
  /** Saves the name as kept; `custom` when it isn't in the data. */
  onAdd: (name: string, custom: boolean) => void;
};

const FORM_ID = "add-name-form";

/**
 * "הוספת שם" (FR-W18, E16 FR-12): a name that isn't in the deck goes straight to "שמרתי".
 * Hebrew letters only, up to 20 characters; a name in the data is saved as the data name.
 * Mounts only while ?sheet=add-name is open, so each opening starts empty.
 */
export default function AddNameSheet(props: AddNameSheetProps) {
  return (
    <Suspense fallback={null}>
      <Gate {...props} />
    </Suspense>
  );
}

function Gate(props: AddNameSheetProps) {
  return useLayerOpen("sheet", "add-name") ? <Panel {...props} /> : null;
}

function Panel({ names, saved, onAdd }: AddNameSheetProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!names) return;
    const result = validateCustomName(value, names, saved);
    if (!result.ok) {
      setError(result.message);
      document.getElementById("add-name")?.focus();
      return;
    }
    closeSheet("add-name");
    onAdd(result.name, !result.isDataName);
    track("custom_name_added", { in_data: result.isDataName });
  };

  return (
    <BottomSheet
      name="add-name"
      title="הוספת שם"
      footer={
        <Button type="submit" form={FORM_ID} className="w-full" aria-disabled={!names || undefined}>
          הוספה לרשימה
        </Button>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={submit} className="flex flex-col gap-1.5">
        <p className="m-0 mb-2 text-body text-ink-soft">אפשר להוסיף שם שלא מופיע בבחירה. הוא יישמר ברשימה בלי נתונים.</p>
        <label htmlFor="add-name" className="text-person font-bold text-ink">
          השם
        </label>
        <input
          id="add-name"
          name="name"
          type="text"
          dir="rtl"
          lang="he"
          autoComplete="off"
          enterKeyHint="done"
          data-autofocus=""
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "add-name-error" : "add-name-hint"}
          className="h-12 w-full rounded-md border border-line bg-surface px-3.5 text-start text-intro text-ink placeholder:text-stone aria-invalid:border-urgent"
        />
        {error ? (
          <span id="add-name-error" role="alert" className="flex items-center gap-1.5 text-caption font-bold text-urgent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="flex-none">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5M12 16v.5" />
            </svg>
            {error}
          </span>
        ) : (
          <span id="add-name-hint" className="text-caption text-stone">
            אותיות בעברית, עד {CUSTOM_NAME_MAX} תווים.
          </span>
        )}
      </form>
    </BottomSheet>
  );
}
