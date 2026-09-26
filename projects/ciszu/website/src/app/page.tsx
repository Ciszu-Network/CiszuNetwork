import Link from "next/link";
import Image from "next/image";
import { assetResolver } from "@ciszunetwork/cdn";
import { SocialIcon, SOCIAL_COLORS, socialInk } from '@ciszu/ui';
import { CISZU_NETWORK, CISZUKO_ANTONY, CISZUBOT_LINKS, DONATION_LINKS, EXTERNAL_LINKS } from "@/config/site";
import { ArrowRight, Code, Shield, Zap, ExternalLink, Star, Globe, Music, Users, ChevronRight, Building, User, Gamepad2, Bot } from "lucide-react";
import { EcosystemSection } from "@ciszu/ui";
import QuickDocks from "@/components/molecules/QuickDocks";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ProjectCarousel } from "@/components/shared/ProjectCarousel";
import { getServerI18n } from "@/lib/i18n-server";
import { fillTemplate } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | HOME',
  description: 'Página principal de Ciszu Network: servicios, proyectos y el ecosistema digital.',
};

export default async function Home() {
  const { t } = await getServerI18n();

  const services = [
    { icon: Code, title: t.homePage.serviceWebTitle, desc: t.homePage.serviceWebDesc, color: "#3a6bf0" },
    { icon: Shield, title: t.homePage.serviceInfraTitle, desc: t.homePage.serviceInfraDesc, color: "#59b4ff" },
    { icon: Zap, title: t.homePage.serviceUxTitle, desc: t.homePage.serviceUxDesc, color: "#68cfff" },
  ];

  const projectSections = [
    {
      id: "ciszugamens",
      title: "Ciszugamens",
      tagline: t.homePage.tagCiszugamens,
      desc: t.homePage.descCiszugamens,
      href: "/projects/ciszugamens",
      icon: Gamepad2,
      gradient: "from-[#a855f7] via-[#3b82f6] to-[#22d3ee]",
      tech: ["Discord", "WhatsApp", "Telegram"],
    },
    {
      id: "ciszubot",
      title: "CiszuBot",
      tagline: t.homePage.tagCiszubot,
      desc: t.homePage.descCiszubot,
      href: "/projects/ciszubot",
      icon: Bot,
      gradient: "from-[#5865F2] via-[#7289DA] to-[#4752C4]",
      tech: ["Bot Development", "Community Management", "Automation"],
    },
    {
      id: "muzicmania",
      title: "MuzicMania",
      tagline: t.homePage.tagMuzicmania,
      desc: t.homePage.descMuzicmania,
      href: EXTERNAL_LINKS.muzicmania,
      icon: Music,
      gradient: "from-brand via-brand-light to-brand-accent",
      tech: ["Next.js", "Game Dev", "Web"],
      external: true,
    },
    {
      id: "ciszunetwork",
      title: "Ciszu Network",
      tagline: t.homePage.tagCiszunetwork,
      desc: t.homePage.descCiszunetwork,
      href: "/about",
      icon: Building,
      gradient: "from-brand via-brand-light to-neon-blue",
      tech: ["Web Dev", "Cloud", "UI/UX"],
    },
    {
      id: "ciszukoantony",
      title: "Ciszuko Antony",
      tagline: t.homePage.tagAntony,
      desc: t.homePage.descAntony,
      href: EXTERNAL_LINKS.ciszukoantony,
      icon: User,
      gradient: "from-neon-blue via-brand-accent to-neon-pink",
      tech: ["Content", "Streaming", "Gaming"],
      external: true,
    },
  ];

  const stats = [
    { value: "5+", label: t.homePage.statProjects },
    { value: "100%", label: t.homePage.statCommitment },
    { value: "24/7", label: t.homePage.statSupport },
  ];

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
          <Link href="/" className="flex flex-col items-center group cursor-pointer" aria-label={CISZU_NETWORK.name}>
            <div className="flex items-center justify-center mb-6">
              <Image
                src={assetResolver.resolve("projects/ciszu/content/logos/images/outline/logotype/gradient/color/ciszu_logotipo_outline_zcolor_cwhite_full.svg")}
                alt={CISZU_NETWORK.name}
                width={420}
                height={227}
                className="drop-shadow-brand group-hover:drop-shadow-[0_0_40px_rgba(35,63,146,0.9)] h-auto w-[min(420px,80vw)] transition-all duration-500 animate-float"
                priority
              />
            </div>
            <h1 className="sr-only">
              {CISZU_NETWORK.name}
            </h1>
            <div className="flex items-center justify-center mb-8">
              <Image
                src={assetResolver.resolve("projects/ciszu/content/logos/images/outline/tagline/tagline_white.svg") + "?v=2"}
                alt={CISZU_NETWORK.tagline}
                width={400}
                height={30}
                className="drop-shadow-brand group-hover:drop-shadow-[0_0_30px_rgba(35,63,146,0.8)] transition-all duration-500 animate-float-delayed"
                priority
              />
            </div>
          </Link>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-accent">
            {t.homePage.heroDescription}
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-brand/20 text-white font-black rounded-xl border-2 border-brand/50 hover:bg-brand hover:scale-105 transition-all text-lg font-header shadow-[0_0_20px_rgba(35,63,146,0.3)] hover:shadow-[0_0_30px_rgba(35,63,146,0.5)]">
              {t.homePage.ctaContact} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-black rounded-xl border-2 border-white/20 hover:bg-white/10 hover:scale-105 transition-all text-lg font-header">
              {t.homePage.ctaAbout}
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
          <AnimatedSection animation="fade-in-up" delay={0}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-brand-light via-brand-accent to-neon-blue bg-clip-text text-transparent uppercase tracking-tighter">
                {t.homePage.servicesTitle}
              </h2>
              <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm uppercase tracking-widest">
                {t.homePage.servicesSubtitle}
              </p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((s, i) => (
              <AnimatedSection key={i} animation="scale-in" delay={i * 100}>
                <div className="p-8 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/30 transition-all group hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
                    <s.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-header font-bold mb-3 text-white">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24 bg-gradient-to-b from-transparent to-black/80 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-brand-light via-brand-accent to-neon-blue bg-clip-text text-transparent uppercase tracking-tighter">
              {t.homePage.projectsTitle}
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm uppercase tracking-widest">
              {fillTemplate(t.homePage.projectsSubtitle, { site: CISZU_NETWORK.name })}
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <ProjectCarousel>
              {projectSections.map((p) => {
                const Comp = p.external ? 'a' : Link;
                const props = p.external
                  ? { href: p.href, target: '_blank', rel: 'noopener noreferrer' as const }
                  : { href: p.href };
                return (
                  <Comp key={p.id} {...props}
                    className="group relative p-[1px] rounded-[2rem] bg-gradient-to-br from-white/10 via-transparent to-transparent hover:from-brand-light/30 transition-all duration-500 overflow-hidden min-w-0 shrink-0"
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
                        {p.external ? t.homePage.projectVisit : t.homePage.projectExplore} <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </Comp>
                );
              })}
            </ProjectCarousel>
          </div>
        </div>
      </section>

      {/* CEO */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="scale-in" delay={200}>
            <div className="max-w-4xl mx-auto p-10 md:p-14 rounded-[2.5rem] bg-gradient-to-br from-brand/10 via-brand-dark/10 to-transparent border border-brand/30 text-center relative overflow-hidden group">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand/10 rounded-full blur-[80px] group-hover:bg-brand-light/15 transition-all" />
              <div className="relative z-10">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand via-brand-light to-brand-accent mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(35,63,146,0.4)] p-1">
                  <Image
                    src={assetResolver.resolve("shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg")}
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
                  {fillTemplate(t.homePage.ceoBio, { site: CISZU_NETWORK.name })}
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {Object.entries(CISZUKO_ANTONY.social).filter(([k]) => k !== 'discordTag').map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform"
                      style={{ color: socialInk(platform as keyof typeof SOCIAL_COLORS) }}
                    >
                      <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={22} />
                    </a>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {["Next.js", "React", "TypeScript", "UI/UX", t.homePage.skillCloud, t.homePage.skillLeadership].map((skill) => (
                    <span key={skill} className="px-4 py-2 rounded-full bg-brand/10 border border-brand/30 text-xs font-bold text-brand-light">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all">
                    {t.homePage.ceoContact} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a href={CISZUKO_ANTONY.portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                    <ExternalLink className="w-4 h-4" /> {t.homePage.ceoPortfolio}
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Social */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-header font-black text-white mb-4 uppercase tracking-tighter">
            {t.homePage.socialTitle}
          </h2>
          <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto">
            {fillTemplate(t.homePage.socialSubtitle, { site: CISZU_NETWORK.name })}
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
            {Object.entries(CISZU_NETWORK.social).map(([platform, url]) => {
              const key = platform as keyof typeof SOCIAL_COLORS;
              const color = SOCIAL_COLORS[key];
              // El texto usa el color atenuado para claro; el fondo y el borde
              // mantienen el tinte de marca puro.
              const ink = socialInk(key);
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 rounded-xl border transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${color}15`,
                    borderColor: `${color}40`,
                    color: ink,
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

      {/* Soporte y donaciones */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-header font-black text-white mb-4 uppercase tracking-tighter">
              {t.homePage.supportTitle}
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              {t.homePage.supportSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <a href={CISZUBOT_LINKS.website} target="_blank" rel="noopener noreferrer"
              className="p-8 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 to-transparent hover:scale-[1.02] transition-all">
              <h3 className="text-xl font-header font-black text-white mb-2 uppercase">CiszuBot</h3>
              <p className="text-gray-400 text-sm mb-4">{t.homePage.supportBotDesc}</p>
              <span className="text-brand-light font-bold text-sm uppercase tracking-widest">{t.homePage.supportVisitCta} →</span>
            </a>
            <a href={CISZUBOT_LINKS.topggBotVote} target="_blank" rel="noopener noreferrer"
              className="p-8 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 to-transparent hover:scale-[1.02] transition-all">
              <h3 className="text-xl font-header font-black text-white mb-2 uppercase">{t.homePage.supportVoteTitle}</h3>
              <p className="text-gray-400 text-sm mb-4">{t.homePage.supportVoteDesc}</p>
              <span className="text-brand-light font-bold text-sm uppercase tracking-widest">{t.homePage.supportVoteCta} →</span>
            </a>
            <a href={CISZUBOT_LINKS.topggServer} target="_blank" rel="noopener noreferrer"
              className="p-8 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 to-transparent hover:scale-[1.02] transition-all">
              <h3 className="text-xl font-header font-black text-white mb-2 uppercase">{t.homePage.supportServerTitle}</h3>
              <p className="text-gray-400 text-sm mb-4">{t.homePage.supportServerDesc}</p>
              <span className="text-brand-light font-bold text-sm uppercase tracking-widest">{t.homePage.supportServerCta} →</span>
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href={DONATION_LINKS.patreon} target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:border-brand/40 transition-all">
              Patreon
            </a>
            <a href={DONATION_LINKS.koFi} target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:border-brand/40 transition-all">
              Ko-fi
            </a>
            <a href={DONATION_LINKS.buyMeACoffee} target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:border-brand/40 transition-all">
              Buy Me a Coffee
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto p-12 rounded-[2rem] bg-gradient-to-r from-brand/20 via-brand-dark/10 to-transparent border border-brand/30">
            <Globe className="w-16 h-16 text-brand-light mx-auto mb-6 drop-shadow-brand" />
            <h2 className="text-4xl md:text-5xl font-header font-black bg-gradient-to-r from-white via-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
              {t.homePage.ctaTitle}
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm uppercase tracking-widest">
              {t.homePage.ctaSubtitle}
            </p>
            <Link href="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-brand text-white font-black rounded-2xl hover:bg-brand-light hover:scale-105 transition-all uppercase tracking-widest shadow-brand">
              {t.homePage.ctaButton} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ PROJECT PROVIDED BY CISZU NETWORK ═══ */}
      <EcosystemSection
        title="Project provided by CiszuNetwork"
        description="This project is part of the Ciszu Network ecosystem. Discover more projects and tools built by Ciszuko Antony."
        visitHref="https://ciszunetwork.vercel.app"
        projectsHref="https://ciszunetwork.vercel.app/projects"
        visitLabel="Visit CiszuNetwork"
        projectsLabel="View Projects"
      />

      <QuickDocks />
    </div>
  );
}
