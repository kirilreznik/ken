"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { Button, Dialog, IconButton, closeDialog, openDialog } from "@/components/names/ui";
import { useSpace } from "@/components/names/useSpace";
import { hasAppEntry } from "@/lib/names/appHistory";
import { APP_PATH, WELCOME_PATH } from "@/lib/names/auth";
import { isOffline } from "@/lib/names/authErrors";
import { reportClientLog } from "@/lib/names/clientLog";
import { DISPLAY_NAME_MAX, isValidDisplayName, suggestedDisplayName } from "@/lib/names/onboarding";
import {
  DELETE_UNAVAILABLE_TEXT,
  NAME_SAVED_TEXT,
  OPT_IN_OFF_TEXT,
  OPT_IN_ON_TEXT,
  SETTINGS_ERROR_TEXT,
  SETTINGS_OFFLINE_TEXT,
  isOptedIn,
  optInMetadata,
  saveDisplayName,
  signInMethod,
} from "@/lib/names/settings";
import { getSupabase } from "@/lib/names/supabase";
import { showToast } from "@/lib/names/toast";

const DELETE_DIALOG = "delete-account";

const card = "m-0 list-none rounded-lg bg-surface p-0 shadow-card";
const row = "border-b border-line first:rounded-t-lg last:rounded-b-lg last:border-b-0";
const rowAction = "flex min-h-14 w-full rounded-[inherit] items-center gap-3 px-4 py-3 text-start text-body font-bold text-ink";

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ms-auto shrink-0 text-stone ltr:-scale-x-100">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function LinkRow({ href, children, newTab = false }: { href: string; children: React.ReactNode; newTab?: boolean }) {
  return (
    <li className={row}>
      {newTab ? (
        <a href={href} target="_blank" rel="noopener" className={rowAction}>
          {children}
          <span className="sr-only"> (נפתח בכרטיסייה חדשה)</span>
          <Chevron />
        </a>
      ) : (
        <Link href={href} className={rowAction}>
          {children}
          <Chevron />
        </Link>
      )}
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="m-0 px-1 text-label text-stone">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * FR-W25 (`/names/settings`): display name, sign-in method, the updates opt-in, invite, about,
 * legal links, sign out and account deletion. Board 5's list look on canvas.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const space = useSpace();
  const metadata = user?.user_metadata;
  const savedName = suggestedDisplayName(metadata);
  const [draft, setDraft] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [optIn, setOptIn] = useState<boolean | null>(null);
  const [optInError, setOptInError] = useState<string | null>(null);
  const [savingOptIn, setSavingOptIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [status, setStatus] = useState("");

  const name = draft ?? savedName;
  const changed = name.trim() !== savedName;
  const nameValid = isValidDisplayName(name);
  const optedIn = optIn ?? isOptedIn(metadata);
  const method = signInMethod(user);

  const back = () => {
    if (hasAppEntry()) router.back();
    else router.replace(APP_PATH);
  };

  async function submitName(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!user || !supabase || savingName) return;
    if (!nameValid) {
      setNameError(`השם צריך להיות באורך 1 עד ${DISPLAY_NAME_MAX} תווים.`);
      return;
    }
    if (!changed) return;
    if (isOffline()) {
      setNameError(SETTINGS_OFFLINE_TEXT);
      return;
    }
    setSavingName(true);
    setNameError(null);
    try {
      await saveDisplayName(supabase, space.spaceId, user.id, name.trim());
      setDraft(null);
      setStatus(NAME_SAVED_TEXT);
      showToast(NAME_SAVED_TEXT);
    } catch (err) {
      reportClientLog({ area: "settings", message: "display name save failed", name: err instanceof Error ? err.name : undefined });
      setNameError(isOffline() ? SETTINGS_OFFLINE_TEXT : SETTINGS_ERROR_TEXT);
    } finally {
      setSavingName(false);
    }
  }

  async function toggleOptIn() {
    const supabase = getSupabase();
    if (!supabase || savingOptIn) return;
    if (isOffline()) {
      setOptInError(SETTINGS_OFFLINE_TEXT);
      return;
    }
    const next = !optedIn;
    setOptIn(next);
    setSavingOptIn(true);
    setOptInError(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: optInMetadata(next) });
      if (error) throw error;
      setOptIn(null);
      setStatus(next ? OPT_IN_ON_TEXT : OPT_IN_OFF_TEXT);
    } catch (err) {
      reportClientLog({ area: "settings", message: "opt-in save failed", name: err instanceof Error ? err.name : undefined });
      setOptIn(null);
      setOptInError(isOffline() ? SETTINGS_OFFLINE_TEXT : SETTINGS_ERROR_TEXT);
    } finally {
      setSavingOptIn(false);
    }
  }

  async function doSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.replace(WELCOME_PATH);
    } finally {
      setSigningOut(false);
    }
  }

  // US-060 wires this to /api/names/account and the goodbye screen.
  function confirmDelete() {
    closeDialog(DELETE_DIALOG);
    showToast(DELETE_UNAVAILABLE_TEXT);
  }

  return (
    <div data-names-bg="none" className="min-h-dvh bg-canvas">
      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <header className="flex items-center gap-2">
          <IconButton aria-label="חזרה" onClick={back}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ltr:-scale-x-100">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </IconButton>
          <h1 className="m-0 min-w-0 flex-1 text-title">הגדרות</h1>
        </header>

        <Section title="החשבון">
          <ul className={card}>
            <li className={`${row} px-4 py-3.5`}>
              <form onSubmit={submitName} noValidate className="flex flex-col gap-2">
                <label htmlFor="settings-name" className="text-caption font-bold text-ink-soft">
                  השם שלי
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="settings-name"
                    type="text"
                    dir="rtl"
                    autoComplete="given-name"
                    maxLength={DISPLAY_NAME_MAX}
                    value={name}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      setNameError(null);
                    }}
                    aria-invalid={nameError ? true : undefined}
                    aria-describedby="settings-name-hint"
                    className="min-h-11 min-w-0 flex-1 rounded-md border border-line bg-sand px-3 text-start text-body text-ink"
                  />
                  <Button type="submit" variant="secondary" size="md" aria-disabled={!changed || savingName} aria-busy={savingName} className="aria-disabled:opacity-60">
                    {savingName ? "שומרים…" : "שמירה"}
                  </Button>
                </div>
                {nameError ? (
                  <p id="settings-name-hint" role="alert" className="m-0 text-caption font-bold text-urgent">
                    {nameError}
                  </p>
                ) : (
                  <p id="settings-name-hint" className="m-0 text-caption text-stone">
                    כך יופיע השם שלך אצל מי שבוחרים איתך.
                  </p>
                )}
              </form>
            </li>
            <li className={`${row} flex flex-col gap-0.5 px-4 py-3.5`}>
              <span className="text-caption font-bold text-ink-soft">כניסה באמצעות</span>
              {method.kind === "google" ? (
                <span className="text-body text-ink">Google</span>
              ) : (
                <bdi dir="ltr" className="self-start text-body break-all text-ink">
                  {method.email}
                </bdi>
              )}
            </li>
            <li className={row}>
              <button
                type="button"
                role="switch"
                aria-checked={optedIn}
                aria-busy={savingOptIn}
                aria-describedby="settings-optin-hint"
                onClick={toggleOptIn}
                className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-start"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-body font-bold text-ink">עדכון כש־Nest יוצאת לחנויות</span>
                  <span id="settings-optin-hint" className="text-caption text-stone">
                    {optedIn ? "פעיל" : "כבוי"} · לא חובה
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-8 w-13 shrink-0 items-center rounded-pill border-2 transition-colors ${optedIn ? "border-ink bg-ink" : "border-line bg-sand"}`}
                >
                  <span className={`absolute size-6 rounded-full bg-surface shadow-card transition-[inset-inline-start] ${optedIn ? "start-[calc(100%-26px)]" : "start-0.5"}`} />
                </span>
              </button>
              {optInError ? (
                <p role="alert" className="m-0 px-4 pb-3 text-caption font-bold text-urgent">
                  {optInError}
                </p>
              ) : null}
            </li>
          </ul>
        </Section>

        <Section title="בחירה ביחד">
          <ul className={card}>
            <LinkRow href="/names/invite">הזמנת מישהו לבחור ביחד</LinkRow>
          </ul>
        </Section>

        <Section title="מידע">
          <ul className={card}>
            <LinkRow href="/names/about">על הנתונים</LinkRow>
            <LinkRow href="/names/terms" newTab>
              תנאי שימוש
            </LinkRow>
            <LinkRow href="/names/privacy" newTab>
              מדיניות פרטיות
            </LinkRow>
          </ul>
        </Section>

        <ul className={card}>
          <li className={row}>
            <button type="button" onClick={doSignOut} aria-busy={signingOut} className={rowAction}>
              {signingOut ? "יוצאים…" : "יציאה מהחשבון"}
            </button>
          </li>
          <li className={row}>
            <button type="button" onClick={() => openDialog(DELETE_DIALOG)} className={`${rowAction} text-urgent`}>
              מחיקת החשבון
            </button>
          </li>
        </ul>

        <p role="status" className="sr-only">
          {status}
        </p>
      </main>

      <Dialog name={DELETE_DIALOG} title="למחוק את החשבון?" description="מחיקת החשבון תמחק את כל הבחירות שלך. אם יש מרחב משותף, הוא נשאר אצל מי שהוזמן/ה.">
        <Button onClick={confirmDelete}>
          מחיקה לצמיתות
        </Button>
        <Button variant="secondary" data-autofocus="" onClick={() => closeDialog(DELETE_DIALOG)}>
          ביטול
        </Button>
      </Dialog>
    </div>
  );
}
