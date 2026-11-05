import BackButton from "@/components/names/BackButton";
import { LEGAL_DRAFT_BANNER, LEGAL_PLACEHOLDER, legalParts, type LegalContacts, type LegalDoc } from "@/lib/names/legal";

function Text({ text, contacts }: { text: string; contacts: LegalContacts }) {
  return legalParts(text).map((part, i) => {
    if (part.kind === "text") return part.text;
    const value = part.kind === "operator" ? contacts.operator : contacts.contact;
    if (!value) return <strong key={i} className="font-bold text-ink">{LEGAL_PLACEHOLDER}</strong>;
    if (part.kind === "operator") return <bdi key={i}>{value}</bdi>;
    return (
      <a key={i} href={`mailto:${value}`} dir="ltr" className="-my-3 inline-flex min-h-11 items-center max-w-full font-bold break-all text-ink underline underline-offset-2">
        {value}
      </a>
    );
  });
}

/**
 * /names/privacy and /names/terms (FR-W31) in board 5's list look on canvas: a draft banner while
 * LEGAL_DRAFT, the version and date, then the sections in one card. Server-rendered.
 */
export default function LegalScreen({ doc, draft, contacts }: { doc: LegalDoc; draft: boolean; contacts: LegalContacts }) {
  return (
    <div data-names-bg="none" className="min-h-dvh bg-canvas">
      <main className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <header className="flex items-center gap-2">
          <BackButton />
          <h1 className="m-0 min-w-0 flex-1 text-title">{doc.title}</h1>
        </header>

        {draft ? (
          <p role="note" className="m-0 flex items-center gap-2 rounded-md bg-caution-bg px-4 py-3 text-body font-bold text-ink">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none text-caution">
              <path d="M12 3l9.5 17h-19z" />
              <path d="M12 10v4M12 17.5v.01" />
            </svg>
            {LEGAL_DRAFT_BANNER}
          </p>
        ) : null}

        <article className="flex flex-col gap-5 rounded-lg bg-surface p-5 shadow-card">
          <p className="m-0 text-caption text-stone">
            גרסה <bdi dir="ltr">{doc.version}</bdi> · עודכן ב־{doc.updated}
          </p>
          <p className="m-0 text-body text-ink">
            <Text text={doc.intro} contacts={contacts} />
          </p>
          {doc.sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-1.5">
              <h2 className="m-0 text-card-title">{section.title}</h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="m-0 text-body text-ink-soft">
                  <Text text={p} contacts={contacts} />
                </p>
              ))}
              {section.items ? (
                <ul className="m-0 flex list-disc flex-col gap-1.5 ps-5 text-body text-ink-soft marker:text-stone">
                  {section.items.map((item) => (
                    <li key={item}>
                      <Text text={item} contacts={contacts} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </main>
    </div>
  );
}
