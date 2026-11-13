"use client";

import { useState } from "react";
import { showToast } from "@/lib/names/toast";
import { track } from "@/lib/names/track";
import Section from "./Section";

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function Row({ label, value, kind }: { label: string; value: string; kind: "he" | "intl" }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-h-11 items-center gap-3">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-caption text-stone">{label}</span>
        <bdi dir="ltr" lang="en" className="self-start text-card-title break-all text-ink">
          {value}
        </bdi>
      </span>
      <button
        type="button"
        aria-label={`העתקת האיות ${value}`}
        onClick={async () => {
          if (!(await copy(value))) return;
          setCopied(true);
          showToast(`הועתק: ${value}`);
          track("latin_copied", { kind });
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-pill border border-line bg-surface px-3 text-person font-bold text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {copied ? <path d="M5 12l5 5 9-10" /> : (<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>)}
        </svg>
        {copied ? "הועתק" : "העתקה"}
      </button>
    </div>
  );
}

/**
 * "באותיות לועזיות": the name by the Academy of the Hebrew Language's rules and, when it has
 * one, its international form, each with a copy button. It doesn't claim to be the passport
 * spelling: parents choose that when they register the name. Hidden when the name has neither.
 */
export default function LatinSection({ latin }: { latin?: { he?: string; intl?: string } }) {
  if (!latin?.he && !latin?.intl) return null;
  return (
    <Section label="באותיות לועזיות">
      <div className="flex flex-col gap-1">
        {latin.he ? <Row label="לפי כללי האקדמיה ללשון העברית" value={latin.he} kind="he" /> : null}
        {latin.intl ? <Row label="הצורה המוכרת בעולם" value={latin.intl} kind="intl" /> : null}
      </div>
      <p className="m-0 text-caption text-stone">את האיות בדרכון ההורים בוחרים כשרושמים את השם.</p>
    </Section>
  );
}
