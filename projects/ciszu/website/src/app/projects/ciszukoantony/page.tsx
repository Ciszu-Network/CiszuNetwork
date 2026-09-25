import Image from "next/image";
import Link from "next/link";
import { assetResolver } from "@ciszunetwork/cdn";
import { SocialIcon, SOCIAL_COLORS, InfoHero, type InfoTheme } from '@ciszu/ui';
import PageAmbience from "@/components/layout/PageAmbience";
import PageReveal from "@/components/layout/PageReveal";
import QuickDocks from "@/components/molecules/QuickDocks";
import { CISZUKO_ANTONY, CISZU_NETWORK } from "@/config/site";
import { ArrowRight, ExternalLink, Music, Gamepad2, Mic, Video } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | PROJECTS — CISZUKO ANTONY',
  description: 'Proyecto artístico de Ciszuko Antony: contenido gaming, música y tecnología.',
};

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const contentTypes = [
  { icon: Gamepad2, title: "Gaming", desc: "Gameplays, streams y contenido de videojuegos variado." },
  { icon: Music, title: "Música", desc: "Producción musical y proyectos de audio originales." },
  { icon: Mic, title: "Tech", desc: "Tutoriales, desarrollo y contenido tecnológico." },
];

const platforms = ['YouTube', 'Twitch', 'TikTok', 'Instagram', 'Spotify', 'X'];

export default function CiszukoAntonyPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="star"
          title={CISZUKO_ANTONY.name}
          subtitle="Youtuber • Streamer • Desarrollador"
          kicker="Proyecto"
          theme={THEME}
        />

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-brand/10 via-brand-dark/5 to-transparent border border-brand/20 text-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-neon-blue via-brand-accent to-neon-pink mx-auto mb-6 flex items-center justify-center p-1">
              <Image
                src={assetResolver.resolve("shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg")}
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

          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
            <h2 className="text-2xl font-header font-bold text-white mb-6">Plataformas</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {platforms.map((p) => (
                <span key={p} className="px-3 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand-light text-[10px] font-bold uppercase tracking-wider">
                  {p}
                </span>
              ))}
            </div>
            <div className="text-center">
              <Link href="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                Ver todos los proyectos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
