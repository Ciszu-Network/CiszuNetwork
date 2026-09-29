import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2, Rajdhani } from "next/font/google";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, AdBlockerGuard, PostHogAnalytics, GoogleAnalytics, GoogleScripts, AdsProvider, AdFloat, AdPill, FabStackProvider, ZoomWarning, DisclaimerProvider, DisclaimerStack, DisclaimerDebug, GlobalDisclaimer, GlobalAdvisor, ToastProvider, RedirectGuard, ActivityGuardProvider } from "@ciszu/ui";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeedbackFab from "@/components/layout/FeedbackFab";
import HideOnEdit from "@/components/layout/HideOnEdit";
import { CookiesBanner } from "@/components/layout/CookiesBanner";
import AuthProvider from "@/components/providers/AuthProvider";
import AdsWithUser from "@/components/providers/AdsWithUser";
import { I18nProvider } from "@/components/providers/I18nProvider";
import "./globals.scss";

const PROFILE_PIC = assetResolver.resolve("projects/ciszukoantony/content/logos/images/samples/circle/circle_1_yt.png");
const OG_IMAGE = assetResolver.resolve("projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png");

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
  metadataBase: new URL("https://ciszukoantony.vercel.app"),
  title: "Ciszuko Antony | HOME",
  description:
    "Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network. Innovation, development and technology.",
  keywords: ["Ciszuko Antony", "Ciszuko Network", "portfolio", "developer", "Venezuela", "CEO", "technology"],
  icons: {
    icon: PROFILE_PIC,
    shortcut: PROFILE_PIC,
    apple: "/pwa/icon-192.png",
  },
  appleWebApp: { capable: true, title: "Ciszuko Antony", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Ciszuko Antony",
    description: "Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network.",
    url: "https://ciszukoantony.vercel.app",
    siteName: "Ciszuko Antony",
    images: [{ url: OG_IMAGE, width: 132, height: 118 }],
    locale: "en_US",
    type: "website",
  },
  verification: {
    google: "9jc8qVjHjC3ZpZ7gpgbIpHrloar3kaeNIEy0EnR2uc0",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Fase 3/4 (STATIC_MIGRATION_PLAN §4.4-4.5): el layout no lee `headers()`.
  // El SSR sale siempre en la base y el I18nProvider la resuelve en cliente;
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
        <GoogleScripts />
      </head>
      <body className="min-h-screen font-sans flex flex-col">
        <I18nProvider lang={lang}>
        <AuthProvider>
          <DisclaimerProvider>
            <ToastProvider>
            <ActivityGuardProvider>
            <AdsWithUser site="ciszukoantony">
            <AdFloat placement="corner" side="bottom-right" />
            <AdPill placement="body" />
            <RedirectGuard debug={true} />
            <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={PROFILE_PIC} title="Ciszuko Antony" subtitle="Ciszuko Antony Security • Cloudflare" accent="#a78bfa" storageKey="cf_verified_ciszukoantony">
              <AdBlockerGuard site="ciszukoantony" logo={PROFILE_PIC} title="Ciszuko Antony" accent="#a78bfa" accentAlt="#ff33cc" donateHref="https://ciszukoantony.vercel.app/donate">
              {/* BetaDisclaimer removido: ahora usa el sistema de push global (GlobalDisclaimer) */}
              <HideOnEdit><Navbar /></HideOnEdit>
              <HideOnEdit><ZoomWarning /></HideOnEdit>
              <HideOnEdit><DisclaimerStack headerHeight={64} /></HideOnEdit>
              <DisclaimerDebug site="ciszukoantony" />
              <GlobalDisclaimer site="ciszukoantony" />
              <main className="flex-grow pt-16">{children}</main>
              <HideOnEdit><Footer /></HideOnEdit>
              <HideOnEdit><CookiesBanner /></HideOnEdit>
              </AdBlockerGuard>
            </CloudflareGuard>
            </AdsWithUser>
            </ActivityGuardProvider>
            </ToastProvider>
          </DisclaimerProvider>
        </AuthProvider>
        <GlobalAdvisor site="ciszukoantony" />
        <SpeedInsights />
        <PwaRegister />
        <FabStackProvider>
          <HideOnEdit><InstallPdwaButton site="Ciszuko Antony" accent="#a78bfa" accentAlt="#22d3ee" /></HideOnEdit>
          <HideOnEdit><FeedbackFab /></HideOnEdit>
        </FabStackProvider>
        <PostHogAnalytics app="ciszukoantony" />
        <GoogleAnalytics app="ciszukoantony" />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" data-cookie-consent="optional" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
        </I18nProvider>
      </body>
    </html>
  );
}
