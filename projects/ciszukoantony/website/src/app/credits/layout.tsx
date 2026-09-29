import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | CREDITS',
  description:
    'Créditos del portfolio de Ciszuko Antony: autoría y dirección, tecnologías base y proyectos del ecosistema Ciszu Network.',
};

export default function CreditsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
