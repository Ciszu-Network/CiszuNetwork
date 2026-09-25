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

const COPY = {
  founder: 'Ciszuko Antony',
  founderLegal: 'Francisco Antonio García Menolascina',
  founderRole: 'CEO & Founder · Ciszu Network',
  founderBio:
    'Desarrollador full-stack venezolano. Crea y mantiene CiszuBot, MuzicMania, Ciszu Network y el resto del ecosistema. Diseña la arquitectura, escribe los módulos del bot y revisa cada despliegue antes de publicarse.',
  skillsTitle: 'Stack y disciplinas',
  rolesTitle: 'Roles del ecosistema',
  joinTitle: 'Cómo colaborar',
  actionsTitle: 'Canales oficiales',
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

const SOCIALS = [
  { name: 'GitHub', href: GITHUB_ORG, icon: 'verified' },
  { name: 'Discord', href: DISCORD_SERVER, icon: 'discord' },
  { name: 'YouTube', href: YOUTUBE, icon: 'music' },
  { name: 'X', href: X_SOCIAL, icon: 'share' },
  { name: 'Instagram', href: INSTAGRAM, icon: 'camera' },
  { name: 'Facebook', href: FACEBOOK, icon: 'person' },
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
            <p className="max-w-2xl mx-auto text-sm text-white/60 leading-relaxed mb-8">{COPY.founderBio}</p>

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

            <div className="flex flex-wrap justify-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-xl border text-xs font-bold text-white transition-all ${THEME.border} ${THEME.card}`}
                >
                  {social.name}
                </a>
              ))}
            </div>
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
