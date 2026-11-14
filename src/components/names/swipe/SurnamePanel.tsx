"use client";

import { useEffect, useState } from "react";
import { Button, Glass, emptyTitleClass, inputClass } from "@/components/names/ui";
import { SURNAME_MAX, fullName } from "@/lib/names/card";
import { track } from "@/lib/names/track";
import { deckPanel, deckPanelWrap } from "./EmptyDeck";

type SurnamePanelProps = {
  /** The first card's name with niqqud (large) and without it (with the surname, as on the card). */
  preview: string;
  name: string;
  /** Guests have no settings screen: the hint points to the name sheet instead. */
  guest: boolean;
  /** Saves the surname ("" when skipped); the card won't come back either way. */
  onDone: (surname: string) => void;
};

/**
 * The surname card, once per device, where the first name card would be (like PausePanel):
 * the first name with the family name typed so far, so the full name is on every card from
 * the start. Skippable; the surname stays on the device only, and settings can change it.
 */
export default function SurnamePanel({ preview, name, guest, onDone }: SurnamePanelProps) {
  const [surname, setSurname] = useState("");
  const full = fullName(name, surname);

  useEffect(() => {
    track("surname_prompt", { action: "shown" });
  }, []);

  const save = () => {
    if (!surname.trim()) return;
    track("surname_prompt", { action: "saved" });
    onDone(surname.trim());
  };

  const skip = () => {
    track("surname_prompt", { action: "skipped" });
    onDone("");
  };

  return (
    <div className={deckPanelWrap}>
      <Glass as="section" aria-labelledby="names-surname-title" aria-describedby="names-surname-lead" className={deckPanel}>
        <h2 id="names-surname-title" className={emptyTitleClass("glass")}>
          איך זה יישמע עם שם המשפחה?
        </h2>
        <p id="names-surname-lead" className="m-0 text-intro text-ink-soft">
          אפשר להוסיף שם משפחה, וכל שם יופיע על הכרטיס יחד איתו.
        </p>
        {/* The preview: the first card's name, with the surname as it is typed. */}
        <div aria-hidden="true" className="flex w-full flex-col items-center gap-0.5 rounded-md bg-peach-pale px-4 py-3 text-center">
          <span className="text-name break-words text-ink">{preview}</span>
          <span className="text-card-title font-medium break-words text-ink-soft">
            {full ?? `${name} ...`}
          </span>
        </div>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="flex w-full flex-col gap-1.5 text-start"
        >
          <label htmlFor="names-surname" className="text-person font-bold text-ink">
            שם משפחה
          </label>
          <input
            id="names-surname"
            name="surname"
            type="text"
            dir="rtl"
            autoComplete="family-name"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            maxLength={SURNAME_MAX}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            aria-describedby="names-surname-hint"
            className={inputClass()}
          />
          <span id="names-surname-hint" className="text-caption text-ink-soft">
            {guest
              ? "נשמר רק במכשיר הזה. אפשר לשנות אחר כך ב״לכל הפרטים״ של כל שם."
              : "נשמר רק במכשיר הזה. אפשר לשנות אחר כך בהגדרות."}
          </span>
          <Button type="submit" size="md" aria-disabled={!surname.trim()} className="mt-2 w-full">
            הצגה על הכרטיסים
          </Button>
        </form>
        <Button variant="link" onClick={skip}>
          דילוג, בלי שם משפחה
        </Button>
      </Glass>
    </div>
  );
}
