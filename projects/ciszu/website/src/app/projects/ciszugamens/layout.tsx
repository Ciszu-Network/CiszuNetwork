import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZUGAMENS',
  description: 'Ciszugamens: el servidor de la comunidad de Ciszu Network en Discord, WhatsApp y Telegram. Torneos, salas multijuego y comunidad hispanohablante.',
};

export default function CiszugamensLayout({ children }: { children: React.ReactNode }) {
  return children;
}