import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZUBOT',
  description: 'CiszuBot: el bot inteligente de Discord del ecosistema. Moderación, música, juegos, economía y automatización.',
};

export default function CiszubotLayout({ children }: { children: React.ReactNode }) {
  return children;
}