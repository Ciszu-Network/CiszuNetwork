import Link from "next/link";
import { CISZU_NETWORK, CISZUKO_ANTONY, EXTERNAL_LINKS, GITHUB_REPO } from "@/config/site";
import { ArrowRight, Code, Cloud, ExternalLink, Palette } from "lucide-react";
import { InfoHero, type InfoTheme } from "@ciszu/ui";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import QuickDocks from "@/components/molecules/QuickDocks";
import { getServerI18n } from "@/lib/i18n-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZU NETWORK',
  description: 'Ciszu Network: compañía de innovación digital con desarrollo web, cloud y UI/UX.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const areas = [
  { icon: Code, title: "Desarrollo Web", desc: "Aplicaciones con Next.js, React, TypeScript y Tailwind." },
  { icon: Cloud, title: "Infraestructura Cloud", desc: "Despliegue en Vercel, AWS y servicios cloud modernos." },
  { icon: Palette, title: "Diseño UI/UX", desc: "Interfaces intuitivas con estética de alto nivel." },
];

const stack = ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Supabase', 'Vercel', 'pnpm', 'Turborepo', 'GitHub Actions'];

const sites = [
  { name: 'Web principal', href: EXTERNAL_LINKS.ciszunetwork, external: true },
  { name: 'CiszuBot', href: '/projects/ciszubot', external: false },
  { name: 'MuzicMania', href: EXTERNAL_LINKS.muzicmania, external: true },
  { name: 'Ciszuko Antony', href: EXTERNAL_LINKS.ciszukoantony, external: true },
];

export default async function CiszuNetworkPage() {
  const { t } = await getServerI18n();
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="rocket"
          title={CISZU_NETWORK.name}
          subtitle="Compañía de Innovación Digital"
          kicker="Proyecto"
          theme={THEME}
        />

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <p className="text-gray-300 leading-relaxed mb-8">
              {CISZU_NETWORK.name} es el núcleo de todos nuestros proyectos. Fundada por {CISZUKO_ANTONY.name}, 
              es una compañía de innovación digital que desarrolla soluciones tecnológicas de alto rendimiento.
              Desde desarrollo web hasta infraestructura cloud, pasando por bots, servidores de juego y experiencias digitales.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {areas.map((a, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <a.icon className="w-8 h-8 text-brand-light mx-auto mb-3" />
                  <h3 className="text-white font-bold font-header text-sm mb-2">{a.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all">
                {t.projectPages.ciszunetwork.workWithUs} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
            <h2 className="text-2xl font-header font-bold text-white mb-6">{t.projectPages.stack}</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {stack.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand-light text-[10px] font-bold uppercase tracking-wider">
                  {s}
                </span>
              ))}
            </div>
            <h3 className="text-sm font-header font-bold text-white mb-3">{t.projectPages.ciszunetwork.ecosystemProjects}</h3>
            <div className="flex flex-wrap gap-3">
              {sites.map((s) => (
                <Link key={s.name} href={s.href} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold hover:border-brand-light/60 hover:text-brand-light transition-all">
                  {s.name} {s.external ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </Link>
              ))}
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold hover:border-brand-light/60 hover:text-brand-light transition-all">
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="text-center">
            <Link href="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
              {t.projectPages.viewAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
