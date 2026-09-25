import type { Metadata } from 'next';
import { CreditsRoll, type CreditSection, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import { CISZU_NETWORK } from '@/config/site';

export const metadata: Metadata = {
  title: 'Ciszu Network | CREDITS',
  description:
    'Créditos y contribuciones del ecosistema Ciszu Network: equipo, proyecto y tecnologías base.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const SECTIONS: CreditSection[] = [
  {
    title: 'Dirección y Desarrollo Principal',
    credits: [
      { role: 'Fundador & Director General (CEO)', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Arquitecto de Software & Lead Developer', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Diseño de Interfaz (UI) & Experiencia (UX)', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Infraestructura Cloud & Despliegues', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Arquitectura de Base de Datos (Supabase)', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Dirección de Arte & Identidad Visual', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Copywriting & Documentación', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Estrategia de Producto & Roadmap', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'QA Lead & Soporte Técnico', name: 'Ciszuko Antony (Francisco Garcia)' },
    ],
  },
  {
    title: 'Motores y Tecnologías Base',
    credits: [
      { role: 'Framework Principal', name: 'Next.js (Vercel)', link: 'https://nextjs.org' },
      { role: 'Librería de Componentes', name: 'React (Meta Platforms)', link: 'https://react.dev' },
      { role: 'Estilización y Diseño Visual', name: 'Tailwind CSS (Tailwind Labs)', link: 'https://tailwindcss.com' },
      { role: 'Infraestructura Backend y Base de Datos', name: 'Supabase (Supabase Inc.)', link: 'https://supabase.com' },
      { role: 'CDN y Distribución de Assets', name: 'Supabase Storage + Vercel Edge Network', link: 'https://vercel.com' },
      { role: 'Control de Estado Global', name: 'Zustand', link: 'https://zustand-demo.pmnd.rs/' },
    ],
  },
  {
    title: 'Proyectos del Ecosistema',
    credits: [
      { role: 'Bot de Discord', name: 'CiszuBot', link: 'https://ciszubot.vercel.app' },
      { role: 'Juego de Ritmo', name: 'MuzicMania', link: 'https://muzicmania.vercel.app' },
      { role: 'Comunidad Gamer', name: 'CiszuGamens', link: 'https://discord.com/invite/W3kMtMMj6E' },
      { role: 'Portfolio del Fundador', name: 'Ciszuko Antony', link: 'https://ciszukoantony.vercel.app' },
    ],
  },
];

export default function CreditsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <CreditsRoll
          icon="users"
          title="CRÉDITOS Y CONTRIBUCIONES"
          subtitle="Desarrollo del Ecosistema Ciszu Network"
          sections={SECTIONS}
          closing={{
            note: `${CISZU_NETWORK.name} es un ecosistema digital dedicado a la innovación con propósito: desarrollo web, infraestructura cloud, bots y experiencias interactivas. Construido línea por línea desde Caracas, Venezuela.`,
            quote: 'Bright Future Promised',
          }}
          theme={THEME}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
