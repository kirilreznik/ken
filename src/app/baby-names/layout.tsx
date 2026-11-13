import type { Metadata, Viewport } from "next";
import Shell from "@/components/babyNames/Shell";
import { canvasColor } from "@/lib/names/brand";
import { SITE_URL } from "@/lib/babyNames/slug";
import "@/styles/nest-tokens.css";
import "./baby-names.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { template: "%s · Nest", default: "שמות לתינוקות · Nest" },
  icons: { icon: "/names/brand/favicon.svg" },
  openGraph: { siteName: "Nest", locale: "he_IL", type: "website" },
};

export const viewport: Viewport = {
  themeColor: canvasColor,
};

/** Public, statically generated name pages: open to search engines, no sign-in, no app providers. */
export default function BabyNamesLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
