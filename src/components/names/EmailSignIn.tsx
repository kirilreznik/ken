"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthSkeleton } from "@/components/names/AuthGuard";
import AuthLayout from "@/components/names/auth/AuthLayout";
import { Button, inputClass } from "@/components/names/ui";
import CodeInput, { CODE_LENGTH } from "@/components/names/auth/CodeInput";
import ResendTimer from "@/components/names/auth/ResendTimer";
import Turnstile, { captchaEnabled } from "@/components/names/auth/Turnstile";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import { CLOSED_PARAM, WELCOME_PATH } from "@/lib/names/auth";
import {
  INVALID_EMAIL_MESSAGE,
  OFFLINE_MESSAGE,
  handleAuthError,
  isOffline,
  isValidEmail,
  visibleSignInError,
} from "@/lib/names/authErrors";
import { withJoin } from "@/lib/names/join";
import { getPref } from "@/lib/names/prefs";
import { hasAcceptedTerms, nextRoute } from "@/lib/names/routing";
import { getSupabase } from "@/lib/names/supabase";
import { useAuth } from "./AuthProvider";
import ConnectionNote from "./ConnectionNote";
import { useOnline } from "./useMatches";
import { track } from "@/lib/names/track";

const wordmark = <Image src="/names/brand/nest-wordmark.svg" alt="Nest" width={85} height={32} priority unoptimized className="self-center" />;

/**
 * FR-W4: step 1 asks for the address and sends a code (signInWithOtp), step 2 takes the
 * 6 digits (verifyOtp type 'email'). Once a session exists the visitor moves on per FR-W6.
 */
export default function EmailSignIn() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const join = usePendingJoin();
  const online = useOnline();

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

  // Back online, "no connection" is stale: drop it (while offline ConnectionNote says it instead).
  useEffect(() => {
    const clear = () => setError((e) => (e === OFFLINE_MESSAGE ? null : e));
    window.addEventListener("online", clear);
    return () => window.removeEventListener("online", clear);
  }, []);

  function fail(area: string, err: unknown): void {
    track("signin_failed", { method: "email", step: area.endsWith("verify") ? "verify" : "send" });
    const { message } = handleAuthError(area, err);
    if (message === null) {
      router.replace(withJoin(`${WELCOME_PATH}?${CLOSED_PARAM}=1`, join));
      return;
    }
    setError(message);
  }

  async function sendCode(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || busy) return false;
    if (isOffline()) {
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
      track("signin_code_sent", { resend: step === "code" });
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
    track("signin_started", { method: "email" });
    if (await sendCode()) {
      setCode("");
      setStep("code");
    }
  }

  async function verify(token: string) {
    const supabase = getSupabase();
    if (!supabase || busy || token.length !== CODE_LENGTH) return;
    if (isOffline()) {
      setError(OFFLINE_MESSAGE);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
      // On success the auth listener sets the user and the effect above routes on.
      if (err) fail("sign-in-email-verify", err);
      else track("signin_completed", { method: "email", new_user: !hasAcceptedTerms(data.user) });
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
  const shownError = visibleSignInError(error, online);
  const errorLine = shownError ? (
    <p id="email-sign-in-error" role="alert" className="text-body font-medium text-urgent">
      {shownError}
    </p>
  ) : null;
  const sendBlocked = captchaEnabled && !captchaToken;

  if (step === "email") {
    return (
      <AuthLayout title="כניסה עם קוד במייל" lead="נשלח קוד בן 6 ספרות לכתובת שלך." backHref={backHref} hero={wordmark}>
        <form noValidate onSubmit={submitEmail} className="flex flex-col gap-4">
          <ConnectionNote />
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
              aria-invalid={shownError === INVALID_EMAIL_MESSAGE || undefined}
              aria-describedby={shownError ? "email-sign-in-error" : undefined}
              className={inputClass()}
            />
          </div>
          {errorLine}
          <Turnstile key={captchaKey} onToken={setCaptchaToken} />
          <Button type="submit" disabled={busy || sendBlocked} aria-busy={busy}>
            {busy ? "שולחים…" : "שליחת קוד"}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
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
        <ConnectionNote />
        <CodeInput
          id="code"
          label="הקוד מהמייל"
          value={code}
          onChange={(c) => {
            setCode(c);
            if (error) setError(null);
          }}
          onComplete={(c) => void verify(c)}
          invalid={shownError !== null}
          describedBy={shownError ? "email-sign-in-error" : undefined}
          autoFocus
        />
        {errorLine}
        <Button type="submit" disabled={busy || code.length !== CODE_LENGTH} aria-busy={busy}>
          {busy ? "נכנסים…" : "כניסה"}
        </Button>
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
