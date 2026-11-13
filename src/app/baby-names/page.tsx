import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/babyNames/Breadcrumbs";
import JsonLd, { breadcrumbLd } from "@/components/babyNames/JsonLd";
import { NamePills } from "@/components/babyNames/NameLinks";
import SwiperCta from "@/components/babyNames/SwiperCta";
import { allNamePages, namesByLetter } from "@/lib/babyNames/data";
import { LISTS, listHref } from "@/lib/babyNames/lists";
import { absoluteUrl, BASE_PATH } from "@/lib/babyNames/slug";

const TITLE = "שמות לתינוקות: משמעות, מקור ונתונים לכל שם";
const LEAD =
  "כמעט 2,000 שמות שניתנים היום בישראל, כל אחד עם משמעות ומקור, כמה תינוקות קיבלו אותו בכל שנה מאז 2000, החלוקה בין בנים לבנות ושמות דומים. המספרים מהלשכה המרכזית לסטטיסטיקה.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · Nest` },
  description: LEAD,
  alternates: { canonical: BASE_PATH },
  robots: { index: true, follow: true },
  openGraph: { title: TITLE, description: LEAD, url: BASE_PATH },
};

/** The hub: the five lists, the most given names of 2024, and every name by first letter. */
export default function BabyNamesHub() {
  const top = allNamePages().slice(0, 30);
  const letters = namesByLetter();
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Nest", url: absoluteUrl("/") },
          { name: "שמות לתינוקות", url: absoluteUrl(BASE_PATH) },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Nest", href: "/" },
          { name: "שמות לתינוקות", href: BASE_PATH },
        ]}
      />
      <div className="flex flex-col gap-10">
        <header className="seo-hero -mx-4 flex flex-col gap-3 px-4 pt-8 pb-10 sm:mx-0 sm:rounded-xl sm:px-10">
          <h1 className="m-0 max-w-2xl text-display-xl text-ink">שמות לתינוקות</h1>
          <p className="m-0 max-w-2xl text-intro text-ink">{LEAD}</p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-title text-ink">רשימות</h2>
          <ul className="m-0 grid gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3" style={{ listStyle: "none" }}>
            {LISTS.map((l) => (
              <li key={l.id}>
                <Link href={listHref(l.id)} className="seo-glass flex h-full flex-col gap-1 rounded-lg p-5 hover:bg-peach-pale">
                  <span className="text-section text-ink">{l.title}</span>
                  <span className="text-body text-ink-soft">{l.lead}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-title text-ink">השמות שניתנו הכי הרבה ב־2024</h2>
          <NamePills pages={top} />
        </section>

        <SwiperCta />

        <section className="flex flex-col gap-4">
          <h2 className="m-0 text-title text-ink">כל השמות לפי אות</h2>
          <nav aria-label="קפיצה לאות" className="flex flex-wrap gap-1">
            {letters.map(({ letter }) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="inline-flex size-11 items-center justify-center rounded-pill bg-sand text-card-title text-ink"
              >
                {letter}
              </a>
            ))}
          </nav>
          {letters.map(({ letter, pages }) => (
            <section key={letter} id={`letter-${letter}`} className="flex scroll-mt-20 flex-col gap-2">
              <h3 className="m-0 text-section text-ink">{letter}</h3>
              <NamePills pages={pages} />
            </section>
          ))}
        </section>
      </div>
    </>
  );
}
