import Link from "next/link";

/**
 * The way into the swiper. Sign-ups are invite-only for now (Auth hook 0012), so the line under
 * the button says so and points to the waitlist on the landing page.
 */
export default function SwiperCta({ name, compact = false }: { name?: string; compact?: boolean }) {
  return (
    <aside aria-label="בחירת שם ב־Nest" className="seo-glass flex flex-col gap-3 rounded-lg p-5">
      {compact ? null : (
        <p className="m-0 text-section text-ink">
          {name ? `אוהבים את השם ${name}?` : "בוחרים שם?"} ממשיכים לבחור, שם אחד בכל פעם.
        </p>
      )}
      <p className="m-0 text-body text-ink-soft">
        כמעט 2,000 שמות עם משמעות ומספרים אמיתיים מהלמ״ס. שומרים, מדלגים ובוחרים לבד או ביחד, עם התאמות כשאתם בוחרים בשניים.
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link
          href="/names/welcome"
          className="inline-flex h-12 items-center justify-center rounded-pill bg-ink px-6 text-button text-surface"
        >
          לבחירת שם באפליקציה
        </Link>
        <span className="text-caption text-stone">
          ההרשמה כרגע בהזמנה.{" "}
          <Link href="/#waitlist" className="inline-flex min-h-11 items-center font-bold text-ink-soft underline underline-offset-2">
            להשארת אימייל
          </Link>
        </span>
      </div>
    </aside>
  );
}
