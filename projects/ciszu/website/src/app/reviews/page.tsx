import { Star } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | REVIEWS',
  description: 'Reseñas y opiniones sobre Ciszu Network, sus servicios y proyectos.',
};

const reviews = [
  { platform: "Trustpilot", rating: 5, text: "Excelente servicio y profesionalismo. La web superó todas mis expectativas.", author: "Cliente verificado" },
  { platform: "Google", rating: 5, text: "Muy recomendado. Ciszuko Antony y su equipo son unos genios.", author: "Usuario web" },
  { platform: "Discord", rating: 5, text: "CiszuBot es el mejor bot que he usado. Muy estable y con muchas funcionalidades.", author: "Admin de servidor" },
  { platform: "Top.gg", rating: 5, text: "Bot imprescindible para cualquier comunidad de Discord.", author: "Votante verificado" },
];

export default function ReviewsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <Star className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Reviews
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Opiniones de nuestra comunidad / Community Reviews
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white font-bold text-xs font-header">{r.platform}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-brand-light fill-brand-light" />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">"{r.text}"</p>
              <p className="text-gray-500 text-xs">— {r.author}</p>
            </div>
          ))}
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
