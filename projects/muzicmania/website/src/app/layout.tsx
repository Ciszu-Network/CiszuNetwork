import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2, Rajdhani } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton } from "@ciszu/ui";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-rajdhani",
});

const ICON_SVG = assetResolver.resolve("projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg");

export const viewport = {
  themeColor: "#000000",
};

/** @type {import('next').Metadata} */
export const metadata = {
  title: "MuzicMania",
  description: "El Juego de Ritmo Definitivo en la Web. Domina el beat en una dimensión online con estética futurista.",
  appleWebApp: { capable: true, title: "MuzicMania", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: ICON_SVG,
    shortcut: ICON_SVG,
    apple: ICON_SVG,
  },
};

import { CookiesBanner } from "@/components/atoms/CookiesBanner";
import { CloudflareGuard } from "@/components/layout/CloudflareGuard";
import { ConnectivityBanner } from "@/components/layout/ConnectivityBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className={`${exo2.variable} ${rajdhani.variable}`}>
      <body className="bg-black text-white min-h-screen font-sans flex flex-col">
        {/* AuthProvider: hidrata el store global con la sesión de Supabase en cada carga */}
        <AuthProvider>
          <CloudflareGuard>
            <Navbar />
            <ConnectivityBanner />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
            <CookiesBanner />
            <SpeedInsights />
          </CloudflareGuard>
        </AuthProvider>
        <PwaRegister />
        <InstallPdwaButton site="MuzicMania" accent="#00f0ff" accentAlt="#ff33cc" desktopAppHref="/download" />
        <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
      </body>
    </html>
  );
}
