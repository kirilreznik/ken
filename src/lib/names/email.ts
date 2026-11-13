/** PRD FR-W4: the email field on /names/sign-in/email. Supabase does the real check. */

export const EMAIL_ERROR = "צריך כתובת מייל, למשל name@example.com";

// Something before one @, a domain with a dot, no spaces anywhere.
const SHAPE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/** Trimmed and lowercased; what goes to signInWithOtp / verifyOtp. */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isEmail(input: string): boolean {
  return SHAPE.test(normalizeEmail(input));
}

/** The error to show under the field, or null when the address is usable. */
export function emailError(input: string): string | null {
  return isEmail(input) ? null : EMAIL_ERROR;
}
