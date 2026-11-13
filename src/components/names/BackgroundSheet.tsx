"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { useBackgroundChoice } from "@/components/names/ScreenBackground";
import { BottomSheet, Button, FADE_PRESS } from "@/components/names/ui";
import { photoUrl } from "@/lib/names/background";
import { canvasColor } from "@/lib/names/brand";
import { loadOwnPhoto, resizePhoto, saveOwnPhoto, subscribeOwnPhoto } from "@/lib/names/photo";
import { setPref, type Background } from "@/lib/names/prefs";
import { showToast } from "@/lib/names/toast";
import fabric from "../../../public/landing/names-fabric.webp";
import notebook from "../../../public/landing/names-notebook.webp";
import nursery from "../../../public/landing/names-nursery.webp";
import { track } from "@/lib/names/track";

interface Option {
  id: Background;
  label: string;
  sub: string;
  photo?: { url: string; blur: StaticImageData };
}

// Board 11, in its order (RTL rows of three).
const OPTIONS: Option[] = [
  { id: "none", label: "ללא רקע", sub: "כרטיסים לבנים" },
  { id: "fabric", label: "בדים", sub: "ברירת מחדל", photo: { url: photoUrl("fabric"), blur: fabric } },
  { id: "notebook", label: "מחברת", sub: "", photo: { url: photoUrl("notebook"), blur: notebook } },
  { id: "nursery", label: "חדר תינוק", sub: "", photo: { url: photoUrl("nursery"), blur: nursery } },
  { id: "own", label: "תמונה משלי", sub: "מהגלריה" },
];

function Icon({ size, strokeWidth = 2, children }: { size: number; strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-none"
    >
      {children}
    </svg>
  );
}

/** This user's saved own photo as an object URL (null when there is none), following saves and deletes. */
function useOwnThumb(userId: string | null): string | null {
  const [thumb, setThumb] = useState<{ userId: string; url: string | null } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => subscribeOwnPhoto(() => setVersion((v) => v + 1)), []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let url: string | null = null;
    void loadOwnPhoto(userId).then((blob) => {
      if (cancelled) return;
      url = blob ? URL.createObjectURL(blob) : null;
      setThumb({ userId, url });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [userId, version]);

  return !!userId && thumb?.userId === userId ? thumb.url : null;
}

/**
 * "רקע למסך" (board 11, FR-W17): five options in a radio group; the current one is ringed in
 * ink with a check and "נבחר". A choice is saved to the device pref right away, so the screen
 * behind the sheet changes with it. "תמונה משלי" opens a file picker when no photo is saved
 * yet; the photo is resized on the device and kept in IndexedDB, never uploaded (PRD 3.2.15).
 */
export default function BackgroundSheet() {
  return (
    <BottomSheet
      name="background"
      title="רקע למסך"
      closeButton
    >
      <BackgroundOptions />
      <p className="flex items-start gap-3 rounded-md bg-canvas px-3.5 py-3 text-note text-ink-soft">
        <span className="mt-0.5">
          <Icon size={18}>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </Icon>
        </span>
        <span>תמונה משלך נשמרת רק במכשיר הזה. היא לא יוצאת ממנו ולא מוצגת לשאר המשתתפים בבחירה.</span>
      </p>
    </BottomSheet>
  );
}

function BackgroundOptions() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const current = useBackgroundChoice();
  const ownThumb = useOwnThumb(userId);
  const hasOwn = !!ownThumb;
  const [saving, setSaving] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  // A missing own photo shows as "בדים", like the screen behind (FR-W17).
  const checked: Background = current === "own" && !hasOwn ? "fabric" : current;

  function pick(id: Background) {
    if (!userId) return;
    if (id === "own" && !hasOwn) return;
    setPref(userId, "background", id);
    track("background_changed", { background: id });
  }

  function choosePhoto() {
    if (!userId || saving) return;
    fileInput.current?.click();
  }

  // Resize, then save over the old photo (one Blob per user), then show it.
  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file || !userId) return;
    setSaving(true);
    // A photo that can't be read and a device that can't keep it get their own message (NP-132).
    let blob: Blob;
    try {
      blob = await resizePhoto(file, canvasColor);
    } catch {
      setSaving(false);
      showToast("אי אפשר לפתוח את התמונה הזו. אפשר לבחור תמונה אחרת.");
      return;
    }
    try {
      await saveOwnPhoto(userId, blob);
      setPref(userId, "background", "own");
      showToast("התמונה נשמרה במכשיר הזה.");
    } catch {
      showToast("לא הצלחנו לשמור את התמונה במכשיר הזה. אפשר לנסות שוב.");
    } finally {
      setSaving(false);
    }
  }

  // Radio group keys: arrows move (and pick) along the reading order, Home/End jump.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = buttons.current.findIndex((b) => b === document.activeElement);
    if (index < 0) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    const n = OPTIONS.length;
    let next: number;
    if (event.key === forward || event.key === "ArrowDown") next = (index + 1) % n;
    else if (event.key === back || event.key === "ArrowUp") next = (index - 1 + n) % n;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = n - 1;
    else return;
    event.preventDefault();
    buttons.current[next]?.focus();
    pick(OPTIONS[next].id);
  }

  return (
    <>
      <div role="radiogroup" aria-label="בחירת רקע" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-3">
        {OPTIONS.map((o, i) => {
          const on = checked === o.id;
          return (
            <button
              key={o.id}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={o.label}
              aria-busy={(o.id === "own" && saving) || undefined}
              tabIndex={on ? 0 : -1}
              onClick={() => (o.id === "own" && !hasOwn ? choosePhoto() : pick(o.id))}
              className={`group flex flex-col items-stretch gap-1.5 rounded-md text-ink outline-none ${FADE_PRESS}`}
            >
              <span
                className={`relative flex h-30 items-center justify-center overflow-hidden rounded-md group-focus-visible:ring-2 group-focus-visible:ring-ink/50 group-focus-visible:ring-offset-4 ${
                  o.id === "own" && !ownThumb
                    ? "border-[1.5px] border-dashed border-faint bg-peach-pale"
                    : `${o.photo || o.id === "own" ? "bg-sand" : "bg-canvas"} ${on ? "" : "border border-line"}`
                } ${on ? "outline-3 outline-offset-2 outline-ink" : ""}`}
              >
                {o.photo ? (
                  // The precached file, so the thumbnails show offline too (NP-BUG-009).
                  <Image src={o.photo.url} alt="" unoptimized placeholder="blur" blurDataURL={o.photo.blur.blurDataURL} fill className="object-cover" />
                ) : null}
                {o.id === "own" && ownThumb ? (
                  // A local Blob's object URL: next/image can't optimize it.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ownThumb} alt="" className="absolute inset-0 size-full object-cover" />
                ) : null}
                {o.id === "none" ? (
                  <span aria-hidden="true" className="h-13 w-10 rounded-sm bg-surface shadow-card-raised" />
                ) : null}
                {o.id === "own" && !ownThumb ? (
                  <Icon size={26}>
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <circle cx="9" cy="10" r="1.6" />
                    <path d="M21 16l-5-5-8 8" />
                  </Icon>
                ) : null}
                {on ? (
                  <span className="absolute end-1.5 top-1.5 flex size-5.5 items-center justify-center rounded-pill bg-ink text-surface">
                    <Icon size={14}>
                      <path d="M5 12l5 5 9-10" />
                    </Icon>
                  </span>
                ) : null}
              </span>
              <span className="text-center text-ref font-bold">{o.label}</span>
              {on || o.sub ? <span className="text-center text-tag font-medium text-stone">{on ? "נבחר" : o.sub}</span> : null}
            </button>
          );
        })}
      </div>
      {hasOwn ? (
        <Button variant="link" size="md" onClick={choosePhoto} aria-busy={saving || undefined} className="self-center">
          החלפת התמונה
        </Button>
      ) : null}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        onChange={(event) => void onFile(event)}
      />
    </>
  );
}
