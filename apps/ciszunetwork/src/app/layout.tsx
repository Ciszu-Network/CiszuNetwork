import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ZoomWarning } from "@/components/layout/ZoomWarning";
import { CISZU_NETWORK } from "@/config/site";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Ciszu Network — Innovación Digital",
  description: "Ciszu Network desarrolla soluciones digitales de alto rendimiento. Liderados por Ciszuko Antony, CEO. Proyectos: MuzicMania, Minecraft, Discord, WhatsApp, Telegram y más.",
  keywords: ["Ciszu Network", "Ciszuko Antony", "MuzicMania", "desarrollo web", "Next.js", "Venezuela"],
  icons: {
    icon: "/logos/imagen/outline/isotipo/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg",
    shortcut: "/logos/imagen/outline/isotipo/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg",
    apple: "/logos/imagen/outline/isotipo/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg",
  },
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
        <ZoomWarning />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
