"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthSkeleton } from "@/components/names/AuthGuard";
import AuthLayout from "@/components/names/auth/AuthLayout";
import CodeInput, { CODE_LENGTH } from "@/components/names/auth/CodeInput";
import ResendTimer from "@/components/names/auth/ResendTimer";
import Turnstile, { captchaEnabled } from "@/components/names/auth/Turnstile";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import { CLOSED_PARAM, WELCOME_PATH } from "@/lib/names/auth";
import {
  INVALID_EMAIL_MESSAGE,
  OFFLINE_MESSAGE,
  authErrorKind,
  authErrorMessage,
  isValidEmail,
  reportAuthError,
} from "@/lib/names/authErrors";
import { withJoin } from "@/lib/names/join";
import { getPref } from "@/lib/names/prefs";
import { nextRoute } from "@/lib/names/routing";
import { getSupabase } from "@/lib/names/supabase";
import { useAuth } from "./AuthProvider";

const wordmark = <Image src="/names/brand/nest-wordmark.svg" alt="Nest" width={85} height={32} priority unoptimized className="self-center" />;

const primaryButton =
  "flex h-14 items-center justify-center rounded-pill bg-ink px-6 text-button text-surface shadow-button disabled:opacity-60";

/**
 * FR-W4: step 1 asks for the address and sends a code (signInWithOtp), step 2 takes the
 * 6 digits (verifyOtp type 'email'). Once a session exists the visitor moves on per FR-W6.
 */
export default function EmailSignIn() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const join = usePendingJoin();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentAt, setSentAt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  useEffect(() => {
    if (loading || !user) return;
    router.replace(nextRoute(user, { introSeen: getPref(user.id, "introSeen") }, join));
  }, [loading, user, join, router]);

  function fail(area: string, err: unknown): void {
    const kind = authErrorKind(err);
    if (kind === "signups-closed") {
      router.replace(withJoin(`${WELCOME_PATH}?${CLOSED_PARAM}=1`, join));
      return;
    }
    if (kind === "other") reportAuthError(area, err);
    setError(authErrorMessage(kind));
  }

  async function sendCode(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || busy) return false;
    if (!navigator.onLine) {
      setError(OFFLINE_MESSAGE);
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, captchaToken: captchaToken ?? undefined },
      });
      if (err) {
        fail("sign-in-email-send", err);
        return false;
      }
      setSentAt(Date.now());
      return true;
    } catch (err) {
      fail("sign-in-email-send", err);
      return false;
    } finally {
      // Turnstile tokens are single use: a new widget gives the next send a fresh one.
      if (captchaEnabled) {
        setCaptchaToken(null);
        setCaptchaKey((k) => k + 1);
      }
      setBusy(false);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError(INVALID_EMAIL_MESSAGE);
      return;
    }
    if (await sendCode()) {
      setCode("");
      setStep("code");
    }
  }

  async function verify(token: string) {
    const supabase = getSupabase();
    if (!supabase || busy || token.length !== CODE_LENGTH) return;
    if (!navigator.onLine) {
      setError(OFFLINE_MESSAGE);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
      // On success the auth listener sets the user and the effect above routes on.
      if (err) fail("sign-in-email-verify", err);
    } catch (err) {
      fail("sign-in-email-verify", err);
    } finally {
      setBusy(false);
    }
  }

  function changeAddress() {
    setStep("email");
    setCode("");
    setError(null);
  }

  if (loading || user) return <AuthSkeleton />;

  const backHref = withJoin(WELCOME_PATH, join);
  const errorLine = error ? (
    <p id="email-sign-in-error" role="alert" className="text-body font-medium text-urgent">
      {error}
    </p>
  ) : null;
  const sendBlocked = captchaEnabled && !captchaToken;

  if (step === "email") {
    return (
      <AuthLayout eyebrow="בחירת שם" title="כניסה עם קוד במייל" lead="נשלח קוד בן 6 ספרות לכתובת שלך." backHref={backHref} hero={wordmark}>
        <form noValidate onSubmit={submitEmail} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-caption font-bold text-ink">
              כתובת אימייל
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoFocus
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error === INVALID_EMAIL_MESSAGE || undefined}
              aria-describedby={error ? "email-sign-in-error" : undefined}
              className="h-14 w-full rounded-md border border-line bg-surface px-3.5 text-start text-card-title text-ink placeholder:text-faint aria-invalid:border-urgent"
            />
          </div>
          {errorLine}
          <Turnstile key={captchaKey} onToken={setCaptchaToken} />
          <button type="submit" disabled={busy || sendBlocked} aria-busy={busy} className={primaryButton}>
            {busy ? "שולחים…" : "שליחת קוד"}
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="בחירת שם"
      title="מה הקוד?"
      lead={
        <>
          שלחנו קוד בן 6 ספרות ל־<bdi dir="ltr">{email.trim()}</bdi>. אפשר לבדוק גם בתיקיית הספאם.
        </>
      }
      backHref={backHref}
      hero={wordmark}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void verify(code);
        }}
        className="flex flex-col gap-4"
      >
        <CodeInput
          id="code"
          label="הקוד מהמייל"
          value={code}
          onChange={(c) => {
            setCode(c);
            if (error) setError(null);
          }}
          onComplete={(c) => void verify(c)}
          invalid={error !== null}
          describedBy={error ? "email-sign-in-error" : undefined}
          autoFocus
        />
        {errorLine}
        <button type="submit" disabled={busy || code.length !== CODE_LENGTH} aria-busy={busy} className={primaryButton}>
          {busy ? "נכנסים…" : "כניסה"}
        </button>
      </form>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ResendTimer sentAt={sentAt} onResend={() => void sendCode()} busy={busy || sendBlocked} />
        <button
          type="button"
          onClick={changeAddress}
          className="min-h-11 rounded-pill px-1 text-card-title font-bold text-ink underline underline-offset-4"
        >
          שינוי כתובת
        </button>
      </div>
      <Turnstile key={captchaKey} onToken={setCaptchaToken} />
    </AuthLayout>
  );
}
