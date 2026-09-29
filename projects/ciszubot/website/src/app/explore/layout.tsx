import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CiszuBot | EXPLORE',
  description:
    'Todas las plataformas oficiales de CiszuBot y Ciszu Network (Top.gg, Discord Bot List, Disboard y Ciszugamens): vota, deja tu reseña, únete a la comunidad y copia los widgets de estado.',
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
