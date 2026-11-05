import { PRIVACY_VERSION, TERMS_VERSION } from "@/content/names-legal/versions";

export const DISPLAY_NAME_MAX = 40;
export const SIGNUP_SOURCE = "names-pwa";

export interface OnboardingForm {
  displayName: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
  updatesOptIn: boolean;
}

type Metadata = Record<string, unknown> | null | undefined;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The name to prefill (FR-W7): a name saved earlier, else the first word of Google's
 * full_name / name. Email sign-ins have neither, so the field starts empty.
 */
export function suggestedDisplayName(metadata: Metadata): string {
  const saved = text(metadata?.display_name);
  if (saved) return saved.slice(0, DISPLAY_NAME_MAX);
  const google = text(metadata?.full_name) || text(metadata?.name);
  return google.split(/\s+/)[0]?.slice(0, DISPLAY_NAME_MAX) ?? "";
}

/** 1–40 characters after trimming. */
export function isValidDisplayName(raw: string): boolean {
  const name = raw.trim();
  return name.length >= 1 && name.length <= DISPLAY_NAME_MAX;
}

/** The button stays disabled until the name and both required confirmations are there. */
export function canSubmit(form: OnboardingForm): boolean {
  return isValidDisplayName(form.displayName) && form.ageConfirmed && form.termsAccepted;
}

/** user_metadata written by onboarding (PRD §6). updates_opt_in_at only when the opt-in is on. */
export function onboardingMetadata(form: OnboardingForm, now: Date = new Date()): Record<string, unknown> {
  const at = now.toISOString();
  const data: Record<string, unknown> = {
    display_name: form.displayName.trim(),
    age_confirmed_at: at,
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
    terms_accepted_at: at,
    updates_opt_in: form.updatesOptIn,
    signup_source: SIGNUP_SOURCE,
  };
  if (form.updatesOptIn) data.updates_opt_in_at = at;
  return data;
}
