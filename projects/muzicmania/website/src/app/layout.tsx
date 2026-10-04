import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2, Rajdhani } from "next/font/google";
import { buildSeoMetadata, seoJsonLdString } from "@ciszunetwork/utils/seo";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.scss";
import AuthProvider from "@/components/providers/AuthProvider";
import AdsWithUser from "@/components/providers/AdsWithUser";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, AdBlockerGuard, PostHogAnalytics, GoogleAnalytics, GoogleScripts, AdsProvider, AdFloat, AdPill, FabStackProvider, ZoomWarning, DisclaimerProvider, DisclaimerStack, DisclaimerDebug, GlobalDisclaimer, GlobalAdvisor, ToastProvider, RedirectGuard, ActivityGuardProvider } from "@ciszu/ui";
import HideOnEdit from "@/components/layout/HideOnEdit";
import SiteMain from "@/components/layout/SiteMain";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-rajdhani",
});


export const viewport = {
  themeColor: "#000000",
};

/**
 * Metadata base del sitio (Fase 4, STATIC_MIGRATION_PLAN §4.5).
 *
 * Antes el layout raíz resolvía el pathname por el header `x-pathname` del
 * middleware (`generateMetadata` + `headers()`), lo que hacía dinámica toda la
 * web. Ahora la metadata por ruta vive en el `layout.tsx` de cada segmento
 * (`metadataForPath`), y esta base actúa de fallback: coincide con la metadata
 * del home, que es lo que `metadataForPath` devolvía para cualquier ruta sin
 * entrada propia (el helper cae al prefijo `/`).
 */
export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: 'MuzicMania | El Juego de Ritmo Definitivo en la Web',
    description:
      'El Juego de Ritmo Definitivo en la Web. Domina el beat en una dimensión online con estética futurista y la banda sonora Genesis Neon de Ciszuko Antony.',
    url: 'https://muzicmania.vercel.app/',
    siteName: 'MuzicMania',
    keywords: ['muzicmania', 'juego ritmo', 'rhythm game', 'genesis neon', 'ciszu network', 'música'],
    image: 'https://muzicmania.vercel.app/pwa/icon-512.png',
  }),
  appleWebApp: { capable: true, title: "MuzicMania", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "9jc8qVjHjC3ZpZ7gpgbIpHrloar3kaeNIEy0EnR2uc0",
  },
  icons: {
    icon: "/favicon.ico?v=2",
    shortcut: "/favicon.ico?v=2",
    apple: "/pwa/icon-192.png",
  },
};

import { CookiesBanner } from "@/components/atoms/CookiesBanner";
import { CloudflareGuard } from "@/components/layout/CloudflareGuard";
import { ConnectivityBanner } from "@/components/layout/ConnectivityBanner";
import FeedbackFab from "@/components/layout/FeedbackFab";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Fase 3/4 (STATIC_MIGRATION_PLAN §4.4-4.5): el layout no lee `headers()`.
  // El SSR sale siempre en la base y el cliente la resuelve (Navbar → store);
  // el chrome del editor (`/edit/*`) se oculta con `usePathname()` (HideOnEdit).
  const lang = "es-latam";

  return (
    <html lang={lang} className={`${exo2.variable} ${rajdhani.variable}`} suppressHydrationWarning>
      {/* suppressHydrationWarning: AdSense (auto ads) inyecta su propio <script> en
          el <head> antes de que React hidrate, así que el primer hijo no coincide.
          Es una mutación legítima de un tercero: se silencia el aviso, no el bug. */}
      <head suppressHydrationWarning>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem('ciszu_preferences')||'{}');if(t&&t.theme==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: seoJsonLdString(
              'MuzicMania',
              'https://muzicmania.vercel.app/',
              'El Juego de Ritmo Definitivo en la Web con la banda sonora Genesis Neon.',
              'https://muzicmania.vercel.app/pwa/icon-512.png',
            ),
          }}
        />
        <GoogleScripts />
      </head>
      <body className="min-h-screen font-sans flex flex-col">
        {/* AuthProvider: hidrata el store global con la sesión de Supabase en cada carga */}
        <AuthProvider>
          <ToastProvider>
          <ActivityGuardProvider>
           <AdsWithUser site="muzicmania">
           <AdFloat placement="corner" side="bottom-right" />
           <AdPill placement="body" />
           <RedirectGuard debug={true} />
          <DisclaimerProvider>
            <CloudflareGuard>
              <AdBlockerGuard site="muzicmania" logo={assetResolver.resolve('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')} title="MuzicMania" accent="#c026d3" accentAlt="#ff33cc" donateHref="https://muzicmania.vercel.app/donate">
              {/* BetaDisclaimer removido: ahora usa el sistema de push global (GlobalDisclaimer) */}
              <HideOnEdit><Navbar /></HideOnEdit>
              <HideOnEdit><ZoomWarning /></HideOnEdit>
              <HideOnEdit><DisclaimerStack headerHeight={60} /></HideOnEdit>
          <DisclaimerDebug site="muzicmania" />
          <GlobalDisclaimer site="muzicmania" />
              <HideOnEdit><ConnectivityBanner /></HideOnEdit>
              <SiteMain>
                <NuqsAdapter>
                  {children}
                </NuqsAdapter>
              </SiteMain>
              <HideOnEdit><Footer /></HideOnEdit>
              <HideOnEdit><CookiesBanner /></HideOnEdit>
              </AdBlockerGuard>
            </CloudflareGuard>
          </DisclaimerProvider>
          </AdsWithUser>
          </ActivityGuardProvider>
          </ToastProvider>
        </AuthProvider>
        <GlobalAdvisor site="muzicmania" />
        <SpeedInsights />
        <PwaRegister />
        <FabStackProvider>
          <HideOnEdit><InstallPdwaButton site="MuzicMania" accent="#00f0ff" accentAlt="#ff33cc" desktopAppHref="/download" /></HideOnEdit>
          <HideOnEdit><FeedbackFab /></HideOnEdit>
        </FabStackProvider>
        <PostHogAnalytics app="muzicmania" />
        <GoogleAnalytics app="muzicmania" />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" data-cookie-consent="optional" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
      </body>
    </html>
  );
}
