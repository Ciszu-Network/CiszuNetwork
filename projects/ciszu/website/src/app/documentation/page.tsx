import { BookOpen } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | DOCUMENTATION',
  description: 'Documentación técnica y guías de Ciszu Network y sus proyectos.',
};

const sections = [
  { title: "Guía de Inicio", desc: "Primeros pasos con Ciszu Network: registro, configuración y primeros proyectos.", lang: "ES / EN" },
  { title: "API Reference", desc: "Documentación de la API REST, endpoints y ejemplos de uso.", lang: "EN" },
  { title: "Arquitectura", desc: "Visión general de la arquitectura del ecosistema y stack tecnológico.", lang: "ES / EN" },
  { title: "Deployment", desc: "Guías de despliegue para Vercel, Docker y entornos locales.", lang: "ES / EN" },
  { title: "CiszuBot Docs", desc: "Documentación de comandos, configuración y administración del bot.", lang: "ES / EN" },
  { title: "MuzicMania Docs", desc: "Guías de juego, puntuación y funcionalidades de MuzicMania.", lang: "ES / EN" },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Documentation
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Documentación técnica y guías / Technical Documentation & Guides
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all cursor-pointer">
              <h3 className="text-white font-header font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">{s.desc}</p>
              <span className="text-brand-light text-[10px] font-bold uppercase tracking-widest">{s.lang}</span>
            </div>
          ))}
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
