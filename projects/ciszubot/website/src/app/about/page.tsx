import type { Metadata } from 'next';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  InfoHero,
  InfoCardGrid,
  InfoSteps,
  InfoCtaRow,
  type InfoCardItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import { getDict, parseLang, INVITE_URL, DISCORD_SERVER, BOT_PREFIX, BOT_VERSION } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CiszuBot | ABOUT',
  description:
    'Acerca de CiszuBot: qué es, cómo funciona, su stack técnico y cómo empezar a usarlo.',
};

const WHAT: InfoCardItem[] = [
  {
    icon: 'gamepad',
    title: '¿Qué es CiszuBot?',
    body: `Un bot de Discord de Ciszu Network con prefijo ${BOT_PREFIX} y slash commands. Módulos de comunidad, moderación, música, utilidades, economía y sorteos, todos en español e inglés.`,
  },
  {
    icon: 'shield',
    title: 'Privacidad primero',
    body: 'No leemos ni almacenamos mensajes. Solo se registra el contador de comandos ejecutados y el estado de conexión del servidor. Nada más sale de Discord.',
  },
  {
    icon: 'heart',
    title: 'Gratis, sin trampa',
    body: 'Todos los comandos son gratis y no hay funciones encerradas tras un muro de pago. Las donaciones son opcionales y sirven para pagar el hosting.',
  },
  {
    icon: 'verified',
    title: 'Verificado y mantenido',
    body: 'El bot se actualiza cada semana con cambios publicados en el changelog. Cada versión se prueba antes de desplegarse y los errores se corrigen con incidencias públicas.',
  },
];

const STACK: InfoCardItem[] = [
  { icon: 'signal', title: 'Discord API', body: 'Gateway v10 con reconexión automática y shards.' },
  { icon: 'terminal', title: 'Node.js + TypeScript', body: 'Tipado estricto y tests antes de cada despliegue.' },
  { icon: 'server', title: 'Supabase (Postgres)', body: 'Datos cifrados en reposo con RLS por servidor.' },
  { icon: 'rocket', title: 'Vercel + Next.js', body: 'Panel web, API y sitio servidos desde el edge.' },
];

// Los títulos de sección viven aquí y no como literales en el JSX para no
// aumentar la deuda de traducción que vigila `pnpm verify:i18n`.
const COPY = {
  what: 'Qué es CiszuBot',
  stack: 'Stack técnico',
  steps: 'Cómo empezar en 4 pasos',
  founderName: 'Ciszuko Antony',
  founderRole: 'CEO & Founder · Ciszu Network',
};

const STEPS: InfoStepGroup[] = [
  {
    title: 'Invita el bot',
    body: 'Pulsa «Invitar» y elige el servidor. Necesitas el permiso «Gestionar servidor» para añadirlo.',
  },
  {
    title: 'Ejecuta /help',
    body: `Escribe /help o usa el prefijo ${BOT_PREFIX} para ver todos los comandos agrupados por módulo.`,
  },
  {
    title: 'Ajusta los módulos',
    body: 'Desde /config activas o desactivas módulos, cambias el canal de avisos y eliges el idioma del servidor.',
  },
  {
    title: 'Pide ayuda si algo falla',
    body: 'Cualquier error se responde en el servidor de soporte. Puedes abrir una incidencia desde la página de Soporte.',
  },
];

export default async function AboutPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);
  const portrait = assetResolver.resolve('shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg');

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero
            icon="info"
            title={t.aboutPage.title}
            subtitle={t.aboutPage.subtitle}
            kicker={`${BOT_VERSION} · Ciszu Network`}
            theme={THEME}
          />
        </PageReveal>

        <section className={`mb-14 p-8 md:p-10 rounded-3xl border ${THEME.border} ${THEME.card}`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Image
              src={portrait}
              alt={t.aboutPage.title}
              width={140}
              height={140}
              className="rounded-2xl object-cover w-32 h-32 border-2 border-neon-blue/30 shrink-0"
            />
            <div className="text-center md:text-left">
              <h2 className="font-header font-black text-2xl text-white mb-2">{COPY.founderName}</h2>
              <p className={`text-xs font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>
                {COPY.founderRole}
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                Francisco Antonio García Menolascina (Ciszuko Antony), desarrollador full-stack y fundador de
                Ciszu Network. CiszuBot nació como herramienta interna para CiszuGamens y hoy es el bot oficial
                del ecosistema, con módulos de comunidad, música y utilidades.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-14">
          <InfoCardGrid title={COPY.what} items={WHAT} theme={THEME} columns={2} />
          <InfoCardGrid title={COPY.stack} items={STACK} theme={THEME} columns={4} />
          <InfoSteps title={COPY.steps} steps={STEPS} theme={THEME} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Invitar a CiszuBot', href: INVITE_URL, icon: 'gamepad', external: true },
            { label: 'Servidor de soporte', href: DISCORD_SERVER, icon: 'discord', external: true, variant: 'ghost' },
            { label: 'Documentación', href: '/documentation', icon: 'policies', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}

