import type { Metadata } from 'next';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  InfoHero,
  InfoCardGrid,
  InfoSteps,
  InfoCtaRow,
  SocialIcon,
  CopyWithButton,
  Icon,
  type InfoTheme,
  type InfoCardItem,
  type InfoStepGroup,
  type SocialPlatform,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { CISZUKO_ANTONY, CISZU_NETWORK, GITHUB_REPO } from '@/config/site';

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

const PLATFORM_LABEL: Record<string, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
  github: 'GitHub',
  discord: 'Discord',
  tiktok: 'TikTok',
};

const FOUNDER_SOCIALS = Object.entries(CISZUKO_ANTONY.social).filter(([key]) => key !== 'discordTag');
const NETWORK_SOCIALS = Object.entries(CISZU_NETWORK.social);

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

function ContactField({
  label,
  value,
  icon,
  href,
  actionLabel,
}: {
  label: string;
  value: string;
  icon: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${THEME.border} ${THEME.card}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${THEME.accentBg} ${THEME.accent}`}>
          <Icon name={icon} size={18} />
        </span>
        <div className="min-w-0 text-left">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
          <CopyWithButton value={value} label={`Copiar ${label}`}>
            <span className="text-xs font-bold text-white truncate md:text-sm">{value}</span>
          </CopyWithButton>
        </div>
      </div>
      {href ? (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          title={actionLabel ?? label}
          aria-label={actionLabel ?? label}
          className={`shrink-0 rounded-lg border p-2 transition-all hover:scale-110 ${THEME.border} ${THEME.card} ${THEME.accent}`}
        >
          <Icon name="chevronRight" size={16} />
        </a>
      ) : null}
    </div>
  );
}

function SocialRow({ socials }: { socials: [string, string][] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {socials.map(([platform, href]) => (
        <a
          key={platform}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={PLATFORM_LABEL[platform] ?? platform}
          aria-label={PLATFORM_LABEL[platform] ?? platform}
          className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all hover:scale-110 ${THEME.border} ${THEME.card}`}
        >
          <SocialIcon platform={platform as SocialPlatform} size={20} colored />
        </a>
      ))}
    </div>
  );
}

export default function TeamPage() {
  const logo = assetResolver.resolve(
    'projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg',
  );

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="users"
          title="Equipo"
          subtitle={`Quién está detrás de ${CISZU_NETWORK.name}: el fundador, los roles que cubre el ecosistema y cómo entrar a colaborar.`}
          kicker="Compañía"
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
            <p className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed mb-6">
              Fundador y única persona detrás de {CISZU_NETWORK.name}. Diseña, desarrolla y mantiene cada proyecto del
              ecosistema — desde la arquitectura cloud y las bases de datos hasta la identidad visual y el contenido —
              con base en {CISZU_NETWORK.location}.
            </p>
            <p className={`mx-auto mb-8 max-w-2xl rounded-2xl border px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-300 ${THEME.accentBorder} ${THEME.accentBg}`}>
              Webs, bots, juego e infraestructura: todo el ecosistema se diseña y mantiene desde un único núcleo.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
              <ContactField
                label="Email personal"
                value={CISZUKO_ANTONY.email}
                icon="mail"
                href={`mailto:${CISZUKO_ANTONY.email}`}
                actionLabel="Escribir email"
              />
              <ContactField
                label="WhatsApp"
                value={CISZUKO_ANTONY.phone}
                icon="phone"
                href="https://wa.me/584126858111"
                actionLabel="Abrir WhatsApp"
              />
            </div>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>
              Redes personales
            </p>
            <SocialRow socials={FOUNDER_SOCIALS} />
          </div>
        </section>

        {/* Núcleo Ciszu Network */}
        <section
          className={`mb-14 p-8 md:p-12 rounded-3xl border relative overflow-hidden ${THEME.border} ${THEME.card}`}
        >
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border p-3 ${THEME.border} ${THEME.accentBg}`}>
              <Image src={logo} alt={CISZU_NETWORK.name} width={72} height={72} className="h-full w-full object-contain" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-header font-black uppercase tracking-tight text-white">
                Núcleo {CISZU_NETWORK.name}
              </h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${THEME.accent}`}>
                {CISZU_NETWORK.tagline}
              </p>
              <p className="max-w-2xl text-sm text-gray-400 leading-relaxed">
                Compañía de innovación digital: desarrollo web, infraestructura cloud, bots y experiencias
                interactivas. Cuatro webs en producción y una sola identidad técnica.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ContactField
              label="Email corporativo"
              value={CISZU_NETWORK.email}
              icon="mail"
              href={`mailto:${CISZU_NETWORK.email}`}
              actionLabel="Escribir email"
            />
            <ContactField
              label="Teléfono"
              value={CISZU_NETWORK.phone}
              icon="phone"
              href="https://wa.me/584126858111"
              actionLabel="Abrir WhatsApp"
            />
            <ContactField label="Ubicación" value={CISZU_NETWORK.location} icon="globe" />
            <ContactField label="Zona horaria" value={CISZU_NETWORK.timezone} icon="clock" />
          </div>

          <div className="mt-8 space-y-4">
            <p className={`text-center text-[10px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
              Canales de la red
            </p>
            <SocialRow socials={NETWORK_SOCIALS} />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all hover:scale-105 ${THEME.accentBorder} ${THEME.accentBg} ${THEME.accent}`}
            >
              <Icon name="code" size={16} />
              Repositorio en GitHub
            </a>
            <a
              href={CISZUKO_ANTONY.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 ${THEME.border} ${THEME.card}`}
            >
              <Icon name="globe" size={16} />
              Portfolio del fundador
            </a>
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
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
