import type { Metadata } from 'next';
import {
  InfoHero,
  InfoAccordion,
  InfoCardGrid,
  InfoCtaRow,
  type InfoTheme,
  type InfoAccordionItem,
  type InfoCardItem,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszu Network | FAQ',
  description: 'Preguntas frecuentes sobre Ciszu Network, sus servicios y proyectos.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const FAQS: InfoAccordionItem[] = [
  {
    q: '¿Qué es Ciszu Network?',
    a: 'Ciszu Network es una compañía de innovación digital fundada por Ciszuko Antony. Desarrollamos soluciones web, infraestructura cloud, bots, servidores de juego y experiencias digitales.',
  },
  {
    q: '¿Qué servicios ofrecen?',
    a: 'Ofrecemos desarrollo web (Next.js, React, TypeScript), infraestructura cloud (Vercel, Supabase), diseño UI/UX, bots para Discord/WhatsApp/Telegram, servidores de Minecraft y consultoría tecnológica.',
  },
  {
    q: '¿Cómo puedo contactarlos?',
    a: 'Puedes contactarnos a través de nuestro formulario en la página de Contacto, por correo a ciszunetwork@outlook.com, o directamente por WhatsApp al +58 412 6858111.',
  },
  {
    q: '¿MuzicMania es parte de Ciszu Network?',
    a: 'Sí, MuzicMania es un proyecto de juego de ritmo desarrollado por Ciszu Network. Puedes probarlo en muzicmania.vercel.app.',
  },
  {
    q: '¿Tienen servidores de Minecraft?',
    a: 'Sí, desarrollamos texture packs, mods y administramos servidores Minecraft con identidad Ciszu. Consulta nuestra sección de proyectos para más información.',
  },
  {
    q: '¿Ofrecen bots para Discord?',
    a: 'Sí, creamos bots personalizados para Discord con diversas funcionalidades. También administramos servidores comunitarios y el bot oficial CiszuBot.',
  },
  {
    q: '¿Dónde están ubicados?',
    a: 'Nuestra sede está en Coro, Falcón, Venezuela. Operamos en horario GMT-4 con disponibilidad 24/7.',
  },
  {
    q: '¿Cuál es el horario de atención?',
    a: 'Estamos disponibles 24/7, todos los días del año. Puedes contactarnos en cualquier momento por los canales oficiales.',
  },
  {
    q: '¿Qué es CISZU ID?',
    a: 'CISZU ID es la cuenta única del ecosistema: con ella sincronizas perfil, preferencias y progreso entre todas las webs y servicios de Ciszu Network.',
  },
  {
    q: '¿Cómo puedo apoyar el proyecto?',
    a: 'Puedes donar a través de Ko-fi, Patreon o criptomonedas desde la página de Donate, o simplemente compartiendo nuestros proyectos.',
  },
];

const TOPICS: InfoCardItem[] = [
  {
    icon: 'info',
    title: 'Sobre la compañía',
    body: 'Quiénes somos, qué hacemos y cómo trabajamos. Consulta la sección de información o la página del equipo.',
  },
  {
    icon: 'rocket',
    title: 'Proyectos y servicios',
    body: 'CiszuBot, MuzicMania, CiszuGamens, portfolio y más. Cada proyecto tiene su página con detalles y enlaces.',
  },
  {
    icon: 'lock',
    title: 'Privacidad y legal',
    body: 'Consulta la Política de Privacidad, las Reglas de la comunidad y la Licencia del software.',
  },
];

export default function FAQPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="faq"
          title="Preguntas frecuentes"
          subtitle="Respuestas rápidas a las dudas más comunes sobre Ciszu Network, sus proyectos y servicios."
          kicker="FAQ"
          theme={THEME}
        />

        <div className="space-y-14">
          <InfoAccordion items={FAQS} theme={THEME} />
          <InfoCardGrid title="Temas relacionados" items={TOPICS} theme={THEME} columns={3} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Centro de ayuda', href: '/help', icon: 'help' },
            { label: 'Abrir incidencia', href: '/support', icon: 'support', variant: 'ghost' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
