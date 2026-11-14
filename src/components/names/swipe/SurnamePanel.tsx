"use client";

import { useEffect, useState } from "react";
import { Button, ChevronIcon, Glass, inputClass } from "@/components/names/ui";
import { SURNAME_MAX, fullName } from "@/lib/names/card";
import { track } from "@/lib/names/track";
import { deckPanel, deckPanelWrap } from "./EmptyDeck";

type SurnamePanelProps = {
  /** The first card's name with niqqud (large) and without it (with the surname, as on the card). */
  preview: string;
  name: string;
  /** Guests have no settings screen: the hint points to the name sheet instead. */
  guest: boolean;
  /** How many names the deck has, for the lead line (left out while unknown). */
  total?: number;
  /** Saves the surname ("" when skipped); the card won't come back either way. */
  onDone: (surname: string) => void;
};

/**
 * The first card a new visitor sees, once per device, where the first name card would be
 * (like PausePanel): an invitation to the deck that previews the first name, with an optional
 * family name shown on it as it is typed. One button starts the deck either way; the surname
 * stays on the device only, and settings (or a name's sheet, for guests) can change it.
 */
export default function SurnamePanel({ preview, name, guest, total, onDone }: SurnamePanelProps) {
  const [surname, setSurname] = useState("");
  const full = fullName(name, surname);

  useEffect(() => {
    track("surname_prompt", { action: "shown" });
  }, []);

  // One button: with a surname typed it's saved, without one the card is skipped (same events as before).
  const start = () => {
    const value = surname.trim();
    track("surname_prompt", { action: value ? "saved" : "skipped" });
    onDone(value);
  };

  return (
    <div className={deckPanelWrap}>
      <Glass
        as="section"
        aria-labelledby="names-surname-title"
        aria-describedby="names-surname-lead"
        className={`${deckPanel} justify-center`}
      >
        <h2 id="names-surname-title" className="m-0 text-display text-ink">
          השם הראשון כבר מחכה
        </h2>
        <p id="names-surname-lead" className="m-0 -mt-1 text-intro text-ink-soft">
          {total ? `${total.toLocaleString("en-US")} שמות, ` : "שמות "}
          כל אחד עם הסיפור שלו ומספר הלידות מהלמ״ס. לבד או עם מי שבוחרים.
        </p>
        {/* The first card, peeking out of its deck: its name, with the surname as it is typed. */}
        <div aria-hidden="true" className="relative my-1 w-full max-w-[320px] py-2 max-[20rem]:hidden [@media(max-height:40rem)]:hidden">
          <div className="names-glass-soft absolute inset-x-6 inset-y-1 rotate-3 rounded-lg" />
          <div className="relative mx-2 flex -rotate-2 flex-col items-center gap-1 rounded-lg bg-peach-pale px-4 py-7 text-center shadow-card">
            <span className="text-name break-words text-ink">{preview}</span>
            <span className="text-card-title font-medium break-words text-ink-soft">{full ?? name}</span>
          </div>
        </div>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
          className="flex w-full flex-col gap-1.5 text-start"
        >
          <label htmlFor="names-surname" className="text-person font-bold text-ink">
            שם משפחה <span className="font-medium text-ink-soft">(לא חובה)</span>
          </label>
          <input
            id="names-surname"
            name="surname"
            type="text"
            dir="rtl"
            autoComplete="family-name"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            maxLength={SURNAME_MAX}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            aria-describedby="names-surname-hint"
            className={inputClass()}
          />
          <span id="names-surname-hint" className="text-caption text-ink-soft">
            {guest
              ? "כל שם יופיע איתו על הכרטיס. נשמר רק במכשיר הזה, ואפשר לשנות ב״לכל הפרטים״ של כל שם."
              : "כל שם יופיע איתו על הכרטיס. נשמר רק במכשיר הזה, ואפשר לשנות בהגדרות."}
          </span>
          <Button type="submit" className="mt-3 w-full">
            לראות את השם הראשון
            <ChevronIcon dir="forward" />
          </Button>
        </form>
      </Glass>
    </div>
  );
}
