import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/babyNames/Breadcrumbs";
import JsonLd, { breadcrumbLd } from "@/components/babyNames/JsonLd";
import { NameRows } from "@/components/babyNames/NameLinks";
import SwiperCta from "@/components/babyNames/SwiperCta";
import { LISTS, listById, listHref, type ListId } from "@/lib/babyNames/lists";
import { absoluteUrl, BASE_PATH, nameHref } from "@/lib/babyNames/slug";

export function listMetadata(id: ListId): Metadata {
  const list = listById(id);
  const url = listHref(id);
  return {
    title: list.metaTitle,
    description: list.lead,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: list.metaTitle, description: list.lead, url },
  };
}

/** One of the five list pages: h1, lead, the numbered names, how the list was made, the other lists. */
export default function ListPage({ id }: { id: ListId }) {
  const list = listById(id);
  const pages = list.pages();
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Nest", url: absoluteUrl("/") },
          { name: "שמות לתינוקות", url: absoluteUrl(BASE_PATH) },
          { name: list.title, url: absoluteUrl(listHref(id)) },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: list.title,
          numberOfItems: pages.length,
          itemListElement: pages.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: absoluteUrl(nameHref(p.name)),
          })),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Nest", href: "/" },
          { name: "שמות לתינוקות", href: BASE_PATH },
          { name: list.title, href: listHref(id) },
        ]}
      />
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="seo-hero -mx-4 flex flex-col gap-3 px-4 pt-6 pb-8 sm:mx-0 sm:rounded-xl sm:px-8">
          <h1 className="m-0 text-display-xl text-ink">{list.title}</h1>
          <p className="m-0 text-intro text-ink">{list.lead}</p>
        </header>
        <SwiperCta compact />
        <NameRows pages={pages} stat={list.stat} />
        <p className="m-0 text-caption text-stone">איך הרשימה נבנתה: {list.method}</p>
        <nav aria-label="רשימות נוספות" className="flex flex-col gap-2">
          <h2 className="m-0 text-section text-ink">רשימות נוספות</h2>
          <ul className="m-0 flex flex-wrap gap-2 p-0" style={{ listStyle: "none" }}>
            {LISTS.filter((l) => l.id !== id).map((l) => (
              <li key={l.id}>
                <Link href={listHref(l.id)} className="inline-flex min-h-11 items-center rounded-pill bg-sand px-4 text-person font-bold text-ink">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <SwiperCta />
      </div>
    </>
  );
}
