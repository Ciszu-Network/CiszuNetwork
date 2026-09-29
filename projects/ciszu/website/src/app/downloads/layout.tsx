import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | DESCARGAS',
  description: 'Instala Ciszu Network como PDWA (App de Escritorio Progresiva) en tu PC o móvil, sin pestañas ni barra de dirección.',
};

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
