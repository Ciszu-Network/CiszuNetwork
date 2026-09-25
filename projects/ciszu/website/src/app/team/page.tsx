import type { Metadata } from 'next';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  InfoHero,
  InfoCardGrid,
  InfoSteps,
  InfoCtaRow,
  SocialIcon,
  type InfoTheme,
  type InfoCardItem,
  type InfoStepGroup,
  type SocialPlatform,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import { CISZUKO_ANTONY, CISZU_NETWORK } from '@/config/site';

export const metadata: Metadata = {
  title: 'Ciszu Network | TEAM',
  description: 'Conoce al equipo de Ciszu Network y la visión de su fundador, Ciszuko Antony.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const SKILLS = [
  'Next.js / React',
  'TypeScript',
  'Tailwind CSS',
  'Supabase / Postgres',
  'Discord.js',
  'Diseño UI/UX',
  'Infraestructura Cloud',
  'Automatización & IA',
];

const SOCIALS = Object.entries(CISZUKO_ANTONY.social).filter(([key]) => key !== 'discordTag');

const ROLES: InfoCardItem[] = [
  {
    icon: 'crown',
    title: 'Dirección',
    body: 'Define la hoja de ruta del ecosistema, la identidad de marca y aprueba cada publicación y despliegue.',
  },
  {
    icon: 'terminal',
    title: 'Desarrollo',
    body: 'Webs, APIs, bots y automatizaciones. Todo el código vive en el GitHub de Ciszu Network.',
  },
  {
    icon: 'palette',
    title: 'Diseño',
    body: 'Logos, iconografía SVG, paletas y el sistema de UI compartido por las cuatro webs del ecosistema.',
  },
  {
    icon: 'server',
    title: 'Infraestructura',
    body: 'Despliegues en Vercel, base de datos Supabase, CDN de assets y monitorización de uptime.',
  },
];

const STEPS: InfoStepGroup[] = [
  {
    title: 'Únete a la comunidad',
    body: 'El punto de entrada es el servidor de Discord y la comunidad de CiszuGamens, donde se anuncian las vacantes y colaboraciones.',
  },
  {
    title: 'Elige un área',
    body: 'Desarrollo, diseño, traducción, moderación o soporte. Se valora cualquier aporte, no solo el código.',
  },
  {
    title: 'Presenta tu propuesta',
    body: 'Abre un issue o un pull request en GitHub con la idea y el alcance. Se revisa y se responde siempre.',
  },
  {
    title: 'Publicación con crédito',
    body: 'Cada aporte aceptado se publica en el changelog con su autoría visible en la ficha del cambio.',
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <InfoHero
          icon="users"
          title="Equipo"
          subtitle={`Quién está detrás de ${CISZU_NETWORK.name}: el fundador, los roles que cubre el ecosistema y cómo entrar a colaborar.`}
          theme={THEME}
        />

        {/* Fundador */}
        <section
          className={`mb-14 p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden ${THEME.border} ${THEME.card}`}
        >
          <div className="relative z-10">
            <Image
              src={assetResolver.resolve('shared/images/francisco_selfie/IMG_20251207_001632@893898207.jpg')}
              alt={CISZUKO_ANTONY.name}
              width={132}
              height={132}
              className="rounded-full object-cover mx-auto mb-6 border-2 border-brand-light/40 w-32 h-32"
            />
            <h2 className="text-3xl font-header font-black text-white uppercase tracking-tight">
              {CISZUKO_ANTONY.name}
            </h2>
            <p className="text-[11px] text-gray-500 mt-1">Francisco Antonio García Menolascina</p>
            <p className={`text-xs font-black uppercase tracking-[0.35em] mt-3 mb-6 ${THEME.accent}`}>
              {CISZUKO_ANTONY.role}
            </p>
            <p className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed mb-8">
              Fundador y única persona detrás de {CISZU_NETWORK.name}. Diseña, desarrolla y mantiene cada proyecto del
              ecosistema — desde la arquitectura cloud y las bases de datos hasta la identidad visual y el contenido —
              con base en Caracas, Venezuela.
            </p>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>Stack principal</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${THEME.accentBorder} ${THEME.accentBg} ${THEME.accent}`}
                >
                  {skill}
                </span>
              ))}
            </div>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>Redes oficiales</p>
            <div className="flex flex-wrap justify-center gap-3">
              {SOCIALS.map(([platform, href]) => (
                <a
                  key={platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={platform}
                  aria-label={platform}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${THEME.border} ${THEME.card}`}
                >
                  <SocialIcon platform={platform as SocialPlatform} size={20} colored />
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-14">
          <InfoCardGrid title="Áreas del ecosistema" items={ROLES} theme={THEME} columns={4} />
          <InfoSteps title="Cómo colaborar" steps={STEPS} theme={THEME} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Ver créditos', href: '/credits', icon: 'trophy' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
            { label: 'Únete al Discord', href: CISZUKO_ANTONY.social.discord, icon: 'support', variant: 'ghost', external: true },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
