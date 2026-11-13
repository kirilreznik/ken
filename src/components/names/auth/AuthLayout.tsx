import Image from "next/image";
import Link from "next/link";
import { iconButtonClass } from "@/components/names/ui/classes";
import fabric from "../../../../public/landing/names-fabric.webp";

/** The lead's id: fields in the panel point aria-describedby at it (NP-015). */
export const AUTH_LEAD_ID = "auth-lead";

const BACK_PLACE = "absolute start-5 top-[max(6px,env(safe-area-inset-top))]";

const backIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ltr:-scale-x-100">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

interface AuthLayoutProps {
  title: string;
  lead?: React.ReactNode;
  /** Optional round back link in the top start corner, out of the flow so the hero keeps its place (NP-008). */
  backHref?: string;
  /** Instead of backHref: the back control runs this, for a step back within the page (NP-007). */
  onBack?: () => void;
  /** Above the panel (e.g. the wordmark or a preview card). */
  hero?: React.ReactNode;
  /** Below the panel (e.g. the legal line). */
  footer?: React.ReactNode;
  /** A step within the page (e.g. email → code): when it changes, the panel's content enters
   * with names-step-in instead of swapping in place (NP-102). Leave unset on the first step. */
  step?: string;
  children?: React.ReactNode;
}

/**
 * Shared frame for welcome, sign-in, callback, onboarding and join: the fabric photo
 * full-bleed with the demo's top scrim, a centered column of max 480 px, and a strong
 * glass panel holding the title and the form (board 1's layout on board 8's glass).
 */
export default function AuthLayout({ title, lead, backHref, onBack, hero, footer, step, children }: AuthLayoutProps) {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <Image
        src={fabric}
        alt=""
        aria-hidden="true"
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover"
        fill
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-(--nest-scrim-photo-height) bg-(image:--nest-scrim-photo)" />

      <main className="relative mx-auto flex min-h-dvh w-full max-w-content flex-col gap-6 px-5 pt-[max(56px,env(safe-area-inset-top))] pb-[max(32px,env(safe-area-inset-bottom))]">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="חזרה" data-control className={`${iconButtonClass()} ${BACK_PLACE}`}>
            {backIcon}
          </button>
        ) : backHref ? (
          <Link href={backHref} aria-label="חזרה" data-control className={`${iconButtonClass()} ${BACK_PLACE}`}>
            {backIcon}
          </Link>
        ) : null}

        {hero}

        <section aria-labelledby="auth-title" className="names-glass names-card-glass rounded-xl p-6">
          {/* The content animates, not the glass: a fading backdrop-filter flickers in Safari. */}
          <div key={step} className={`flex flex-col gap-6 ${step ? "names-step-in" : ""}`}>
            <div className="flex flex-col gap-2">
              <h1 id="auth-title" className="text-display text-balance">
                {title}
              </h1>
              {lead ? (
                <div id={AUTH_LEAD_ID} className="text-card-title font-medium text-pretty text-ink-soft">
                  {lead}
                </div>
              ) : null}
            </div>
            {children}
          </div>
        </section>

        {footer ? <div className="mt-auto">{footer}</div> : null}
      </main>
    </div>
  );
}
