import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CiszuBot - Bot de Discord",
  description: "Bot de Discord en español con múltiples funcionalidades para tu servidor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-dark text-white antialiased">{children}</body>
    </html>
  );
}
