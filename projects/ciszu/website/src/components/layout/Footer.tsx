'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import { useAppStore } from '@/store';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { CISZU_NETWORK, CISZUKO_ANTONY, EXTERNAL_LINKS, SOCIAL_COLORS } from '@/config/site';
import {
  Globe,
  ExternalLink,
  HelpCircle,
  FileText,
  Sparkles,
  LifeBuoy,
  Users,
  Home,
  Info,
  Mail,
  Pickaxe,
  MessageCircle,
  MessageSquare,
  Send,
  Music,
  User,
  MessageSquareWarning,
  Download,
} from 'lucide-react';

const IcoArrowUp = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m18 15-6-6-6 6" />
  </svg>
);
const IcoArrowDown = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const IcoPhone = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IcoDiscord = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

interface FooterLink { name: string; href: string; icon: React.ReactNode; }
interface FooterColumn { title: string; links: FooterLink[]; }

const FOOTER_SECTIONS: FooterColumn[] = [
  {
    title: 'Ciszu Network',
    links: [
      { name: 'Inicio', href: '/', icon: <Home className="w-4 h-4" /> },
      { name: 'Sobre Nosotros', href: '/about', icon: <Info className="w-4 h-4" /> },
      { name: 'Equipo', href: '/team', icon: <Users className="w-4 h-4" /> },
      { name: 'Contacto', href: '/contact', icon: <Mail className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Información',
    links: [
      { name: 'FAQ', href: '/faq', icon: <HelpCircle className="w-4 h-4" /> },
      { name: 'Políticas', href: '/policies', icon: <FileText className="w-4 h-4" /> },
      { name: 'Guías', href: '/guidelines', icon: <Sparkles className="w-4 h-4" /> },
      { name: 'Soporte', href: '/support', icon: <LifeBuoy className="w-4 h-4" /> },
      { name: 'Feedback', href: '/feedback', icon: <MessageSquareWarning className="w-4 h-4" /> },
      { name: 'Descargas', href: '/descargas', icon: <Download className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Proyectos',
    links: [
      { name: 'Minecraft', href: '/projects/minecraft', icon: <Pickaxe className="w-4 h-4" /> },
      { name: 'Discord', href: '/projects/discord', icon: <MessageCircle className="w-4 h-4" /> },
      { name: 'WhatsApp', href: '/projects/whatsapp', icon: <MessageSquare className="w-4 h-4" /> },
      { name: 'Telegram', href: '/projects/telegram', icon: <Send className="w-4 h-4" /> },
      { name: 'MuzicMania', href: EXTERNAL_LINKS.muzicmania, icon: <Music className="w-4 h-4" /> },
      { name: 'Ciszuko Antony', href: EXTERNAL_LINKS.ciszukoantony, icon: <User className="w-4 h-4" /> },
    ],
  },
];

const SOCIAL_ITEMS = [
  { platform: 'youtube' as const, url: CISZU_NETWORK.social.youtube },
  { platform: 'facebook' as const, url: CISZU_NETWORK.social.facebook },
  { platform: 'instagram' as const, url: CISZU_NETWORK.social.instagram },
  { platform: 'x' as const, url: CISZU_NETWORK.social.x },
  { platform: 'github' as const, url: CISZU_NETWORK.social.github },
  { platform: 'discord' as const, url: CISZU_NETWORK.social.discord },
];

// Literal Tailwind hover glow classes per platform (source-present so they get generated).
const SOCIAL_GLOWS: Record<string, string> = {
  youtube: 'hover:border-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]',
  facebook: 'hover:border-[#1877F2] hover:shadow-[0_0_15px_rgba(24,119,242,0.5)]',
  instagram: 'hover:border-[#E4405F] hover:shadow-[0_0_15px_rgba(228,64,95,0.5)]',
  x: 'hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  github: 'hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  discord: 'hover:border-[#5865F2] hover:shadow-[0_0_15px_rgba(88,101,242,0.5)]',
};

const TECH_LINKS = [
  { name: 'Next.js', url: 'https://nextjs.org' },
  { name: 'Vercel', url: 'https://vercel.com' },
  { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  { name: 'IBM Plex Sans', url: 'https://fonts.google.com/specimen/IBM+Plex+Sans' },
  { name: 'Lucide', url: 'https://lucide.dev' },
  { name: 'Zustand', url: 'https://zustand-demo.pmnd.rs' },
];

export const Footer = () => {
  const { theme, setTheme, language, setIsMenuOpen, setSidebarView } = useAppStore();
  const [toast, setToast] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <footer className="relative bg-black border-t-2 border-brand/20 pt-12 pb-6 px-4 md:px-8 overflow-hidden z-30">
      {/* Animated separator line Top of Footer */}
      <div className="absolute top-0 left-0 w-full h-[2px] animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-brand-light via-brand-accent to-brand-light shadow-[0_0_15px_rgba(58,107,240,0.45)]" />

      {/* Floating scroll arrows */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-3 bg-black/60 backdrop-blur-md border-2 border-brand-light rounded-full text-brand-light hover:border-brand-accent hover:text-brand-accent transition-all active:scale-95" aria-label="Ir arriba">
          <IcoArrowUp />
        </button>
        <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="p-3 bg-black/60 backdrop-blur-md border-2 border-brand-light rounded-full text-brand-light hover:border-brand-accent hover:text-brand-accent transition-all active:scale-95" aria-label="Ir abajo">
          <IcoArrowDown />
        </button>
      </div>

      <div className="max-w-screen-xl mx-auto">
        {/* Main Footer Layout Container */}
        <div className="flex flex-col xl:flex-row gap-6 mb-8 bg-[#050505] border border-white/5 p-6 lg:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          {/* LEFT: Brand & Community */}
          <div className="flex flex-col items-center text-center xl:w-2/5 border-b xl:border-b-0 xl:border-r border-white/10 pb-8 xl:pb-0 xl:pr-10">
            <Link href="/" className="flex flex-col items-center gap-4 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 mb-6">
              <Image
                src={assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg')}
                alt={CISZU_NETWORK.name}
                width={72}
                height={72}
                className="drop-shadow-brand group-hover:drop-shadow-[0_0_25px_rgba(58,107,240,0.9)] transition-all duration-300"
              />
              <Image
                src={assetResolver.resolve('projects/ciszu/content/logos/images/outline/logotype/monochrome/ciszu_logotipo_outline_zwhite_cwhite_simple.svg')}
                alt={CISZU_NETWORK.name}
                width={200}
                height={68}
                className="group-hover:drop-shadow-[0_0_20px_rgba(58,107,240,0.7)] transition-all duration-300"
              />
              <Image
                src={assetResolver.resolve('projects/ciszu/content/logos/images/outline/tagline/tagline_white.svg')}
                alt={CISZU_NETWORK.tagline}
                width={220}
                height={17}
                className="opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>

            {/* Social icons with hover glow */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {SOCIAL_ITEMS.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.platform}
                  className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 ${SOCIAL_GLOWS[s.platform]}`}
                >
                  <SocialIcon platform={s.platform} size={18} colored={false} />
                </a>
              ))}
            </div>

            {/* Community Connectors (WhatsApp & Discord) */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full max-w-3xl">
              <a
                href={`https://wa.me/${CISZU_NETWORK.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] hover:bg-gradient-to-r hover:from-[#25D366]/70 hover:to-[#128C7E]/80 px-5 py-3.5 rounded-2xl transition-all duration-300 hover:text-white shadow-lg shadow-[#25D366]/10 hover:shadow-[0_0_25px_#25D366] hover:scale-[1.02]"
              >
                <IcoPhone />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">
                    {language === 'es' ? 'WhatsApp Directo' : 'Direct WhatsApp'}
                  </span>
                  <span className="text-sm font-bold tracking-tight leading-none group-hover:text-white">{CISZU_NETWORK.phone}</span>
                </div>
              </a>

              <div className="hidden sm:block w-[1px] bg-white/10 self-stretch my-2" />

              <a
                href={CISZU_NETWORK.social.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex items-center justify-center gap-4 bg-[#5865F2]/10 border border-[#5865F2]/40 text-[#5865F2] hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da] hover:text-white px-6 py-3.5 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                <div className="w-6 h-6 transform group-hover:scale-110 transition-transform">
                  <IcoDiscord />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="font-header font-black tracking-tighter text-base uppercase italic">Discord Server</span>
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT: Footer Nav Layout */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center sm:text-left content-start">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title} className="flex flex-col items-center sm:items-start">
                <span className="text-brand-light text-[10px] font-black uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_8px_rgba(58,107,240,0.5)]">
                  {section.title}
                </span>
                <div className="flex flex-col gap-1.5 w-full">
                  {section.links.map((link) => {
                    const external = link.href.startsWith('http');
                    const Comp = external ? 'a' : Link;
                    const props = external
                      ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' }
                      : { href: link.href };
                    const active = !external && isActive(link.href);
                    return (
                      <Comp
                        key={link.name}
                        {...props}
                        className={`flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
                          active
                            ? 'border-brand-light bg-brand-light/20 shadow-[0_0_15px_rgba(58,107,240,0.3)] text-brand-light hover:text-white'
                            : 'border-transparent text-white hover:border-brand-light hover:bg-brand-light/15 hover:text-brand-light hover:shadow-[0_0_10px_rgba(58,107,240,0.2)]'
                        }`}
                      >
                        <span className="shrink-0 text-brand-light/70 transition-colors duration-300 group-hover:text-brand-light">
                          {link.icon}
                        </span>
                        <span className="tracking-wide">{link.name}</span>
                        {external && <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />}
                      </Comp>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Controls & Bottom Bar */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        <div className="flex flex-col items-center justify-center gap-6 pb-6 text-center">

          {/* LEFT: Theme + Language triggers (muzicmania style) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
                theme === 'dark' ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
              }`}
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth={1}>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <button
              onClick={() => { setIsMenuOpen(true); setSidebarView('lang'); }}
              className="group flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg"
              title={language === 'es' ? 'Cambiar idioma' : 'Change language'}
            >
              <Globe className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12 text-white/70" />
              <span className="text-gray-400 group-hover:text-white uppercase tracking-widest text-xs font-bold">LANG</span>
            </button>
          </div>

          {/* RIGHT: Copyright */}
          <div className="text-center space-y-2">
            <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
              <span className="text-brand-light">&copy;</span>{' '}
              2024-{new Date().getFullYear()}{' '}
              <a href={EXTERNAL_LINKS.ciszunetwork} target="_blank" rel="noopener noreferrer"
                className="text-brand-light font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(58,107,240,0.8)]">
                CISZU NETWORK
              </a>{' '}
              &amp; TODOS LOS DERECHOS RESERVADOS.
            </p>
            <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
              {language === 'es' ? (
                <>Hecho con amor por{' '}
                  <a href={CISZUKO_ANTONY.portfolio} target="_blank" rel="noopener noreferrer"
                    className="text-brand-accent font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(14,185,220,0.8)]">
                    {CISZUKO_ANTONY.name.toUpperCase()}
                  </a>
                  {' '}&middot; respaldado por{' '}
                  <a href={EXTERNAL_LINKS.ciszunetwork} target="_blank" rel="noopener noreferrer"
                    className="text-brand-light font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(58,107,240,0.8)]">
                    {CISZU_NETWORK.name.toUpperCase()}
                  </a>
                </>
              ) : (
                <>Made with love by{' '}
                  <a href={CISZUKO_ANTONY.portfolio} target="_blank" rel="noopener noreferrer"
                    className="text-brand-accent font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(14,185,220,0.8)]">
                    {CISZUKO_ANTONY.name.toUpperCase()}
                  </a>
                  {' '}&middot; backed by{' '}
                  <a href={EXTERNAL_LINKS.ciszunetwork} target="_blank" rel="noopener noreferrer"
                    className="text-brand-light font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(58,107,240,0.8)]">
                    {CISZU_NETWORK.name.toUpperCase()}
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Tech stack credits */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 pb-2">
          {TECH_LINKS.map((tech) => (
            <a key={tech.name} href={tech.url} target="_blank" rel="noopener noreferrer"
              className="text-[9px] text-gray-600 hover:text-brand-light uppercase tracking-wider transition-colors">
              {tech.name}
            </a>
          ))}
        </div>
      </div>

      {/* Toast hint for non-ready controls */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in-up pointer-events-none">
          <button
            onClick={() => setToast(null)}
            className="bg-[#05050a]/95 border border-brand-light/40 px-6 py-3 rounded-full shadow-[0_4px_30px_rgba(58,107,240,0.4)] backdrop-blur-md flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-brand-light animate-pulse shrink-0" />
            <span className="text-brand-light font-bold uppercase tracking-widest text-[10px] sm:text-xs">{toast}</span>
          </button>
        </div>
      )}
    </footer>
  );
};

export default Footer;