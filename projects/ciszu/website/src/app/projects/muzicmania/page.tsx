import Link from "next/link";
import { EXTERNAL_LINKS, CISZU_NETWORK, GITHUB_REPO } from "@/config/site";
import { ArrowRight, ExternalLink, Gamepad2, Star, Sparkles } from "lucide-react";
import { InfoHero, type InfoTheme } from "@ciszu/ui";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — MUZICMANIA',
  description: 'MuzicMania, el juego de ritmo definitivo desarrollado por Ciszu Network.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const features = [
  { icon: Gamepad2, title: "Juego Rítmico", desc: "Mecánicas de juego fluidas y adictivas. Compones mientras juegas." },
  { icon: Star, title: "Estética Futurista", desc: "Diseño visual impactante con identidad de marca única." },
  { icon: Sparkles, title: "Web Moderna", desc: "Desarrollado con Next.js y tecnologías web de última generación." },
];

const stack = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Web Audio', 'Supabase', 'Tauri'];

export default function MuzicManiaPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="music"
          title="MuzicMania"
          subtitle="El juego de ritmo definitivo"
          kicker="Proyecto"
          theme={THEME}
        />

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <p className="text-gray-300 leading-relaxed mb-8">
              MuzicMania es un juego de ritmo desarrollado por {CISZU_NETWORK.name}. 
              Una experiencia musical interactiva en la web con estética futurista y mecánicas adictivas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {features.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <f.icon className="w-8 h-8 text-brand-light mx-auto mb-3" />
                  <h3 className="text-white font-bold font-header text-sm mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <a href={EXTERNAL_LINKS.muzicmania} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand/20 border-2 border-brand/50 text-white font-black rounded-xl hover:bg-brand hover:scale-105 transition-all text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(35,63,146,0.3)]"
              >
                Jugar Ahora <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
            <h2 className="text-2xl font-header font-bold text-white mb-6">Stack tecnológico</h2>
            <div className="flex flex-wrap gap-2">
              {stack.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand-light text-[10px] font-bold uppercase tracking-wider">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-[2rem] bg-gradient-to-br from-brand/10 to-transparent border border-brand/30">
            <p className="text-gray-400 text-sm mb-2">¿Eres desarrollador o músico?</p>
            <p className="text-gray-500 text-xs mb-4">Colabora con MuzicMania aportando canciones, ideas o código.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
                <ExternalLink className="w-3 h-3" /> GitHub
              </a>
              <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/30 text-brand-light rounded-xl text-xs font-bold hover:bg-brand/20 transition-all">
                Ver todos los proyectos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
