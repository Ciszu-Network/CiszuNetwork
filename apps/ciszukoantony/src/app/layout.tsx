import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Exo_2, Rajdhani } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ciszukoantony.vercel.app"),
  title: "Ciszuko Antony | CEO & Founder of Ciszuko Network",
  description: "Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network. Innovation, development and technology.",
  keywords: ["Ciszuko Antony", "Ciszuko Network", "portfolio", "developer", "Venezuela", "CEO", "technology"],
  icons: {
    icon: "/logos/favicon.svg",
    apple: "/logos/imagen/outline/isotipo/degradado/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.svg",
  },
  openGraph: {
    title: "Ciszuko Antony | CEO & Founder of Ciszuko Network",
    description: "Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — CEO & Founder of Ciszuko Network.",
    url: "https://ciszukoantony.vercel.app",
    siteName: "Ciszuko Antony",
    images: [{ url: "/logos/imagen/outline/isotipo/degradado/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png", width: 132, height: 118 }],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${exo2.variable} ${rajdhani.variable}`}>
      <body className="bg-black text-white min-h-screen font-sans flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
