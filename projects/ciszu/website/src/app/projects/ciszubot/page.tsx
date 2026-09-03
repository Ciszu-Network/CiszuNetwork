import { CISZU_NETWORK, CISZUBOT_LINKS } from "@/config/site";
import { Bot, ArrowRight, Shield, Music, Coins, Settings } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZUBOT',
  description: 'CiszuBot: el bot inteligente de Discord del ecosistema. Moderación, música, juegos, economía y automatización.',
};

const features = [
  { icon: Shield, title: "Moderación", desc: "Anti-spam, filtros, roles y herramientas de gestión para tu servidor." },
  { icon: Music, title: "Música", desc: "Reproduce música de calidad directamente en tus canales de voz." },
  { icon: Coins, title: "Economía", desc: "Sistema de monedas, niveles, inventario y tiendas configurables." },
  { icon: Settings, title: "Automatización", desc: "Bienvenidas, tickets, logs y comandos personalizados." },
];

export default function CiszubotPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-[#5865F2] via-[#7289DA] to-[#4752C4] bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            CiszuBot
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            El bot oficial del ecosistema · Discord
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <h2 className="text-2xl font-header font-bold text-white mb-4">Funcionalidades</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              CiszuBot es el bot oficial de {CISZU_NETWORK.name}: un bot todo-en-uno para
              moderar, entretener y automatizar tu servidor de Discord.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <h2 className="text-xl font-header font-bold text-white mb-4">Añade CiszuBot a tu servidor</h2>
            <p className="text-gray-400 text-sm mb-6">Web oficial con estado en vivo, comandos y soporte.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CISZUBOT_LINKS.invite} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] rounded-xl font-bold text-sm hover:bg-[#5865F2] hover:text-white transition-all">
                Invitar el bot <ArrowRight className="w-4 h-4" />
              </a>
              <a href={CISZUBOT_LINKS.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                Web oficial de CiszuBot <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}