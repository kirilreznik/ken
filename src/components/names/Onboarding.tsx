"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthSkeleton } from "@/components/names/AuthGuard";
import AuthLayout from "@/components/names/auth/AuthLayout";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import { GENERIC_MESSAGE, handleAuthError, isOffline } from "@/lib/names/authErrors";
import {
  DISPLAY_NAME_MAX,
  canSubmit,
  isValidDisplayName,
  onboardingMetadata,
  suggestedDisplayName,
  type OnboardingForm,
} from "@/lib/names/onboarding";
import { getPref } from "@/lib/names/prefs";
import { ONBOARDING_PATH, hasAcceptedTerms, nextRoute } from "@/lib/names/routing";
import { ensureSpace } from "@/lib/names/space";
import { getSupabase } from "@/lib/names/supabase";
import { useAuth } from "./AuthProvider";
import { track } from "@/lib/names/track";

const OFFLINE_SAVE_MESSAGE = "אין חיבור לאינטרנט. אפשר לשמור שוב כשהחיבור יחזור.";
const ADULTS_ONLY = "השירות מיועד מגיל 18 ומעלה.";
const MISSING_HINT = "אפשר להתחיל אחרי שממלאים שם ומאשרים את שני הסעיפים הראשונים.";

const wordmark = <Image src="/names/brand/nest-wordmark.svg" alt="Nest" width={85} height={32} priority unoptimized className="self-center" />;

const checkboxRow = "flex min-h-11 cursor-pointer items-start gap-3 py-1 text-body text-ink";
const checkbox = "mt-0.5 size-6 shrink-0 cursor-pointer accent-ink";
const legalLink = "font-bold underline underline-offset-2";

function NewTabLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={legalLink}>
      {children}
      <span className="sr-only"> (נפתח בכרטיסייה חדשה)</span>
    </a>
  );
}

/**
 * FR-W7: one screen, no due date. A display name, the 18+ and terms confirmations, and an
 * optional updates opt-in. Saves user_metadata, opens the names space, then routes per FR-W6.
 */
export default function Onboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const join = usePendingJoin();

  const [form, setForm] = useState<OnboardingForm>(() => ({
    displayName: suggestedDisplayName(user?.user_metadata),
    ageConfirmed: false,
    termsAccepted: false,
    updatesOptIn: false,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  // Once submitting, this screen routes on itself; the metadata update must not trigger the skip below.
  const [submitted, setSubmitted] = useState(false);
  // The display name already saved, so a retry after a names_space failure doesn't rewrite the consent.
  const saved = useRef<{ displayName: string; metadata: Record<string, unknown> } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  const alreadyOnboarded = hasAcceptedTerms(user);

  useEffect(() => {
    if (!user || !alreadyOnboarded || submitted) return;
    router.replace(nextRoute(user, { introSeen: getPref(user.id, "introSeen") }, join));
  }, [user, alreadyOnboarded, submitted, join, router]);

  function update(patch: Partial<OnboardingForm>) {
    setForm((f) => ({ ...f, ...patch }));
    if (error) setError(null);
  }

  function fail(area: string, err: unknown) {
    if (isOffline()) {
      setError(OFFLINE_SAVE_MESSAGE);
      return;
    }
    const { kind, message } = handleAuthError(area, err);
    setError(kind === "offline" ? OFFLINE_SAVE_MESSAGE : (message ?? GENERIC_MESSAGE));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !user) return;
    if (!canSubmit(form)) {
      setTried(true);
      if (!isValidDisplayName(form.displayName)) nameRef.current?.focus();
      else if (!form.ageConfirmed) ageRef.current?.focus();
      else termsRef.current?.focus();
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;
    if (isOffline()) {
      setError(OFFLINE_SAVE_MESSAGE);
      return;
    }

    const displayName = form.displayName.trim();
    setSubmitted(true);
    setBusy(true);
    setError(null);
    try {
      let metadata = saved.current?.displayName === displayName ? saved.current.metadata : null;
      if (!metadata) {
        const { data, error: err } = await supabase.auth.updateUser({ data: onboardingMetadata(form) });
        if (err || !data.user) {
          fail("onboarding-save", err ?? new Error("no user"));
          return;
        }
        metadata = data.user.user_metadata;
        saved.current = { displayName, metadata };
      }
      try {
        await ensureSpace(displayName);
      } catch (err) {
        fail("onboarding-space", err);
        return;
      }
      track("onboarding_completed", { opt_in: form.updatesOptIn, joining: !!join });
      const next = nextRoute({ user_metadata: metadata }, { introSeen: getPref(user.id, "introSeen") }, join);
      router.replace(next === ONBOARDING_PATH ? "/names" : next);
    } catch (err) {
      fail("onboarding-save", err);
    } finally {
      setBusy(false);
    }
  }

  if (!user || (alreadyOnboarded && !submitted)) return <AuthSkeleton />;

  const valid = canSubmit(form);
  const nameInvalid = tried && !isValidDisplayName(form.displayName);
  const ageInvalid = tried && !form.ageConfirmed;
  const termsInvalid = tried && !form.termsAccepted;

  return (
    <AuthLayout title="רגע לפני שמתחילים" lead="כמה פרטים, ואפשר לבחור." hero={wordmark}>
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display-name" className="text-card-title font-bold text-ink">
            איך לקרוא לך?
          </label>
          <input
            ref={nameRef}
            id="display-name"
            name="display-name"
            type="text"
            dir="rtl"
            autoComplete="given-name"
            required
            maxLength={DISPLAY_NAME_MAX}
            value={form.displayName}
            onChange={(e) => update({ displayName: e.target.value })}
            aria-invalid={nameInvalid || undefined}
            aria-describedby="display-name-hint"
            className="h-14 w-full rounded-md border border-line bg-surface px-4 text-start text-card-title text-ink placeholder:text-faint aria-invalid:border-urgent"
          />
          <p id="display-name-hint" className="text-caption text-ink-soft">
            {nameInvalid ? <strong className="font-bold text-urgent">צריך שם, עד 40 תווים. </strong> : null}
            השם יוצג בבחירה משותפת.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">אישורים</legend>
          <div className="flex flex-col">
            <label className={checkboxRow}>
              <input
                ref={ageRef}
                type="checkbox"
                required
                checked={form.ageConfirmed}
                onChange={(e) => update({ ageConfirmed: e.target.checked })}
                aria-invalid={ageInvalid || undefined}
                aria-describedby="age-hint"
                className={checkbox}
              />
              <span>אני בן/בת 18 ומעלה</span>
            </label>
            <p id="age-hint" className="-mt-2 ps-9 text-caption text-ink-soft">
              {ADULTS_ONLY}
            </p>
          </div>
          <label className={checkboxRow}>
            <input
              ref={termsRef}
              type="checkbox"
              required
              checked={form.termsAccepted}
              onChange={(e) => update({ termsAccepted: e.target.checked })}
              aria-invalid={termsInvalid || undefined}
              className={checkbox}
            />
            <span>
              קראתי ואני מסכים/ה ל<NewTabLink href="/names/terms">תנאי השימוש</NewTabLink> ול
              <NewTabLink href="/names/privacy">מדיניות הפרטיות</NewTabLink>
            </span>
          </label>
          <label className={checkboxRow}>
            <input
              type="checkbox"
              checked={form.updatesOptIn}
              onChange={(e) => update({ updatesOptIn: e.target.checked })}
              className={checkbox}
            />
            <span>
              אשמח לקבל עדכון כש־Nest יוצאת לחנויות
              <span id="updates-hint" className="block text-caption text-ink-soft">
                לא חובה. אפשר לשנות בהגדרות.
              </span>
            </span>
          </label>
        </fieldset>

        {error ? (
          <p id="onboarding-error" role="alert" className="text-body font-medium text-urgent">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            aria-disabled={!valid || busy}
            aria-busy={busy}
            aria-describedby={valid ? undefined : "onboarding-missing"}
            className="flex h-14 items-center justify-center rounded-pill bg-ink px-6 text-button text-surface shadow-button aria-disabled:opacity-60"
          >
            {busy ? "שומרים…" : "התחלת בחירה"}
          </button>
          {valid ? null : (
            <p id="onboarding-missing" aria-live="polite" className={`text-center text-caption ${tried ? "font-bold text-urgent" : "text-ink-soft"}`}>
              {MISSING_HINT}
            </p>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}
