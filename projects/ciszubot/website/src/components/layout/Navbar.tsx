'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, SmartImage } from '@ciszu/ui';
import { INVITE_URL, LANGS, LOGO_ISOTIPO, LOGO_LOGOTIPO, type Dict, type Lang } from '@/lib/i18n';

const NAV_PAGES: { href: string; key: 'home' | 'commands' | 'status' | 'support' | 'downloads' | 'feedback'; icon: string }[] = [
  { href: '/', key: 'home', icon: 'home' },
  { href: '/comandos', key: 'commands', icon: 'gamepad' },
  { href: '/estado', key: 'status', icon: 'clock' },
  { href: '/soporte', key: 'support', icon: 'support' },
  { href: '/descargas', key: 'downloads', icon: 'download' },
  { href: '/feedback', key: 'feedback', icon: 'message' },
];

const SEARCH_PAGES: { href: string; labelKey: string; icon: string; keywords: string[] }[] = [
  { href: '/', labelKey: 'home', icon: 'home', keywords: ['inicio', 'home', 'main'] },
  { href: '/comandos', labelKey: 'commands', icon: 'gamepad', keywords: ['comandos', 'commands', 'bot', 'slash'] },
  { href: '/estado', labelKey: 'status', icon: 'clock', keywords: ['estado', 'status', 'uptime', 'online'] },
  { href: '/soporte', labelKey: 'support', icon: 'support', keywords: ['soporte', 'support', 'ayuda', 'help'] },
  { href: '/descargas', labelKey: 'downloads', icon: 'download', keywords: ['descargas', 'downloads', 'app', 'exe'] },
  { href: '/feedback', labelKey: 'feedback', icon: 'message', keywords: ['feedback', 'reporte', 'report', 'problema'] },
  { href: '/dashboard', labelKey: 'dashboard', icon: 'server', keywords: ['panel', 'dashboard', 'config', 'admin'] },
  { href: '/privacidad', labelKey: 'privacidad', icon: 'lock', keywords: ['privacidad', 'privacy'] },
  { href: '/terminos', labelKey: 'terminos', icon: 'external', keywords: ['terminos', 'terms', 'legal'] },
];

interface NavbarProps {
  lang: Lang;
  dict: Dict;
  account?: { id: string; name: string | null; avatar: string | null } | null;
}

export default function Navbar({ lang, dict, account }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const firstRender = useRef(true);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchToggleRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const authRef = useRef<HTMLDivElement | null>(null);
  const inviteRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const suggestions = query.trim().length > 0
    ? SEARCH_PAGES.filter(
        (p) =>
          dict.nav[p.labelKey as keyof typeof dict.nav].toLowerCase().includes(query.toLowerCase()) ||
          p.href.toLowerCase().includes(query.toLowerCase()) ||
          p.keywords.some((k) => k.includes(query.toLowerCase()))
      )
    : [];

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Clear navigation loader once the route change completed
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setIsNavigating(false);
  }, [pathname]);

  // Close search/menu on route change
  useEffect(() => {
    setSearchOpen(false);
    setQuery('');
    setAuthOpen(false);
    setInviteOpen(false);
    setAccountOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Focus the search input when opening
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        if (searchToggleRef.current && searchToggleRef.current.contains(e.target as Node)) {
          return;
        }
        setSearchOpen(false);
      }
      const target = e.target as Node;
      if (authRef.current && !authRef.current.contains(target)) setAuthOpen(false);
      if (inviteRef.current && !inviteRef.current.contains(target)) setInviteOpen(false);
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Global click interceptor: show loader when navigating between internal pages
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target?.href &&
        target.href.startsWith(window.location.origin) &&
        !target.href.includes('#') &&
        target.target !== '_blank'
      ) {
        const targetUrl = new URL(target.href);
        if (targetUrl.pathname !== pathname) {
          setIsNavigating(true);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

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
    `relative group flex items-center gap-0 hover:gap-1.5 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
      isActive(href)
        ? 'border-neon-blue bg-neon-blue/15 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue gap-1.5 -translate-y-0.5 hover:text-white'
        : 'border-transparent text-muted hover:text-neon-blue hover:border-neon-blue/40 hover:bg-neon-blue/10 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]'
    }`;

  const linkLabelCls = (href: string) =>
    `max-w-0 overflow-hidden transition-all duration-300 group-hover:max-w-[100px] ${isActive(href) ? 'max-w-[100px]' : ''}`;

  return (
    <>
      {/* Loader de navegación global — aparece al navegar entre páginas */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center p-4 rounded-full bg-[#0a0a14]/90 border backdrop-blur-md shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300 ${
          isNavigating
            ? 'translate-y-0 opacity-100 border-emerald-400/60 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
            : 'translate-y-10 opacity-0 pointer-events-none border-neon-blue/50 text-neon-blue'
        }`}
      >
        <svg
          className="w-8 h-8 animate-pulse text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a14]/85 backdrop-blur-2xl border-b border-white/10">
        <div
          className={`absolute bottom-0 left-0 w-full h-[2px] bg-[length:200%_auto] animate-gradient-x transition-colors duration-500 ${
            isNavigating
              ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
              : 'bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]'
          }`}
        />
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
            {NAV_PAGES.map((link) => (
              <Link key={link.href} href={link.href} className={linkCls(link.href)}>
                <Icon name={link.icon} size={16} className="shrink-0" />
                <span className={linkLabelCls(link.href)}>{dict.nav[link.key]}</span>
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

            {/* Buscador — toggle + panel flotante */}
            <div className="relative" ref={searchRef}>
              <button
                ref={searchToggleRef}
                onClick={() => { setSearchOpen(v => !v); setMenuOpen(false); setAccountOpen(false); setAuthOpen(false); setInviteOpen(false); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer border group ${
                  searchOpen
                    ? 'bg-neon-blue border-neon-blue text-black'
                    : 'bg-white/5 border-white/20 text-white hover:border-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.25)]'
                }`}
                aria-label={dict.nav.search}
                title={dict.nav.search}
              >
                <Icon name="search" size={18} />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-12 w-[min(90vw,24rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f1c]/95 backdrop-blur-2xl shadow-2xl animate-fade-in-down">
                  <div className="flex items-center gap-2 border-b border-white/10 px-3">
                    <Icon name="search" size={16} className="shrink-0 text-white/50" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setSearchOpen(false);
                        if (e.key === 'Enter' && suggestions.length > 0) {
                          window.location.href = suggestions[0].href;
                        }
                      }}
                      placeholder={dict.nav.search}
                      className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery('')}
                        className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
                        aria-label="clear"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1.5">
                    {suggestions.length === 0 && query.trim().length > 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-white/50">{dict.nav.searchHint}</p>
                    ) : (
                      suggestions.map((p) => (
                        <Link
                          key={p.href}
                          href={p.href}
                          onClick={() => { setSearchOpen(false); setQuery(''); }}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/85 transition hover:bg-white/5 hover:text-neon-blue"
                        >
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/40 text-white/70 shrink-0">
                            <Icon name={p.icon} size={14} />
                          </span>
                          {dict.nav[p.labelKey as keyof typeof dict.nav]}
                          <span className="ml-auto text-[11px] text-white/35">{p.href}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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

            {/* Invitar — icono desplegable */}
            <div className="relative hidden sm:block" ref={inviteRef}>
              <button
                onClick={() => { setInviteOpen(!inviteOpen); setAuthOpen(false); setAccountOpen(false); setSearchOpen(false); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md border group ${
                  inviteOpen
                    ? 'bg-neon-blue border-neon-blue text-black'
                    : 'bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white hover:scale-110 hover:shadow-[0_10px_28px_-8px_rgba(0,212,255,0.8)]'
                } active:scale-95`}
                aria-label={dict.nav.invite}
                title={dict.nav.invite}
                aria-expanded={inviteOpen}
              >
                <Icon name="discord" size={17} className="[&>g]:fill-current" />
              </button>
              {inviteOpen && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#12121f] shadow-2xl animate-fade-in-down">
                <a
                  href={INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/5 hover:text-neon-blue"
                >
                  <Icon name="external" size={15} /> {dict.nav.invite}
                </a>
                <p className="border-t border-white/10 px-4 py-2.5 text-[11px] text-white/45">
                  Añade a CiszuBot a tu servidor de Discord
                </p>
                </div>
              )}
            </div>

            {/* Cuenta / Login */}
            {account ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => { setAccountOpen(!accountOpen); setAuthOpen(false); setSearchOpen(false); setInviteOpen(false); }}
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
              <div className="relative" ref={authRef}>
                <button
                  onClick={() => { setAuthOpen(!authOpen); setAccountOpen(false); setSearchOpen(false); setInviteOpen(false); }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer border ${
                    authOpen
                      ? 'bg-[#5865F2] border-[#5865F2] text-white shadow-[0_0_12px_rgba(88,101,242,0.6)]'
                      : 'bg-white/5 border-white/20 text-white hover:border-[#5865F2] hover:shadow-[0_0_10px_rgba(88,101,242,0.4)]'
                  }`}
                  aria-label="Iniciar sesión"
                  title="Iniciar sesión"
                >
                  <Icon name="user" size={17} />
                </button>
                {authOpen && (
                  <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-xl border border-white/10 bg-[#12121f] shadow-2xl animate-fade-in-down">
                    <a
                      href="/api/auth/discord"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold bg-[#5865F2] text-white transition hover:bg-[#4752c4]"
                    >
                      <Icon name="discord" size={16} className="[&>g]:fill-current" />
                      <span>Iniciar sesión con Discord</span>
                    </a>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-neon-blue"
                    >
                      <Icon name="server" size={15} /> Panel de control
                    </Link>
                    <a
                      href={INVITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-neon-blue"
                    >
                      <Icon name="external" size={15} /> {dict.nav.invite}
                    </a>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); setAuthOpen(false); setInviteOpen(false); setAccountOpen(false); }}
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
          {NAV_PAGES.map((link) => (
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
    </>
  );
}
