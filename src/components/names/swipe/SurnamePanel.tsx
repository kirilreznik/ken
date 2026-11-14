"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, ChevronIcon, Glass, Icon, inputClass } from "@/components/names/ui";
import { aiDeckEnabled } from "@/lib/names/aiDeck";
import { SURNAME_MAX, fullName } from "@/lib/names/card";
import { track } from "@/lib/names/track";
import { deckPanel, deckPanelWrap } from "./EmptyDeck";

type SurnamePanelProps = {
  /** The first card's name, for the surname hint ("נועם כהן"). */
  name: string;
  /** Guests have no settings screen: the hint points to the name sheet instead. */
  guest: boolean;
  /** How many names the deck has, for the lead line (left out while unknown). */
  total?: number;
  /** Saves the surname ("" when skipped); the card won't come back either way. */
  onDone: (surname: string) => void;
};

/** What the swiper can do, on the first card. The AI line shows only while the feature is on. */
const FEATURES: { key: string; title: string; text: string; icon: ReactNode }[] = [
  {
    key: "ai",
    title: "חיפוש לפי תיאור",
    text: "מתארים במילים את השם שמחפשים, ו־AI בוחר מתוך השמות שלנו.",
    icon: <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />,
  },
  {
    key: "share",
    title: "לבחור יחד, לגלות התאמות",
    text: "אפשר להזמין מישהו. שם שנשמר אצל שניים או יותר הופך להתאמה, ומה שדילגת עליו נשאר רק אצלך.",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.2c.6-.1 1.3-.2 2-.2 2.8 0 4 2 4 5" />
      </>
    ),
  },
  {
    key: "relative",
    title: "על שם מישהו יקר",
    text: "שמות לפי האות הראשונה או המשמעות של שם במשפחה, וכל שם עם הסיפור שלו.",
    icon: <path d="M12 21V11M12 11c0-4 3-7 8-7 0 5-3 7-8 7zM12 15c0-3-2-5-7-5 0 4 2 5 7 5z" />,
  },
];

/**
 * The first card a new visitor sees, once per device, where the first name card would be
 * (like PausePanel): a poetic welcome, what the swiper can do (AI search, choosing together
 * and matches, naming after a relative) and one button to the deck; an optional family name
 * opens from a link below it. The button starts the deck either way; the surname
 * stays on the device only, and settings (or a name's sheet, for guests) can change it.
 */
export default function SurnamePanel({ name, guest, total, onDone }: SurnamePanelProps) {
  const [surname, setSurname] = useState("");
  // The surname field opens from its link, so the card leads with the invitation and one button.
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
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
        <span className="rounded-pill bg-peach-soft px-3 py-1 text-caption font-bold text-clay-deep">ברוכים הבאים</span>
        <h2 id="names-surname-title" className="m-0 text-display text-balance text-ink">
          כל סיפור מתחיל בשם
        </h2>
        <p id="names-surname-lead" className="m-0 -mt-1 text-intro text-ink-soft">
          {total ? `${total.toLocaleString("en-US")} שמות` : "שמות"} עם סיפור ומספרי לידות מהלמ״ס, אחד בכל פעם, עד שאחד מרגיש בבית.
        </p>
        <ul className="m-0 flex w-full list-none flex-col gap-3 p-0 text-start">
          {FEATURES.filter((f) => f.key !== "ai" || aiDeckEnabled()).map((f) => (
            <li key={f.key} className="flex items-start gap-3">
              <span aria-hidden="true" className="names-well flex size-10 flex-none items-center justify-center rounded-sm text-ink">
                <Icon>{f.icon}</Icon>
              </span>
              <span className="text-body text-ink-soft">
                <b className="block text-card-title text-ink">{f.title}</b>
                {f.text}
              </span>
            </li>
          ))}
        </ul>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
          className="flex w-full flex-col gap-1.5 text-start"
        >
          {open ? (
            <>
              <label htmlFor="names-surname" className="text-person font-bold text-ink">
                שם משפחה <span className="font-medium text-ink-soft">(לא חובה)</span>
              </label>
              <input
                ref={inputRef}
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
                {full ? `על הכרטיס: ${full}. ` : `כל שם יופיע איתו על הכרטיס, למשל ${name} ... `}
                {guest
                  ? "נשמר רק במכשיר הזה, ואפשר לשנות ב״לכל הפרטים״ של כל שם."
                  : "נשמר רק במכשיר הזה, ואפשר לשנות בהגדרות."}
              </span>
            </>
          ) : null}
          <Button type="submit" className="mt-2 w-full">
            להתחיל לבחור שמות
            <ChevronIcon dir="forward" />
          </Button>
        </form>
        {open ? null : (
          <Button variant="link" onClick={() => setOpen(true)} aria-expanded={false} aria-controls="names-surname">
            להוסיף קודם שם משפחה
          </Button>
        )}
      </Glass>
    </div>
  );
}
