import Image from "next/image";
import Link from "next/link";
import fabric from "../../../../public/landing/names-fabric.webp";

interface AuthLayoutProps {
  title: string;
  lead?: React.ReactNode;
  /** Optional round back link in the top start corner. */
  backHref?: string;
  /** Above the panel (e.g. the wordmark or a preview card). */
  hero?: React.ReactNode;
  /** Below the panel (e.g. the legal line). */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Shared frame for welcome, sign-in, callback, onboarding and join: the fabric photo
 * full-bleed with the demo's top scrim, a centered column of max 480 px, and a strong
 * glass panel holding the title and the form (board 1's layout on board 8's glass).
 */
export default function AuthLayout({ title, lead, backHref, hero, footer, children }: AuthLayoutProps) {
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

      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-6 px-5 pt-[max(56px,env(safe-area-inset-top))] pb-[max(32px,env(safe-area-inset-bottom))]">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="חזרה"
            className="names-glass-soft flex size-11 items-center justify-center self-start rounded-pill text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ltr:-scale-x-100">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ) : null}

        {hero}

        <section aria-labelledby="auth-title" className="names-glass names-card-glass flex flex-col gap-6 rounded-xl p-6">
          <div className="flex flex-col gap-2">
            <h1 id="auth-title" className="text-display">
              {title}
            </h1>
            {lead ? <div className="text-card-title font-medium text-ink-soft">{lead}</div> : null}
          </div>
          {children}
        </section>

        {footer ? <div className="mt-auto">{footer}</div> : null}
      </main>
    </div>
  );
}
