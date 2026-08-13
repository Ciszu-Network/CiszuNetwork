import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2, Rajdhani } from "next/font/google";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, PostHogAnalytics, FabStackProvider } from "@ciszu/ui";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeedbackFab from "@/components/layout/FeedbackFab";
import "./globals.css";
const ICON_SVG = assetResolver.resolve("projects/ciszukoantony/content/logos/images/outline/isotype/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg");
const OG_IMAGE = assetResolver.resolve("projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png");
const CHANNEL_ICON = assetResolver.resolve("projects/ciszukoantony/content/assets/youtube_canal.png");

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
  title: "Ciszuko Antony | CEO & Founder of Ciszuko Network",
  description: "Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network. Innovation, development and technology.",
  keywords: ["Ciszuko Antony", "Ciszuko Network", "portfolio", "developer", "Venezuela", "CEO", "technology"],
  icons: {
    icon: CHANNEL_ICON,
    apple: CHANNEL_ICON,
  },
  appleWebApp: { capable: true, title: "Ciszuko Antony", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Ciszuko Antony | CEO & Founder of Ciszuko Network",
    description: "Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network.",
    url: "https://ciszukoantony.vercel.app",
    siteName: "Ciszuko Antony",
    images: [{ url: OG_IMAGE, width: 132, height: 118 }],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${exo2.variable} ${rajdhani.variable}`}>
      <body className="bg-black text-white min-h-screen font-sans flex flex-col">
        <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={ICON_SVG} title="Ciszuko Antony" subtitle="Ciszuko Antony Security • Cloudflare" accent="#a78bfa" storageKey="cf_verified_ciszukoantony">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CloudflareGuard>
        <PwaRegister />
        <FabStackProvider>
          <InstallPdwaButton site="Ciszuko Antony" accent="#a78bfa" accentAlt="#22d3ee" />
          <FeedbackFab />
        </FabStackProvider>
        <PostHogAnalytics app="ciszukoantony" />
        <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
      </body>
    </html>
  );
}
