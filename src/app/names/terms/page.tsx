import type { Metadata } from "next";
import LegalScreen from "@/components/names/legal/LegalScreen";
import { LEGAL_DRAFT, terms } from "@/content/names-legal/terms";
import { legalContacts } from "@/lib/names/legal";

export const metadata: Metadata = {
  title: terms.title,
  description: terms.description,
  robots: { index: true, follow: true },
  openGraph: { title: `${terms.title} · בחירת שם`, description: terms.description, type: "website", locale: "he_IL" },
};

const contacts = legalContacts({
  PREGNANCY_OPERATOR_NAME: process.env.PREGNANCY_OPERATOR_NAME,
  PREGNANCY_CONTACT_EMAIL: process.env.PREGNANCY_CONTACT_EMAIL,
});

/** FR-W31: static, indexable; the operator details are read from env at build time. */
export default function TermsPage() {
  return <LegalScreen doc={terms} draft={LEGAL_DRAFT} contacts={contacts} />;
}
