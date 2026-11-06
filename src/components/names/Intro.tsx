"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button, IconButton } from "@/components/names/ui";
import { APP_PATH } from "@/lib/names/auth";
import { getPref, setPref } from "@/lib/names/prefs";
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

  function finish(saveSurname: boolean) {
    if (userId) {
      if (saveSurname) setPref(userId, "surname", surname.trim());
      setPref(userId, "introSeen", true);
    }
    router.replace(APP_PATH);
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
        <IconButton aria-label="סגירה" onClick={() => finish(false)} className="self-end">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </IconButton>

        <div aria-hidden="true" className="flex justify-center py-2">
          <div className="relative h-37.5 w-55 max-[20rem]:scale-75">
            <div className="absolute start-8.5 top-4.5 h-27.5 w-37.5 -rotate-8 rounded-lg bg-surface opacity-60 shadow-card" />
            <div className="absolute start-10 top-2.5 flex h-30 w-37.5 rotate-4 flex-col items-center justify-center gap-1.5 rounded-lg bg-surface shadow-hero">
              <span className="text-hero-name text-ink">נֹעַם</span>
              <span className="size-2.5 rounded-full bg-clay" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-display text-ink">שם אחד בכל פעם</h1>
          <p className="m-0 text-intro text-ink-soft">עוברים על שמות שניתנו לתינוקות בישראל, שומרים את מה שמדבר אליכם ומדלגים על השאר.</p>
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
              ? "הבחירה נעשית בנפרד, בכל טלפון. שם ששניכם שמרתם יופיע בהתאמות, ועל דילוגים אף אחד לא יודע."
              : "אף אחד לא רואה מה שמרתם ועל מה דילגתם."}
          </Point>
          <Point
            icon={
              <Icon>
                <path d="M6 4h12v16l-6-4-6 4z" />
              </Icon>
            }
          >
            <b className={strong}>עובד גם לבד.</b> מהשמות ששמרתם אפשר לצמצם לחמישייה <span className="whitespace-nowrap">בדו־קרב</span>.
          </Point>
        </ul>

        <div className="names-glass names-card-glass flex flex-col gap-1.5 rounded-md p-3 in-data-[names-bg=none]:p-0 in-data-[names-bg=none]:shadow-none">
          <label htmlFor="surname" className="text-person font-bold text-ink">
            שם משפחה, לא חובה
          </label>
          <input
            id="surname"
            name="surname"
            type="text"
            dir="rtl"
            autoComplete="family-name"
            maxLength={SURNAME_MAX}
            placeholder="כדי לראות את השם המלא"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            aria-describedby="surname-hint"
            className="h-12 w-full rounded-md border border-line bg-surface px-3.5 text-start text-intro text-ink placeholder:text-stone"
          />
          <span id="surname-hint" className="text-caption text-ink-soft in-data-[names-bg=none]:text-stone">
            נשמר רק במכשיר הזה.
          </span>
        </div>

        {/* Sticky so the main action is in view on a short screen (NP-UX-002). */}
        <div className="sticky bottom-0 -mx-5 mt-auto bg-linear-to-t from-(--nest-canvas) from-40% to-transparent px-5 pt-6 pb-[max(16px,env(safe-area-inset-bottom))]">
          <Button type="submit" className="w-full">
            התחלת בחירה
          </Button>
        </div>
      </form>
    </main>
  );
}
