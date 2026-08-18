import type { Metadata } from "next";
import HomeContent from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "MuzicMania | HOME",
  description: "El Juego de Ritmo Definitivo en la Web. Domina el beat en una dimensión online con estética futurista.",
};

export default function Home() {
  return <HomeContent />;
}