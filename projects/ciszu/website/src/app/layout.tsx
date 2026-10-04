import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { assetResolver } from "@ciszunetwork/cdn";
import { buildSeoMetadata, seoJsonLdString } from "@ciszunetwork/utils/seo";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, AdBlockerGuard, PostHogAnalytics, GoogleAnalytics, GoogleScripts, AdsProvider, AdFloat, AdPill, FabStackProvider, ZoomWarning, DisclaimerProvider, DisclaimerStack, DisclaimerDebug, GlobalDisclaimer, GlobalAdvisor, ToastProvider, RedirectGuard, ActivityGuardProvider } from "@ciszu/ui";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookiesBanner } from "@/components/layout/CookiesBanner";
import FeedbackFab from "@/components/layout/FeedbackFab";
import HideOnEdit from "@/components/layout/HideOnEdit";
import BareGate from "@/components/layout/BareGate";
import AuthProvider from "@/components/providers/AuthProvider";
import AdsWithUser from "@/components/providers/AdsWithUser";
import LangSync from "@/components/providers/LangSync";
import { CISZU_NETWORK } from "@/config/site";
import "./globals.scss";

const ICON_SVG = assetResolver.resolve("projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zwhite_ccolor.svg");

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
  ...buildSeoMetadata({
    title: "Ciszu Network — Innovación Digital",
    description: "Ciszu Network desarrolla soluciones digitales de alto rendimiento. Liderados por Ciszuko Antony, CEO. Proyectos: MuzicMania, Minecraft, Discord, WhatsApp, Telegram y más.",
    url: "https://ciszunetwork.vercel.app/",
    siteName: CISZU_NETWORK.name,
    keywords: ["Ciszu Network", "Ciszuko Antony", "MuzicMania", "desarrollo web", "Next.js", "Venezuela", "innovación digital"],
    image: "https://ciszunetwork.vercel.app/pwa/icon-512.png",
  }),
  icons: {
    icon: ICON_SVG,
    shortcut: ICON_SVG,
    apple: "/pwa/icon-192.png",
  },
  appleWebApp: { capable: true, title: "Ciszu Network", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "9jc8qVjHjC3ZpZ7gpgbIpHrloar3kaeNIEy0EnR2uc0",
  },
};

const themeScript = `
(function () {
  try {
    var raw = localStorage.getItem('ciszu_preferences');
    if (!raw) return;
    var t = JSON.parse(raw);
    if (t && t.theme === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Fase 3/4 (STATIC_MIGRATION_PLAN §4.4-4.5): el layout no lee `cookies()` ni
  // `headers()`. El SSR sale siempre en el idioma base y LangSync lo corrige en
  // cliente; el editor se oculta con `usePathname()` (HideOnEdit) y el modo
  // "desnudo" de /youareanidiot se resuelve en cliente (BareGate).
  const lang = "es-latam";

  return (
    <html lang={lang} className={`${ibmPlex.variable} ${ibmPlexCondensed.variable}`} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: seoJsonLdString(
              'Ciszu Network',
              'https://ciszunetwork.vercel.app/',
              'Ciszu Network desarrolla soluciones digitales de alto rendimiento, lideradas por Ciszuko Antony.',
              'https://ciszunetwork.vercel.app/pwa/icon-512.png',
            ),
          }}
        />
        <Script
          id="kofi-widget"
          src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
          strategy="afterInteractive"
        />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" data-cookie-consent="optional" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
        <GoogleScripts />
      </head>
      <body className="min-h-screen font-sans flex flex-col">
        <LangSync />
        <BareGate fallback={<main className="m-0 p-0 min-h-screen">{children}</main>}>
        <AuthProvider>
          <ToastProvider>
          <ActivityGuardProvider>
          <AdsWithUser site="ciszu">
            <AdFloat placement="corner" side="bottom-right" />
            <AdPill placement="body" />
            <RedirectGuard debug={true} />
            <DisclaimerProvider>
              <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={ICON_SVG} title="Ciszu Network" subtitle="Ciszu Network Security • Cloudflare" accent="#22d3ee" storageKey="cf_verified_ciszu">
                <AdBlockerGuard site="ciszu" logo={ICON_SVG} title="Ciszu Network" accent="#22d3ee" accentAlt="#f472b6" donateHref="https://ciszunetwork.vercel.app/donate">
                <HideOnEdit><ZoomWarning /></HideOnEdit>
                <HideOnEdit><Navbar /></HideOnEdit>
                <HideOnEdit><DisclaimerStack headerHeight={64} /></HideOnEdit>
                <DisclaimerDebug site="ciszu" />
                <GlobalDisclaimer site="ciszu" />
                <main className="flex-grow pt-16">{children}</main>
                <HideOnEdit><Footer /></HideOnEdit>
                <HideOnEdit><CookiesBanner /></HideOnEdit>
                </AdBlockerGuard>
              </CloudflareGuard>
            </DisclaimerProvider>
          </AdsWithUser>
          </ActivityGuardProvider>
          </ToastProvider>
          <GlobalAdvisor site="ciszu" />
        </AuthProvider>
        </BareGate>
        <SpeedInsights />
        <PwaRegister />
        <FabStackProvider>
          <HideOnEdit><InstallPdwaButton site="Ciszu Network" accent="#22d3ee" accentAlt="#f472b6" /></HideOnEdit>
          <HideOnEdit><FeedbackFab /></HideOnEdit>
        </FabStackProvider>
        <PostHogAnalytics app="ciszunetwork" />
        <GoogleAnalytics app="ciszunetwork" />
      </body>
    </html>
  );
}
