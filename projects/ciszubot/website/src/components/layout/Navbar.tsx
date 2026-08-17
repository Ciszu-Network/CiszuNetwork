'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, SmartImage } from '@ciszu/ui';
import { Menu, X, Search } from 'lucide-react';
import { useAppStore } from '@/store';
import { INVITE_URL, LOGO_ISOTIPO, LOGO_LOGOTIPO, type Dict, type Lang } from '@/lib/i18n';

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

const LANGS = [
  { code: 'ES-LA', label: 'Español (Latam)', flag: (
    <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner">
      <rect width="512" height="170.6" fill="#ffcc00"/>
      <rect width="512" height="170.6" y="170.6" fill="#003399"/>
      <rect width="512" height="170.6" y="341.2" fill="#cf142b"/>
      <g fill="#fff" transform="translate(256,230) scale(4)">
        <circle cx="0" cy="0" r="18" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2,2"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-45) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-22.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(22.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(45) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(-67.5) translate(0,-18) scale(0.4)"/>
        <path d="M0-22l1.5 4.5h4.5l-3.5 3 1.5 4.5-4-3-4 3 1.5-4.5-3.5-3h4.5z" transform="rotate(67.5) translate(0,-18) scale(0.4)"/>
      </g>
    </svg>
  ) },
  { code: 'ES-ES', label: 'Español (España)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#ad1519"/><rect width="512" height="300" y="106" fill="#fabd00"/><circle cx="150" cy="256" r="50" fill="#ad1519"/></svg> },
  { code: 'EN-US', label: 'English (US)', flag: (
    <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner font-sans">
      <rect width="512" height="512" fill="#bd3d44"/>
      <rect width="512" height="36" y="36.5" fill="#fff"/><rect width="512" height="36" y="109.5" fill="#fff"/><rect width="512" height="36" y="182.5" fill="#fff"/><rect width="512" height="36" y="255.5" fill="#fff"/><rect width="512" height="36" y="328.5" fill="#fff"/><rect width="512" height="36" y="401.5" fill="#fff"/><rect width="512" height="36" y="474.5" fill="#fff"/>
      <rect width="240" height="260" fill="#192f5d"/>
      <g fill="#fff">
        <circle cx="30" cy="35" r="5"/><circle cx="70" cy="35" r="5"/><circle cx="110" cy="35" r="5"/><circle cx="150" cy="35" r="5"/><circle cx="190" cy="35" r="5"/>
        <circle cx="50" cy="65" r="5"/><circle cx="90" cy="65" r="5"/><circle cx="130" cy="65" r="5"/><circle cx="170" cy="65" r="5"/><circle cx="210" cy="65" r="5"/>
        <circle cx="30" cy="95" r="5"/><circle cx="70" cy="95" r="5"/><circle cx="110" cy="95" r="5"/><circle cx="150" cy="95" r="5"/><circle cx="190" cy="95" r="5"/>
        <circle cx="50" cy="125" r="5"/><circle cx="90" cy="125" r="5"/><circle cx="130" cy="125" r="5"/><circle cx="170" cy="125" r="5"/><circle cx="210" cy="125" r="5"/>
        <circle cx="30" cy="155" r="5"/><circle cx="70" cy="155" r="5"/><circle cx="110" cy="155" r="5"/><circle cx="150" cy="155" r="5"/><circle cx="190" cy="155" r="5"/>
      </g>
    </svg>
  ) },
  { code: 'EN-UK', label: 'English (UK)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60"/><path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30"/><rect width="512" height="100" y="206" fill="#fff"/><rect width="100" height="512" x="206" fill="#fff"/><rect width="512" height="60" y="226" fill="#cf142b"/><rect width="60" height="512" x="226" fill="#cf142b"/></svg> },
  { code: 'PT', label: 'Português (Brasil)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#009c3b"/><path d="M256 70l186 186-186 186L70 256z" fill="#ffdf00"/><circle cx="256" cy="256" r="100" fill="#002776"/></svg> },
  { code: 'FR', label: 'Français', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#002395"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ed2939"/></svg> },
  { code: 'IT', label: 'Italiano', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#009246"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ce2b37"/></svg> },
  { code: 'DE', label: 'Deutsch', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#000"/><rect width="512" height="170" y="171" fill="#d00"/><rect width="512" height="171" y="341" fill="#ffce00"/></svg> },
  { code: 'RU', label: 'Русский', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#fff"/><rect width="512" height="170" y="171" fill="#0039a6"/><rect width="512" height="171" y="341" fill="#d52b1e"/></svg> },
  { code: 'JA', label: '日本語 (Japanese)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="120" fill="#bc002d"/></svg> },
  { code: 'KO', label: '한국어 (Korean)', flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="80" fill="#cd2e3a"/><path d="M256 176a80 80 0 0 0 0 160c44 0 44-80 80-80s36 80 80 80" fill="#0047a0"/></svg> }];

const IcoUser = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

interface NavbarProps {
  lang: Lang;
  dict: Dict;
  account?: { id: string; name: string | null; avatar: string | null } | null;
}

export default function Navbar({ lang, dict, account }: NavbarProps) {
  const pathname = usePathname();
  const { isMenuOpen, setIsMenuOpen, sidebarView, setSidebarView } = useAppStore();
  const [toast, setToast] = useState<string | null>(null);
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

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const floating = scrolled && !searchOpen && !isMenuOpen;

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
    setIsMenuOpen(false);
    setSidebarView('main');
    setToast(null);
  }, [pathname]);

  // Auto-hide the language-unavailable toast after ~4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

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

  const currentLangCode = lang === 'es' ? 'ES-LA' : 'EN-US';

  const handleLangSelect = (code: string) => {
    if (code === 'ES-LA') {
      if (lang !== 'es') setLang('es');
    } else if (code === 'EN-US') {
      if (lang !== 'en') setLang('en');
    } else {
      setToast('Esta función no está desarrollada para la beta aún');
    }
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const linkCls = (href: string) =>
    `relative group flex items-center gap-0 hover:gap-1.5 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 border cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
      isActive(href)
        ? 'border-neon-blue bg-neon-blue/15 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue gap-1.5 -translate-y-0.5 hover:text-ink'
        : 'border-transparent text-muted hover:text-neon-blue hover:border-neon-blue/40 hover:bg-neon-blue/10 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]'
    }`;

  const linkLabelCls = (href: string) =>
    `max-w-0 overflow-hidden transition-all duration-300 ${floating ? '' : 'group-hover:max-w-[100px]'} ${!floating && isActive(href) ? 'max-w-[100px]' : ''}`;

  return (
    <>
      {/* Loader de navegación global — aparece al navegar entre páginas */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center p-4 rounded-full bg-bg/90 border backdrop-blur-md shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300 ${
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

      <nav className={`fixed z-50 transform-gpu will-change-transform [backface-visibility:hidden] transition-all duration-500 ease-out ${
          floating
            ? 'top-3 inset-x-3 rounded-full bg-bg/90 backdrop-blur-2xl border border-border/80 shadow-[0_10px_40px_rgba(0,0,0,0.55)]'
            : 'top-0 left-0 w-full bg-bg/85 backdrop-blur-2xl border-b border-border'
        }`}>
        <div
          className={`${floating ? 'hidden' : ''} absolute bottom-0 left-0 w-full h-[2px] bg-[length:200%_auto] animate-gradient-x transition-colors duration-500 ${
            isNavigating
              ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
              : 'bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]'
          }`}
        />
      <div className="max-w-screen-xl mx-auto px-4">
        <div className={`flex items-center ${floating ? 'h-12' : 'h-[64px]'} gap-3`}>
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
              className={`${floating ? 'hidden' : 'hidden lg:block'} h-[30px] w-auto group-hover:drop-shadow-[0_0_15px_rgba(0,212,255,0.8)] transition-all duration-300`}
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
            {/* Invitar — botón con texto */}
            <div className="relative hidden sm:block" ref={inviteRef}>
              <button
                onClick={() => { setInviteOpen(!inviteOpen); setAuthOpen(false); setAccountOpen(false); setSearchOpen(false); }}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300 cursor-pointer shadow-md border group font-header font-bold text-sm ${
                  inviteOpen
                    ? 'bg-neon-blue border-neon-blue text-black'
                    : 'bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white hover:scale-105 hover:shadow-[0_10px_28px_-8px_rgba(0,212,255,0.8)]'
                } active:scale-95`}
                aria-label={dict.nav.invite}
                title={dict.nav.invite}
                aria-expanded={inviteOpen}
              >
                <Icon name="discord" size={16} className="[&>g]:fill-current" />
                <span>{dict.nav.invite}</span>
              </button>
              {inviteOpen && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl animate-fade-in-down">
                <a
                  href={INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-ink transition hover:bg-muted/15 hover:text-neon-blue"
                >
                  <Icon name="external" size={15} /> {dict.nav.invite}
                </a>
                <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted">
                  Añade a CiszuBot a tu servidor de Discord
                </p>
                </div>
              )}
            </div>

            {/* Buscador — toggle (panel full-width bajo el nav) */}
            <div className="relative">
              <button
                ref={searchToggleRef}
                onClick={() => { setSearchOpen(v => !v); setIsMenuOpen(false); setAccountOpen(false); setAuthOpen(false); setInviteOpen(false); }}
                className={`p-2 rounded-full border transition-all duration-300 cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_10px_rgba(0,212,255,0.25)] ${
                  searchOpen
                    ? 'bg-neon-blue border-neon-blue text-black'
                    : 'bg-card border-border text-ink hover:border-neon-blue'
                }`}
                aria-label={dict.nav.search}
                title={dict.nav.search}
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            {/* Cuenta / Login */}
            {account ? (
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => { setAccountOpen(!accountOpen); setAuthOpen(false); setSearchOpen(false); setInviteOpen(false); }}
                  className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2.5 transition hover:border-[#5865F2] hover:bg-muted/15 cursor-pointer"
                  aria-label="Cuenta"
                >
                  <img
                    src={account.avatar ?? `https://cdn.discordapp.com/embed/avatars/${Number(account.id) % 5}.png`}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="hidden lg:block max-w-[90px] truncate text-xs font-bold text-ink/85">
                    {account.name ?? 'Cuenta'}
                  </span>
                  <Icon name="arrow-right" size={12} className={`text-muted transition-transform ${accountOpen ? 'rotate-90' : '-rotate-90'}`} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl animate-fade-in-down">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-bold text-ink">{account.name ?? 'Cuenta'}</p>
                      <p className="truncate text-[11px] text-muted">{account.id}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink/85 transition hover:bg-muted/15 hover:text-neon-blue"
                    >
                      <Icon name="server" size={15} /> Panel de control
                    </Link>
                    <a
                      href="/api/auth/logout"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition hover:bg-muted/15"
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
                  className={`p-2 rounded-full border transition-all duration-300 cursor-pointer shadow-sm active:scale-95 hover:shadow-[0_0_10px_rgba(88,101,242,0.4)] ${
                    authOpen
                      ? 'bg-[#5865F2] border-[#5865F2] text-white shadow-[0_0_12px_rgba(88,101,242,0.6)]'
                      : 'bg-card border-border text-ink hover:border-[#5865F2]'
                  }`}
                  aria-label="Iniciar sesión"
                  title="Iniciar sesión"
                >
                  <IcoUser />
                </button>
                {authOpen && (
                  <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl animate-fade-in-down">
                    <a
                      href="/api/auth/discord"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold bg-[#5865F2] text-white transition hover:bg-[#4752c4]"
                    >
                      <Icon name="discord" size={16} className="[&>g]:fill-current" />
                      <span>Iniciar sesión con Discord</span>
                    </a>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted transition hover:bg-muted/15 hover:text-neon-blue"
                    >
                      <Icon name="server" size={15} /> Panel de control
                    </Link>
                    <a
                      href={INVITE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted transition hover:bg-muted/15 hover:text-neon-blue"
                    >
                      <Icon name="external" size={15} /> {dict.nav.invite}
                    </a>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => { setIsMenuOpen(!isMenuOpen); setSearchOpen(false); setAuthOpen(false); setInviteOpen(false); setAccountOpen(false); if (!isMenuOpen) setSidebarView('main'); }}
              className={`p-2 rounded-full border transition-all duration-300 cursor-pointer shadow-sm active:scale-95 ${
                isMenuOpen
                  ? 'bg-neon-blue border-neon-blue text-black'
                  : 'bg-card border-border text-ink hover:border-neon-blue'
              }`}
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div ref={searchRef} className="absolute left-0 right-0 top-[64px] border-b border-border bg-[#0a0a14]/95 backdrop-blur-2xl shadow-2xl animate-fade-in-down">
          <div className="max-w-screen-xl mx-auto px-4 py-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 flex items-center">
                <Search className="w-5 h-5" />
              </span>
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
                className="w-full bg-white/5 border border-white/10 focus:border-neon-blue placeholder:text-gray-600 text-white rounded-xl py-3 pl-12 pr-4 text-sm outline-none transition-all font-header font-bold"
              />
            </div>
            {query.trim().length > 0 && suggestions.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                {suggestions.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={() => { setSearchOpen(false); setQuery(''); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-white text-xs font-header font-bold hover:border-neon-blue/50 hover:text-neon-blue hover:shadow-[0_0_12px_rgba(0,212,255,0.2)] transition-all"
                  >
                    <span className="w-4 h-4 shrink-0 opacity-70 flex items-center justify-center">
                      <Icon name={p.icon} size={14} />
                    </span>
                    <span className="truncate">{dict.nav[p.labelKey as keyof typeof dict.nav]}</span>
                  </Link>
                ))}
              </div>
            )}
            {query.trim().length > 0 && suggestions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 animate-fade-in-down">
                <p className="text-gray-500 font-header font-black uppercase text-xs tracking-widest italic animate-pulse">{dict.nav.searchHint}</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-3 px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-header font-bold bg-neon-blue/20 border border-neon-blue/40 text-neon-blue hover:bg-neon-blue hover:text-black transition-all active:scale-95 cursor-pointer"
                >
                  {lang === 'es' ? 'Reiniciar búsqueda' : 'Reset search'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      </nav>

    {isMenuOpen && (
      <div className="fixed inset-0 z-[100] pointer-events-none">
        <div className="absolute top-[64px] right-0 w-[320px] max-w-[85vw] h-[calc(100vh-64px)] bg-[#05050a]/95 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto animate-slide-right-fade">
          <div className="absolute left-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-neon-blue/50 to-transparent shadow-[0_0_15px_rgba(0,212,255,0.4)] z-10" />

          <div className="flex items-center justify-between px-5 pt-8 pb-6 border-b border-white/5 shrink-0 gap-3">
            <button
              onClick={setTheme}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 cursor-pointer border group ${
                isDark ? 'bg-white border-gray-100 hover:rotate-12' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
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

            <h2 className="text-neon-blue text-base font-header font-black tracking-widest drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">
              {sidebarView === 'main' ? (lang === 'es' ? 'MENÚ' : 'MENU') : 'IDIOMAS'}
            </h2>

            <button
              onClick={() => setSidebarView(sidebarView === 'main' ? 'lang' : 'main')}
              className="group flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg cursor-pointer"
              title="Idioma"
            >
              <svg className={`w-5 h-5 transition-transform duration-500 ${sidebarView === 'lang' ? 'rotate-90 text-neon-blue' : 'group-hover:rotate-12 text-white/70'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 transition-transform duration-300 group-hover:scale-110 [&>svg]:w-6 [&>svg]:h-6">
                {(LANGS.find(l => l.code === currentLangCode) || LANGS[0]).flag}
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
            {sidebarView === 'main' ? (
              <>
                <div className="mb-4">
                  <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{lang === 'es' ? 'NAVEGACIÓN' : 'NAVIGATION'}</p>
                  {NAV_PAGES.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => { setIsMenuOpen(false); setSidebarView('main'); }}
                      className={`flex justify-start items-center px-4 py-3 rounded-2xl transition-all font-header font-bold text-[15px] group mb-1 active:scale-95 border ${
                        isActive(link.href)
                          ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue hover:text-white'
                          : 'border-transparent text-gray-300 hover:text-neon-blue hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isActive(link.href) ? 'bg-neon-blue/20 text-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'bg-black/40 text-gray-500 group-hover:text-neon-blue group-hover:bg-neon-blue/10'
                        }`}>
                          <Icon name={link.icon} size={16} />
                        </span>
                        <span>{dict.nav[link.key]}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-white/10 my-4" />
                <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">{lang === 'es' ? 'CUENTA' : 'ACCOUNT'}</p>
                {account ? (
                  <Link
                    href="/dashboard"
                    onClick={() => { setIsMenuOpen(false); setSidebarView('main'); }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-xl font-header font-bold hover:bg-neon-blue/20 hover:text-white text-xs shadow-[0_4px_15px_rgba(0,212,255,0.1)] transition-all"
                  >
                    <Icon name="server" size={16} className="[&>g]:fill-current" />
                    <span>Panel</span>
                  </Link>
                ) : (
                  <a
                    href="/api/auth/discord"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#5865F2] text-white rounded-xl font-header font-bold hover:bg-[#4752c4] text-xs transition-all"
                  >
                    <Icon name="discord" size={16} className="[&>g]:fill-current" />
                    <span>{lang === 'es' ? 'Iniciar sesión con Discord' : 'Sign in with Discord'}</span>
                  </a>
                )}

                <div className="h-px bg-white/10 my-4" />
                <a
                  href={INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { setIsMenuOpen(false); setSidebarView('main'); }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white rounded-xl font-header font-bold text-sm shadow-[0_4px_15px_rgba(0,212,255,0.2)] hover:shadow-[0_4px_25px_rgba(0,212,255,0.5)] transition-all"
                >
                  <Icon name="discord" size={16} className="[&>g]:fill-current" />
                  <span>{dict.nav.invite}</span>
                </a>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-1 animate-fade-in-up pb-10">
                {LANGS.map((l) => {
                  const available = l.code === 'ES-LA' || l.code === 'EN-US';
                  const active = currentLangCode === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => handleLangSelect(l.code)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-header font-bold transition-all group ${
                        active
                          ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                          : available
                            ? 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent cursor-pointer'
                            : 'text-gray-600 opacity-60 hover:opacity-90 hover:text-white/70 hover:bg-white/5 border border-transparent cursor-pointer'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/10 shrink-0 transition-transform duration-300 group-hover:scale-110 [&>svg]:w-6 [&>svg]:h-6">
                        {l.flag}
                      </span>
                      <span className="flex-1 text-left">{l.label}</span>
                      {!available && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 shrink-0">
                          Beta
                        </span>
                      )}
                      {active && (
                        <svg className="w-4 h-4 text-neon-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Toast de aviso para idiomas no disponibles */}
    {toast && (
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in-up pointer-events-none">
        <div className="bg-[#05050a]/95 border border-neon-blue/40 px-6 py-3 rounded-full shadow-[0_4px_30px_rgba(0,212,255,0.4)] backdrop-blur-md flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shrink-0" />
          <span className="text-neon-blue font-bold uppercase tracking-widest text-[10px] sm:text-xs">{toast}</span>
        </div>
      </div>
    )}
    </>
  );
}
