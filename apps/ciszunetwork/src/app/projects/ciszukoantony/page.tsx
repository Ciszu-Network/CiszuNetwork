import Image from "next/image";
import Link from "next/link";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { CISZUKO_ANTONY, CISZU_NETWORK, SOCIAL_COLORS } from "@/config/site";
import { User, ArrowRight, ExternalLink, Music, Gamepad2, Mic, Video } from "lucide-react";

const contentTypes = [
  { icon: Gamepad2, title: "Gaming", desc: "Gameplays, streams y contenido de videojuegos variado." },
  { icon: Music, title: "Música", desc: "Producción musical y proyectos de audio originales." },
  { icon: Mic, title: "Tech", desc: "Tutoriales, desarrollo y contenido tecnológico." },
];

export default function CiszukoAntonyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue via-brand-accent to-neon-pink flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-neon-blue via-brand-accent to-neon-pink bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            {CISZUKO_ANTONY.name}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Youtuber • Streamer • Desarrollador
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-brand/10 via-brand-dark/5 to-transparent border border-brand/20 text-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-neon-blue via-brand-accent to-neon-pink mx-auto mb-6 flex items-center justify-center p-1">
              <Image
                src="/images/cisco (1).png"
                alt={CISZUKO_ANTONY.name}
                width={108}
                height={108}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6">
              {CISZUKO_ANTONY.name} es el proyecto artístico y de entretenimiento del CEO de {CISZU_NETWORK.name}. 
              Como youtuber y streamer, crea contenido gaming, música y tecnología. 
              También es el desarrollador principal detrás de todos los proyectos de {CISZU_NETWORK.name}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {contentTypes.map((c, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <c.icon className="w-8 h-8 text-brand-light mx-auto mb-3" />
                  <h3 className="text-white font-bold font-header text-sm mb-2">{c.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {Object.entries(CISZUKO_ANTONY.social).filter(([k]) => k !== 'discordTag').map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand/30 transition-all text-sm font-medium text-white"
                  style={{ borderColor: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}40` }}
                >
                  <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={16} />
                  <span className="capitalize">{platform === 'x' ? 'X' : platform}</span>
                </a>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={CISZUKO_ANTONY.social.youtube} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all"
              >
                <Video className="w-4 h-4" /> YouTube
              </a>
              <a href={CISZUKO_ANTONY.portfolio} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Portafolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
