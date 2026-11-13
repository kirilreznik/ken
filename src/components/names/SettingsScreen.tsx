"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { Button, Dialog, IconButton, closeDialog, inputClass, openDialog } from "@/components/names/ui";
import { InstallSheet, useInstall } from "@/components/names/pwa/Install";
import { useSpace } from "@/components/names/useSpace";
import {
  DELETE_BODY,
  DELETE_OFFLINE_TEXT,
  DELETE_TITLE,
  GOODBYE_PATH,
  deleteErrorText,
  markAccountDeleted,
  requestAccountDeletion,
} from "@/lib/names/accountDeletion";
import { hasAppEntry } from "@/lib/names/appHistory";
import { APP_PATH, WELCOME_PATH } from "@/lib/names/auth";
import { isOffline } from "@/lib/names/authErrors";
import { INSTALL_TITLE } from "@/lib/names/install";
import { LEAVE_DIALOG, LEAVE_DONE, LEAVE_FAILED, LEAVE_OFFLINE, LEAVE_TITLE, afterLeave, leaveBody, leaveSpace } from "@/lib/names/leave";
import { reportClientLog } from "@/lib/names/clientLog";
import { DISPLAY_NAME_MAX, isValidDisplayName, suggestedDisplayName } from "@/lib/names/onboarding";
import {
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
import { track } from "@/lib/names/track";

const DELETE_DIALOG = "delete-account";

const card = "m-0 list-none rounded-lg bg-surface p-0 shadow-card";
const row = "group/row border-b border-line first:rounded-t-lg last:rounded-b-lg last:border-b-0";
const rowAction = "flex min-h-14 w-full items-center group-first/row:rounded-t-lg group-last/row:rounded-b-lg gap-3 px-4 py-3 text-start text-body font-bold text-ink";

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ms-auto shrink-0 text-stone ltr:-scale-x-100">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function LinkRow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li className={row}>
      <Link href={href} data-control className={rowAction}>
        {children}
        <Chevron />
      </Link>
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
  const install = useInstall();
  const metadata = user?.user_metadata;
  const savedName = suggestedDisplayName(metadata);
  const [draft, setDraft] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [optIn, setOptIn] = useState<boolean | null>(null);
  const [optInError, setOptInError] = useState<string | null>(null);
  const [savingOptIn, setSavingOptIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const others = space.members.filter((m) => m.userId !== user?.id).map((m) => m.displayName);

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
      setNameError(`צריך שם, עד ${DISPLAY_NAME_MAX} תווים.`);
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
      track("display_name_changed");
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
      track("opt_in_changed", { opt_in: next });
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
    track("signed_out");
    try {
      await signOut();
      router.replace(WELCOME_PATH);
    } finally {
      setSigningOut(false);
    }
  }

  async function confirmLeave() {
    const supabase = getSupabase();
    if (!supabase || !user || leaving) return;
    setLeaving(true);
    setLeaveError(null);
    try {
      const members = space.members.length;
      const result = await leaveSpace(supabase);
      if (result.kind === "offline") {
        setLeaveError(LEAVE_OFFLINE);
        return;
      }
      if (result.kind === "error") {
        track("space_leave_failed", { reason: result.reason });
        reportClientLog({ area: "settings", message: `leave failed: ${result.reason}` });
        setLeaveError(LEAVE_FAILED);
        return;
      }
      // "not-shared": the others had already gone; the refresh shows the solo space either way.
      if (result.kind === "left") track("space_left", { members });
      afterLeave(user.id);
      await space.refresh();
      closeDialog(LEAVE_DIALOG);
      setStatus(LEAVE_DONE);
      showToast(LEAVE_DONE);
    } finally {
      setLeaving(false);
    }
  }

  function openDelete() {
    setDeleteError(null);
    openDialog(DELETE_DIALOG);
  }

  async function confirmDelete() {
    const supabase = getSupabase();
    if (!supabase || deleting) return;
    if (isOffline()) {
      setDeleteError(DELETE_OFFLINE_TEXT);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      // getSession refreshes an expired access token first.
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const result = token ? await requestAccountDeletion(token) : "unauthorized";
      const message = deleteErrorText(result);
      if (message) {
        if (result === "error") reportClientLog({ area: "settings", message: "account deletion failed" });
        setDeleteError(isOffline() ? DELETE_OFFLINE_TEXT : message);
        return;
      }
      markAccountDeleted();
      await signOut();
      router.replace(GOODBYE_PATH);
    } finally {
      setDeleting(false);
    }
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
                    className={`${inputClass()} min-w-0 flex-1`}
                  />
                  <Button type="submit" variant="secondary" size="md" aria-disabled={!changed || savingName} aria-busy={savingName}>
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
                  className={`relative inline-flex h-8 w-13 shrink-0 items-center rounded-pill border-2 transition-colors duration-(--nest-duration-press) ease-out ${optedIn ? "border-ink bg-ink" : "border-stone bg-sand"}`}
                >
                  <span className={`absolute start-0.5 size-6 rounded-pill bg-surface shadow-card transition-transform duration-(--nest-duration-press) ease-out ${optedIn ? "translate-x-5 rtl:-translate-x-5" : ""}`} />
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
            {space.isShared ? (
              <li className={row}>
                <button
                  type="button"
                  onClick={() => {
                    setLeaveError(null);
                    openDialog(LEAVE_DIALOG);
                  }}
                  className={`${rowAction} flex-col items-start! gap-0.5!`}
                >
                  <span>יציאה מהבחירה המשותפת</span>
                  <span className="text-caption font-normal text-stone">השמות ששמרת יישארו אצלך</span>
                </button>
              </li>
            ) : null}
          </ul>
        </Section>

        <Section title="מידע">
          <ul className={card}>
            <LinkRow href="/names/about">על הנתונים</LinkRow>
            {install.mode ? (
              <li className={row}>
                <button type="button" onClick={() => void install.start()} aria-haspopup={install.mode === "ios" ? "dialog" : undefined} className={rowAction}>
                  {INSTALL_TITLE}
                  <Chevron />
                </button>
              </li>
            ) : null}
            <LinkRow href="/names/terms">תנאי שימוש</LinkRow>
            <LinkRow href="/names/privacy">מדיניות פרטיות</LinkRow>
          </ul>
        </Section>

        <ul className={card}>
          <li className={row}>
            <button type="button" onClick={doSignOut} aria-busy={signingOut} className={rowAction}>
              {signingOut ? "יוצאים…" : "יציאה מהחשבון"}
            </button>
          </li>
          <li className={row}>
            <button type="button" onClick={openDelete} className={`${rowAction} text-urgent`}>
              מחיקת החשבון
            </button>
          </li>
        </ul>

        <p role="status" className="sr-only">
          {status}
        </p>
      </main>

      <InstallSheet />
      <Dialog name={LEAVE_DIALOG} title={LEAVE_TITLE} description={leaveBody(others)}>
        {leaveError ? (
          <p role="alert" className="m-0 text-caption font-bold text-urgent">
            {leaveError}
          </p>
        ) : null}
        <Button onClick={() => void confirmLeave()} aria-disabled={leaving} aria-busy={leaving}>
          {leaving ? "יוצאים…" : "יציאה מהבחירה המשותפת"}
        </Button>
        <Button variant="secondary" data-autofocus="" onClick={() => closeDialog(LEAVE_DIALOG)}>
          ביטול
        </Button>
      </Dialog>
      <Dialog name={DELETE_DIALOG} title={DELETE_TITLE} description={DELETE_BODY}>
        {deleteError ? (
          <p role="alert" className="m-0 text-caption font-bold text-urgent">
            {deleteError}
          </p>
        ) : null}
        <Button onClick={confirmDelete} aria-disabled={deleting} aria-busy={deleting}>
          {deleting ? "מוחקים…" : "מחיקה לצמיתות"}
        </Button>
        <Button variant="secondary" data-autofocus="" onClick={() => closeDialog(DELETE_DIALOG)}>
          ביטול
        </Button>
      </Dialog>
    </div>
  );
}
