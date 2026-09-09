import { MessagesSquare } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | FORUM',
  description: 'Foro de la comunidad de Ciszu Network: discusiones, soporte y más.',
};

const categories = [
  { name: "General", desc: "Charlas generales sobre la comunidad y el ecosistema.", icon: "💬" },
  { name: "Soporte Técnico", desc: "Ayuda con proyectos, bots y servicios.", icon: "🛠️" },
  { name: "MuzicMania", desc: "Discusiones sobre el juego de ritmo.", icon: "🎵" },
  { name: "CiszuBot", desc: "Comandos, reportes y sugerencias del bot.", icon: "🤖" },
  { name: "Proyectos", desc: "Colaboraciones, ideas y feedback.", icon: "🚀" },
  { name: "Off-Topic", desc: "Temas libres fuera del ecosistema.", icon: "🌍" },
];

export default function ForumPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <MessagesSquare className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Forum
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Foro comunitario / Community Forum
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all cursor-pointer">
              <div className="text-2xl mb-3">{c.icon}</div>
              <h3 className="text-white font-header font-bold text-sm mb-1">{c.name}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
