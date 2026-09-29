import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | TEAM',
  description:
    'Equipo detrás de CiszuBot: quién lo crea, qué roles existen y cómo colaborar en Ciszu Network.',
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
