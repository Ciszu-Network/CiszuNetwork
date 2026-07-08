import Link from "next/link";
import Image from "next/image";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { CISZU_NETWORK, CISZUKO_ANTONY, EXTERNAL_LINKS, SOCIAL_COLORS } from "@/config/site";
import { ArrowRight, Code, Shield, Zap, ExternalLink, Star, Globe, Music, Users, ChevronRight, Pickaxe, MessageCircle, MessageSquare, Send, Building, User, Gamepad2, Smartphone } from "lucide-react";

const services = [
  { icon: Code, title: "Desarrollo Web", desc: "Aplicaciones web modernas con Next.js, React y TypeScript. Rendimiento, escalabilidad y diseño de alto nivel.", color: "#3a6bf0" },
  { icon: Shield, title: "Infraestructura Digital", desc: "Arquitectura cloud, despliegue continuo y seguridad enterprise. Vercel, AWS y herramientas modernas.", color: "#59b4ff" },
  { icon: Zap, title: "Experiencia de Usuario", desc: "Interfaces intuitivas con estética cuidada. Animaciones fluidas y diseño responsivo.", color: "#68cfff" },
];

const projectSections = [
  {
    id: "minecraft",
    title: "Minecraft",
    tagline: "Texture Packs, Mods & Servers",
    desc: "Desarrollamos texture packs personalizados, mods y administramos servidores Minecraft con la identidad visual de Ciszu Network. Experiencias únicas para tu comunidad.",
    href: "/projects/minecraft",
    icon: Pickaxe,
    gradient: "from-[#44B272] via-[#2ECC71] to-[#1ABC9C]",
    tech: ["Resource Packs", "Mods", "Servers"],
  },
  {
    id: "discord",
    title: "Discord",
    tagline: "Servers & Bots Inteligentes",
    desc: "Creamos y administramos servidores Discord comunitarios, bots personalizados con funcionalidades avanzadas y automatización para tu comunidad o empresa.",
    href: "/projects/discord",
    icon: MessageCircle,
    gradient: "from-[#5865F2] via-[#7289DA] to-[#4752C4]",
    tech: ["Bot Development", "Community Management", "Automation"],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    tagline: "Comunidades & Bots",
    desc: "Automatización y bots inteligentes para WhatsApp. Comunidades organizadas, respuestas automáticas y herramientas de gestión para empresas y grupos.",
    href: "/projects/whatsapp",
    icon: MessageSquare,
    gradient: "from-[#25D366] via-[#20BD5A] to-[#128C7E]",
    tech: ["WhatsApp Bot", "Community", "Automation"],
  },
  {
    id: "telegram",
    title: "Telegram",
    tagline: "Canales, Grupos & Bots",
    desc: "Desarrollo de bots para Telegram, canales de contenido y grupos automatizados. Soluciones de mensajería con tecnología Ciszu.",
    href: "/projects/telegram",
    icon: Send,
    gradient: "from-[#26A5E4] via-[#229ED9] to-[#1E8FC7]",
    tech: ["Telegram Bot", "Channels", "Groups"],
  },
  {
    id: "muzicmania",
    title: "MuzicMania",
    tagline: "Juego de Ritmo Definitivo",
    desc: "Plataforma de juego rítmico en la web con estética futurista. Desarrollada por Ciszu Network con Next.js y tecnologías modernas.",
    href: EXTERNAL_LINKS.muzicmania,
    icon: Music,
    gradient: "from-brand via-brand-light to-brand-accent",
    tech: ["Next.js", "Game Dev", "Web"],
    external: true,
  },
  {
    id: "ciszunetwork",
    title: "Ciszu Network",
    tagline: "Compañía de Innovación Digital",
    desc: "Núcleo de todos los proyectos. Desarrollo web, infraestructura cloud, UI/UX, bots y soluciones digitales de alto rendimiento.",
    href: "/about",
    icon: Building,
    gradient: "from-brand via-brand-light to-neon-blue",
    tech: ["Web Dev", "Cloud", "UI/UX"],
  },
  {
    id: "ciszukoantony",
    title: "Ciszuko Antony",
    tagline: "Youtuber & Streamer",
    desc: "Proyecto artístico y de entretenimiento. Contenido gaming, música, tecnología y desarrollo. Streams, videos y una comunidad en crecimiento.",
    href: EXTERNAL_LINKS.ciszukoantony,
    icon: User,
    gradient: "from-neon-blue via-brand-accent to-neon-pink",
    tech: ["Content", "Streaming", "Gaming"],
    external: true,
  },
];

const stats = [
  { value: "7+", label: "Áreas de Proyecto" },
  { value: "100%", label: "Compromiso" },
  { value: "24/7", label: "Soporte Técnico" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(35,63,146,0.3)_0%,rgba(0,10,30,0.2)_60%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(35,63,146,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(35,63,146,0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-brand-light/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-neon-blue/5 rounded-full blur-[80px] animate-blob animation-delay-4000" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-8">
            <Image
              src="/logos/imagen/outline/logotipo/degradado/color/ciszuko_logotipo_outline_degradado_color_full.png"
              alt={CISZU_NETWORK.name}
              width={320}
              height={80}
              className="drop-shadow-brand"
              priority
            />
          </div>
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/logos/tagline_white.svg"
              alt={CISZU_NETWORK.tagline}
              width={280}
              height={24}
              className="opacity-80"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-header font-black tracking-tighter mb-6">
            <span className="bg-gradient-to-r from-brand-light via-brand-accent to-neon-blue bg-clip-text text-transparent">
              {CISZU_NETWORK.name}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-accent">
            Innovación digital con propósito. Desarrollamos soluciones de alto rendimiento 
            que combinan tecnología de punta con una estética inconfundible.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-brand/20 text-white font-black rounded-xl border-2 border-brand/50 hover:bg-brand hover:scale-105 transition-all text-lg font-header shadow-[0_0_20px_rgba(35,63,146,0.3)] hover:shadow-[0_0_30px_rgba(35,63,146,0.5)]">
              Contáctanos <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-black rounded-xl border-2 border-white/20 hover:bg-white/10 hover:scale-105 transition-all text-lg font-header">
              Conócenos
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand/40 transition-all animate-pulse-glow">
                <div className="text-5xl font-header font-black text-brand-light mb-2">{s.value}</div>
                <div className="text-gray-400 text-sm font-bold uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-brand-light via-brand-accent to-neon-blue bg-clip-text text-transparent uppercase tracking-tighter">
              Servicios
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm uppercase tracking-widest">
              Tecnología de punta para proyectos ambiciosos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((s, i) => (
              <div key={i} className="p-8 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all group hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                  <s.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-header font-bold mb-3 text-white">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24 bg-gradient-to-b from-transparent to-black/80 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-brand-light via-brand-accent to-neon-blue bg-clip-text text-transparent uppercase tracking-tighter">
              Proyectos
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm uppercase tracking-widest">
              Soluciones digitales creadas por {CISZU_NETWORK.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {projectSections.map((p) => {
              const Comp = p.external ? 'a' : Link;
              const props = p.external
                ? { href: p.href, target: '_blank', rel: 'noopener noreferrer' as const }
                : { href: p.href };
              return (
                <Comp key={p.id} {...props}
                  className="group relative p-[1px] rounded-[2rem] bg-gradient-to-br from-white/10 via-transparent to-transparent hover:from-brand-light/30 transition-all duration-500 overflow-hidden"
                >
                  <div className="bg-[#0a0a0f] rounded-[2rem] p-6 h-full flex flex-col relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity"
                      style={{ background: `radial-gradient(circle, ${p.gradient.includes('brand') ? '#233f92' : p.gradient.split(' ')[0].replace('from-', '')}, transparent)` }}
                    />
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform relative z-10`}>
                      <p.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-header font-bold text-white mb-1 group-hover:text-brand-light transition-colors relative z-10">
                      {p.title}
                    </h3>
                    <p className="text-brand-light text-[10px] font-bold uppercase tracking-[0.2em] mb-3 relative z-10">
                      {p.tagline}
                    </p>
                    <p className="text-gray-400 text-xs leading-relaxed flex-grow relative z-10">
                      {p.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4 relative z-10">
                      {p.tech.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-light text-[10px] font-bold uppercase tracking-widest mt-4 group-hover:gap-2.5 transition-all relative z-10">
                      {p.external ? 'Visitar' : 'Explorar'} <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </Comp>
              );
            })}
          </div>
        </div>
      </section>

      {/* CEO */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto p-10 md:p-14 rounded-[2.5rem] bg-gradient-to-br from-brand/10 via-brand-dark/10 to-transparent border border-brand/30 text-center relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand/10 rounded-full blur-[80px] group-hover:bg-brand-light/15 transition-all" />
            <div className="relative z-10">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand via-brand-light to-brand-accent mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(35,63,146,0.4)] p-1">
                <Image
                  src="/images/cisco (1).png"
                  alt={CISZUKO_ANTONY.name}
                  width={108}
                  height={108}
                  className="rounded-full object-cover w-full h-full"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-header font-black text-white mb-2 uppercase tracking-tighter">
                {CISZUKO_ANTONY.name}
              </h2>
              <p className="text-brand-light font-black text-xs uppercase tracking-[0.4em] mb-6">
                {CISZUKO_ANTONY.role}
              </p>
              <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6">
                Visionario digital y desarrollador full-stack. Fundador de {CISZU_NETWORK.name} y creador de MuzicMania. 
                Lidera con una visión centrada en la innovación, la calidad técnica y la experiencia de usuario. 
                También youtuber y streamer en crecimiento.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {Object.entries(CISZUKO_ANTONY.social).filter(([k]) => k !== 'discordTag').map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                    style={{ color: SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS] }}
                  >
                    <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={22} />
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {["Next.js", "React", "TypeScript", "UI/UX", "Arquitectura Cloud", "Liderazgo"].map((skill) => (
                  <span key={skill} className="px-4 py-2 rounded-full bg-brand/10 border border-brand/30 text-xs font-bold text-brand-light">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all">
                  Contactar <ArrowRight className="w-4 h-4" />
                </Link>
                <a href={CISZUKO_ANTONY.portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                  <ExternalLink className="w-4 h-4" /> Portafolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-header font-black text-white mb-4 uppercase tracking-tighter">
            Síguenos
          </h2>
          <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto">
            Conéctate con {CISZU_NETWORK.name} en todas nuestras plataformas
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
            {Object.entries(CISZU_NETWORK.social).map(([platform, url]) => {
              const color = SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS];
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 rounded-xl border transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${color}15`,
                    borderColor: `${color}40`,
                    color,
                  }}
                >
                  <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={18} />
                  <span className="font-bold text-sm capitalize">{platform === 'x' ? 'X' : platform}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto p-12 rounded-[2rem] bg-gradient-to-r from-brand/20 via-brand-dark/10 to-transparent border border-brand/30">
            <Globe className="w-16 h-16 text-brand-light mx-auto mb-6 drop-shadow-brand" />
            <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-white via-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
              Construyamos el Futuro
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm uppercase tracking-widest">
              ¿Tienes un proyecto en mente? Hablemos.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-brand text-white font-black rounded-2xl hover:bg-brand-light hover:scale-105 transition-all uppercase tracking-widest shadow-brand">
              Iniciar Proyecto <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
