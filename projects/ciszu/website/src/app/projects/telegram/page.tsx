import Link from "next/link";
import { CISZU_NETWORK } from "@/config/site";
import { Send, ArrowRight, Bot, Users, Radio } from "lucide-react";

const features = [
  { icon: Bot, title: "Bots Telegram", desc: "Bots con menús, comandos personalizados, integración con APIs y notificaciones." },
  { icon: Users, title: "Grupos & Canales", desc: "Creación y gestión de grupos y canales con contenido automatizado." },
  { icon: Radio, title: "Difusión", desc: "Sistemas de difusión masiva, encuestas y contenido programado." },
];

export default function TelegramPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#26A5E4] to-[#1E8FC7] flex items-center justify-center mx-auto mb-6">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-[#26A5E4] via-[#229ED9] to-[#1E8FC7] bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Telegram
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Canales, Grupos & Bots
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <h2 className="text-2xl font-header font-bold text-white mb-4">Soluciones Telegram</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Desarrollamos bots y canales en Telegram con tecnología {CISZU_NETWORK.name}. 
              Automatización, difusión y herramientas de gestión para tu comunidad o negocio.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <f.icon className="w-8 h-8 text-[#26A5E4] mb-4" />
                  <h3 className="text-white font-bold font-header text-sm mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-[2rem] bg-gradient-to-br from-[#26A5E4]/10 to-transparent border border-[#26A5E4]/30">
            <h2 className="text-xl font-header font-bold text-white mb-4">¿Creamos algo en Telegram?</h2>
            <p className="text-gray-400 text-sm mb-6">Cuéntanos tu idea.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#26A5E4]/20 border border-[#26A5E4]/40 text-[#26A5E4] rounded-xl font-bold text-sm hover:bg-[#26A5E4] hover:text-white transition-all">
              Contáctanos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
