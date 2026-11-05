// FR-W27: "התקנה למסך הבית". Chromium hands over a beforeinstallprompt event that can show
// the browser's install prompt once; iOS Safari has no prompt, so the same entry opens a
// sheet with the share-menu steps. Nothing is offered when the app already runs installed.

export const INSTALL_TITLE = "התקנה למסך הבית";
export const INSTALL_STEPS = ["לוחצים על כפתור השיתוף", "ואז על 'הוספה למסך הבית'"] as const;
export const INSTALL_HINT_TEXT = "אפשר להוסיף את בחירת השם למסך הבית ולפתוח אותה כמו אפליקציה.";
/** The lists screen offers the install hint once this many names have a vote. */
export const INSTALL_HINT_VOTES = 5;

/** "prompt": the browser's own install prompt; "ios": the steps sheet; null: nothing to offer. */
export type InstallMode = "prompt" | "ios" | null;

/**
 * iPhone, iPod or iPad Safari. iPadOS asks for desktop pages by default and says
 * "Macintosh", so a Mac with a touch screen counts as an iPad. Chrome, Firefox, Edge and
 * Opera on iOS (CriOS, FxiOS, EdgiOS, OPiOS) and in-app browsers are left out.
 */
export function isIosSafari(userAgent: string, maxTouchPoints = 0): boolean {
  const ios = /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
  if (!ios) return false;
  if (/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|Line\//.test(userAgent)) return false;
  return /Safari\//.test(userAgent) && /Version\//.test(userAgent);
}

export function installMode(opts: { standalone: boolean; ios: boolean; canPrompt: boolean }): InstallMode {
  if (opts.standalone) return null;
  if (opts.canPrompt) return "prompt";
  return opts.ios ? "ios" : null;
}

export function showInstallHint(mode: InstallMode, voteCount: number, dismissed: boolean): boolean {
  return mode !== null && !dismissed && voteCount >= INSTALL_HINT_VOTES;
}

/** The parts of BeforeInstallPromptEvent this app uses (not in the DOM typings). */
export interface InstallPromptEvent extends Event {
  prompt(): Promise<unknown>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallState = { mode: InstallMode };

const SERVER_STATE: InstallState = { mode: null };
let state: InstallState = SERVER_STATE;
let deferred: InstallPromptEvent | null = null;
let installed = false;
let watching = false;
const listeners = new Set<() => void>();

function standalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || (typeof matchMedia === "function" && matchMedia("(display-mode: standalone)").matches);
}

function refresh() {
  const mode = installMode({
    standalone: installed || standalone(),
    ios: isIosSafari(navigator.userAgent, navigator.maxTouchPoints),
    canPrompt: deferred !== null,
  });
  if (mode === state.mode) return;
  state = { mode };
  listeners.forEach((l) => l());
}

/**
 * Starts listening for beforeinstallprompt and appinstalled (once per page). Call it from
 * the names layout, early, so a prompt fired before a screen mounts isn't lost.
 */
export function watchInstall(): void {
  if (watching || typeof window === "undefined") return;
  watching = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    // Keeps Chromium's mini-infobar away; the app offers the install itself.
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    refresh();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    refresh();
  });
  if (typeof matchMedia === "function") matchMedia("(display-mode: standalone)").addEventListener?.("change", refresh);
  refresh();
}

/** For useSyncExternalStore. */
export function subscribeInstall(listener: () => void): () => void {
  watchInstall();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInstallState(): InstallState {
  return state;
}

export function getServerInstallState(): InstallState {
  return SERVER_STATE;
}

/**
 * Shows the browser's install prompt. The event works once, so it's dropped either way;
 * resolves to whether the user accepted.
 */
export async function promptInstall(): Promise<boolean> {
  const event = deferred;
  if (!event) return false;
  deferred = null;
  try {
    await event.prompt();
    const choice = await event.userChoice;
    return choice.outcome === "accepted";
  } catch {
    return false;
  } finally {
    refresh();
  }
}
