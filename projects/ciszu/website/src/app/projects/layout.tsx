import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS',
  description:
    'Todos los proyectos de Ciszu Network: CiszuGamens, CiszuBot, MuzicMania, Ciszu Network y Ciszuko Antony. Comunidad, bots, juegos y desarrollo.',
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
