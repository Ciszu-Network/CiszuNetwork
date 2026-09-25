import type { Metadata } from 'next';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  InfoHero,
  InfoCardGrid,
  InfoSteps,
  InfoCtaRow,
  SocialIcon,
  CopyWithButton,
  Icon,
  type InfoCardItem,
  type InfoStepGroup,
  type SocialPlatform,
} from '@ciszu/ui';
import {
  getDict,
  parseLang,
  DISCORD_SERVER,
  GITHUB_ORG,
  GITHUB_REPO,
  YOUTUBE,
  INSTAGRAM,
  X_SOCIAL,
  FACEBOOK,
  FEEDBACK_EMAIL,
  CISZU_NETWORK,
  CISZUKO_ANTONY,
} from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'CiszuBot | TEAM',
  description:
    'Equipo detrás de CiszuBot: quién lo crea, qué roles existen y cómo colaborar en Ciszu Network.',
};

const MUZICMANIA = 'https://muzicmania.vercel.app';

const COPY = {
  founder: 'Ciszuko Antony',
  founderLegal: 'Francisco Antonio García Menolascina',
  founderRole: 'CEO & Founder · Ciszu Network',
  founderBio:
    'Desarrollador full-stack venezolano. Crea y mantiene CiszuBot, MuzicMania, Ciszu Network y el resto del ecosistema. Diseña la arquitectura, escribe los módulos del bot y revisa cada despliegue antes de publicarse.',
  founderQuote: 'Un solo núcleo mantiene el bot, las webs, el juego y toda la infraestructura del ecosistema.',
  contactTitle: 'Contacto directo',
  skillsTitle: 'Stack y disciplinas',
  socialsTitle: 'Canales oficiales',
  rolesTitle: 'Roles del ecosistema',
  joinTitle: 'Cómo colaborar',
  networkTitle: 'Red del ecosistema',
  networkBody:
    'CiszuBot es una pieza de Ciszu Network. Estos son los proyectos hermanos y la comunidad donde vive el bot.',
};

const SKILLS = [
  'Next.js',
  'React',
  'TypeScript',
  'Node.js',
  'Discord.js',
  'Postgres / Supabase',
  'Tailwind CSS',
  'UI / UX',
  'Cloud & CI',
  'Python',
];

const CONTACT = [
  {
    label: 'Email de soporte',
    value: FEEDBACK_EMAIL,
    icon: 'mail',
    href: `mailto:${FEEDBACK_EMAIL}`,
    actionLabel: 'Escribir email',
  },
];

const SOCIALS: { name: string; href: string; platform: SocialPlatform }[] = [
  { name: 'GitHub', href: GITHUB_ORG, platform: 'github' },
  { name: 'Discord', href: DISCORD_SERVER, platform: 'discord' },
  { name: 'YouTube', href: YOUTUBE, platform: 'youtube' },
  { name: 'X', href: X_SOCIAL, platform: 'x' },
  { name: 'Instagram', href: INSTAGRAM, platform: 'instagram' },
  { name: 'Facebook', href: FACEBOOK, platform: 'facebook' },
];

const ECOSYSTEM = [
  {
    name: 'Ciszu Network',
    desc: 'Web principal y centro de documentación del ecosistema.',
    href: CISZU_NETWORK,
    icon: 'globe',
  },
  {
    name: 'Ciszuko Antony',
    desc: 'Portfolio del fundador: proyectos, medios y música.',
    href: CISZUKO_ANTONY,
    icon: 'user',
  },
  {
    name: 'MuzicMania',
    desc: 'Juego de ritmo para web con clasificaciones y app de escritorio.',
    href: MUZICMANIA,
    icon: 'music',
  },
  {
    name: 'CiszuGamens',
    desc: 'Comunidad en Discord donde se anuncian bots, eventos y vacantes.',
    href: DISCORD_SERVER,
    icon: 'discord',
  },
];

const ROLES: InfoCardItem[] = [
  {
    icon: 'crown',
    title: 'Founder & CEO',
    body: 'Ciszuko Antony define la hoja de ruta, la arquitectura y aprueba cada versión publicada del bot.',
  },
  {
    icon: 'terminal',
    title: 'Desarrollo',
    body: 'Módulos del bot, panel web, API y base de datos. Hoy es un equipo unipersonal abierto a colaboradores.',
  },
  {
    icon: 'palette',
    title: 'Diseño y marca',
    body: 'Identidad visual, iconografía SVG y sistema de UI compartido entre las cuatro webs del ecosistema.',
  },
  {
    icon: 'headset',
    title: 'Soporte y comunidad',
    body: 'Atención en el servidor de Discord, moderación de CiszuGamens y respuesta de incidencias.',
  },
];

const STEPS: InfoStepGroup[] = [
  {
    title: 'Entra al servidor',
    body: 'Únete al Discord de Ciszu Network y preséntate en el canal de comunidad.',
  },
  {
    title: 'Elige un área',
    body: 'Desarrollo, diseño, traducción o soporte. Se busca ayuda en todas, no solo en código.',
  },
  {
    title: 'Muestra tu trabajo',
    body: 'Abre un issue o un pull request en GitHub con la propuesta. Todo el código del ecosistema es público.',
  },
  {
    title: 'Revisión y crédito',
    body: 'Cada aporte aceptado se publica en el changelog con su autoría. No hay aportes sin crédito.',
  },
];

export default async function TeamPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const t = getDict(lang);
  const portrait = assetResolver.resolve('shared/images/francisco_selfie/IMG_20251207_001632@893898207.jpg');

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero icon="users" title={t.teamPage.title} subtitle={t.teamPage.subtitle} theme={THEME} />
        </PageReveal>

        {/* Fundador */}
        <section
          className={`mb-14 p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden ${THEME.border} ${THEME.card}`}
        >
          <div className="relative z-10">
            <Image
              src={portrait}
              alt={COPY.founder}
              width={132}
              height={132}
              className="rounded-full object-cover w-32 h-32 mx-auto mb-6 border-2 border-neon-blue/40"
            />
            <h2 className="font-header font-black text-3xl text-white uppercase tracking-tight">{COPY.founder}</h2>
            <p className="text-[11px] text-white/40 mt-1">{COPY.founderLegal}</p>
            <p className={`text-xs font-black uppercase tracking-[0.35em] mt-3 mb-6 ${THEME.accent}`}>
              {COPY.founderRole}
            </p>
            <p className="max-w-2xl mx-auto text-sm text-white/60 leading-relaxed mb-6">{COPY.founderBio}</p>
            <p
              className={`mx-auto mb-8 max-w-2xl rounded-2xl border px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/70 ${THEME.accentBorder} ${THEME.accentBg}`}
            >
              {COPY.founderQuote}
            </p>

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>
              {COPY.skillsTitle}
            </p>
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

            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${THEME.accent}`}>
              {COPY.contactTitle}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {CONTACT.map((field) => (
                <div
                  key={field.label}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${THEME.border} ${THEME.card}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${THEME.accentBg} ${THEME.accent}`}
                    >
                      <Icon name={field.icon} size={18} />
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{field.label}</p>
                      <CopyWithButton value={field.value} label={`Copiar ${field.label}`}>
                        <span className="text-xs font-bold text-white truncate md:text-sm">{field.value}</span>
                      </CopyWithButton>
                    </div>
                  </div>
                  <a
                    href={field.href}
                    title={field.actionLabel}
                    aria-label={field.actionLabel}
                    className={`shrink-0 rounded-lg border p-2 transition-all hover:scale-110 ${THEME.border} ${THEME.card} ${THEME.accent}`}
                  >
                    <Icon name="chevronRight" size={16} />
                  </a>
                </div>
              ))}
              <a
                href={DISCORD_SERVER}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition-all hover:scale-[1.02] ${THEME.border} ${THEME.card}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${THEME.accentBg} ${THEME.accent}`}
                  >
                    <Icon name="discord" size={18} />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Discord</p>
                    <span className="text-xs font-bold text-white truncate md:text-sm">Servidor oficial de soporte</span>
                  </div>
                </div>
                <span className={`${THEME.accent}`}>
                  <Icon name="chevronRight" size={16} />
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Canales oficiales */}
        <section className={`mb-14 rounded-3xl border p-8 md:p-12 ${THEME.border} ${THEME.card}`}>
          <p className={`text-center text-[10px] font-black uppercase tracking-[0.3em] mb-6 ${THEME.accent}`}>
            {COPY.socialsTitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                aria-label={social.name}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all hover:scale-110 ${THEME.border} ${THEME.card}`}
              >
                <SocialIcon platform={social.platform} size={22} colored />
              </a>
            ))}
          </div>
        </section>

        {/* Red del ecosistema */}
        <section className={`mb-14 rounded-3xl border p-8 md:p-12 ${THEME.border} ${THEME.card}`}>
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="font-header font-black text-2xl text-white uppercase tracking-tight mb-3">
              {COPY.networkTitle}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">{COPY.networkBody}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ECOSYSTEM.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${THEME.border} ${THEME.card}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${THEME.accentBg} ${THEME.accent}`}
                >
                  <Icon name={item.icon} size={22} />
                </span>
                <h3 className="font-header font-bold text-white mb-2">{item.name}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <div className="space-y-14">
          <InfoCardGrid title={COPY.rolesTitle} items={ROLES} theme={THEME} columns={4} />
          <InfoSteps title={COPY.joinTitle} steps={STEPS} theme={THEME} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Unirse al Discord', href: DISCORD_SERVER, icon: 'discord', external: true },
            { label: 'Repositorio en GitHub', href: GITHUB_REPO, icon: 'verified', external: true, variant: 'ghost' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
