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
  title: "CiszuBot — Bot de Discord de Ciszu Network",
  description:
    "El bot de Discord de Ciszu Network. Comandos divertidos, de información y utilidad con prefijo cz! y slash commands. Moderno, rápido y en español.",
  icons: {
    icon: "/apps/ciszubot/content/logos/imagen/not outline/isotipo/color/ciszubot_logo_isotipo_color.png",
    shortcut: "/apps/ciszubot/content/logos/imagen/not outline/isotipo/color/ciszubot_logo_isotipo_color.png",
    apple: "/apps/ciszubot/content/logos/imagen/not outline/isotipo/color/ciszubot_logo_isotipo_color.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${exo2.variable} ${rajdhani.variable}`}>
      <body className="bg-black text-white min-h-screen font-sans flex flex-col">
        <Navbar />
        <main className="flex-grow pt-[60px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
