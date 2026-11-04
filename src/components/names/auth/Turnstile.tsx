"use client";

import { useEffect, useRef } from "react";

/** Optional (PRD §5): without a site key nothing renders and no script loads. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
export const captchaEnabled = TURNSTILE_SITE_KEY !== "";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      language?: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible" | "compact";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing")));
      script.onerror = () => {
        scriptPromise = null;
        script.remove();
        reject(new Error("turnstile failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

interface TurnstileProps {
  /** A fresh token, or null when it expired or the check failed. Tokens are single use. */
  onToken: (token: string | null) => void;
}

/**
 * Cloudflare Turnstile for signInWithOtp's captchaToken. Renders only when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. Change its `key` after each send to get a new token.
 */
export default function Turnstile({ onToken }: TurnstileProps) {
  const box = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!captchaEnabled || !box.current) return;
    const el = box.current;
    let widget: string | null = null;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled) return;
        widget = api.render(el, {
          sitekey: TURNSTILE_SITE_KEY,
          language: "he",
          theme: "light",
          size: "flexible",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widget && window.turnstile) window.turnstile.remove(widget);
    };
  }, []);

  if (!captchaEnabled) return null;
  return <div ref={box} className="min-h-[65px] w-full" />;
}
