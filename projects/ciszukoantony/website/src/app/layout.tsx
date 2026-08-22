import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Exo_2, Rajdhani } from "next/font/google";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, PostHogAnalytics, FabStackProvider, ZoomWarning, BetaDisclaimer, DisclaimerProvider, DisclaimerStack } from "@ciszu/ui";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeedbackFab from "@/components/layout/FeedbackFab";
import { CookiesBanner } from "@/components/layout/CookiesBanner";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";
const PROFILE_PIC = assetResolver.resolve("projects/ciszukoantony/content/assets/youtube_canal.png");
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
export const metadata: Metadata = {
  metadataBase: new URL("https://ciszukoantony.vercel.app"),
  title: "Ciszuko Antony",
  description: "Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network. Innovation, development and technology.",
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await headers();
  const isEdit = store.get("x-is-edit") === "1";

  return (
    <html lang="en" className={`${exo2.variable} ${rajdhani.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem('ciszu_preferences')||'{}');if(t&&t.theme==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans flex flex-col">
        <AuthProvider>
          <DisclaimerProvider>
            <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={PROFILE_PIC} title="Ciszuko Antony" subtitle="Ciszuko Antony Security • Cloudflare" accent="#a78bfa" storageKey="cf_verified_ciszukoantony">
              {!isEdit && <BetaDisclaimer storageKey="betadisclaimer_ciszukoantony_dismissed" />}
              {!isEdit && <Navbar />}
              {!isEdit && <ZoomWarning />}
              {!isEdit && <DisclaimerStack headerHeight={64} />}
              <main className="flex-grow">{children}</main>
              {!isEdit && <Footer />}
              {!isEdit && <CookiesBanner />}
            </CloudflareGuard>
          </DisclaimerProvider>
        </AuthProvider>
        <PwaRegister />
        <FabStackProvider>
          {!isEdit && <InstallPdwaButton site="Ciszuko Antony" accent="#a78bfa" accentAlt="#22d3ee" />}
          {!isEdit && <FeedbackFab />}
        </FabStackProvider>
        <PostHogAnalytics app="ciszukoantony" />
        {process.env.NODE_ENV === 'production' && (
          <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
        )}
      </body>
    </html>
  );
}
