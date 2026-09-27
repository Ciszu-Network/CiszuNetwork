import type { Metadata } from "next";
import HomeContent from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: 'Ciszu Network | HOME',
  description:
    'Página principal de Ciszu Network: ecosistema de proyectos (CiszuBot, MuzicMania, Ciszugamens, Ciszuko Antony), servicios reales, stack tecnológico, últimas novedades y reseñas de la comunidad.',
};

export default function Home() {
  return <HomeContent />;
}
