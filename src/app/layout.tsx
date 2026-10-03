import type { Metadata, Viewport } from "next";
import "@fontsource-variable/assistant";
import "@fontsource-variable/frank-ruhl-libre";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppShell } from "@/components/AppShell";


export const metadata: Metadata = {
  title: { default: "קן", template: "%s · קן" },
  description: "ההריון שלכם, במקום אחד",
  applicationName: "קן",
  appleWebApp: { capable: true, title: "קן", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f1eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className="antialiased">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
