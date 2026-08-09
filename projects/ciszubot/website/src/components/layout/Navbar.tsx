'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, SmartImage } from '@ciszu/ui';
import { INVITE_URL, LANGS, LOGO_ISOTIPO, LOGO_LOGOTIPO, type Dict, type Lang } from '@/lib/i18n';

const NAV_LINKS: { href: string; key: 'home' | 'commands' | 'status' | 'support'; icon: string }[] = [
  { href: '/', key: 'home', icon: 'home' },
  { href: '/comandos', key: 'commands', icon: 'gamepad' },
  { href: '/estado', key: 'status', icon: 'clock' },
  { href: '/soporte', key: 'support', icon: 'support' },
];

interface NavbarProps {
  lang: Lang;
  dict: Dict;
  account?: { id: string; name: string | null; avatar: string | null } | null;
}

export default function Navbar({ lang, dict, account }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
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

  const setLang = (code: Lang) => {
    document.cookie = `ciszubot_lang=${code}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const linkCls = (href: string) =>
    `relative group flex items-center gap-2 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 border ${
      isActive(href)
        ? 'border-neon-blue bg-neon-blue/15 shadow-[0_0_15px_rgba(0,212,255,0.25)] text-neon-blue'
        : 'border-transparent text-muted hover:text-neon-blue hover:border-neon-blue/40 hover:bg-neon-blue/10'
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a14]/85 backdrop-blur-2xl border-b border-white/10">
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[length:200%_auto] animate-gradient-x bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]" />
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center h-[64px] gap-3">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group cursor-pointer">
            <SmartImage
              src={LOGO_ISOTIPO}
              alt="CiszuBot"
              width={36}
              height={36}
              className="group-hover:drop-shadow-[0_0_15px_rgba(0,212,255,0.8)] transition-all duration-300"
              fetchPriority="high"
            />
            <SmartImage
              src={LOGO_LOGOTIPO}
              alt="CiszuBot"
              width={150}
              height={30}
              className="hidden lg:block h-[30px] w-auto group-hover:drop-shadow-[0_0_15px_rgba(0,212,255,0.8)] transition-all duration-300"
              fetchPriority="high"
            />
          </Link>

          <div className="w-px h-7 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0" />

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkCls(link.href)}>
                <Icon name={link.icon} size={16} className="shrink-0" />
                <span>{dict.nav[link.key]}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Toggle de tema — estilo muzicmania */}
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

            {/* Selector de idioma — estilo muzicmania */}
            <div className="hidden sm:flex items-center rounded-full border border-white/10 bg-white/5 overflow-hidden shadow-lg">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    lang === l.code
                      ? 'bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                      : 'text-muted hover:text-white hover:bg-white/10'
                  }`}
                  aria-pressed={lang === l.code}
                  title={l.code === 'es' ? 'Español' : 'English'}
                >
                  <Icon name={l.flag} style="flag" size={14} />
                  {l.label}
                </button>
              ))}
            </div>

            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white shadow-[0_8px_22px_-8px_rgba(88,101,242,0.8)] transition-all hover:scale-105 hover:shadow-[0_10px_28px_-8px_rgba(0,212,255,0.8)] active:scale-95"
            >
              <Icon name="discord" size={16} className="[&>g]:fill-current" />
              <span>{dict.nav.invite}</span>
            </a>

            {/* Cuenta / Login */}
            {account ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 pr-2.5 transition hover:border-[#5865F2] hover:bg-white/10 cursor-pointer"
                  aria-label="Cuenta"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={account.avatar ?? `https://cdn.discordapp.com/embed/avatars/${Number(account.id) % 5}.png`}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="hidden lg:block max-w-[90px] truncate text-xs font-bold text-white/85">
                    {account.name ?? 'Cuenta'}
                  </span>
                  <Icon name="arrow-right" size={12} className={`text-white/60 transition-transform ${accountOpen ? 'rotate-90' : '-rotate-90'}`} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#12121f] shadow-2xl animate-fade-in-down">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="truncate text-sm font-bold text-white">{account.name ?? 'Cuenta'}</p>
                      <p className="truncate text-[11px] text-white/50">{account.id}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/5 hover:text-neon-blue"
                    >
                      <Icon name="server" size={15} /> Panel de control
                    </Link>
                    <a
                      href="/api/auth/logout"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition hover:bg-white/5"
                    >
                      <Icon name="close" size={15} /> Cerrar sesión
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/api/auth/discord"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-[#5865F2] text-white shadow-[0_8px_22px_-8px_rgba(88,101,242,0.8)] transition-all hover:scale-105 hover:shadow-[0_10px_28px_-8px_rgba(88,101,242,1)] active:scale-95"
              >
                <Icon name="discord" size={15} className="[&>g]:fill-current" />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </a>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-full border transition-all cursor-pointer active:scale-95 ${
                menuOpen
                  ? 'bg-neon-blue border-neon-blue text-black'
                  : 'bg-white/5 border-white/20 text-white hover:border-neon-blue'
              }`}
              aria-label="Menu"
            >
              {menuOpen ? <Icon name="close" size={20} /> : <Icon name="menu" size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a14]/95 backdrop-blur-2xl px-4 py-3 animate-fade-in-down">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-header font-bold transition-all ${
                isActive(link.href)
                  ? 'bg-neon-blue/15 border border-neon-blue/40 text-neon-blue'
                  : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isActive(link.href) ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'bg-black/40 text-white/60'
              }`}>
                <Icon name={link.icon} size={16} />
              </span>
              {dict.nav[link.key]}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/10">
            <div className="flex items-center rounded-full border border-white/10 bg-white/5 overflow-hidden">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold ${
                    lang === l.code
                      ? 'bg-gradient-to-r from-neon-blue to-neon-pink text-white'
                      : 'text-muted'
                  }`}
                >
                  <Icon name={l.flag} style="flag" size={14} />
                  {l.label}
                </button>
              ))}
            </div>
            {account ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white"
              >
                <Icon name="server" size={16} className="[&>g]:fill-current" />
                <span>Panel</span>
              </Link>
            ) : (
              <a
                href="/api/auth/discord"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-[#5865F2] text-white"
              >
                <Icon name="discord" size={16} className="[&>g]:fill-current" />
                <span>Iniciar sesión</span>
              </a>
            )}
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-white/10 text-white/85 border border-white/15"
            >
              <Icon name="external" size={14} />
              <span>Invitar</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
