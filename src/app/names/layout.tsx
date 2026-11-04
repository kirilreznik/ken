import type { Metadata, Viewport } from "next";
import { canvasColor } from "@/lib/names/brand";
import "@/styles/nest-tokens.css";

export const metadata: Metadata = {
  title: { template: "%s · בחירת שם", default: "בחירת שם" },
  description: "בוחרים שם לתינוק או לתינוקת, לבד או ביחד: שמירה, דילוג והתאמות.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "בחירת שם", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: canvasColor,
};

export default function NamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas font-nest text-ink">
      {children}
    </div>
  );
}
