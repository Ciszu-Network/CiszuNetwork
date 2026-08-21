import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, PostHogAnalytics, FabStackProvider, ZoomWarning, BetaDisclaimer, DisclaimerProvider, DisclaimerStack } from "@ciszu/ui";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookiesBanner } from "@/components/layout/CookiesBanner";
import FeedbackFab from "@/components/layout/FeedbackFab";
import AuthProvider from "@/components/providers/AuthProvider";
import GlobalToast from "@/components/auth/GlobalToast";
import { CISZU_NETWORK } from "@/config/site";
import "./globals.css";

const ICON_SVG = assetResolver.resolve("projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg");

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

const ibmPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-condensed",
});

export const viewport = {
  themeColor: "#000000",
};
export const metadata: Metadata = {
  title: "Ciszu Network — Innovación Digital",
  description: "Ciszu Network desarrolla soluciones digitales de alto rendimiento. Liderados por Ciszuko Antony, CEO. Proyectos: MuzicMania, Minecraft, Discord, WhatsApp, Telegram y más.",
  keywords: ["Ciszu Network", "Ciszuko Antony", "MuzicMania", "desarrollo web", "Next.js", "Venezuela"],
  icons: {
    icon: ICON_SVG,
    shortcut: ICON_SVG,
    apple: "/pwa/icon-192.png",
  },
  appleWebApp: { capable: true, title: "Ciszu Network", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Ciszu Network — Innovación Digital",
    description: "Bright Future Promised. Desarrollo web, infraestructura cloud y experiencias digitales.",
    siteName: CISZU_NETWORK.name,
    locale: "es_ES",
    type: "website",
  },
};

const themeScript = `
(function () {
  try {
    var t = JSON.parse(localStorage.getItem('ciszu_preferences') || '{}');
    var theme = (t && t.theme) || 'dark';
    if (theme === 'light') document.documentElement.classList.add('light');
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const store = await headers();
  const isEdit = store.get("x-is-edit") === "1";

  return (
    <html lang="es" className={`${ibmPlex.variable} ${ibmPlexCondensed.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans flex flex-col">
        <AuthProvider>
          <DisclaimerProvider>
            <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={ICON_SVG} title="Ciszu Network" subtitle="Ciszu Network Security • Cloudflare" accent="#22d3ee" storageKey="cf_verified_ciszu">
              {!isEdit && <ZoomWarning />}
              {!isEdit && <BetaDisclaimer storageKey="betadisclaimer_ciszu_dismissed" />}
              {!isEdit && <Navbar />}
              {!isEdit && <DisclaimerStack headerHeight={64} />}
              <main className="flex-grow">{children}</main>
              {!isEdit && <Footer />}
              {!isEdit && <CookiesBanner />}
            </CloudflareGuard>
          </DisclaimerProvider>
          <GlobalToast />
        </AuthProvider>
        <PwaRegister />
        <FabStackProvider>
          {!isEdit && <InstallPdwaButton site="Ciszu Network" accent="#22d3ee" accentAlt="#f472b6" />}
          {!isEdit && <FeedbackFab />}
        </FabStackProvider>
        <PostHogAnalytics app="ciszunetwork" />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
      </body>
    </html>
  );
}
