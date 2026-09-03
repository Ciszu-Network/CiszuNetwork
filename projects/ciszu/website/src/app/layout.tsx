import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, AdBlockerGuard, PostHogAnalytics, GoogleAnalytics, GoogleScripts, AdsProvider, AdFloat, AdPill, FabStackProvider, ZoomWarning, BetaDisclaimer, DisclaimerProvider, DisclaimerStack, DisclaimerDebug, GlobalDisclaimer, GlobalAdvisor, ToastProvider, RedirectGuard, ActivityGuardProvider } from "@ciszu/ui";
import { GlobalAdvisorConfirm } from "@ciszu/ui/server";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookiesBanner } from "@/components/layout/CookiesBanner";
import FeedbackFab from "@/components/layout/FeedbackFab";
import AuthProvider from "@/components/providers/AuthProvider";
import AdsWithUser from "@/components/providers/AdsWithUser";
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
  verification: {
    google: "9jc8qVjHjC3ZpZ7gpgbIpHrloar3kaeNIEy0EnR2uc0",
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
  // Rutas "desnudas" (pruebas no oficiales, p.ej. /youareanidiot): sin chrome,
  // sin ads, sin guards, sin disclaimers ni botones flotantes. Solo el body.
  const isBare = store.get("x-is-bare") === "1";

  if (isBare) {
    return (
      <html lang="es" className={`${ibmPlex.variable} ${ibmPlexCondensed.variable}`} suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="m-0 p-0 min-h-screen">{children}</body>
      </html>
    );
  }

  return (
    <html lang="es" className={`${ibmPlex.variable} ${ibmPlexCondensed.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <GoogleScripts />
      </head>
      <body className="min-h-screen font-sans flex flex-col">
        <AuthProvider>
          <ToastProvider>
          <ActivityGuardProvider>
          <AdsWithUser site="ciszunetwork">
          <AdFloat placement="corner" side="bottom-right" />
          <AdPill placement="body" />
          <RedirectGuard />
          <DisclaimerProvider>
            <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={ICON_SVG} title="Ciszu Network" subtitle="Ciszu Network Security • Cloudflare" accent="#22d3ee" storageKey="cf_verified_ciszu">
              <AdBlockerGuard site="ciszunetwork" logo={ICON_SVG} title="Ciszu Network" accent="#22d3ee" accentAlt="#f472b6">
              {!isEdit && <ZoomWarning />}
              {!isEdit && <BetaDisclaimer storageKey="betadisclaimer_ciszu_dismissed" />}
              {!isEdit && <Navbar />}
              {!isEdit && <DisclaimerStack headerHeight={64} />}
              <DisclaimerDebug site="ciszunetwork" />
              <GlobalDisclaimer site="ciszu" />
              <main className="flex-grow">{children}</main>
              {!isEdit && <Footer />}
              {!isEdit && <CookiesBanner />}
              </AdBlockerGuard>
            </CloudflareGuard>
          </DisclaimerProvider>
          </AdsWithUser>
          </ActivityGuardProvider>
          </ToastProvider>
          <GlobalAdvisor site="ciszu" />
        </AuthProvider>
        <GlobalAdvisorConfirm site="ciszu" />
        <PwaRegister />
        <FabStackProvider>
          {!isEdit && <InstallPdwaButton site="Ciszu Network" accent="#22d3ee" accentAlt="#f472b6" />}
          {!isEdit && <FeedbackFab />}
        </FabStackProvider>
        <PostHogAnalytics app="ciszunetwork" />
        <GoogleAnalytics app="ciszunetwork" />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
      </body>
    </html>
  );
}
