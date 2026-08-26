import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Exo_2, Rajdhani } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, PostHogAnalytics, FabStackProvider, ZoomWarning, BetaDisclaimer, DisclaimerProvider, DisclaimerStack, GlobalAdvisor, ToastProvider } from "@ciszu/ui";
import { GlobalAdvisorConfirm } from "@ciszu/ui/server";

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

/** Metadata SSR por ruta (SEO): las páginas son client components y no pueden
 *  exportar `export const metadata`; se resuelve aquí desde el pathname que
 *  inyecta el middleware (header x-pathname). */
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/";
  return {
    ...metadataForPath(pathname),
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
}

import { CookiesBanner } from "@/components/atoms/CookiesBanner";
import { CloudflareGuard } from "@/components/layout/CloudflareGuard";
import { ConnectivityBanner } from "@/components/layout/ConnectivityBanner";
import FeedbackFab from "@/components/layout/FeedbackFab";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { metadataForPath } from '@/lib/page-metadata';

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const store = await headers();
  const isEdit = store.get("x-is-edit") === "1";

  return (
    <html lang="es" className={`${exo2.variable} ${rajdhani.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem('ciszu_preferences')||'{}');if(t&&t.theme==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans flex flex-col">
        {/* AuthProvider: hidrata el store global con la sesión de Supabase en cada carga */}
        <AuthProvider>
          <ToastProvider>
          <DisclaimerProvider>
            <CloudflareGuard>
              {!isEdit && <BetaDisclaimer storageKey="betadisclaimer_muzicmania_dismissed" />}
              {!isEdit && <Navbar />}
              {!isEdit && <ZoomWarning />}
              {!isEdit && <DisclaimerStack headerHeight={60} />}
              {!isEdit && <ConnectivityBanner />}
              <main className={isEdit ? "flex-grow" : "flex-grow pt-20"}>
                <NuqsAdapter>
                  {children}
                </NuqsAdapter>
              </main>
              {!isEdit && <Footer />}
              {!isEdit && <CookiesBanner />}
            </CloudflareGuard>
          </DisclaimerProvider>
          </ToastProvider>
        </AuthProvider>
        <GlobalAdvisor site="muzicmania" />
        <GlobalAdvisorConfirm site="muzicmania" />
        <SpeedInsights />
        <PwaRegister />
        <FabStackProvider>
          {!isEdit && <InstallPdwaButton site="MuzicMania" accent="#00f0ff" accentAlt="#ff33cc" desktopAppHref="/download" />}
          {!isEdit && <FeedbackFab />}
        </FabStackProvider>
        <PostHogAnalytics app="muzicmania" />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
      </body>
    </html>
  );
}
