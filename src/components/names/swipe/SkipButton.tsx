"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { LONG_PRESS_MS, longPressMoved } from "@/lib/names/gesture";
import { isMenuKey, swipeKey } from "@/lib/names/keys";

type Press = { id: number; x: number; y: number; timer: number };

type SkipButtonProps = {
  onSkip: () => void;
  onHide: () => void;
  disabled: boolean;
  className: string;
  /** Sets aria-pressed (the name sheet shows the current vote); left out on the swipe screen. */
  pressed?: boolean;
  describedBy?: string;
  children: ReactNode;
};

/**
 * "דילוג" with its hide menu (§3.2.13, E16 FR-11): holding it for 500 ms, right-clicking it,
 * or the menu key / Shift+F10 while it has focus opens a small menu with "דילוג ולא להציג
 * שוב". The menu takes focus; Escape, Tab or a tap outside close it. A long press never also
 * skips.
 */
export default function SkipButton({ onSkip, onHide, disabled, className, pressed, describedBy, children }: SkipButtonProps) {
  const [menu, setMenu] = useState(false);
  const open = menu && !disabled;
  const press = useRef<Press | null>(null);
  const swallowClick = useRef(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const item = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    item.current?.focus();
    const outside = (e: Event) => {
      if (!wrap.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [open]);

  useEffect(() => () => window.clearTimeout(press.current?.timer), []);

  const showMenu = () => {
    if (!disabled) setMenu(true);
  };
  const cancelPress = () => {
    window.clearTimeout(press.current?.timer);
    press.current = null;
  };
  const closeMenu = () => {
    setMenu(false);
    button.current?.focus();
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    swallowClick.current = false;
    cancelPress();
    if (disabled || e.button > 0) return;
    const timer = window.setTimeout(() => {
      press.current = null;
      swallowClick.current = true;
      showMenu();
    }, LONG_PRESS_MS);
    press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, timer };
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (p && p.id === e.pointerId && longPressMoved(e.clientX - p.x, e.clientY - p.y)) cancelPress();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!isMenuKey(e)) return;
    e.preventDefault();
    showMenu();
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    } else if (e.key === "Tab") {
      setMenu(false);
    } else if (["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key) || swipeKey(e)) {
      // One item: arrows stay on it, and the swipe shortcuts don't fire behind the menu.
      e.preventDefault();
    }
  };

  return (
    <div ref={wrap} className="relative flex min-w-0">
      <button
        ref={button}
        type="button"
        data-act="skip"
        aria-label="דילוג"
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        aria-pressed={pressed}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`${className} select-none [-webkit-touch-callout:none]`}
        onClick={() => {
          if (swallowClick.current) swallowClick.current = false;
          else if (!disabled) onSkip();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault();
          cancelPress();
          showMenu();
        }}
        onKeyDown={onKeyDown}
      >
        {children}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="אפשרויות דילוג"
          data-motion="fade"
          onKeyDown={onMenuKeyDown}
          className="names-glass names-menu-in absolute end-0 origin-bottom-left ltr:origin-bottom-right bg-surface bottom-full z-10 mb-2.5 rounded-md p-1.5"
        >
          <button
            ref={item}
            type="button"
            role="menuitem"
            className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sm px-3.5 text-body font-bold text-ink hover:bg-sand focus-visible:bg-sand"
            onClick={() => {
              setMenu(false);
              button.current?.focus();
              onHide();
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="flex-none"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 5.1A10.5 10.5 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.9 3.8M6.6 6.6A17 17 0 0 0 2.5 12S6 19 12 19a9.6 9.6 0 0 0 5.4-1.6" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
            דילוג ולא להציג שוב
          </button>
        </div>
      ) : null}
    </div>
  );
}
