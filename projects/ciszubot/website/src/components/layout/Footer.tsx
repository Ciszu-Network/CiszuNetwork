'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon, SmartImage } from '@ciszu/ui';
import { useAppStore } from '@/store';
import {
  CISZUKO_ANTONY,
  CISZU_NETWORK,
  DISCORD_SERVER,
  FACEBOOK,
  GITHUB_ORG,
  INSTAGRAM,
  INVITE_URL,
  LOGO_ISOTIPO,
  LOGO_LOGOTIPO,
  X_SOCIAL,
  YOUTUBE,
  BOT_PREFIX,
  TOP_GG_BOT,
  DISCORD_BOT_LIST_BOT,
  DISBOARD_SERVER,
  type Dict,
  type Lang,
} from '@/lib/i18n';

const IcoDiscord = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.031.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const IcoGithub = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const IcoYoutube = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const IcoFacebook = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const IcoInstagram = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const IcoX = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SOCIALS = [
  { Ico: IcoDiscord, href: DISCORD_SERVER, label: 'Discord', glow: 'hover:border-[#5865F2] hover:text-[#5865F2] hover:shadow-[0_0_15px_rgba(88,101,242,0.5)]' },
  { Ico: IcoGithub, href: GITHUB_ORG, label: 'GitHub', glow: 'hover:border-ink hover:text-ink hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]' },
  { Ico: IcoYoutube, href: YOUTUBE, label: 'YouTube', glow: 'hover:border-[#FF0000] hover:text-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]' },
  { Ico: IcoFacebook, href: FACEBOOK, label: 'Facebook', glow: 'hover:border-[#1877F2] hover:text-[#1877F2] hover:shadow-[0_0_15px_rgba(24,119,242,0.5)]' },
  { Ico: IcoInstagram, href: INSTAGRAM, label: 'Instagram', glow: 'hover:border-[#E4405F] hover:text-[#E4405F] hover:shadow-[0_0_15px_rgba(228,64,95,0.5)]' },
  { Ico: IcoX, href: X_SOCIAL, label: 'X', glow: 'hover:border-ink hover:text-ink hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]' },
];

const IcoUp = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IcoDown = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface FooterProps {
  lang: Lang;
  dict: Dict;
}

export default function Footer({ lang, dict }: FooterProps) {
  const { setIsMenuOpen, setSidebarView } = useAppStore();
  const isActive = (href: string) => typeof window !== 'undefined' && window.location.pathname === href;
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const setTheme = () => {
    const root = document.documentElement;
    const isDarkNow = root.classList.contains('dark');
    const next = isDarkNow ? 'light' : 'dark';
    root.classList.toggle('dark', next === 'dark');
    setIsDark(next === 'dark');
    document.cookie = `ciszubot_theme=${next}; path=/; max-age=31536000`;
  };

  return (
    <footer className="relative bg-bg border-t border-border pt-12 pb-6 px-4 md:px-8 overflow-hidden">
      {/* Scroll arrows flotantes (arriba / abajo) */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Ir arriba"
          className="p-3 bg-surface/90 backdrop-blur-md border-2 border-neon-blue rounded-full text-neon-blue shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:text-neon-pink hover:border-neon-pink hover:shadow-[0_0_15px_rgba(255,51,204,0.4)] transition-all active:scale-95"
        >
          <IcoUp />
        </button>
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          aria-label="Ir abajo"
          className="p-3 bg-surface/90 backdrop-blur-md border-2 border-neon-blue rounded-full text-neon-blue shadow-[0_0_15px_rgba(0,212,255,0.3)] hover:text-neon-pink hover:border-neon-pink hover:shadow-[0_0_15px_rgba(255,51,204,0.4)] transition-all active:scale-95"
        >
          <IcoDown />
        </button>
      </div>

      <div className="absolute top-0 left-0 w-full h-[2px] bg-[length:200%_auto] animate-gradient-x bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />

      <div className="max-w-screen-xl mx-auto">
        {/* Main Footer Layout Container (estilo MuzicMania) */}
        <div className="flex flex-col xl:flex-row gap-6 mb-8 bg-card border border-border p-6 lg:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          {/* LEFT: Brand & Community */}
          <div className="flex flex-col items-center text-center xl:w-2/5 border-b xl:border-b-0 xl:border-r border-border pb-8 xl:pb-0 xl:pr-10">
            <Link href="/" className="flex flex-col items-center gap-4 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 mb-6">
              <SmartImage
                src={LOGO_ISOTIPO}
                alt="CiszuBot"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full ring-2 ring-neon-blue/40 shadow-[0_0_20px_rgba(0,212,255,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] transition-all duration-300"
              />
              <SmartImage
                src={LOGO_LOGOTIPO}
                alt="CiszuBot"
                width={160}
                height={32}
                className="h-[32px] w-auto group-hover:drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] transition-all duration-300"
              />
              <span className="text-[10px] text-faint font-bold uppercase tracking-[0.25em]">
                {dict.nav.invite} · <code className="text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-1.5 py-0.5 rounded font-bold">{BOT_PREFIX}</code>
              </span>
            </Link>

            {/* Community Connector (Discord invite) — mismo estilo que el botón del header */}
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white px-8 py-3.5 font-header font-bold text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(0,212,255,0.2)] hover:scale-[1.02] hover:shadow-[0_10px_28px_-8px_rgba(0,212,255,0.8)] active:scale-95 mb-8"
            >
              <Icon name="discord" size={16} className="[&>g]:fill-current" />
              <span>{dict.nav.invite}</span>
            </a>

            {/* Social icons */}
            <div className="flex flex-wrap justify-center gap-3">
              {SOCIALS.map(({ Ico, href, label, glow }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className={`w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted transition-all duration-300 hover:scale-110 ${glow}`}
                >
                  <Ico />
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: Footer Nav Layout */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center sm:text-left content-start">
            <div className="flex flex-col items-center sm:items-start">
              <h4 className="text-neon-blue text-[10px] font-black uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">
                {dict.footer.explore}
              </h4>
              <div className="flex flex-col gap-1.5 w-full">
                {[
                  { href: '/', label: dict.nav.home, icon: 'home' },
                  { href: '/comandos', label: dict.nav.commands, icon: 'gamepad' },
                  { href: '/estado', label: dict.nav.status, icon: 'clock' },
                  { href: '/soporte', label: dict.nav.support, icon: 'support' },
                  { href: '/descargas', label: dict.nav.downloads, icon: 'download' },
                  { href: '/feedback', label: dict.nav.feedback, icon: 'message' },
                ].map((l) => {
                  const active = isActive(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 group ${
                        active
                          ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue hover:text-ink'
                          : 'border-transparent text-ink hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                      }`}
                    >
                      <span className="transition-colors duration-300 shrink-0">
                        <Icon name={l.icon} size={14} className="opacity-70" />
                      </span>
                      <span className="tracking-wide">{l.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <h4 className="text-neon-blue text-[10px] font-black uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">
                {dict.footer.projects}
              </h4>
              <div className="flex flex-col gap-1.5 w-full">
                <a href={CISZU_NETWORK} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border border-transparent text-ink font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                  <span className="tracking-wide">Ciszu Network</span>
                </a>
                <a href={CISZUKO_ANTONY} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border border-transparent text-ink font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                  <span className="tracking-wide">Ciszuko Antony</span>
                </a>
                <a href={GITHUB_ORG} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border border-transparent text-ink font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                  <span className="tracking-wide">GitHub</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <h4 className="text-neon-blue text-[10px] font-black uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">
                {dict.footer.bot}
              </h4>
              <div className="flex flex-col gap-1.5 w-full text-sm text-muted text-center sm:text-left">
                <span>
                  {dict.footer.prefix}: <code className="text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-1.5 py-0.5 rounded">{BOT_PREFIX}</code>
                </span>
                <span>
                  {dict.footer.slash}: <code className="text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-1.5 py-0.5 rounded">/comandos</code>
                </span>
                <span>20 comandos · 4 categorías</span>
                <span>7 listas de bots</span>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <h4 className="text-neon-blue text-[10px] font-black uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">
                {dict.footer.legal}
              </h4>
              <div className="flex flex-col gap-1.5 w-full">
                <Link href="/terminos"
                  className="flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border border-transparent text-ink font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                  <span className="tracking-wide">{dict.footer.terms}</span>
                </Link>
                <Link href="/privacidad"
                  className="flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border border-transparent text-ink font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]">
                  <span className="tracking-wide">{dict.footer.privacy}</span>
                </Link>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  {[
                    { href: TOP_GG_BOT, label: 'Top.gg', glow: 'hover:border-[#FF3366] hover:text-[#FF3366]' },
                    { href: DISCORD_BOT_LIST_BOT, label: 'DBL', glow: 'hover:border-neon-blue hover:text-neon-blue' },
                    { href: DISBOARD_SERVER, label: 'Disboard', glow: 'hover:border-neon-purple hover:text-neon-purple' },
                  ].map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold bg-card border border-border text-muted transition-all ${s.glow}`}>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        <div className="flex flex-col items-center justify-center gap-8 pb-2 text-center">

          {/* Toggles de tema e idioma — pill LANG abre el sidebar en vista idiomas */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={setTheme}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
                isDark ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
              }`}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDark ? (
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
              className="group flex items-center gap-3 px-4 py-2 bg-card hover:bg-muted/15 border border-border hover:border-neon-blue rounded-full transition-all duration-300 shadow-lg cursor-pointer"
              title={lang === 'es' ? 'Cambiar idioma' : 'Change language'}
            >
              <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-muted group-hover:text-neon-blue uppercase tracking-widest text-xs font-bold">LANG</span>
            </button>
          </div>

          {/* Copyright — siempre al final */}
          <div className="text-center space-y-2">
            <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
              <span className="text-neon-blue">&copy;</span>{' '}
              2024-{new Date().getFullYear()}{' '}
              <a href={CISZU_NETWORK} target="_blank" rel="noopener noreferrer"
                className="text-neon-blue font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">
                CISZU NETWORK
              </a>{' '}
              &amp; CISZUBOT. {dict.footer.rights}
            </p>
            <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
              {dict.footer.madeBy}{' '}
              <a href={CISZUKO_ANTONY} target="_blank" rel="noopener noreferrer"
                className="text-neon-blue font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">
                Ciszuko Antony
              </a>{' '}
              &middot; respaldado por{' '}
              <a href={CISZU_NETWORK} target="_blank" rel="noopener noreferrer"
                className="text-neon-blue font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]">
                CISZU NETWORK
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
