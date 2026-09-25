import Link from "next/link";
import { CISZU_NETWORK, CISZUKO_ANTONY } from "@/config/site";
import { ArrowRight, Code, Cloud, Palette } from "lucide-react";
import { InfoHero, type InfoTheme } from "@ciszu/ui";
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
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

export default function CiszuNetworkPage() {
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
                Trabaja con Nosotros <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </PageReveal>
    </div>
  );
}
