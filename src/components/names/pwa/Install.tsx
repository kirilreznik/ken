"use client";

import Image from "next/image";
import { useSyncExternalStore, type ReactNode } from "react";
import { BottomSheet, Button, IconButton, closeSheet, openSheet } from "@/components/names/ui";
import {
  INSTALL_HINT_TEXT,
  INSTALL_STEPS,
  INSTALL_TITLE,
  getInstallState,
  getServerInstallState,
  promptInstall,
  showInstallHint,
  subscribeInstall,
  type InstallMode,
} from "@/lib/names/install";
import { getPref, setPref, subscribePrefs } from "@/lib/names/prefs";
import { track } from "@/lib/names/track";

/**
 * The install entry's mode (null when there is nothing to offer, e.g. already installed)
 * and the action behind it: the browser's prompt, or the iOS steps sheet.
 */
export function useInstall(): { mode: InstallMode; start: () => Promise<boolean> } {
  const { mode } = useSyncExternalStore(subscribeInstall, getInstallState, getServerInstallState);
  const start = async () => {
    if (mode === "prompt") {
      const accepted = await promptInstall();
      track("install_prompt", { mode, outcome: accepted ? "accepted" : "dismissed" });
      return accepted;
    }
    if (mode === "ios") {
      openSheet("install");
      track("install_prompt", { mode, outcome: "steps" });
    }
    return false;
  };
  return { mode, start };
}

function Icon({ size = 20, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
      {children}
    </svg>
  );
}

const STEP_ICONS: ReactNode[] = [
  // Safari's share button: a box with an arrow up.
  <Icon key="share" size={22}>
    <path d="M12 3v12M8 7l4-4 4 4" />
    <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
  </Icon>,
  // "הוספה למסך הבית": a rounded square with a plus.
  <Icon key="add" size={22}>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <path d="M12 8.5v7M8.5 12h7" />
  </Icon>,
];

/** Starts listening for the install prompt as soon as the names layout mounts. */
export function InstallWatcher() {
  useSyncExternalStore(subscribeInstall, getInstallState, getServerInstallState);
  return null;
}

/**
 * ?sheet=install (FR-W27): iOS Safari's steps, board 11's sheet chrome. The app icon and
 * name on top, then the two steps, each with the icon Safari shows.
 */
export function InstallSheet() {
  return (
    <BottomSheet
      name="install"
      title={INSTALL_TITLE}
      closeButton
      footer={
        <Button variant="primary" className="w-full" onClick={() => closeSheet("install")}>
          הבנתי
        </Button>
      }
    >
      <div className="flex items-center gap-3">
        <Image src="/names/icons/icon-192.png" alt="" width={56} height={56} className="size-14 rounded-md shadow-card" />
        <div className="flex min-w-0 flex-col">
          <span className="text-card-title">בחירת שם</span>
          <span className="text-caption text-stone">Nest</span>
        </div>
      </div>
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {INSTALL_STEPS.map((step, i) => (
          <li key={step} className="flex min-h-14 items-center gap-3 rounded-lg bg-sand px-4 py-3">
            <span aria-hidden="true" className="flex size-8 flex-none items-center justify-center rounded-full bg-surface text-label text-ink">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-body text-ink">{step}</span>
            <span className="text-ink-soft">{STEP_ICONS[i]}</span>
          </li>
        ))}
      </ol>
    </BottomSheet>
  );
}

/**
 * The one-time install hint on the lists screen (FR-W27): from the 5th vote, while there is
 * something to install and it wasn't dismissed. Closing it or using it hides it for good.
 */
export function InstallHint({ userId, voteCount }: { userId: string | null; voteCount: number }) {
  const install = useInstall();
  const dismissed = useSyncExternalStore(
    subscribePrefs,
    () => (userId ? getPref(userId, "installHintDismissed") : true),
    () => true,
  );
  if (!userId || !showInstallHint(install.mode, voteCount, dismissed)) return null;
  const dismiss = () => setPref(userId, "installHintDismissed", true);

  return (
    <aside aria-label={INSTALL_TITLE} className="flex items-start gap-3 rounded-lg bg-surface p-4 shadow-card">
      <Image src="/names/icons/icon-192.png" alt="" width={44} height={44} className="size-11 flex-none rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
        <p className="m-0 text-person text-ink-soft">{INSTALL_HINT_TEXT}</p>
        <Button
          variant="secondary"
          size="md"
          aria-haspopup={install.mode === "ios" ? "dialog" : undefined}
          onClick={() => {
            dismiss();
            void install.start();
          }}
        >
          {INSTALL_TITLE}
        </Button>
      </div>
      <IconButton aria-label="סגירת ההצעה להתקנה" onClick={dismiss} className="-me-2 -mt-2">
        <Icon>
          <path d="M6 6l12 12M18 6L6 18" />
        </Icon>
      </IconButton>
    </aside>
  );
}
