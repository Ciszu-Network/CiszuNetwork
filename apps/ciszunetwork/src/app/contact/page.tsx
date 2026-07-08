import { SocialIcon } from "@/components/ui/SocialIcon";
import { CISZU_NETWORK, CISZUKO_ANTONY, SOCIAL_COLORS } from "@/config/site";
import { Mail, Phone, MapPin, Clock, Send, ArrowRight, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <Send className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Contacto
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Estamos listos para escuchar tu proyecto
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email Principal", value: CISZU_NETWORK.email },
              { icon: Mail, label: "Email CEO", value: CISZUKO_ANTONY.email },
              { icon: Phone, label: "WhatsApp Directo", value: CISZU_NETWORK.phone },
              { icon: MapPin, label: "Ubicación", value: CISZU_NETWORK.location },
              { icon: Clock, label: "Disponibilidad", value: `24/7 — ${CISZU_NETWORK.timezone}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-brand/5 border border-brand/20 group hover:border-brand-light/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand-light flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{item.label}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Redes Sociales</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CISZU_NETWORK.social).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-brand/30 transition-all text-xs"
                    style={{ borderColor: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}30` }}
                  >
                    <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={14} />
                    <span className="capitalize text-gray-400">{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand-dark/10 to-transparent border border-brand/30 flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-12 h-12 text-brand-light mb-6 drop-shadow-brand" />
            <h2 className="text-2xl md:text-3xl font-header font-black text-white uppercase tracking-tighter mb-4">
              ¿Hablamos?
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-xs">
              Cuéntanos sobre tu proyecto y te responderemos a la brevedad.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a
                href={`mailto:${CISZU_NETWORK.email}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-brand/20 border-2 border-brand/50 text-white font-black rounded-xl hover:bg-brand hover:scale-105 transition-all text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(35,63,146,0.3)]"
              >
                Enviar Correo <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${CISZU_NETWORK.phone.replace(/[^0-9]/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border-2 border-white/20 text-white font-black rounded-xl hover:bg-white/10 hover:scale-105 transition-all text-sm uppercase tracking-widest"
              >
                WhatsApp <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
