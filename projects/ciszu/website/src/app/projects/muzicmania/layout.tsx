import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — MUZICMANIA',
  description: 'MuzicMania, el juego de ritmo definitivo desarrollado por Ciszu Network.',
};

export default function MuzicManiaLayout({ children }: { children: React.ReactNode }) {
  return children;
}