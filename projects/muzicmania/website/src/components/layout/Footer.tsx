'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { ScrollNavButton } from '@ciszu/ui';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { updatePreferences, reloadAfterPrefChange } from '@/lib/preferences';

import {
  I,
  SOCIALS,
  MAIN_NAV_LINKS,
  COMMUNITY_LINKS,
  GENERAL_INFO_LINKS,
  LEGAL_LINKS,
} from '@/config/navigation';

const CISZU_NETWORK_URL = 'https://ciszunetwork.vercel.app';
const CISZUKO_ANTONY_URL = 'https://ciszukoantony.vercel.app';
const CISZUBOT_URL = 'https://ciszubot.vercel.app';

const IcoDiscord = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.079.112 18.1.13 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;
const IcoGithub = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>;
const IcoPhone = () => <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

/**
 * Acento de cada columna del footer.
 *
 * Cada grupo tiene su color de la paleta MuzicMania (cyan/purple/yellow/green)
 * y los iconos lo heredan vía `currentColor`. Los tonos existen en el bloque
 * claro de globals.scss (`.light .text-neon-*`), así que se leen igual en tema
 * oscuro y claro.
 */
const SECTION_ACCENTS = {
  cyan: {
    head: 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.45)]',
    icon: 'text-neon-cyan',
    hover: 'hover:border-neon-cyan hover:bg-neon-cyan/15 hover:text-neon-cyan hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]',
    active: 'border-neon-cyan bg-neon-cyan/20 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-cyan',
  },
  purple: {
    head: 'text-neon-purple drop-shadow-[0_0_8px_rgba(128,0,255,0.45)]',
    icon: 'text-neon-purple',
    hover: 'hover:border-neon-purple hover:bg-neon-purple/15 hover:text-neon-purple hover:shadow-[0_0_10px_rgba(128,0,255,0.25)]',
    active: 'border-neon-purple bg-neon-purple/20 shadow-[0_0_15px_rgba(128,0,255,0.3)] text-neon-purple',
  },
  yellow: {
    head: 'text-neon-yellow drop-shadow-[0_0_8px_rgba(255,217,0,0.45)]',
    icon: 'text-neon-yellow',
    hover: 'hover:border-neon-yellow hover:bg-neon-yellow/15 hover:text-neon-yellow hover:shadow-[0_0_10px_rgba(255,217,0,0.2)]',
    active: 'border-neon-yellow bg-neon-yellow/20 shadow-[0_0_15px_rgba(255,217,0,0.3)] text-neon-yellow',
  },
  green: {
    head: 'text-neon-green drop-shadow-[0_0_8px_rgba(0,255,136,0.45)]',
    icon: 'text-neon-green',
    hover: 'hover:border-neon-green hover:bg-neon-green/15 hover:text-neon-green hover:shadow-[0_0_10px_rgba(0,255,136,0.2)]',
    active: 'border-neon-green bg-neon-green/20 shadow-[0_0_15px_rgba(0,255,136,0.3)] text-neon-green',
  },
} as const;

type AccentKey = keyof typeof SECTION_ACCENTS;

interface FooterLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface FooterGroup {
  title: string;
  icon: React.ReactNode;
  accent: AccentKey;
  links: FooterLink[];
}

/** Redes con color de marca propio. Discord y GitHub no se repiten aquí:
 *  ya viven en el botón de comunidad y en el de repositorio. */
const BRAND_SOCIALS = SOCIALS.filter((s) => !['Discord', 'GitHub'].includes(s.name));

export const Footer = ({ lang, dict }: { lang: string; dict: Record<string, any> }) => {
  const pathname = usePathname();
  const { isNavigating, setIsMenuOpen, setSidebarView, darkMode, setDarkMode } = useAppStore();

  const isActive = (href: string) => pathname === href;

  const applyThemeChange = () => {
    const next = !darkMode;
    setDarkMode(next);
    updatePreferences({ theme: next ? 'dark' : 'light' });
    reloadAfterPrefChange(next ? `[SISTEMA]: ${dict.system.darkOn}` : `[SISTEMA]: ${dict.system.lightOn}`);
  };

  const GROUPS: FooterGroup[] = [
    {
      title: dict.footer.navigation,
      icon: I.home,
      accent: 'cyan',
      links: MAIN_NAV_LINKS,
    },
    {
      title: dict.footer.community,
      icon: I.team,
      accent: 'purple',
      links: COMMUNITY_LINKS,
    },
    {
      title: dict.nav.information,
      icon: I.info,
      accent: 'yellow',
      links: GENERAL_INFO_LINKS,
    },
    {
      title: dict.footer.ecosystem,
      icon: I.handshake,
      accent: 'green',
      links: [
        { name: 'Ciszu Network', href: CISZU_NETWORK_URL, icon: I.team },
        { name: 'Ciszuko Antony', href: CISZUKO_ANTONY_URL, icon: I.user },
        { name: 'CiszuBot', href: CISZUBOT_URL, icon: I.support },
        { name: dict.footer.courses, href: `${CISZU_NETWORK_URL}/courses`, icon: I.docs },
      ],
    },
  ];

  return (
    <footer className="relative bg-black border-t-2 border-white/10 pt-10 pb-6 px-4 md:px-8 overflow-hidden z-30">
      {/* Animated separator line Top of Footer */}
      <div className={`absolute top-0 left-0 w-full h-[3px] transition-colors duration-500 animate-gradient-x ${
        isNavigating
          ? 'bg-[length:200%_auto] bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
          : 'bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink shadow-[0_0_15px_rgba(0,212,255,0.4)]'
      }`} />

      {/* Floating scroll arrows (Global) */}
      {pathname !== '/play' && (
        <ScrollNavButton accent="#00f0ff" accentAlt="#ff33cc" className="[.is-fullscreen_&]:hidden" />
      )}

      <div className="max-w-[90rem] mx-auto">
        {/* Main Footer Layout Container */}
        <div className="flex flex-col xl:flex-row gap-6 mb-8 bg-[#050505] border border-white/5 p-6 lg:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          {/* LEFT: Brand & Community */}
          <div className="flex flex-col items-center text-center xl:w-2/5 border-b xl:border-b-0 xl:border-r border-white/10 pb-8 xl:pb-0 xl:pr-10">
            <Link href="/" className="flex flex-col items-center gap-4 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 mb-6">
              <Image
                src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
                alt="Isotipo" width={72} height={72}
                className="drop-shadow-neon-blue group-hover:drop-shadow-[0_0_25px_rgba(0,212,255,0.9)] transition-all duration-300"
              />
              <Image
                src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')}
                alt="MuzicMania" width={220} height={48}
                className="group-hover:drop-shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-300"
              />
            </Link>

            {/* Socials: cada icono con el color de su marca (X, YouTube, Instagram, TikTok, Facebook) */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {BRAND_SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  className={`w-10 h-10 rounded-full ${social.bgCol} border ${social.borderCol} ${social.textCol} flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.hoverBg} ${social.hoverColor}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Open Source — repositorio del ecosistema */}
            <a
              href="https://github.com/Ciszu-Network/CiszuNetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-blue text-white hover:text-neon-blue px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg mb-8"
            >
              <IcoGithub />
              <span className="text-sm font-bold tracking-wide">{dict.footer.openSource}</span>
            </a>

            {/* Community Connectors (WhatsApp & Discord) */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full max-w-3xl mb-8">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/584126858111"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] hover:bg-gradient-to-r hover:from-[#25D366]/70 hover:to-[#128C7E]/70 px-6 py-4 rounded-2xl transition-all duration-300 hover:text-white shadow-lg shadow-[#25D366]/10 hover:shadow-[0_0_25px_#25D366] hover:scale-[1.02]"
              >
                <IcoPhone />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">{dict.footer.whatsapp}</span>
                  <span className="text-base font-bold tracking-tight leading-none group-hover:text-white">+58 412 6858111</span>
                </div>
              </a>

              {/* Vertical Divider (Desktop Only) */}
              <div className="hidden sm:block w-[1px] bg-white/10 self-stretch my-2" />

              {/* Discord Server Button */}
              <a
                href="https://discord.gg/W3kMtMMj6E"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex items-center justify-center gap-4 bg-[#5865F2]/10 border border-[#5865F2]/40 text-[#5865F2] hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da] hover:text-white px-8 py-4 rounded-2xl transition-all shadow-lg active-depth"
              >
                <div className="flex items-center gap-2 transform group-hover:scale-110 transition-transform">
                  <Image
                    src={resolveAssetPath('projects/ciszugamens/content/logos/images/outline/isotype/gradient/color/ciszugamens_logo_isotipo_degradado_outline_color_cpurple_zblue.svg')}
                    alt="Ciszugamens"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                  <IcoDiscord />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="font-header font-black tracking-tighter text-lg uppercase italic">Ciszugamens</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{dict.footer.discordServer}</span>
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT: Footer Nav Layout — una columna por grupo, cada una con su acento */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left content-start">
            {GROUPS.map((group) => {
              const accent = SECTION_ACCENTS[group.accent];
              return (
                <div key={group.title} className="flex flex-col items-center sm:items-start">
                  <h4 className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${accent.head}`}>
                    <span className="inline-flex shrink-0" aria-hidden="true">{group.icon}</span>
                    {group.title}
                  </h4>
                  <div className="flex flex-col gap-1.5 w-full">
                    {group.links.map((link) => {
                      const external = /^https?:/.test(link.href);
                      const active = !external && isActive(link.href);
                      const className = `flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
                        active
                          ? `${accent.active} hover:text-white`
                          : `border-transparent text-white ${accent.hover}`
                      }`;
                      const content = (
                        <>
                          <span className={`shrink-0 ${accent.icon}`}>{link.icon}</span>
                          <span className="tracking-wide">{link.name}</span>
                        </>
                      );
                      return external ? (
                        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                          {content}
                        </a>
                      ) : (
                        <Link key={link.href} href={link.href} className={className}>
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Controls & Bottom Bar */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        <div className="flex flex-col items-center justify-center gap-6 pb-6 text-center">

          {/* MINI NAVBAR inferior: fila de enlaces rápidos con iconos (estilo footer de ciszubot) */}
          <nav aria-label={dict.footer.legal} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    active
                      ? 'border-neon-pink/60 bg-neon-pink/15 text-neon-pink'
                      : 'border-transparent text-white/70 hover:border-neon-pink/40 hover:bg-neon-pink/10 hover:text-neon-pink'
                  }`}
                >
                  <span className="text-neon-pink shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Botonera: tema e idioma */}
          <div className="flex items-center gap-4">
            <button
              onClick={applyThemeChange}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
                darkMode ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
              }`}
               title={dict.common[darkMode ? 'lightMode' : 'darkMode']}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth={1}>
                  <circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            <button
              onClick={() => { setIsMenuOpen(true); setSidebarView('lang'); }}
              className="group flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg"
               title={dict.common.changeLanguage}
            >
              <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="text-gray-400 group-hover:text-white uppercase tracking-widest text-xs font-bold">{dict.footer.lang}</span>
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center space-y-2">
            <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
              <span className="text-neon-cyan">&copy;</span> 2024-{new Date().getFullYear()}{' '}
              <a href={CISZU_NETWORK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors cursor-pointer uppercase font-black">CISZU NETWORK</a> &amp; MUZICMANIA. {dict.footer.rights.toUpperCase()}
            </p>
            <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
              {dict.footer.madeBy.toUpperCase()}{' '}
              <a href={CISZUKO_ANTONY_URL} target="_blank" rel="noopener noreferrer" className="text-neon-cyan font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">CISZUKO ANTONY</a>{' '}
              · {dict.common.learnMore.toUpperCase()}{' '}
              <a href={CISZU_NETWORK_URL} target="_blank" rel="noopener noreferrer" className="text-neon-cyan font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">CISZU NETWORK</a>
            </p>
          </div>
        </div>
        </div>
      </footer>
  );
};

export default Footer;
