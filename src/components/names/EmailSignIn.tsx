"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthSkeleton } from "@/components/names/AuthGuard";
import AuthLayout, { AUTH_LEAD_ID } from "@/components/names/auth/AuthLayout";
import Wordmark from "@/components/names/auth/Wordmark";
import { Button, inputClass, linkClass } from "@/components/names/ui";
import CodeInput, { CODE_LENGTH } from "@/components/names/auth/CodeInput";
import PanelNote from "@/components/names/auth/PanelNote";
import ResendTimer from "@/components/names/auth/ResendTimer";
import Turnstile, { captchaEnabled } from "@/components/names/auth/Turnstile";
import { usePendingJoin } from "@/components/names/auth/usePendingJoin";
import { CLOSED_PARAM, WELCOME_PATH } from "@/lib/names/auth";
import {
  EMPTY_EMAIL_MESSAGE,
  INVALID_EMAIL_MESSAGE,
  OFFLINE_MESSAGE,
  RATE_LIMIT_CLEAR_MS,
  RATE_LIMIT_MESSAGE,
  type AuthErrorKind,
  clearsCode,
  handleAuthError,
  isOffline,
  isValidEmail,
  visibleSignInError,
} from "@/lib/names/authErrors";
import { withJoin } from "@/lib/names/join";
import { CODE_RESENT_TEXT } from "@/lib/names/resend";
import { getPref } from "@/lib/names/prefs";
import { hasAcceptedTerms, nextRoute } from "@/lib/names/routing";
import { getSupabase } from "@/lib/names/supabase";
import { useAuth } from "./AuthProvider";
import ConnectionNote from "./ConnectionNote";
import { useOnline } from "./useMatches";
import { track } from "@/lib/names/track";
import { failureKind, takeSigninFrom } from "@/lib/names/signinFrom";
import { signupData } from "@/lib/names/signupPass";

const wordmark = <Wordmark />;

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
  // Set once the visitor moves between steps, so only a step change animates, not the first paint (NP-102).
  const [moved, setMoved] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentAt, setSentAt] = useState(0);
  // One request at a time, but each says its own thing: "שולחים…" on the resend link,
  // "נכנסים…" only on the sign-in button (INT-G1-01).
  const [pending, setPending] = useState<"send" | "verify" | null>(null);
  const busy = pending !== null;
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading || !user) return;
    router.replace(nextRoute(user, { introSeen: getPref(user.id, "introSeen") }, join));
  }, [loading, user, join, router]);

  // The rate-limit line goes once the wait is over (NP-035); a new address or send clears it sooner.
  useEffect(() => {
    if (error !== RATE_LIMIT_MESSAGE) return;
    const timer = window.setTimeout(() => setError((e) => (e === RATE_LIMIT_MESSAGE ? null : e)), RATE_LIMIT_CLEAR_MS);
    return () => window.clearTimeout(timer);
  }, [error]);

  // Back online, "no connection" is stale: drop it (while offline ConnectionNote says it instead).
  useEffect(() => {
    const clear = () => setError((e) => (e === OFFLINE_MESSAGE ? null : e));
    window.addEventListener("online", clear);
    return () => window.removeEventListener("online", clear);
  }, []);

  function fail(area: string, err: unknown): AuthErrorKind {
    const { kind, message } = handleAuthError(area, err);
    track("signin_failed", { method: "email", step: area.endsWith("verify") ? "verify" : "send", kind: failureKind(kind) });
    if (message === null) {
      router.replace(withJoin(`${WELCOME_PATH}?${CLOSED_PARAM}=1`, join));
      return kind;
    }
    setError(message);
    return kind;
  }

  // A wrong code is cleared with focus kept in the field, so typing, pasting or the
  // one-time-code fill starts fresh (CRIT-G1-01).
  function failVerify(err: unknown): void {
    if (!clearsCode(fail("sign-in-email-verify", err))) return;
    setCode("");
    codeRef.current?.focus();
  }

  async function sendCode(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || busy) return false;
    if (isOffline()) {
      setError(OFFLINE_MESSAGE);
      return false;
    }
    setPending("send");
    setError(null);
    setResent(false);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true, captchaToken: captchaToken ?? undefined, data: signupData(join) },
      });
      if (err) {
        fail("sign-in-email-send", err);
        return false;
      }
      setSentAt(Date.now());
      setResent(step === "code");
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
      setPending(null);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError(email.trim() ? INVALID_EMAIL_MESSAGE : EMPTY_EMAIL_MESSAGE);
      return;
    }
    track("signin_started", { method: "email" });
    if (await sendCode()) {
      setCode("");
      setMoved(true);
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
    setPending("verify");
    setError(null);
    setResent(false);
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
      // On success the auth listener sets the user and the effect above routes on.
      if (err) failVerify(err);
      else track("signin_completed", { method: "email", new_user: !hasAcceptedTerms(data.user), after: takeSigninFrom(!!join) });
    } catch (err) {
      failVerify(err);
    } finally {
      setPending(null);
    }
  }

  function changeAddress() {
    setMoved(true);
    setStep("email");
    setCode("");
    setError(null);
    setResent(false);
  }

  if (loading || user) return <AuthSkeleton />;

  const backHref = withJoin(WELCOME_PATH, join);
  const shownError = visibleSignInError(error, online);
  const errorLine = shownError ? (
    <PanelNote icon="alert" id="email-sign-in-error" role="alert">
      {shownError}
    </PanelNote>
  ) : null;
  const sendBlocked = captchaEnabled && !captchaToken;

  if (step === "email") {
    return (
      <AuthLayout title="כניסה עם קוד במייל" lead="שולחים לכתובת שלך קוד בן 6 ספרות, ואיתו נכנסים." backHref={backHref} hero={wordmark} step={moved ? "email" : undefined}>
        <form noValidate onSubmit={submitEmail} className="flex flex-col gap-4">
          <ConnectionNote />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-caption font-bold text-ink">
              כתובת מייל
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
              // Typing waits for the send's answer, so the code goes to the address shown (NP-006).
              readOnly={busy}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              aria-invalid={shownError === INVALID_EMAIL_MESSAGE || shownError === EMPTY_EMAIL_MESSAGE || undefined}
              aria-describedby={shownError ? `${AUTH_LEAD_ID} email-sign-in-error` : AUTH_LEAD_ID}
              className={inputClass()}
            />
          </div>
          {errorLine}
          <Turnstile key={captchaKey} onToken={setCaptchaToken} />
          <Button type="submit" disabled={busy || sendBlocked} aria-busy={pending === "send"}>
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
          שלחנו קוד בן 6 ספרות ל־
          {/* Own line: the address stays whole where it fits and breaks anywhere only when it's wider. */}
          <bdi dir="ltr" className="block text-end wrap-anywhere">
            {email.trim()}
          </bdi>
          אפשר לבדוק גם בתיקיית הספאם.
        </>
      }
      // Back returns to the email step with the address kept (NP-007).
      onBack={changeAddress}
      hero={wordmark}
      step="code"
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
          describedBy={shownError ? `${AUTH_LEAD_ID} email-sign-in-error` : AUTH_LEAD_ID}
          autoFocus
          readOnly={busy}
          inputRef={codeRef}
        />
        {errorLine ??
          (resent ? (
            // Not a live region: ResendTimer's status says it with the new wait, once.
            <p id="email-sign-in-sent" className="text-caption font-medium text-pretty text-ink-soft">
              {CODE_RESENT_TEXT}
            </p>
          ) : null)}
        <Button type="submit" disabled={busy || code.length !== CODE_LENGTH} aria-busy={pending === "verify"}>
          {pending === "verify" ? "נכנסים…" : "כניסה"}
        </Button>
      </form>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <ResendTimer
          sentAt={sentAt}
          onResend={() => void sendCode()}
          disabled={busy || sendBlocked}
          sending={pending === "send"}
          sentNote={resent ? CODE_RESENT_TEXT : undefined}
        />
        <button type="button" onClick={changeAddress} className={linkClass("standalone")}>
          שינוי כתובת
        </button>
      </div>
      <Turnstile key={captchaKey} onToken={setCaptchaToken} />
    </AuthLayout>
  );
}
