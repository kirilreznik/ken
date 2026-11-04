import type { Metadata } from "next";
import AboutScreen from "@/components/names/about/AboutScreen";

const DESCRIPTION = "מאיפה המספרים בבחירת שם: נתוני הלמ\"ס על שמות שניתנו ליילודים 1949–2024, ומה כדאי לדעת על הפירושים.";

export const metadata: Metadata = {
  title: "על הנתונים",
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: { title: "על הנתונים · בחירת שם", description: DESCRIPTION, type: "website", locale: "he_IL" },
};

/** FR-W30: "על הנתונים" for direct links (indexable, PRD 3.2.20); the sheet is ?sheet=about. */
export default function AboutPage() {
  return <AboutScreen />;
}
