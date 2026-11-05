import type { Metadata } from "next";
import LegalScreen from "@/components/names/legal/LegalScreen";
import { LEGAL_DRAFT, privacy } from "@/content/names-legal/privacy";
import { legalContacts } from "@/lib/names/legal";

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.description,
  robots: { index: true, follow: true },
  openGraph: { title: `${privacy.title} · בחירת שם`, description: privacy.description, type: "website", locale: "he_IL" },
};

const contacts = legalContacts({
  PREGNANCY_OPERATOR_NAME: process.env.PREGNANCY_OPERATOR_NAME,
  PREGNANCY_CONTACT_EMAIL: process.env.PREGNANCY_CONTACT_EMAIL,
});

/** FR-W31: static, indexable; the operator details are read from env at build time. */
export default function PrivacyPage() {
  return <LegalScreen doc={privacy} draft={LEGAL_DRAFT} contacts={contacts} />;
}
