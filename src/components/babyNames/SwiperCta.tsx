import Link from "next/link";

/**
 * The way into the swiper. Guests can swipe 100 names before signing in (guest mode), so the
 * button goes straight to the deck and says no sign-up is needed.
 */
export default function SwiperCta({
  name,
  compact = false,
  source,
}: {
  name?: string;
  compact?: boolean;
  /** Where the visitor came from, for the swiper's app_open (never the name itself). */
  source: "seo_name" | "seo_list" | "seo_hub";
}) {
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
          href={`/names?source=${source}`}
          className="inline-flex h-12 items-center justify-center rounded-pill bg-ink px-6 text-button text-surface"
        >
          לנסות עכשיו, בלי הרשמה
        </Link>
        <span className="text-caption text-stone">חינם. 100 השמות הראשונים בלי חשבון, ואחר כך נרשמים כדי לשמור.</span>
      </div>
    </aside>
  );
}
