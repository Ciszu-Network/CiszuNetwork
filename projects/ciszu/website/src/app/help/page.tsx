import type { Metadata } from 'next';
import {
  InfoHero,
  InfoLinkGrid,
  InfoAccordion,
  InfoSteps,
  InfoCtaRow,
  type InfoTheme,
  type InfoLinkGroup,
  type InfoAccordionItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszu Network | HELP',
  description:
    'Centro de ayuda de Ciszu Network: categorías, preguntas frecuentes, solución de problemas y canales de soporte.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const COPY = {
  page: 'Help',
  faq: 'Preguntas frecuentes',
  troubleshooting: 'Solución de problemas',
};

const CATEGORIES: InfoLinkGroup[] = [
  {
    title: 'Empezar',
    items: [
      { name: 'Qué hacemos', href: '/about', icon: 'info', desc: 'Misión, visión y compañía' },
      { name: 'Proyectos', href: '/projects', icon: 'rocket', desc: 'CiszuGamens, CiszuBot, MuzicMania y más' },
      { name: 'Courses', href: '/courses', icon: 'certificates', desc: 'Formación y recursos' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { name: 'Preguntas frecuentes', href: '/faq', icon: 'faq', desc: 'Respuestas rápidas a lo más común' },
      { name: 'Abrir incidencia', href: '/support', icon: 'support', desc: 'Reporta un fallo con seguimiento' },
      { name: 'Contacto', href: '/contact', icon: 'mail', desc: 'Correo, WhatsApp y redes oficiales' },
    ],
  },
];

const FAQS: InfoAccordionItem[] = [
  {
    q: '¿Cómo contacto con soporte?',
    a: 'Puedes contactarnos por email en ciszunetwork@outlook.com o a través de nuestro servidor de Discord.',
  },
  {
    q: '¿Dónde está la documentación?',
    a: 'La documentación técnica está disponible en la sección de Documentation de esta web.',
  },
  {
    q: '¿Cómo reporto un bug?',
    a: 'Usa el formulario de Feedback o abre un issue en GitHub.',
  },
  {
    q: '¿Ofrecen soporte 24/7?',
    a: 'Sí, operamos 24/7 con respuesta prioritaria para clientes y comunidad.',
  },
  {
    q: '¿Puedo colaborar en los proyectos?',
    a: 'Claro, revisa nuestros repositorios en GitHub para ver cómo contribuir.',
  },
  {
    q: '¿Cómo donar al proyecto?',
    a: 'Puedes donar a través de Patreon, Ko-fi o criptomonedas en la sección de Donate.',
  },
];

const STEPS: InfoStepGroup[] = [
  {
    title: 'Mira si ya está resuelto',
    body: 'Revisa la FAQ y la documentación: la mayoría de dudas de uso están cubiertas ahí.',
  },
  {
    title: 'Recolecta los datos del problema',
    body: 'Página afectada, navegador, sistema y el paso exacto que falló. Una captura acelera mucho el diagnóstico.',
  },
  {
    title: 'Abre una incidencia o reporta el bug',
    body: 'Usa la página de Soporte para incidencias con seguimiento o Feedback para sugerencias y errores puntuales.',
  },
  {
    title: 'Sigue el changelog',
    body: 'Las correcciones se documentan con su versión en el changelog del ecosistema.',
  },
];

export default function HelpPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="help"
          title={COPY.page}
          subtitle="Centro de ayuda de Ciszu Network: guías, preguntas frecuentes, solución de problemas y canales de soporte."
          kicker="Soporte"
          theme={THEME}
        />

        <div className="space-y-14">
          <InfoLinkGrid groups={CATEGORIES} theme={THEME} />

          <section>
            <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
              {COPY.faq}
            </h2>
            <InfoAccordion items={FAQS} theme={THEME} />
          </section>

          <InfoSteps title={COPY.troubleshooting} steps={STEPS} theme={THEME} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Abrir incidencia', href: '/support', icon: 'support' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
            { label: 'Ver documentación', href: '/documentation', icon: 'policies', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
