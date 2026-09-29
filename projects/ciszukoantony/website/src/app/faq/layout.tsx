import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | FAQ',
  description:
    'Preguntas frecuentes sobre Ciszuko Antony, Ciszu Network, sus proyectos, certificados y formas de contacto.',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
