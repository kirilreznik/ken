import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/babyNames/Breadcrumbs";
import JsonLd, { breadcrumbLd } from "@/components/babyNames/JsonLd";
import { Digits, NamePills } from "@/components/babyNames/NameLinks";
import SwiperCta from "@/components/babyNames/SwiperCta";
import YearChart from "@/components/babyNames/YearChart";
import { allNamePages, namePage, similarPages, type NamePage } from "@/lib/babyNames/data";
import { LISTS, listHref, type ListId } from "@/lib/babyNames/lists";
import { absoluteUrl, BASE_PATH, nameFromSlug, nameHref, nameSlug } from "@/lib/babyNames/slug";
import { LAST_YEAR } from "@/lib/names/data";
import { compare2000, rankText } from "@/lib/names/detail";
import { allTimeAmount } from "@/lib/names/popularity";

type Params = { params: Promise<{ name: string }> };

// Every deck name is generated at build time; any other path is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return allNamePages().map((p) => ({ name: nameSlug(p.name) }));
}

async function pageFor(params: Params["params"]): Promise<NamePage> {
  const page = namePage(nameFromSlug((await params).name));
  if (!page) notFound();
  return page;
}

const SEX_LINE: Record<NamePage["sexTag"], string> = {
  בן: "שם לבנים",
  בת: "שם לבנות",
  "מתאים לכולם": "מתאים לבנים ולבנות",
};

function description(p: NamePage): string {
  const text = `${p.content.intro} ${p.countLine}.`;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await pageFor(params);
  const title = `משמעות השם ${p.name}: מקור, פירוש ונתונים`;
  const url = nameHref(p.name);
  return {
    title,
    description: description(p),
    alternates: { canonical: url },
    robots: p.indexed ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description: description(p), url, type: "article" },
  };
}

/** The lists this name is on, so each page links back up to them. */
function listsOf(p: NamePage): ListId[] {
  return LISTS.filter((l) => l.pages().some((x) => x.name === p.name)).map((l) => l.id);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="m-0 text-section text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default async function NamePageView({ params }: Params) {
  const p = await pageFor(params);
  const { content, detail, stats } = p;
  const similar = similarPages(p);
  const compare = compare2000(stats);
  const lists = listsOf(p);
  const people = content.people.filter((x) => x.name.trim() && x.what.trim());
  const url = absoluteUrl(nameHref(p.name));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Nest", url: absoluteUrl("/") },
          { name: "שמות לתינוקות", url: absoluteUrl(BASE_PATH) },
          { name: p.name, url },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Nest", href: "/" },
          { name: "שמות לתינוקות", href: BASE_PATH },
          { name: p.name, href: nameHref(p.name) },
        ]}
      />

      <article className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="seo-hero -mx-4 flex flex-col gap-3 px-4 pt-6 pb-8 sm:mx-0 sm:rounded-xl sm:px-8">
          <p className="m-0 text-tag text-clay-deep">משמעות השם</p>
          <h1 className="m-0 text-name text-ink">{p.name}</h1>
          {content.niqqud && content.niqqud !== p.name ? (
            <p className="m-0 text-title text-ink-soft" lang="he">
              {content.niqqud}
            </p>
          ) : null}
          <ul className="m-0 flex flex-wrap gap-2 p-0" style={{ listStyle: "none" }}>
            <li className="rounded-pill bg-surface px-3 py-1 text-person font-bold text-ink">{SEX_LINE[p.sexTag]}</li>
            <li className="rounded-pill bg-surface px-3 py-1 text-person font-bold text-ink">
              <Digits text={p.count2024 > 0 ? `${p.count2024.toLocaleString("he-IL")} תינוקות ב־${LAST_YEAR}` : `פחות מ־5 ב־${LAST_YEAR}`} />
            </li>
            {p.trend ? (
              <li className="rounded-pill bg-surface px-3 py-1 text-person font-bold text-ink">
                <span aria-hidden="true">{p.trend.arrow} </span>
                {p.trend.word}
              </li>
            ) : null}
          </ul>
          <p className="m-0 text-intro text-ink">{content.intro}</p>
        </header>

        {detail.story ? (
          <Section title={`משמעות השם ${p.name}`}>
            <p className="m-0 text-intro text-ink">{detail.story}</p>
          </Section>
        ) : null}

        {content.bible?.text.trim() ? (
          <Section title="בתנ״ך">
            <blockquote className="m-0 flex flex-col gap-1 rounded-md border-s-4 border-peach bg-peach-pale p-4">
              <p className="m-0 text-intro text-ink">{content.bible.text}</p>
              {content.bible.ref ? <p className="m-0 text-ref text-stone">{content.bible.ref}</p> : null}
            </blockquote>
          </Section>
        ) : null}

        <SwiperCta name={p.name} />

        <Section title={`כמה תינוקות קיבלו את השם ${p.name}`}>
          <p className="m-0 text-intro text-ink">
            <Digits text={`${p.countLine}.`} />
            {p.rank !== null ? (
              <>
                {" "}
                <Digits text={`המקום ה־${p.rank.toLocaleString("he-IL")} מכל השמות שניתנו ב־${LAST_YEAR}.`} />
              </>
            ) : null}
          </p>
          <YearChart stats={stats} />
          <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-md border border-line bg-surface p-3">
              <dt className="text-caption text-stone">מאז 1949</dt>
              <dd className="m-0 text-stat text-ink">
                <Digits text={allTimeAmount(stats)} />
              </dd>
            </div>
            {p.rank !== null ? (
              <div className="rounded-md border border-line bg-surface p-3">
                <dt className="text-caption text-stone">דירוג</dt>
                <dd className="m-0 text-stat text-ink">
                  <Digits text={rankText(p.rank)} />
                </dd>
              </div>
            ) : null}
            {compare ? (
              <div className="rounded-md border border-line bg-surface p-3">
                <dt className="text-caption text-stone">ב־{LAST_YEAR}</dt>
                <dd className="m-0 text-stat text-ink">
                  <Digits text={compare.text} />
                </dd>
              </div>
            ) : null}
          </dl>
        </Section>

        <Section title="בנים ובנות">
          <p className="m-0 text-body text-ink-soft">מכל התינוקות שקיבלו את השם מאז 1949:</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex h-3 overflow-hidden rounded-pill bg-peach-soft" aria-hidden="true">
              <div className="h-full bg-ink-soft" style={{ width: `${p.split.boysShare * 100}%` }} />
            </div>
            <p className="m-0 flex justify-between text-person font-bold text-ink">
              <span>
                בנים <Digits text={p.split.boysLabel} />
              </span>
              <span>
                בנות <Digits text={p.split.girlsLabel} />
              </span>
            </p>
          </div>
        </Section>

        {content.latin?.he || content.latin?.intl ? (
          <Section title={`איך כותבים ${p.name} באנגלית`}>
            <dl className="m-0 flex flex-col gap-2">
              {content.latin.he ? (
                <div className="flex flex-col rounded-md border border-line bg-surface p-3">
                  <dt className="text-caption text-stone">לפי כללי האקדמיה ללשון העברית</dt>
                  <dd className="m-0 text-card-title text-ink">
                    <bdi dir="ltr" lang="en">
                      {content.latin.he}
                    </bdi>
                  </dd>
                </div>
              ) : null}
              {content.latin.intl ? (
                <div className="flex flex-col rounded-md border border-line bg-surface p-3">
                  <dt className="text-caption text-stone">הצורה המוכרת בעולם</dt>
                  <dd className="m-0 text-card-title text-ink">
                    <bdi dir="ltr" lang="en">
                      {content.latin.intl}
                    </bdi>
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="m-0 text-caption text-stone">את האיות בדרכון ההורים בוחרים כשרושמים את השם.</p>
          </Section>
        ) : null}

        {people.length ? (
          <Section title={`אנשים ידועים בשם ${p.name}`}>
            <ul className="m-0 flex flex-col gap-2 p-0" style={{ listStyle: "none" }}>
              {people.map((person) => (
                <li key={person.name} className="flex items-center gap-3 rounded-md border border-line bg-surface p-3">
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-peach-soft text-card-title text-clay-deep">
                    {Array.from(person.name.trim())[0]}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-card-title text-ink">{person.name}</span>
                    <span className="text-person text-stone">{person.what}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {similar.length ? (
          <Section title="שמות דומים">
            <NamePills pages={similar} />
          </Section>
        ) : null}

        {lists.length ? (
          <Section title="ברשימות">
            <ul className="m-0 flex flex-wrap gap-2 p-0" style={{ listStyle: "none" }}>
              {lists.map((id) => (
                <li key={id}>
                  <Link href={listHref(id)} className="inline-flex min-h-11 items-center rounded-pill bg-sand px-4 text-person font-bold text-ink">
                    {LISTS.find((l) => l.id === id)!.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <SwiperCta name={p.name} compact />
      </article>
    </>
  );
}
