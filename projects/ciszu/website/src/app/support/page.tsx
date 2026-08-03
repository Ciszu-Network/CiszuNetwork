import Link from "next/link";
import { CISZU_NETWORK, CISZUKO_ANTONY } from "@/config/site";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { SOCIAL_COLORS } from "@/config/site";
import { LifeBuoy, Mail, MessageCircle, ArrowRight, ExternalLink } from "lucide-react";

const supportChannels = [
  { icon: Mail, label: "Email", value: CISZU_NETWORK.email, href: `mailto:${CISZU_NETWORK.email}`, color: "from-brand to-brand-light" },
  { icon: MessageCircle, label: "Discord", value: "Invitación al Servidor", href: CISZU_NETWORK.social.discord, color: "from-[#5865F2] to-[#4752C4]" },
  { icon: ExternalLink, label: "GitHub Issues", value: "Reportar Problemas", href: CISZU_NETWORK.social.github, color: "from-gray-600 to-gray-800" },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Soporte
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportChannels.map((ch, i) => (
            <a key={i} href={ch.href} target="_blank" rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all text-center"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <ch.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-bold font-header text-sm mb-1">{ch.label}</p>
              <p className="text-brand-light text-xs">{ch.value}</p>
            </a>
          ))}
        </div>

        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-brand/20 via-brand-dark/5 to-transparent border border-brand/30 text-center">
          <h2 className="text-2xl font-header font-bold text-white mb-4">Canales Oficiales</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Síguenos en nuestras redes para estar al día con novedades, actualizaciones y soporte comunitario.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Object.entries(CISZU_NETWORK.social).map(([platform, url]) => (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand/30 transition-all text-sm font-medium text-white"
                style={{ borderColor: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}40` }}
              >
                <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={16} />
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all">
            Formulario de Contacto <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
