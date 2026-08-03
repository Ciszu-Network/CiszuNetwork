import { EXTERNAL_LINKS, CISZU_NETWORK } from "@/config/site";
import { Music, ArrowRight, ExternalLink, Gamepad2, Star, Sparkles } from "lucide-react";

const features = [
  { icon: Gamepad2, title: "Juego Rítmico", desc: "Mecánicas de juego fluidas y adictivas. Compones mientras juegas." },
  { icon: Star, title: "Estética Futurista", desc: "Diseño visual impactante con identidad de marca única." },
  { icon: Sparkles, title: "Web Moderna", desc: "Desarrollado con Next.js y tecnologías web de última generación." },
];

export default function MuzicManiaPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center mx-auto mb-6">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand via-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            MuzicMania
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            El juego de ritmo definitivo
          </p>
        </div>

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

          <div className="text-center p-8 rounded-[2rem] bg-gradient-to-br from-brand/10 to-transparent border border-brand/30">
            <p className="text-gray-400 text-sm mb-2">¿Eres desarrollador o músico?</p>
            <p className="text-gray-500 text-xs mb-4">Colabora con MuzicMania aportando canciones, ideas o código.</p>
            <a href={CISZU_NETWORK.social.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
              <ExternalLink className="w-3 h-3" /> GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
