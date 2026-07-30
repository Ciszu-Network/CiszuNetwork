import Link from "next/link";
import { CISZU_NETWORK, CISZUKO_ANTONY } from "@/config/site";
import { Building, ArrowRight, Code, Cloud, Palette } from "lucide-react";

const areas = [
  { icon: Code, title: "Desarrollo Web", desc: "Aplicaciones con Next.js, React, TypeScript y Tailwind." },
  { icon: Cloud, title: "Infraestructura Cloud", desc: "Despliegue en Vercel, AWS y servicios cloud modernos." },
  { icon: Palette, title: "Diseño UI/UX", desc: "Interfaces intuitivas con estética de alto nivel." },
];

export default function CiszuNetworkPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-neon-blue flex items-center justify-center mx-auto mb-6">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand via-brand-light to-neon-blue bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            {CISZU_NETWORK.name}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Compañía de Innovación Digital
          </p>
        </div>

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
      </div>
    </div>
  );
}
