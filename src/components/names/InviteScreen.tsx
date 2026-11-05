"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { Button, IconButton } from "@/components/names/ui";
import { useOnline } from "@/components/names/useMatches";
import { useSpace } from "@/components/names/useSpace";
import { hasAppEntry } from "@/lib/names/appHistory";
import { APP_PATH } from "@/lib/names/auth";
import { reportClientLog } from "@/lib/names/clientLog";
import {
  clearInviteCache,
  COPIED_TEXT,
  createInvite,
  expiryText,
  inviteUrl,
  memberLabel,
  membersForList,
  SHARE_TEXT,
  SHARE_TITLE,
  type Invite,
} from "@/lib/names/invite";
import { showToast } from "@/lib/names/toast";

type Loaded = { key: string; invite: Invite | null; error: boolean };

const noSubscribe = () => () => {};

/** This origin on the client (the invite link falls back to it without NEXT_PUBLIC_SITE_URL). */
function useOrigin(): string {
  return useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => "",
  );
}

/**
 * FR-W23 (`/names/invite`): a single-use link from `names_invite()`, sent with the Web Share
 * API or copied, its expiry, and everyone already in the space. Board 5's list look on canvas.
 */
export default function InviteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const space = useSpace();
  const online = useOnline();
  const origin = useOrigin();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("");
  const [copyFailed, setCopyFailed] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);
  const { refresh } = space;

  const key = space.spaceId ? `${space.spaceId}:${space.members.length}:${attempt}` : null;
  useEffect(() => {
    if (!key || !space.spaceId || !online) return;
    let alive = true;
    createInvite(space.spaceId, space.members.length).then(
      (invite) => {
        if (alive) setLoaded({ key, invite, error: false });
      },
      (err: unknown) => {
        reportClientLog({ area: "invite", message: "names_invite failed", name: err instanceof Error ? err.name : undefined });
        if (alive) setLoaded({ key, invite: null, error: true });
      },
    );
    return () => {
      alive = false;
    };
  }, [key, space.spaceId, space.members.length, online]);

  // Someone may join while the link is out: coming back to the screen refetches the members.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const current = loaded?.key === key ? loaded : null;
  const invite = current?.invite ?? null;
  const url = invite && origin ? inviteUrl(process.env.NEXT_PUBLIC_SITE_URL, origin, invite.code) : null;
  const failed = current?.error || space.error;
  const waiting = !invite && !failed && online;

  const retry = () => {
    clearInviteCache();
    if (space.error) void refresh();
    setAttempt((n) => n + 1);
  };

  const copy = async () => {
    if (!url) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      const input = linkRef.current;
      input?.focus();
      input?.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
    }
    setCopyFailed(!copied);
    if (copied) {
      setStatus(COPIED_TEXT);
      showToast(COPIED_TEXT);
    }
  };

  const share = async () => {
    if (!url) return;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url });
        return;
      } catch (err) {
        // Closing the share sheet isn't an error; anything else falls back to copying.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await copy();
  };

  const back = () => {
    if (hasAppEntry()) router.back();
    else router.replace(APP_PATH);
  };

  const people = membersForList(space.members, userId);

  return (
    <div data-names-bg="none" className="min-h-dvh bg-canvas">
      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <header className="flex items-center gap-2">
          <IconButton aria-label="חזרה" onClick={back}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ltr:-scale-x-100">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </IconButton>
          <h1 className="m-0 min-w-0 flex-1 text-title">הזמנה לבחירה</h1>
        </header>
        <p className="m-0 text-person font-medium text-ink-soft">
          בוחרים שם ביחד? שולחים קישור, וכל אחד מחליק אצלו. שם ששניכם שמרתם יופיע בהתאמות. אף אחד לא רואה על מה השני דילג.
        </p>

        <section aria-labelledby="invite-link-title" className="flex flex-col gap-3 rounded-lg bg-surface p-4 shadow-card">
          <h2 id="invite-link-title" className="m-0 text-card-title">
            קישור הזמנה
          </h2>
          {invite && url ? (
            <>
              <input
                ref={linkRef}
                readOnly
                value={url}
                dir="ltr"
                aria-label="קישור ההזמנה"
                aria-describedby="invite-expiry"
                onFocus={(e) => e.currentTarget.select()}
                className="min-h-11 w-full rounded-md border border-line bg-sand px-3 text-start text-caption text-ink"
              />
              <p id="invite-expiry" className="m-0 text-caption text-stone">
                {expiryText(invite.expiresAt)} · הקישור עובד פעם אחת
              </p>
              <div className="flex flex-col gap-2.5 pt-1">
                <Button onClick={share}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
                  </svg>
                  שליחת קישור הזמנה
                </Button>
                <Button variant="secondary" onClick={copy}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                  </svg>
                  העתקת הקישור
                </Button>
              </div>
              {copyFailed ? (
                <p role="alert" className="m-0 text-caption text-ink-soft">
                  לא הצלחנו להעתיק. אפשר לסמן את הקישור ולהעתיק אותו.
                </p>
              ) : null}
            </>
          ) : !online && !invite ? (
            <p className="m-0 text-person font-medium text-ink-soft">צריך חיבור לאינטרנט כדי ליצור קישור הזמנה.</p>
          ) : failed ? (
            <>
              <p role="alert" className="m-0 text-person font-medium text-ink-soft">
                לא הצלחנו ליצור קישור. אפשר לנסות שוב.
              </p>
              <Button variant="secondary" size="md" onClick={retry} className="self-start">
                ניסיון חוזר
              </Button>
            </>
          ) : waiting ? (
            <div aria-busy="true" className="flex flex-col gap-3">
              <div className="h-11 rounded-md bg-sand" />
              <div className="h-14 rounded-pill bg-sand" />
              <span className="sr-only">יוצרים קישור</span>
            </div>
          ) : null}
        </section>

        {people.length > 0 ? (
          <section aria-labelledby="invite-members-title" className="flex flex-col gap-2">
            <h2 id="invite-members-title" className="m-0 text-card-title">
              מי כבר כאן
            </h2>
            <ul className="m-0 list-none rounded-lg bg-surface p-0 shadow-card">
              {people.map((m) => (
                <li key={m.userId} className="border-b border-line px-4 py-3.5 text-row-name break-words last:border-b-0">
                  {memberLabel(m, userId)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p role="status" className="sr-only">
          {status}
        </p>
      </main>
    </div>
  );
}
