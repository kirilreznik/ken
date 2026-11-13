"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, IconButton, dotClass, inputClass } from "@/components/names/ui";
import { APP_PATH } from "@/lib/names/auth";
import { getPref, setPref } from "@/lib/names/prefs";
import { introFromSheet } from "@/lib/names/routing";
import { useAuth } from "./AuthProvider";
import { useSpace } from "./useSpace";

const SURNAME_MAX = 30;

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function Point({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="names-glass names-card-glass flex items-start gap-3 rounded-md p-3 in-data-[names-bg=none]:shadow-none">
      <span aria-hidden="true" className="names-well flex size-9 flex-none items-center justify-center rounded-sm text-ink in-data-[names-bg=none]:bg-sand">
        {icon}
      </span>
      <span className="text-body text-ink-soft">{children}</span>
    </li>
  );
}

const strong = "font-bold text-ink";

/**
 * FR-W9 / E16 FR-3, FR-4 (board 1): what the cards show, that the numbers are CBS births and
 * that choices stay private (the shared line only when the space has 2+ members), and an
 * optional surname kept on this device only. "התחלת בחירה" marks the intro as seen.
 */
export default function Intro() {
  const { user } = useAuth();
  const router = useRouter();
  const { isShared } = useSpace();
  const userId = user?.id ?? null;
  const [surname, setSurname] = useState(() => (userId ? getPref(userId, "surname") : ""));
  const surnameRef = useRef<HTMLInputElement>(null);

  // Opened from the name sheet's "הוספת שם משפחה": go straight to the field below the fold.
  useEffect(() => {
    if (introFromSheet(window.location.search)) surnameRef.current?.focus();
  }, []);

  function finish(saveSurname: boolean) {
    if (userId) {
      if (saveSurname) setPref(userId, "surname", surname.trim());
      setPref(userId, "introSeen", true);
    }
    // From the name sheet, Back returns to it, where the surname line now shows.
    if (introFromSheet(window.location.search) && window.history.length > 1) router.back();
    else router.replace(APP_PATH);
  }

  return (
    <main className="flex flex-1 flex-col">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          finish(true);
        }}
        className="flex flex-1 flex-col gap-6 px-5 pt-14"
      >
        {/* X keeps a typed surname too; an empty field leaves a saved one alone (NP-029). */}
        <IconButton aria-label="סגירה" onClick={() => finish(surname.trim() !== "")} className="self-end">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </IconButton>

        <div aria-hidden="true" className="flex justify-center py-2">
          <div className="relative h-37.5 w-55 max-[20rem]:scale-75">
            <div className="absolute start-8.5 top-4.5 h-27.5 w-37.5 -rotate-8 rounded-lg bg-surface opacity-60 shadow-card" />
            <div className="absolute start-10 top-2.5 flex h-30 w-37.5 rotate-4 flex-col items-center justify-center gap-1.5 rounded-lg bg-surface shadow-hero">
              <span className="text-hero-name text-ink">נֹעַם</span>
              <span className={dotClass()} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-display text-ink">שם אחד בכל פעם</h1>
          <p className="m-0 text-intro text-ink-soft">עוברים על שמות שניתנו לתינוקות בישראל, שומרים את מה שמדבר אל הלב ומדלגים על השאר.</p>
        </div>

        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          <Point
            icon={
              <Icon>
                <path d="M4 19V9M10 19V5M16 19v-8M22 19H2" />
              </Icon>
            }
          >
            <b className={strong}>כמה תינוקות קיבלו כל שם</b>, ואיך זה השתנה מאז 2000. לפי נתוני הלמ&quot;ס.
          </Point>
          <Point
            icon={
              <Icon>
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </Icon>
            }
          >
            <b className={strong}>הבחירות נשארות פרטיות.</b>{" "}
            {isShared
              ? "הבחירה נעשית בנפרד, בכל טלפון. שם שנשמר אצל שניים או יותר יופיע בהתאמות, ועל דילוגים אף אחד לא יודע."
              : "אף אחד לא רואה מה שמרת ועל מה דילגת."}
          </Point>
          <Point
            icon={
              <Icon>
                <path d="M6 4h12v16l-6-4-6 4z" />
              </Icon>
            }
          >
            <b className={strong}>עובד גם לבד.</b> מהשמות ששומרים אפשר לצמצם לחמישייה <span className="whitespace-nowrap">בדו־קרב</span>, ברשימות.
          </Point>
        </ul>

        <div className="names-glass names-card-glass flex flex-col gap-1.5 rounded-md p-3 in-data-[names-bg=none]:p-0 in-data-[names-bg=none]:shadow-none">
          <label htmlFor="surname" className="text-person font-bold text-ink">
            שם משפחה, לא חובה
          </label>
          <input
            ref={surnameRef}
            id="surname"
            name="surname"
            type="text"
            dir="rtl"
            autoComplete="family-name"
            maxLength={SURNAME_MAX}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            aria-describedby="surname-hint"
            // Focus scrolls the field and its hint clear of the pinned button below (NP-030).
            className={`${inputClass()} scroll-mb-34`}
          />
          <span id="surname-hint" className="text-caption text-ink-soft in-data-[names-bg=none]:text-stone">
            כדי לראות את השם המלא על הכרטיס. נשמר רק במכשיר הזה.
          </span>
        </div>

        {/* Sticky so the main action is in view on a short screen (NP-UX-002). The canvas fade only
            on "ללא רקע": on a photo it would paint a grey band, so the button sits on the photo (NP-030). */}
        <div className="sticky bottom-0 -mx-5 mt-auto px-5 pt-6 pb-[max(16px,env(safe-area-inset-bottom))] in-data-[names-bg=none]:bg-linear-to-t in-data-[names-bg=none]:from-canvas in-data-[names-bg=none]:from-40% in-data-[names-bg=none]:to-transparent">
          <Button type="submit" className="w-full">
            התחלת בחירה
          </Button>
        </div>
      </form>
    </main>
  );
}
