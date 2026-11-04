"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useAuth } from "@/components/names/AuthProvider";
import { useBackgroundChoice } from "@/components/names/ScreenBackground";
import { BottomSheet, IconButton, closeSheet } from "@/components/names/ui";
import { loadOwnPhoto, subscribeOwnPhoto } from "@/lib/names/photo";
import { setPref, type Background } from "@/lib/names/prefs";
import fabric from "../../../public/landing/names-fabric.webp";
import notebook from "../../../public/landing/names-notebook.webp";
import nursery from "../../../public/landing/names-nursery.webp";

interface Option {
  id: Background;
  label: string;
  sub: string;
  photo?: StaticImageData;
}

// Board 11, in its order (RTL rows of three).
const OPTIONS: Option[] = [
  { id: "none", label: "ללא רקע", sub: "כרטיסים לבנים" },
  { id: "fabric", label: "בדים", sub: "ברירת מחדל", photo: fabric },
  { id: "notebook", label: "מחברת", sub: "", photo: notebook },
  { id: "nursery", label: "חדר תינוק", sub: "", photo: nursery },
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

/** Whether this user has an own photo saved on the device, following saves and deletes. */
function useHasOwnPhoto(userId: string | null): boolean {
  const [has, setHas] = useState<{ userId: string; value: boolean } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => subscribeOwnPhoto(() => setVersion((v) => v + 1)), []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void loadOwnPhoto(userId).then((blob) => {
      if (!cancelled) setHas({ userId, value: !!blob });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, version]);

  return !!userId && has?.userId === userId && has.value;
}

/**
 * "רקע למסך" (board 11, FR-W17): five options in a radio group; the current one is ringed in
 * ink with a check and "נבחר". A choice is saved to the device pref right away, so the screen
 * behind the sheet changes with it. "תמונה משלי" applies only when a photo is already saved.
 */
export default function BackgroundSheet() {
  return (
    <BottomSheet
      name="background"
      title="רקע למסך"
      headerEnd={
        <IconButton aria-label="סגירה" onClick={() => closeSheet("background")}>
          <Icon size={20}>
            <path d="M6 6l12 12M18 6L6 18" />
          </Icon>
        </IconButton>
      }
    >
      <BackgroundOptions />
      <p className="flex items-start gap-2.5 rounded-md bg-canvas px-3.5 py-3 text-note text-ink-soft">
        <span className="mt-0.5">
          <Icon size={18}>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </Icon>
        </span>
        <span>תמונה משלכם נשמרת רק במכשיר הזה. היא לא עולה לשרת ולא מוצגת למי שבוחר איתכם.</span>
      </p>
    </BottomSheet>
  );
}

function BackgroundOptions() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const current = useBackgroundChoice();
  const hasOwn = useHasOwnPhoto(userId);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  // A missing own photo shows as "בדים", like the screen behind (FR-W17).
  const checked: Background = current === "own" && !hasOwn ? "fabric" : current;

  function pick(id: Background) {
    if (!userId) return;
    if (id === "own" && !hasOwn) return;
    setPref(userId, "background", id);
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
    <div role="radiogroup" aria-label="בחירת רקע" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-3">
      {OPTIONS.map((o, i) => {
        const on = checked === o.id;
        const unavailable = o.id === "own" && !hasOwn;
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
            aria-disabled={unavailable || undefined}
            tabIndex={on ? 0 : -1}
            onClick={() => pick(o.id)}
            className="group flex flex-col items-stretch gap-1.5 rounded-md text-ink outline-none"
          >
            <span
              className={`relative flex h-30 items-center justify-center overflow-hidden rounded-md group-focus-visible:ring-2 group-focus-visible:ring-ink/50 group-focus-visible:ring-offset-4 ${
                o.id === "own"
                  ? "border-[1.5px] border-dashed border-faint bg-peach-pale"
                  : `${o.photo ? "bg-sand" : "bg-canvas"} ${on ? "" : "border border-line"}`
              } ${on ? "outline-3 outline-offset-2 outline-ink" : ""}`}
            >
              {o.photo ? <Image src={o.photo} alt="" placeholder="blur" sizes="160px" fill className="object-cover" /> : null}
              {o.id === "none" ? (
                <span aria-hidden="true" className="h-13 w-10 rounded-sm bg-surface shadow-(--nest-shadow-card-raised)" />
              ) : null}
              {o.id === "own" ? (
                <Icon size={26}>
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <circle cx="9" cy="10" r="1.6" />
                  <path d="M21 16l-5-5-8 8" />
                </Icon>
              ) : null}
              {on ? (
                <span className="absolute end-1.5 top-1.5 flex size-5.5 items-center justify-center rounded-full bg-ink text-surface">
                  <Icon size={14} strokeWidth={3}>
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
  );
}
