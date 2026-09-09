import { BarChart3 } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | STATS',
  description: 'Estadísticas y métricas de Ciszu Network y sus proyectos.',
};

const stats = [
  { value: "5+", label: "Proyectos activos", sub: "Active Projects" },
  { value: "24/7", label: "Disponibilidad", sub: "Uptime" },
  { value: "100%", label: "Compromiso", sub: "Commitment" },
  { value: "1K+", label: "Usuarios", sub: "Users Reached" },
  { value: "50+", label: "Despliegues", sub: "Deployments" },
  { value: "10+", label: "Países", sub: "Countries" },
];

export default function StatsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Stats
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Métricas del ecosistema / Ecosystem Metrics
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20 text-center hover:border-brand-light/30 transition-all">
              <div className="text-4xl md:text-5xl font-header font-black text-brand-light mb-2">{s.value}</div>
              <div className="text-white font-bold text-sm mb-1">{s.label}</div>
              <div className="text-gray-500 text-xs uppercase tracking-widest">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
