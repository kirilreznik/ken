"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { Button, Glass } from "@/components/names/ui";
import { isOffline } from "@/lib/names/authErrors";
import { reportClientLog } from "@/lib/names/clientLog";
import { SETTINGS_ERROR_TEXT, SETTINGS_OFFLINE_TEXT, isOptedIn, optInMetadata } from "@/lib/names/settings";
import { getSupabase } from "@/lib/names/supabase";
import { track } from "@/lib/names/track";

export type NestCardPlacement = "recap" | "decision" | "deck_end";

/** The landing page, where Nest the pregnancy app is introduced. */
const NEST_LANDING = "/";

/**
 * The opt-in Nest app card (product review step 4): what the Nest app is, and one tap to hear
 * when it launches. The tap sets the same `updates_opt_in` as onboarding and settings, so there
 * is one launch list. Already on the list: says so, with a link to learn more.
 */
export default function NestCard({ placement }: { placement: NestCardPlacement }) {
  const { user } = useAuth();
  const [optedNow, setOptedNow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const optedIn = optedNow || isOptedIn(user?.user_metadata);

  // Once per card on screen, with whether the user was already on the list (the tap-rate base).
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current || !user) return;
    shown.current = true;
    track("nest_card_shown", { placement, opted_in: isOptedIn(user.user_metadata) });
  }, [placement, user]);

  async function optIn() {
    const supabase = getSupabase();
    if (!supabase || saving) return;
    track("nest_card_tap", { placement, action: "opt_in" });
    if (isOffline()) {
      setError(SETTINGS_OFFLINE_TEXT);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.updateUser({ data: optInMetadata(true) });
      if (err) throw err;
      setOptedNow(true);
      track("opt_in_changed", { opt_in: true, from: placement });
    } catch (err) {
      reportClientLog({ area: "nest-card", message: "opt-in save failed", name: err instanceof Error ? err.name : undefined });
      setError(isOffline() ? SETTINGS_OFFLINE_TEXT : SETTINGS_ERROR_TEXT);
    } finally {
      setSaving(false);
    }
  }

  return (
    // On the decision sheet the card sits on the bare photo, so it reads on card glass like the
    // name card; in the recap and deck-end panels it's already on glass and stays soft.
    <Glass as="aside" variant={placement === "decision" ? "strong" : "soft"} aria-label="Nest, אפליקציה לניהול ההיריון" className={`${placement === "decision" ? "names-card-glass " : ""}flex w-full flex-col items-start gap-2 rounded-lg px-4 py-3.5 text-start`}>
      <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-card-title text-ink">
        {/* The wordmark is the brand's Latin "nest"; the alt names it for screen readers. */}
        <Image src="/names/brand/nest-wordmark.svg" alt="Nest" width={53} height={20} unoptimized className="h-5 w-auto" />
        <span>כל ההריון במקום אחד</span>
      </p>
      <p className="m-0 text-person text-ink-soft">
        מאותו צוות: אפליקציה לתורים, לבדיקות ולמסמכים של ההיריון. היא עוד לא בחנויות.
      </p>
      {optedIn ? (
        <p role="status" className="m-0 text-person font-bold text-ink">
          נעדכן אותך כש־<bdi>Nest</bdi> יוצאת. אפשר לבטל בהגדרות.
        </p>
      ) : (
        <Button size="md" onClick={() => void optIn()} aria-busy={saving} aria-disabled={saving}>
          {saving ? "שומרים…" : "לעדכן אותי כשהיא יוצאת"}
        </Button>
      )}
      {error ? (
        <p role="alert" className="m-0 text-caption font-bold text-urgent">
          {error}
        </p>
      ) : null}
      <a
        href={NEST_LANDING}
        target="_blank"
        rel="noopener"
        onClick={() => track("nest_card_tap", { placement, action: "learn" })}
        className="inline-flex min-h-11 items-center text-person font-bold text-ink underline underline-offset-4"
      >
        <span>
          מה זה <bdi>Nest</bdi>?
        </span><span className="sr-only"> (נפתח בכרטיסייה חדשה)</span>
      </a>
    </Glass>
  );
}
