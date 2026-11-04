"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { iconButtonClass } from "@/components/names/ui/classes";

type RowMenuProps = {
  name: string;
  onRemove: () => void;
  onHide: () => void;
};

const ITEM =
  "flex min-h-11 w-full items-center gap-2 whitespace-nowrap rounded-sm px-3.5 text-body font-bold text-ink hover:bg-sand focus-visible:bg-sand";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
      {children}
    </svg>
  );
}

/**
 * A "שמרתי" row's menu (FR-W18): "הסרה מהרשימה" and "לא להציג יותר". Same behavior as the
 * skip menu: focus goes to the first item, arrows move, Escape returns focus, Tab or a tap
 * outside close it.
 */
export default function RowMenu({ name, onRemove, onHide }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
    const outside = (e: Event) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [open]);

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menu.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ?? [])];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      button.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key === "ArrowDown") next = (index + 1) % items.length;
    else if (e.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      items[next]?.focus();
    }
  };

  const act = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={wrap} className="relative flex shrink-0">
      <button
        ref={button}
        type="button"
        data-row-menu=""
        aria-label={`אפשרויות עבור ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={iconButtonClass()}
      >
        <Icon>
          <circle cx="12" cy="5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="19" r="1.2" fill="currentColor" />
        </Icon>
      </button>
      {open ? (
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label={`אפשרויות עבור ${name}`}
          data-motion="fade"
          onKeyDown={onMenuKeyDown}
          className="names-glass names-toast-in absolute end-0 top-full z-10 mt-1.5 flex flex-col rounded-md bg-surface p-1.5"
        >
          <button type="button" role="menuitem" tabIndex={-1} className={ITEM} onClick={() => act(onRemove)}>
            <Icon>
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </Icon>
            הסרה מהרשימה
          </button>
          <button type="button" role="menuitem" tabIndex={-1} className={ITEM} onClick={() => act(onHide)}>
            <Icon>
              <path d="M3 3l18 18" />
              <path d="M10.6 5.1A10.5 10.5 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.9 3.8M6.6 6.6A17 17 0 0 0 2.5 12S6 19 12 19a9.6 9.6 0 0 0 5.4-1.6" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </Icon>
            לא להציג יותר
          </button>
        </div>
      ) : null}
    </div>
  );
}
