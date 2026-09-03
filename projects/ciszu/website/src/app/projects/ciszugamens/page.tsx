import Image from "next/image";
import { assetResolver } from "@ciszunetwork/cdn";
import { CISZU_NETWORK } from "@/config/site";
import { ArrowRight, Gamepad2, Users, Trophy } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZUGAMENS',
  description: 'Ciszugamens: el servidor de la comunidad de Ciszu Network en Discord, WhatsApp y Telegram.',
};

const ISOTIPO = assetResolver.resolve('projects/ciszugamens/content/logos/images/outline/isotype/gradient/color/ciszugamens_logo_isotipo_degradado_outline_color_cpurple_zblue.svg');

const channels = [
  {
    name: "Discord",
    href: CISZU_NETWORK.social.discord,
    desc: "El servidor principal: eventos, partidas, soporte, bots y la comunidad gamer en vivo.",
    color: "#5865F2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: `https://wa.me/${CISZU_NETWORK.phone.replace(/\D/g, '')}`,
    desc: "El canal directo de la comunidad: anuncios, ayuda rápida y contacto con el equipo.",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://t.me/CiszukoNetwork",
    desc: "Canal de Telegram: novedades, bots y una comunidad activa al instante.",
    color: "#26A5E4",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

const features = [
  { icon: Users, title: "Comunidad", desc: "Una comunidad activa y diversa: gamers, creadores y fans del ecosistema." },
  { icon: Trophy, title: "Eventos", desc: "Torneos, partidas, retos y dinámicas semanales para toda la comunidad." },
  { icon: Gamepad2, title: "Gaming", desc: "Discord, WhatsApp y Telegram unidos en una sola comunidad de juego." },
];

export default function CiszugamensPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center mx-auto mb-6">
            <Image src={ISOTIPO} alt="Ciszugamens" width={40} height={40} className="h-10 w-10 object-contain" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-[#a855f7] via-[#3b82f6] to-[#22d3ee] bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Ciszugamens
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Servidor de la Comunidad · Discord · WhatsApp · Telegram
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <h2 className="text-2xl font-header font-bold text-white mb-4">Únete a la comunidad</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Ciszugamens es el servidor de la comunidad de {CISZU_NETWORK.name}: el mismo espacio
              en Discord, WhatsApp y Telegram. Elige tu plataforma favorita y forma parte de la
              familia gamer y digital del ecosistema.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {channels.map((c, i) => (
                <a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all group hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-3" style={{ color: c.color }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${c.color}22`, border: `1px solid ${c.color}44` }}>
                      {c.icon}
                    </div>
                    <h3 className="text-white font-bold font-header text-sm">{c.name}</h3>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{c.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-xs font-bold uppercase tracking-widest transition-all group-hover:gap-2" style={{ color: c.color }}>
                    Unirme <ArrowRight className="w-3 h-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <f.icon className="w-8 h-8 text-[#a855f7] mb-4" />
                <h3 className="text-white font-bold font-header text-sm mb-2">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}