"use client";

import { useRef } from "react";
import { cleanCode } from "@/lib/names/resend";

export const CODE_LENGTH = 6;

interface CodeInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  /** Called once each time the field reaches 6 digits (typing, paste or SMS/email autofill). */
  onComplete: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** Id of the hint or error text under the field. */
  describedBy?: string;
  autoFocus?: boolean;
}

/**
 * One LTR field for the 6-digit code (FR-W4): numeric keyboard, one-time-code autofill,
 * digits only, auto-submit on the 6th digit.
 */
export default function CodeInput({
  id,
  label,
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  describedBy,
  autoFocus,
}: CodeInputProps) {
  const lastSubmitted = useRef<string | null>(null);

  function handle(raw: string) {
    const code = cleanCode(raw, CODE_LENGTH);
    onChange(code);
    if (code.length === CODE_LENGTH && code !== lastSubmitted.current) {
      lastSubmitted.current = code;
      onComplete(code);
    } else if (code.length < CODE_LENGTH) {
      lastSubmitted.current = null;
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-bold text-ink">
        {label}
      </label>
      <input
        id={id}
        name="code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={CODE_LENGTH + 4}
        dir="ltr"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoFocus={autoFocus}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => handle(e.target.value)}
        className="h-14 w-full rounded-md border border-line bg-surface px-3.5 text-center text-title tracking-[0.4em] text-ink tabular-nums placeholder:text-faint aria-invalid:border-urgent disabled:opacity-60"
      />
    </div>
  );
}
