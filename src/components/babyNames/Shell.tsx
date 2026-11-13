import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CBS_ACCESSED, CBS_FILE_URL, CBS_LICENCE_URL } from "@/lib/names/report";
import { BASE_PATH } from "@/lib/babyNames/slug";
import { LISTS, listHref } from "@/lib/babyNames/lists";

const navLink = "inline-flex min-h-11 items-center rounded-pill px-3 text-person font-bold text-ink-soft hover:bg-sand";

/** Header, main column and footer (with the CBS attribution the licence asks for) of every /baby-names page. */
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="nest-seo flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-1">
          <Link href="/" aria-label="Nest, לעמוד הבית" className="inline-flex min-h-11 items-center">
            <Image src="/names/brand/nest-wordmark.svg" alt="Nest" width={74} height={28} unoptimized priority />
          </Link>
          <nav aria-label="שמות לתינוקות" className="flex items-center gap-1">
            <Link href={BASE_PATH} className={navLink}>
              כל השמות
            </Link>
            <Link href="/names/welcome" className="inline-flex min-h-11 items-center rounded-pill bg-ink px-4 text-person font-bold text-surface">
              לבחירת שם
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16">{children}</main>

      <footer className="border-t border-line bg-sand">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-caption text-stone">
          <nav aria-label="רשימות שמות" className="flex flex-wrap gap-x-1 gap-y-0">
            {LISTS.map((l) => (
              <Link key={l.id} href={listHref(l.id)} className={navLink}>
                {l.title}
              </Link>
            ))}
          </nav>
          <p className="m-0">
            מספרי הלידות: הלשכה המרכזית לסטטיסטיקה, הודעה לתקשורת 391/2025, שמות שניתנו ליילודים 1949–2024, נשלף ב־
            {CBS_ACCESSED}.{" "}
            <a href={CBS_FILE_URL} className="font-bold text-ink-soft underline underline-offset-2" rel="noopener">
              לקובץ הנתונים
            </a>{" "}
            ·{" "}
            <a href={CBS_LICENCE_URL} className="font-bold text-ink-soft underline underline-offset-2" rel="noopener">
              לתנאי הרישיון
            </a>
            . השימוש בנתונים לא מעיד על תמיכה של הלמ״ס ב־Nest.
          </p>
          <p className="m-0">
            המשמעויות והסיפורים נכתבו בעזרת בינה מלאכותית ונבדקו בדגימות, ועשויים להכיל טעויות. ההערות מהתנ״ך נבדקו מול נוסח
            התנ״ך, והאנשים הידועים נלקחו מ־<bdi dir="ltr">Wikidata</bdi>. המספרים הם תינוקות שנולדו בישראל וקיבלו את השם, לא
            אנשים שחיים היום.
          </p>
          <p className="m-0">
            <Link href="/" className="font-bold text-ink-soft underline underline-offset-2">
              Nest
            </Link>{" "}
            · כל ההריון במקום אחד
          </p>
        </div>
      </footer>
    </div>
  );
}
