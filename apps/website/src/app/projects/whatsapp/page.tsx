import Link from "next/link";
import { CISZU_NETWORK } from "@/config/site";
import { MessageSquare, ArrowRight, Bot, Users, MessageCircle } from "lucide-react";

const features = [
  { icon: Bot, title: "Bots WhatsApp", desc: "Automatización de respuestas, menús interactivos, envío de mensajes programados y más." },
  { icon: Users, title: "Comunidades", desc: "Gestión de comunidades WhatsApp con herramientas de organización y moderación." },
  { icon: MessageCircle, title: "Marketing", desc: "Difusión de mensajes, campañas automatizadas y atención al cliente 24/7." },
];

export default function WhatsAppPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-[#25D366] via-[#20BD5A] to-[#128C7E] bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            WhatsApp
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Comunidades & Bots
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <h2 className="text-2xl font-header font-bold text-white mb-4">Automatización WhatsApp</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Potenciamos tu presencia en WhatsApp con bots inteligentes y comunidades organizadas. 
              Automatiza tu atención al cliente, difunde información y mantén a tu comunidad informada.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <f.icon className="w-8 h-8 text-[#25D366] mb-4" />
                  <h3 className="text-white font-bold font-header text-sm mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-[2rem] bg-gradient-to-br from-[#25D366]/10 to-transparent border border-[#25D366]/30">
            <h2 className="text-xl font-header font-bold text-white mb-4">¿Automatizamos tu WhatsApp?</h2>
            <p className="text-gray-400 text-sm mb-6">Hablemos de tu proyecto.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] rounded-xl font-bold text-sm hover:bg-[#25D366] hover:text-white transition-all">
              Contáctanos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
