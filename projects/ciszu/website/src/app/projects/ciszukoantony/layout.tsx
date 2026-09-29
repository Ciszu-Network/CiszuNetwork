import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZUKO ANTONY',
  description: 'Proyecto artístico de Ciszuko Antony: contenido gaming, música y tecnología.',
};

export default function CiszukoAntonyLayout({ children }: { children: React.ReactNode }) {
  return children;
}