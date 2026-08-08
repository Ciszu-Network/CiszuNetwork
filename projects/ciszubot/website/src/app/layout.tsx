import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getDict, type Lang } from "@/lib/i18n";
import { assetResolver } from "@ciszunetwork/cdn";
import { PwaRegister, InstallPwaButton } from "@ciszu/ui";
import { getSessionData } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const themeScript = `
(function () {
  try {
    var t = document.cookie.match(/(?:^|; )ciszubot_theme=([^;]*)/);
    var theme = t ? t[1] : 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

const LOGO_ISOTIPO_CIRCLE = assetResolver.resolve('projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png');

export const viewport = {
  themeColor: "#12141a",
};
export const metadata: Metadata = {
  title: "CiszuBot — Bot de Discord de Ciszu Network",
  description:
    "El bot de Discord de Ciszu Network. Comandos divertidos, de información y utilidad con prefijo cz! y slash commands. Moderno, rápido y en español.",
  appleWebApp: { capable: true, title: "CiszuBot", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: LOGO_ISOTIPO_CIRCLE,
    shortcut: LOGO_ISOTIPO_CIRCLE,
    apple: LOGO_ISOTIPO_CIRCLE,
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const lang = (store.get("ciszubot_lang")?.value ?? "es") as Lang;
  const dict = getDict(lang);
  const session = await getSessionData();

  return (
    <html lang={lang} className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg text-ink min-h-screen font-sans flex flex-col">
        <Navbar lang={lang} dict={dict} account={session} />
        <main className="flex-grow pt-[60px]">{children}</main>
        <Footer lang={lang} dict={dict} />
        <PwaRegister />
        <InstallPwaButton />
      </body>
    </html>
  );
}
