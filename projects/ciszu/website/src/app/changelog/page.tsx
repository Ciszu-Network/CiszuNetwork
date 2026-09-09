import { ScrollText } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | CHANGELOG',
  description: 'Registro de cambios y actualizaciones de Ciszu Network y sus proyectos.',
};

const updates = [
  { version: "v2.4.0", date: "2026-08-15", title: "Actualización Mayor", desc: "Rediseño completo de la web principal, mejora de rendimiento y nueva paleta de colores." },
  { version: "v2.3.1", date: "2026-07-20", title: "Parche de Seguridad", desc: "Correcciones de seguridad, actualización de dependencias y mejoras de accesibilidad." },
  { version: "v2.3.0", date: "2026-06-10", title: "Nuevas Funcionalidades", desc: "Integración de servicios de pago, sistema de reseñas y panel de administración mejorado." },
  { version: "v2.2.0", date: "2026-05-01", title: "Mejoras de UX", desc: "Optimización de velocidad, corrección de bugs y mejora de la experiencia móvil." },
  { version: "v2.1.0", date: "2026-03-15", title: "Lanzamiento Inicial", desc: "Primera versión pública de Ciszu Network con proyectos principales." },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <ScrollText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Changelog
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Historial de actualizaciones / Update History
          </p>
        </div>

        <div className="space-y-4">
          {updates.map((u, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-brand/20 text-brand-light text-xs font-bold font-mono">{u.version}</span>
                <span className="text-gray-500 text-xs">{u.date}</span>
              </div>
              <h3 className="text-white font-header font-bold text-sm mb-1">{u.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
