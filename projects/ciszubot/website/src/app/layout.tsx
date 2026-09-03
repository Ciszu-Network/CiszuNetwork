import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Inter, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeedbackFab from "@/components/layout/FeedbackFab";
import { CookiesBanner } from "@/components/layout/CookiesBanner";
import { getDict, type Lang } from "@/lib/i18n";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, AdBlockerGuard, PostHogAnalytics, GoogleAnalytics, GoogleScripts, AdsProvider, AdFloat, AdPill, FabStackProvider, ZoomWarning, BetaDisclaimer, DisclaimerProvider, DisclaimerStack, DisclaimerDebug, GlobalDisclaimer, GlobalAdvisor, ToastProvider, RedirectGuard, ActivityGuardProvider } from "@ciszu/ui";
import { GlobalAdvisorConfirm } from "@ciszu/ui/server";
import { getSessionData } from "@/lib/auth";
import QueryProvider from "@/components/layout/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import AdsWithUser from "@/components/providers/AdsWithUser";
import "./globals.css";

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

const LOGO_ISOTIPO_CIRCLE = assetResolver.resolve('projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png');

export const viewport = {
  themeColor: "#12141a",
};
export const metadata: Metadata = {
  title: "CiszuBot | HOME",
  description:
    "El bot de Discord de Ciszu Network. Comandos divertidos, de información y utilidad con prefijo cz! y slash commands. Moderno, rápido y en español.",
  appleWebApp: { capable: true, title: "CiszuBot", statusBarStyle: "black-translucent" },
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const lang = (store.get("ciszubot_lang")?.value ?? "es") as Lang;
  const dict = getDict(lang);
  const session = await getSessionData();
  const headerStore = await headers();
  const isEdit = headerStore.get("x-is-edit") === "1";

  return (
    <html lang={lang} className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
        <GoogleScripts />
      </head>
      <body className="bg-bg text-ink min-h-screen font-sans flex flex-col">
        <QueryProvider>
           <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={LOGO_ISOTIPO_CIRCLE} title="CiszuBot" subtitle="CiszuBot Security • Cloudflare" accent="#a78bfa" storageKey="cf_verified_ciszubot">
            <AdBlockerGuard site="ciszubot" logo={LOGO_ISOTIPO_CIRCLE} title="CiszuBot" accent="#38bdf8" accentAlt="#ff33cc">
            <AuthProvider>
              <ToastProvider>
              <ActivityGuardProvider>
              <AdsWithUser site="ciszubot">
              <AdFloat placement="corner" side="bottom-right" />
              <AdPill placement="body" />
              <RedirectGuard />
              <DisclaimerProvider>
              {!isEdit && <BetaDisclaimer storageKey="betadisclaimer_ciszubot_dismissed" />}
              {!isEdit && <Navbar lang={lang} dict={dict} account={session} />}
              {!isEdit && <ZoomWarning />}
              {!isEdit && <DisclaimerStack headerHeight={64} />}
              <DisclaimerDebug site="ciszubot" />
              <GlobalDisclaimer site="ciszubot" />
              <main className={isEdit ? "flex-grow" : "flex-grow pt-[60px]"}>{children}</main>
              {!isEdit && <Footer lang={lang} dict={dict} />}
              {!isEdit && <CookiesBanner lang={lang} dict={dict} />}
              </DisclaimerProvider>
              </AdsWithUser>
              </ActivityGuardProvider>
              </ToastProvider>
            </AuthProvider>
            </AdBlockerGuard>
          </CloudflareGuard>
          <GlobalAdvisor site="ciszubot" />
          <GlobalAdvisorConfirm site="ciszubot" />
          <PwaRegister />
          <FabStackProvider>
            {!isEdit && <InstallPdwaButton site="CiszuBot" accent="#22d3ee" accentAlt="#a78bfa" />}
            {!isEdit && <FeedbackFab accent="#22d3ee" accentAlt="#a78bfa" />}
          </FabStackProvider>
          <PostHogAnalytics app="ciszubot" />
          <GoogleAnalytics app="ciszubot" />
        </QueryProvider>
      </body>
    </html>
  );
}

