"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  OWN_SCRIM_BASE,
  averageLuminance,
  cardRegion,
  coverSourceRect,
  effectiveBackground,
  ownScrimOpacity,
  photoUrl,
  type PhotoBackground,
} from "@/lib/names/background";
import { loadOwnPhoto, subscribeOwnPhoto } from "@/lib/names/photo";
import { getPref, subscribePrefs, type Background } from "@/lib/names/prefs";
import fabric from "../../../public/landing/names-fabric.webp";
import notebook from "../../../public/landing/names-notebook.webp";
import nursery from "../../../public/landing/names-nursery.webp";
import { useAuth } from "./AuthProvider";

const PHOTOS: Record<PhotoBackground, StaticImageData> = { fabric, notebook, nursery };

/** The signed-in user's background choice (FR-W17), following changes made anywhere. */
export function useBackgroundChoice(): Background {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useSyncExternalStore(
    subscribePrefs,
    () => (userId ? getPref(userId, "background") : "fabric"),
    () => "fabric",
  );
}

interface OwnPhoto {
  key: string;
  /** Object URL of the Blob, null when there is no readable photo. */
  url: string | null;
  scrim: number;
}

/** Scrim strength from the luminance of the part of the photo the card covers. */
async function measureScrim(url: string): Promise<number | null> {
  const img = document.createElement("img");
  img.src = url;
  try {
    await img.decode();
  } catch {
    return null;
  }
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const source = coverSourceRect(viewport, { width: img.naturalWidth, height: img.naturalHeight }, cardRegion(viewport));
  const size = 24;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return OWN_SCRIM_BASE;
  ctx.drawImage(img, source.x, source.y, source.width, source.height, 0, 0, size, size);
  return ownScrimOpacity(averageLuminance(ctx.getImageData(0, 0, size, size).data));
}

/** The own photo from IndexedDB as an object URL, reloaded when it's replaced or deleted. */
function useOwnPhoto(userId: string | null, enabled: boolean): OwnPhoto | "loading" {
  const [photo, setPhoto] = useState<OwnPhoto | null>(null);
  const [version, setVersion] = useState(0);
  const key = `${userId}:${version}`;

  useEffect(() => subscribeOwnPhoto(() => setVersion((v) => v + 1)), []);

  useEffect(() => {
    if (!enabled || !userId) return;
    let cancelled = false;
    let url: string | null = null;
    void (async () => {
      const blob = await loadOwnPhoto(userId);
      if (cancelled) return;
      url = blob ? URL.createObjectURL(blob) : null;
      const scrim = url ? await measureScrim(url) : null;
      if (cancelled) return;
      if (scrim === null && url) {
        URL.revokeObjectURL(url);
        url = null;
      }
      setPhoto({ key, url, scrim: scrim ?? 0 });
      url = null; // Committed: revoked when it's replaced (below).
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [enabled, userId, key]);

  useEffect(() => {
    const url = photo?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [photo?.url]);

  if (photo && photo.key === key) return photo;
  // While a replacement loads, keep showing this user's previous photo.
  if (photo?.url && photo.key.startsWith(`${userId}:`)) return photo;
  return "loading";
}

interface ScreenBackgroundProps {
  /** Overrides the saved choice (e.g. a preview). */
  background?: Background;
  /** The "ללא רקע" blobs: board 2's two (default), board 1's single one at the top or board 4's centered one. */
  blobs?: "main" | "intro" | "match";
  children?: React.ReactNode;
}

/**
 * The backdrop of the swipe, intro and match views (FR-W17): "ללא רקע" is the canvas with
 * board 2's two peach blobs; the photos fill the screen (cover) under the demo's top scrim;
 * the user's own photo adds a canvas scrim, stronger for dark photos (PRD 3.2.15), and
 * makes the glass whiter. Children sit in a centered column of max 480 px inside the safe area.
 */
export default function ScreenBackground({ background, blobs = "main", children }: ScreenBackgroundProps) {
  const { user } = useAuth();
  const saved = useBackgroundChoice();
  const choice = background ?? saved;
  const own = useOwnPhoto(user?.id ?? null, choice === "own");
  const ownPhoto = own === "loading" ? null : own;
  const shown: Background | null =
    choice === "own" && own === "loading" ? null : effectiveBackground(choice, !!ownPhoto?.url);

  return (
    <div data-names-bg={shown ?? "own"} className="relative isolate min-h-dvh">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {shown === "none" && blobs === "intro" ? (
          <div className="absolute inset-y-0 start-0 end-0 mx-auto max-w-[480px]">
            <div className="absolute -top-15 -end-20 size-80 rounded-full bg-peach opacity-25 blur-(--nest-blob-blur)" />
          </div>
        ) : null}

        {shown === "none" && blobs === "match" ? (
          <div className="absolute inset-y-0 start-0 end-0 mx-auto max-w-[480px]">
            <div className="absolute top-40 inset-x-0 mx-auto size-90 rounded-full bg-peach opacity-25 blur-(--nest-blob-blur)" />
          </div>
        ) : null}

        {shown === "none" && blobs === "main" ? (
          <div className="absolute inset-y-0 start-0 end-0 mx-auto max-w-[480px]">
            <div className="absolute top-30 -end-30 size-75 rounded-full bg-peach opacity-[0.22] blur-(--nest-blob-blur)" />
            <div className="absolute bottom-20 -start-[90px] size-60 rounded-full bg-peach opacity-[0.18] blur-(--nest-blob-blur)" />
          </div>
        ) : null}

        {shown === "fabric" || shown === "notebook" || shown === "nursery" ? (
          // The file the service worker precaches, as is: through the image optimizer it would
          // be a URL that's only cached once fetched, so offline after one visit it was gone (NP-BUG-009).
          <Image
            key={shown}
            src={photoUrl(shown)}
            alt=""
            priority
            unoptimized
            placeholder="blur"
            blurDataURL={PHOTOS[shown].blurDataURL}
            sizes="100vw"
            className="object-cover"
            fill
          />
        ) : null}

        {shown === "own" && ownPhoto?.url ? (
          <>
            {/* An object URL of a local Blob: next/image can't optimize it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ownPhoto.url} alt="" className="absolute inset-0 size-full object-cover" />
            <div
              data-testid="names-own-scrim"
              className="names-own-scrim absolute inset-0"
              style={{ "--names-own-scrim": ownPhoto.scrim } as React.CSSProperties}
            />
          </>
        ) : null}

        {shown && shown !== "none" ? (
          <div className="absolute inset-x-0 top-0 h-(--nest-scrim-photo-height) bg-(image:--nest-scrim-photo)" />
        ) : null}
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-[max(env(safe-area-inset-left),env(safe-area-inset-right))] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {children}
      </div>
    </div>
  );
}
