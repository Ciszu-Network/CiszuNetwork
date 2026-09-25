import type { Metadata } from 'next';
import { CreditsRoll, type CreditSection, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | CREDITS',
  description:
    'Créditos del portfolio de Ciszuko Antony: autoría y dirección, tecnologías base y proyectos del ecosistema Ciszu Network.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const SECTIONS: CreditSection[] = [
  {
    title: 'Autor y Dirección',
    credits: [
      { role: 'Fundador & Director General (CEO)', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Arquitecto de Software & Lead Developer', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Diseño de Interfaz (UI) & Experiencia (UX)', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Dirección de Arte & Identidad Visual', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Contenido, Edición y Producción Audiovisual', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Composición Musical & Producción de Audio', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Infraestructura Cloud & Despliegues', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Documentación & Copywriting', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Estrategia de Producto & Roadmap', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'QA & Soporte Técnico', name: 'Ciszuko Antony (Francisco Garcia)' },
    ],
  },
  {
    title: 'Motores y Tecnologías Base',
    credits: [
      { role: 'Framework Principal', name: 'Next.js (Vercel)', link: 'https://nextjs.org' },
      { role: 'Librería de Componentes', name: 'React (Meta Platforms)', link: 'https://react.dev' },
      { role: 'Estilización y Diseño Visual', name: 'Tailwind CSS (Tailwind Labs)', link: 'https://tailwindcss.com' },
      { role: 'Infraestructura Backend y Base de Datos', name: 'Supabase (Supabase Inc.)', link: 'https://supabase.com' },
      { role: 'Motor de Animaciones', name: 'Framer Motion (Framer)', link: 'https://www.framer.com/motion/' },
      { role: 'Control de Estado Global', name: 'Zustand', link: 'https://zustand-demo.pmnd.rs/' },
    ],
  },
  {
    title: 'Proyectos y Presencia',
    credits: [
      { role: 'Ecosistema Digital', name: 'Ciszu Network', link: 'https://ciszunetwork.vercel.app' },
      { role: 'Juego de Ritmo', name: 'MuzicMania', link: 'https://muzicmania.vercel.app' },
      { role: 'Bot de Discord', name: 'CiszuBot', link: 'https://ciszubot.vercel.app' },
      { role: 'Comunidad Gamer', name: 'CiszuGamens', link: 'https://discord.com/invite/W3kMtMMj6E' },
    ],
  },
];

export default function CreditsPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <CreditsRoll
          icon="trophy"
          title="Créditos y contribuciones"
          subtitle="Autoría y desarrollo del portfolio"
          sections={SECTIONS}
          closing={{
            note: 'Ciszuko Antony es el portfolio oficial de Francisco Garcia (Ciszuko Antony): proyectos, certificados, música y documentación técnica reunidos en un solo lugar, construidos línea por línea desde Venezuela.',
            quote: 'Innovation with Purpose',
          }}
          theme={THEME}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
