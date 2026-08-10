import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, CloudflareGuard, PostHogAnalytics } from "@ciszu/ui";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ZoomWarning } from "@/components/layout/ZoomWarning";
import { CISZU_NETWORK } from "@/config/site";
import "./globals.css";

const ICON_SVG = assetResolver.resolve("projects/ciszukoantony/content/logos/images/outline/isotype/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg");

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
    apple: ICON_SVG,
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className={`${ibmPlex.variable} ${ibmPlexCondensed.variable}`}>
      <body className="bg-black text-white min-h-screen font-sans flex flex-col">
        <CloudflareGuard siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} logo={ICON_SVG} title="Ciszu Network" subtitle="Ciszu Network Security • Cloudflare" accent="#22d3ee" storageKey="cf_verified_ciszu">
          <ZoomWarning />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CloudflareGuard>
        <PwaRegister />
        <InstallPdwaButton site="Ciszu Network" accent="#22d3ee" accentAlt="#f472b6" />
        <PostHogAnalytics app="ciszunetwork" />
        <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
      </body>
    </html>
  );
}
