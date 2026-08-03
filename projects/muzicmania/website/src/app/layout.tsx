import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2, Rajdhani } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-rajdhani",
});

/** @type {import('next').Metadata} */
export const metadata = {
  title: "MuzicMania",
  description: "El Juego de Ritmo Definitivo en la Web. Domina el beat en una dimensión online con estética futurista.",
  icons: {
    icon: "/logos/imagen/not outline/isotipo/degradado/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg",
    shortcut: "/logos/imagen/not outline/isotipo/degradado/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg",
    apple: "/logos/imagen/not outline/isotipo/degradado/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg",
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
      </body>
    </html>
  );
}
