"use client";

import type { ReactNode } from "react";
import { preloadNameDetail } from "@/components/names/detail/LazyNameDetailSheet";
import { FADE_PRESS } from "@/components/names/ui";
import { DETAILS_HINT } from "@/lib/names/a11y";

/**
 * The name part of a row. With `onOpen` (the name has a card) it's a button that opens the
 * name sheet, same look; without it, plain text (custom names have no sheet).
 */
export default function RowName({ onOpen, children, className: extra = "" }: { onOpen?: () => void; children: ReactNode; className?: string }) {
  const className = `flex min-w-0 flex-1 flex-col gap-0.5 ${extra}`;
  if (!onOpen) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      // Safari doesn't focus a tapped button; focus it so the sheet gives focus back to this row.
      onPointerDown={preloadNameDetail}
      onFocus={preloadNameDetail}
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        onOpen();
      }}
      className={`${className} min-h-11 justify-center rounded-sm text-start ${FADE_PRESS}`}>
      {children}
      <span className="sr-only">, {DETAILS_HINT}</span>
    </button>
  );
}
