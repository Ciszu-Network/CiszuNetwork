import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2, Rajdhani } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPdwaButton, PostHogAnalytics, FabStackProvider, ZoomWarning } from "@ciszu/ui";

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

/** @type {import('next').Metadata} */
export const metadata = {
  title: "MuzicMania",
  description: "El Juego de Ritmo Definitivo en la Web. Domina el beat en una dimensión online con estética futurista.",
  appleWebApp: { capable: true, title: "MuzicMania", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
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
  return (
    <html lang="es" className={`${exo2.variable} ${rajdhani.variable}`}>
      <body className="bg-black text-white min-h-screen font-sans flex flex-col">
        {/* AuthProvider: hidrata el store global con la sesión de Supabase en cada carga */}
        <AuthProvider>
          <CloudflareGuard>
            <Navbar />
            <ZoomWarning />
            <ConnectivityBanner />
            <main className="flex-grow pt-20">
              <NuqsAdapter>
                {children}
              </NuqsAdapter>
            </main>
            <Footer />
            <CookiesBanner />
          </CloudflareGuard>
        </AuthProvider>
        <SpeedInsights />
        <PwaRegister />
        <FabStackProvider>
          <InstallPdwaButton site="MuzicMania" accent="#00f0ff" accentAlt="#ff33cc" desktopAppHref="/download" />
          <FeedbackFab />
        </FabStackProvider>
        <PostHogAnalytics app="muzicmania" />
        <script defer type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "2fcf0eab8bf94fe7ad6495160673ab3d"}' />
      </body>
    </html>
  );
}
