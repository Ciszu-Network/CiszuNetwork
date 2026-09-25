import type { Metadata } from 'next';
import { CreditsRoll, type CreditSection } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';
import { CISZUKO_ANTONY, CISZU_NETWORK, DISCORD_SERVER } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'CiszuBot | CREDITS',
  description:
    'Créditos y contribuciones de CiszuBot: dirección, tecnologías base y proyectos del ecosistema Ciszu Network.',
};

const SECTIONS: CreditSection[] = [
  {
    title: 'Dirección y Desarrollo',
    credits: [
      { role: 'Fundador & Director General (CEO)', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Arquitecto de Software & Lead Developer', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Diseño de Interfaz (UI) & Experiencia (UX)', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Infraestructura Cloud & Despliegues', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Arquitectura de Base de Datos (Supabase)', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Dirección de Arte & Identidad Visual', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'Copywriting & Documentación', name: 'Ciszuko Antony (Francisco Garcia)' },
      { role: 'QA Lead & Soporte Técnico', name: 'Ciszuko Antony (Francisco Garcia)' },
    ],
  },
  {
    title: 'Motores y Tecnologías Base',
    credits: [
      { role: 'Framework Web y Panel', name: 'Next.js (Vercel)', link: 'https://nextjs.org' },
      { role: 'Librería de Componentes', name: 'React (Meta Platforms)', link: 'https://react.dev' },
      { role: 'Estilización y Diseño Visual', name: 'Tailwind CSS (Tailwind Labs)', link: 'https://tailwindcss.com' },
      { role: 'API de Discord y Gateway', name: 'Discord.js', link: 'https://discord.js.org' },
      { role: 'Runtime del Bot', name: 'Node.js', link: 'https://nodejs.org' },
      { role: 'Lenguaje y Tipado Estricto', name: 'TypeScript (Microsoft)', link: 'https://www.typescriptlang.org' },
      { role: 'Infraestructura Backend y Base de Datos', name: 'Supabase (Supabase Inc.)', link: 'https://supabase.com' },
      { role: 'Control de Estado Global', name: 'Zustand', link: 'https://zustand-demo.pmnd.rs/' },
    ],
  },
  {
    title: 'Proyectos del Ecosistema',
    credits: [
      { role: 'Juego de Ritmo', name: 'MuzicMania', link: 'https://muzicmania.vercel.app' },
      { role: 'Comunidad Gamer', name: 'CiszuGamens', link: DISCORD_SERVER },
      { role: 'Compañía de Innovación Digital', name: 'Ciszu Network', link: CISZU_NETWORK },
      { role: 'Portfolio del Fundador', name: 'Ciszuko Antony', link: CISZUKO_ANTONY },
    ],
  },
];

export default function CreditsPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <PageReveal>
            <CreditsRoll
              icon="users"
              title="CRÉDITOS Y CONTRIBUCIONES"
              subtitle="Desarrollo de CiszuBot · Ecosistema Ciszu Network"
              sections={SECTIONS}
              closing={{
                note: 'CiszuBot nació como herramienta interna de CiszuGamens y hoy es el bot oficial del ecosistema Ciszu Network. Cada comando, módulo y respuesta se construye y mantiene línea por línea desde Venezuela.',
                quote: 'Siempre en línea, siempre en tu servidor',
              }}
              theme={THEME}
            />
          </PageReveal>
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
