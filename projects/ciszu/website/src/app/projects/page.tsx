import Image from "next/image";
import Link from "next/link";
import { assetResolver } from "@ciszunetwork/cdn";
import { ArrowRight, Bot, Building, ExternalLink, Gamepad2, Music, User } from "lucide-react";
import { InfoHero, type InfoTheme } from "@ciszu/ui";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import QuickDocks from "@/components/molecules/QuickDocks";
import { CISZU_NETWORK, GITHUB_REPO } from "@/config/site";
import { getServerI18n } from "@/lib/i18n-server";
import { fillTemplate } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS',
  description:
    'Todos los proyectos de Ciszu Network: CiszuGamens, CiszuBot, MuzicMania, Ciszu Network y Ciszuko Antony. Comunidad, bots, juegos y desarrollo.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

type Project = {
  id: string;
  title: string;
  tagline: string;
  desc: string;
  href: string;
  external?: boolean;
  icon: typeof Gamepad2;
  gradient: string;
  logo: string;
  stack: string[];
};

const projects: Project[] = [
  {
    id: 'ciszugamens',
    title: 'Ciszugamens',
    tagline: 'Servidor de la Comunidad',
    desc: 'La comunidad gamer y digital del ecosistema: eventos, partidas, soporte y bots, unida en Discord, WhatsApp y Telegram.',
    href: '/projects/ciszugamens',
    icon: Gamepad2,
    gradient: 'from-[#a855f7] via-[#3b82f6] to-[#22d3ee]',
    logo: 'projects/ciszugamens/content/logos/images/outline/isotype/gradient/color/ciszugamens_logo_isotipo_degradado_outline_color_cpurple_zblue.svg',
    stack: ['Discord', 'WhatsApp', 'Telegram', 'Top.gg'],
  },
  {
    id: 'ciszubot',
    title: 'CiszuBot',
    tagline: 'Bot Inteligente de Discord',
    desc: 'El bot oficial: moderación, música, economía, juegos y automatización, con web propia, estado en vivo y soporte.',
    href: '/projects/ciszubot',
    icon: Bot,
    gradient: 'from-[#5865F2] via-[#7289DA] to-[#4752C4]',
    logo: 'projects/ciszubot/content/logos/images/not-outline/isotype/color/ciszubot_logo_isotipo_color.png',
    stack: ['Discord.js', 'TypeScript', 'Node.js', 'Docker', 'Supabase', 'Top.gg'],
  },
  {
    id: 'muzicmania',
    title: 'MuzicMania',
    tagline: 'Juego de Ritmo Definitivo',
    desc: 'Juego de ritmo en la web con estética futurista, álbumes originales y app de escritorio. Compuesto y programado desde cero.',
    href: '/projects/muzicmania',
    icon: Music,
    gradient: 'from-brand via-brand-light to-brand-accent',
    logo: 'projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.png',
    stack: ['Next.js', 'React', 'TypeScript', 'Web Audio', 'Supabase', 'Tauri'],
  },
  {
    id: 'ciszunetwork',
    title: 'Ciszu Network',
    tagline: 'Compañía de Innovación Digital',
    desc: 'El núcleo del ecosistema: desarrollo web, infraestructura cloud, UI/UX, bots y soluciones digitales de alto rendimiento.',
    href: '/projects/ciszunetwork',
    icon: Building,
    gradient: 'from-brand via-brand-light to-neon-blue',
    logo: 'projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg',
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel', 'Turborepo'],
  },
  {
    id: 'ciszukoantony',
    title: 'Ciszuko Antony',
    tagline: 'Youtuber & Streamer',
    desc: 'El proyecto artístico y de entretenimiento del CEO: contenido gaming, música, tecnología y desarrollo para toda la comunidad.',
    href: '/projects/ciszukoantony',
    icon: User,
    gradient: 'from-neon-blue via-brand-accent to-neon-pink',
    logo: 'projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png',
    stack: ['YouTube', 'Twitch', 'TikTok', 'Instagram', 'Spotify'],
  },
];

export default async function ProjectsPage() {
  const { t } = await getServerI18n();
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="rocket"
          title={t.projectsPage.heroTitle}
          subtitle={fillTemplate(t.projectsPage.heroSubtitle, { site: CISZU_NETWORK.name })}
          kicker={t.projectsPage.kicker}
          theme={THEME}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const Comp = p.external ? 'a' : Link;
            const props = p.external
              ? { href: p.href, target: '_blank', rel: 'noopener noreferrer' as const }
              : { href: p.href };
            return (
              <Comp
                key={p.id}
                {...props}
                className="group relative flex flex-col p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-brand-light/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <p.icon className="w-6 h-6 text-white" />
                  </span>
                  <Image
                    src={assetResolver.resolve(p.logo)}
                    alt={p.title}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain ml-auto opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <h2 className="text-xl font-header font-bold text-white group-hover:text-brand-light transition-colors">
                  {p.title}
                </h2>
                <p className="text-brand-light text-[10px] font-bold uppercase tracking-[0.2em] mt-1 mb-3">
                  {p.tagline}
                </p>
                <p className="text-gray-400 text-xs leading-relaxed flex-grow">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {p.stack.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-brand-light text-[10px] font-bold uppercase tracking-widest mt-5 group-hover:gap-2.5 transition-all">
                  {p.external ? 'Visitar' : 'Explorar'}
                  {p.external ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </div>
              </Comp>
            );
          })}
        </div>

        <div className="mt-14 text-center p-8 rounded-[2rem] bg-gradient-to-br from-brand/10 to-transparent border border-brand/30">
          <h2 className="text-xl font-header font-bold text-white mb-3">{t.projectsPage.builtTitle}</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
            {t.projectsPage.builtDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> {t.projectsPage.githubRepo}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all"
            >
              {t.projectsPage.workWithUs} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
