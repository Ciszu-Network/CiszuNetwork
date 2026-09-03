'use client';

import React from 'react';
import { SmartImage, ScrollNavButton, useToast, CiszugamensLogo } from '@ciszu/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SOCIALS, I, FOOTER_SECTIONS } from '@/config/navigation';
import { useAppStore } from '@/store';

const MoonIcon = () => (
  <svg className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SunIcon = () => (
  <svg className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth={1}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round"/>
  </svg>
);

const IcoPhone = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IcoDiscord = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  const { setIsMenuOpen, setSidebarView, theme, setTheme } = useAppStore();
  const { toast } = useToast();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast(theme === 'dark' ? '[SISTEMA]: Modo claro activado.' : '[SISTEMA]: Modo oscuro activado.');
  };

  const openLangMenu = () => {
    setIsMenuOpen(true);
    setSidebarView('lang');
  };

  const isActive = (href: string) => pathname === href.split('#')[0];

  const pillCls = (active: boolean) =>
    `flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 rounded-lg border font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
      active
        ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(61,106,223,0.3)] text-neon-blue hover:text-white'
        : 'border-transparent text-white hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(61,106,223,0.2)]'
    }`;

  return (
    <footer className="relative bg-black border-t-2 border-white/10 pt-16 pb-8 px-4 overflow-hidden">
      {/* Animated gradient separator at top of footer */}
      <div className="absolute top-0 left-0 w-full h-[3px] animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_15px_rgba(61,106,223,0.4)]" />

      {/* Floating scroll arrows (Global) */}
      <ScrollNavButton accent="#3d6adf" accentAlt="#ff33cc" />


      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 mb-10 rounded-[2rem] bg-[#050505] border border-white/5 p-6 lg:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          {/* LEFT: Brand + socials with glow */}
          <div className="flex flex-col items-center text-center lg:w-[38%] gap-7 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
            <Link href="/" className="flex items-center justify-center gap-3 group active:scale-95 transition-all duration-300">
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png"
                alt="Ciszuko" width={28} height={25}
                className="drop-shadow-brand group-hover:drop-shadow-[0_0_15px_rgba(61,106,223,0.8)] transition-all duration-300"
              />
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png"
                alt="Ciszuko Antony" width={140} height={32}
                className="opacity-80 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_rgba(61,106,223,0.8)] transition-all duration-300"
              />
              <SmartImage
                src="projects/ciszukoantony/content/logos/images/samples/circle/circle_1_yt.png"
                alt="Ciszuko Antony YouTube"
                width={34} height={34}
                className="rounded-full shadow-[0_0_15px_rgba(167,139,250,0.35)] group-hover:shadow-[0_0_15px_rgba(61,106,223,0.8)] transition-all duration-300"
              />
            </Link>

            <div className="flex flex-wrap justify-center gap-3">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:scale-110 hover:text-neon-blue hover:border-neon-blue/60 hover:shadow-[0_0_15px_rgba(61,106,223,0.5)] hover:bg-gradient-to-tr hover:from-neon-blue/30 hover:to-transparent"
                  title={s.name}>
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Community Connectors (WhatsApp & Discord) — estilo MuzicMania */}
            <a
              href="https://github.com/Ciszu-Network/CiszuNetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full max-w-3xl mb-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-blue text-white hover:text-neon-blue px-5 py-3 rounded-2xl transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-sm font-bold tracking-wide">Open Source · Repositorio en GitHub</span>
            </a>

            {/* Community Connectors (WhatsApp & Discord) — estilo MuzicMania */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full max-w-3xl">
              <a
                href="https://wa.me/584126858111"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] hover:bg-gradient-to-r hover:from-[#25D366]/70 hover:to-[#128C7E]/70 px-6 py-4 rounded-2xl transition-all duration-300 hover:text-white shadow-lg shadow-[#25D366]/10 hover:shadow-[0_0_25px_#25D366] hover:scale-[1.02]"
              >
                <IcoPhone />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">
                    WhatsApp Directo
                  </span>
                  <span className="text-base font-bold tracking-tight leading-none group-hover:text-white">+58 412 6858111</span>
                </div>
              </a>

              <div className="hidden sm:block w-[1px] bg-white/10 self-stretch my-2" />

              <a
                href="https://discord.com/invite/W3kMtMMj6E"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex items-center justify-center gap-4 bg-[#5865F2]/10 border border-[#5865F2]/40 text-[#5865F2] hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da] hover:text-white px-8 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                <div className="flex items-center gap-2 transform group-hover:scale-110 transition-transform">
                  <CiszugamensLogo size={24} />
                  <IcoDiscord />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="font-header font-black tracking-tighter text-lg uppercase italic">Ciszugamens</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Discord Server</span>
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT: Nav columns with muzicmania-style pills */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.label}>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <span className="w-4 h-4 shrink-0">{section.icon}</span>
                  {section.label}
                </h4>
                <ul className="space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      {'external' in link && link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={pillCls(isActive(link.href))}>
                          <span className="opacity-70 shrink-0">{link.icon}</span>
                          <span className="tracking-wide whitespace-nowrap">{link.name}</span>
                        </a>
                      ) : (
                        <Link href={link.href} className={pillCls(isActive(link.href))}>
                          <span className="opacity-70 shrink-0">{link.icon}</span>
                          <span className="tracking-wide whitespace-nowrap">{link.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        <div className="flex flex-col items-center justify-center gap-8 pb-4 text-center">
          {/* Theme + Language controls */}
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
                theme === 'dark' ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
              }`}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </button>

            <button onClick={openLangMenu}
              className="group flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg"
              title="Language">
              {I.globe}
              <span className="text-gray-400 group-hover:text-white uppercase tracking-widest text-xs font-bold">LANG</span>
            </button>
          </div>

          {/* Copyright */}
          <p className="text-white text-xs text-center leading-relaxed">
            <span className="text-neon-blue">&copy;</span> 2024-{new Date().getFullYear()}{' '}
            <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:text-neon-cyan transition-colors">Ciszu Network</a> &amp; Ciszuko Antony. All rights reserved.
            <br />
            Hecho con amor por{' '}
            <Link href="/" className="text-neon-blue hover:text-neon-cyan transition-colors">Ciszuko Antony</Link> · respaldado por{' '}
            <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:text-neon-cyan transition-colors">Ciszu Network</a>.
            <br />
            Ciszu Network&reg; is a registered trademark.
          </p>
        </div>
      </div>
    </footer>
  );
}
