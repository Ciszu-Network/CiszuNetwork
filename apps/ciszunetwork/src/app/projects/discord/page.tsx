import Link from "next/link";
import { CISZU_NETWORK } from "@/config/site";
import { MessageCircle, ArrowRight, Bot, Users, Settings } from "lucide-react";

const features = [
  { icon: Bot, title: "Bots Inteligentes", desc: "Bots personalizados con moderación, música, juegos, economía y más. Totalmente configurables." },
  { icon: Users, title: "Servidores Comunitarios", desc: "Creación y administración de servidores Discord con estructura, roles y automatización." },
  { icon: Settings, title: "Automatización", desc: "Sistemas de tickets, logs, bienvenidas y herramientas de gestión para tu servidor." },
];

export default function DiscordPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-[#5865F2] via-[#7289DA] to-[#4752C4] bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Discord
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Servers & Bots
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <h2 className="text-2xl font-header font-bold text-white mb-4">Soluciones Discord</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              En {CISZU_NETWORK.name} creamos soluciones completas para Discord. 
              Desde bots con funcionalidades avanzadas hasta servidores comunitarios bien estructurados.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <f.icon className="w-8 h-8 text-[#5865F2] mb-4" />
                  <h3 className="text-white font-bold font-header text-sm mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-[2rem] bg-gradient-to-br from-[#5865F2]/10 to-transparent border border-[#5865F2]/30">
            <h2 className="text-xl font-header font-bold text-white mb-4">¿Necesitas un bot o servidor?</h2>
            <p className="text-gray-400 text-sm mb-6">Cuéntanos tu idea y la hacemos realidad.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] rounded-xl font-bold text-sm hover:bg-[#5865F2] hover:text-white transition-all">
              Contáctanos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
