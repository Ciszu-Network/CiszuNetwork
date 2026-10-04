import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { buildSeoMetadata, seoJsonLdString } from "@ciszunetwork/utils/seo";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeedbackFab from "@/components/layout/FeedbackFab";
import HideOnEdit from "@/components/layout/HideOnEdit";
import SiteMain from "@/components/layout/SiteMain";
import { CookiesBanner } from "@/components/layout/CookiesBanner";
import { LOGO_ISOTIPO_CIRCLE } from "@/lib/i18n";
import { COMMANDS } from "@/data/commands";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, AdBlockerGuard, PostHogAnalytics, GoogleAnalytics, GoogleScripts, AdsProvider, AdFloat, AdPill, FabStackProvider, ZoomWarning, DisclaimerProvider, DisclaimerStack, DisclaimerDebug, GlobalDisclaimer, GlobalAdvisor, ToastProvider, RedirectGuard, ActivityGuardProvider } from "@ciszu/ui";
import { SpeedInsights } from "@vercel/speed-insights/next";
import QueryProvider from "@/components/layout/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import AdsWithUser from "@/components/providers/AdsWithUser";
import "./globals.scss";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const themeScript = `
(function () {
  try {
    var t = JSON.parse(localStorage.getItem('ciszu_preferences') || '{}');
    var theme = (t && t.theme) || 'dark';
    if (theme !== 'light') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

const GUARD_LOGO = assetResolver.resolve(LOGO_ISOTIPO_CIRCLE);

export const viewport = {
  themeColor: "#12141a",
};
export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: 'CiszuBot | El bot de Discord de Ciszu Network',
    description:
      'El bot de Discord de Ciszu Network. Comandos divertidos, de información y utilidad con prefijo cz! y slash commands. Moderno, rápido y en español.',
    url: 'https://ciszubot.vercel.app/',
    siteName: 'CiszuBot',
    keywords: ['ciszubot', 'bot discord', 'discord bot', 'ciszu network', 'comandos', 'slash commands'],
    image: 'https://ciszubot.vercel.app/pwa/icon-512.png',
  }),
  appleWebApp: { capable: true, title: "CiszuBot", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "9jc8qVjHjC3ZpZ7gpgbIpHrloar3kaeNIEy0EnR2uc0",
  },
  icons: {
    icon: "/favicon.ico?v=3",
    shortcut: "/favicon.ico?v=3",
    apple: "/pwa/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Fase 3/4 (STATIC_MIGRATION_PLAN §4.4-4.5): el layout raíz ya no lee
  // `cookies()` ni `headers()`. El SSR sale en la base `es-latam` y el cliente
  // (useClientI18n) aplica el idioma real; la sesión la hidrata AuthProvider en
  // cliente (antes había un fallback SSR de Discord que forzaba render dinámico)
  // y el chrome del editor se oculta con `usePathname()` (HideOnEdit/SiteMain).
  /** Idioma base del SSR; el cliente corrige tras montar (Fase 3 §4.4). */
  const lang = "es-latam";

  return (
    <html lang={lang} className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      {/* suppressHydrationWarning: AdSense (auto ads) inyecta su propio <script> en
          el <head> antes de que React hidrate, así que el primer hijo no coincide.
          Es una mutación legítima de un tercero: se silencia el aviso, no el bug. */}
      <head suppressHydrationWarning>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: seoJsonLdString(
              'CiszuBot',
              'https://ciszubot.vercel.app/',
              'El bot de Discord de Ciszu Network. Comandos divertidos, de información y utilidad con prefijo cz! y slash commands.',
              'https://ciszubot.vercel.app/pwa/icon-512.png',
            ),
          }}
        />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" data-cookie-consent="optional" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
        <GoogleScripts />
      </head>
      <body className="bg-bg text-ink min-h-screen font-sans flex flex-col">
        <QueryProvider>
           <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={GUARD_LOGO} title="CiszuBot" subtitle="CiszuBot Security • Cloudflare" accent="#a78bfa" storageKey="cf_verified_ciszubot">
             <AdBlockerGuard site="ciszubot" logo={GUARD_LOGO} title="CiszuBot" accent="#38bdf8" accentAlt="#ff33cc" donateHref="https://ciszubot.vercel.app/donate">
            <AuthProvider>
              <ToastProvider>
              <ActivityGuardProvider>
               <AdsWithUser site="ciszubot">
               <AdFloat placement="corner" side="bottom-right" />
               <AdPill placement="body" />
               <RedirectGuard debug={true} />
              <DisclaimerProvider>
              {/* BetaDisclaimer removido: ahora usa el sistema de push global (GlobalDisclaimer) */}
              <HideOnEdit><Navbar /></HideOnEdit>
              <HideOnEdit><ZoomWarning /></HideOnEdit>
              <HideOnEdit><DisclaimerStack headerHeight={64} /></HideOnEdit>
              <DisclaimerDebug site="ciszubot" />
              <GlobalDisclaimer site="ciszubot" />
              <SiteMain>{children}</SiteMain>
              <HideOnEdit><Footer commandCount={COMMANDS.length} /></HideOnEdit>
              <HideOnEdit><CookiesBanner /></HideOnEdit>
              </DisclaimerProvider>
              </AdsWithUser>
              </ActivityGuardProvider>
              </ToastProvider>
            </AuthProvider>
            </AdBlockerGuard>
          </CloudflareGuard>
          <GlobalAdvisor site="ciszubot" />
          <SpeedInsights />
          <PwaRegister />
          <FabStackProvider>
            <HideOnEdit><InstallPdwaButton site="CiszuBot" accent="#22d3ee" accentAlt="#a78bfa" /></HideOnEdit>
            <HideOnEdit><FeedbackFab accent="#22d3ee" accentAlt="#a78bfa" /></HideOnEdit>
          </FabStackProvider>
          <PostHogAnalytics app="ciszubot" />
          <GoogleAnalytics app="ciszubot" />
        </QueryProvider>
      </body>
    </html>
  );
}


