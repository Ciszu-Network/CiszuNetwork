import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | DESCARGAS',
  description:
    'Descarga CiszuBot como PDWA (App de Escritorio Progresiva): instalación sin pestañas, con icono propio en tu escritorio y barra de tareas.',
};

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
