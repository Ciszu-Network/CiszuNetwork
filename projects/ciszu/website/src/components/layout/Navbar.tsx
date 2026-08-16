'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { CISZU_NETWORK } from '@/config/site';
import {
  Search,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  Globe,
  User,
  Home,
  Shield,
  Zap,
  Users,
  Mail,
  Info,
  HelpCircle,
  FileText,
  Sparkles,
  LifeBuoy,
  Pickaxe,
  MessageCircle,
  MessageSquare,
  Send,
  Music,
  Building,
  MessageSquareWarning,
  Download,
} from 'lucide-react';

const IcoUser = () => (
  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IcoDiscord = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.013.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

interface NavSubLink { name: string; href: string; icon: React.ReactNode; }
interface NavEntry {
  name: string;
  href?: string;
  icon: React.ReactNode;
  links?: NavSubLink[];
  keywords?: string[];
}

const NAV_ITEMS: NavEntry[] = [
  { name: 'Inicio', href: '/', icon: <Home className="w-4 h-4" /> },
  {
    name: 'Información',
    icon: <Shield className="w-4 h-4" />,
    keywords: ['sobre nosotros', 'faq', 'políticas', 'guías', 'soporte', 'info'],
    links: [
      { name: 'Sobre Nosotros', href: '/about', icon: <Info className="w-4 h-4" /> },
      { name: 'FAQ', href: '/faq', icon: <HelpCircle className="w-4 h-4" /> },
      { name: 'Políticas', href: '/policies', icon: <FileText className="w-4 h-4" /> },
      { name: 'Guías', href: '/guidelines', icon: <Sparkles className="w-4 h-4" /> },
      { name: 'Soporte', href: '/support', icon: <LifeBuoy className="w-4 h-4" /> },
    ],
  },
  { name: 'Descargas', href: '/descargas', icon: <Download className="w-4 h-4" /> },
  { name: 'Feedback', href: '/feedback', icon: <MessageSquareWarning className="w-4 h-4" /> },
  {
    name: 'Proyectos',
    icon: <Zap className="w-4 h-4" />,
    keywords: ['minecraft', 'discord', 'whatsapp', 'telegram', 'muzicmania', 'ciszu network', 'ciszuko antony'],
    links: [
      { name: 'Minecraft', href: '/projects/minecraft', icon: <Pickaxe className="w-4 h-4" /> },
      { name: 'Discord', href: '/projects/discord', icon: <MessageCircle className="w-4 h-4" /> },
      { name: 'WhatsApp', href: '/projects/whatsapp', icon: <MessageSquare className="w-4 h-4" /> },
      { name: 'Telegram', href: '/projects/telegram', icon: <Send className="w-4 h-4" /> },
      { name: 'MuzicMania', href: '/projects/muzicmania', icon: <Music className="w-4 h-4" /> },
      { name: 'Ciszu Network', href: '/projects/ciszunetwork', icon: <Building className="w-4 h-4" /> },
      { name: 'Ciszuko Antony', href: '/projects/ciszukoantony', icon: <User className="w-4 h-4" /> },
    ],
  },
  { name: 'Equipo', href: '/team', icon: <Users className="w-4 h-4" /> },
  { name: 'Contacto', href: '/contact', icon: <Mail className="w-4 h-4" /> },
];

// Massive page catalog for the global search (references the same routes as the nav).
const ALL_PAGES: { name: string; href: string; icon: React.ReactNode; keywords: string[] }[] = [
  { name: 'Inicio', href: '/', icon: <Home className="w-4 h-4" />, keywords: ['inicio', 'home', 'index', 'main'] },
  { name: 'Información', href: '/about', icon: <Info className="w-4 h-4" />, keywords: ['informacion', 'info', 'sobre', 'about'] },
  { name: 'FAQ', href: '/faq', icon: <HelpCircle className="w-4 h-4" />, keywords: ['faq', 'preguntas', 'frecuentes', 'dudas'] },
  { name: 'Políticas', href: '/policies', icon: <FileText className="w-4 h-4" />, keywords: ['politicas', 'politica', 'privacidad', 'privacy', 'policy'] },
  { name: 'Guías', href: '/guidelines', icon: <Sparkles className="w-4 h-4" />, keywords: ['guias', 'guia', 'normas', 'lineamientos', 'guide'] },
  { name: 'Soporte', href: '/support', icon: <LifeBuoy className="w-4 h-4" />, keywords: ['soporte', 'ayuda', 'support', 'asistencia'] },
  { name: 'Feedback', href: '/feedback', icon: <MessageSquareWarning className="w-4 h-4" />, keywords: ['feedback', 'reportar', 'reporte', 'problema', 'opinion', 'bug'] },
  { name: 'Descargas', href: '/descargas', icon: <Download className="w-4 h-4" />, keywords: ['descargas', 'descargar', 'instalar', 'pdwa', 'download'] },
  { name: 'Minecraft', href: '/projects/minecraft', icon: <Pickaxe className="w-4 h-4" />, keywords: ['minecraft', 'texture', 'mods', 'servidor'] },
  { name: 'Discord', href: '/projects/discord', icon: <MessageCircle className="w-4 h-4" />, keywords: ['discord', 'comunidad', 'servidores', 'bots'] },
  { name: 'WhatsApp', href: '/projects/whatsapp', icon: <MessageSquare className="w-4 h-4" />, keywords: ['whatsapp', 'comunidad', 'bots', 'grupos'] },
  { name: 'Telegram', href: '/projects/telegram', icon: <Send className="w-4 h-4" />, keywords: ['telegram', 'canales', 'bots', 'grupos'] },
  { name: 'MuzicMania', href: '/projects/muzicmania', icon: <Music className="w-4 h-4" />, keywords: ['muzicmania', 'musica', 'juego', 'ritmo'] },
  { name: 'Ciszu Network', href: '/projects/ciszunetwork', icon: <Building className="w-4 h-4" />, keywords: ['ciszu', 'network', 'compañia', 'marca'] },
  { name: 'Ciszuko Antony', href: '/projects/ciszukoantony', icon: <User className="w-4 h-4" />, keywords: ['ciszuko', 'antony', 'youtuber', 'streamer'] },
  { name: 'Equipo', href: '/team', icon: <Users className="w-4 h-4" />, keywords: ['equipo', 'team', 'staff', 'miembros'] },
  { name: 'Contacto', href: '/contact', icon: <Mail className="w-4 h-4" />, keywords: ['contacto', 'contact', 'mensaje', 'email'] },
];

const LANGS = [
  {
    code: 'es',
    label: 'Español (Latam)',
    flag: (
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
    ),
  },
  {
    code: 'es',
    label: 'Español (España)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#ad1519"/><rect width="512" height="300" y="106" fill="#fabd00"/><circle cx="150" cy="256" r="50" fill="#ad1519"/></svg>,
  },
  {
    code: 'en',
    label: 'English (US)',
    flag: (
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
    ),
  },
  {
    code: 'en',
    label: 'English (UK)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#012169"/><path d="M0 0l512 512M512 0L0 512" stroke="#fff" strokeWidth="60"/><path d="M0 0l512 512M512 0L0 512" stroke="#cf142b" strokeWidth="30"/><rect width="512" height="100" y="206" fill="#fff"/><rect width="100" height="512" x="206" fill="#fff"/><rect width="512" height="60" y="226" fill="#cf142b"/><rect width="60" height="512" x="226" fill="#cf142b"/></svg>,
  },
  {
    code: 'pt',
    label: 'Português (Brasil)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#009c3b"/><path d="M256 70l186 186-186 186L70 256z" fill="#ffdf00"/><circle cx="256" cy="256" r="100" fill="#002776"/></svg>,
  },
  {
    code: 'fr',
    label: 'Français',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#002395"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ed2939"/></svg>,
  },
  {
    code: 'it',
    label: 'Italiano',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="170" height="512" fill="#009246"/><rect width="170" height="512" x="171" fill="#fff"/><rect width="171" height="512" x="341" fill="#ce2b37"/></svg>,
  },
  {
    code: 'de',
    label: 'Deutsch',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#000"/><rect width="512" height="170" y="171" fill="#d00"/><rect width="512" height="171" y="341" fill="#ffce00"/></svg>,
  },
  {
    code: 'ru',
    label: 'Русский',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="170" fill="#fff"/><rect width="512" height="170" y="171" fill="#0039a6"/><rect width="512" height="171" y="341" fill="#d52b1e"/></svg>,
  },
  {
    code: 'ja',
    label: '日本語 (Japanese)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="120" fill="#bc002d"/></svg>,
  },
  {
    code: 'ko',
    label: '한국어 (Korean)',
    flag: <svg viewBox="0 0 512 512" className="w-6 h-6 rounded-full overflow-hidden shadow-inner"><rect width="512" height="512" fill="#fff"/><circle cx="256" cy="256" r="80" fill="#cd2e3a"/><path d="M256 176a80 80 0 0 0 0 160c44 0 44-80 80-80s36 80 80 80" fill="#0047a0"/></svg>,
  },
];

export const NavbarContent = () => {
  const pathname = usePathname();
  const { isMenuOpen, setIsMenuOpen, theme, setTheme, language, setLanguage, searchQuery, setSearchQuery, sidebarView, setSidebarView } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setShowSearch] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const firstRender = useRef(true);

  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchToggleRef = useRef<HTMLButtonElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Reset UI state on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setSidebarView('main');
    setShowSearch(false);
    setIsAccountOpen(false);
    setOpenDropdown(null);
    setSearchQuery('');
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setIsNavigating(false);
  }, [pathname, setIsMenuOpen, setSearchQuery, setSidebarView]);

  // Global click interceptor: show green loader when navigating between internal pages
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

  // Focus the search input when opening
  useEffect(() => {
    if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isSearchOpen]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        if (searchToggleRef.current && searchToggleRef.current.contains(e.target as Node)) {
          return;
        }
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-hide the language-unavailable toast after ~4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const isActive = (href: string) => pathname === href;

  // Pill active link: REVEAL text ONLY on hover/active.
  const navLinkCls = (href: string) => {
    const active = isActive(href);
    return `relative group flex items-center gap-0 hover:gap-1.5 px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 cursor-pointer border hover:-translate-y-0.5 active:scale-95 ${
      active
        ? 'border-brand-light bg-brand-light/20 shadow-[0_0_15px_rgba(58,107,240,0.3)] text-brand-light gap-1.5 -translate-y-0.5 hover:text-white'
        : 'border-transparent text-white hover:border-brand-light hover:bg-brand-light/15 hover:text-brand-light hover:shadow-[0_0_10px_rgba(58,107,240,0.2)]'
    }`;
  };

  const navLabelCls = (href: string) => {
    const active = isActive(href);
    return `max-w-0 overflow-hidden transition-all duration-300 group-hover:max-w-[110px] ${active ? 'max-w-[110px]' : ''}`;
  };

  const toggleSearch = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isSearchOpen) {
      setIsMenuOpen(false);
      setIsAccountOpen(false);
      setOpenDropdown(null);
    }
    setShowSearch(v => !v);
  };

  const toggleMenu = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isMenuOpen) {
      setShowSearch(false);
      setIsAccountOpen(false);
      setOpenDropdown(null);
      setSidebarView('main');
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAccount = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAccountOpen) {
      setShowSearch(false);
      setIsMenuOpen(false);
      setOpenDropdown(null);
    }
    setIsAccountOpen(!isAccountOpen);
  };

  const hoverOpen = (s: (v: string | null) => void, t: React.MutableRefObject<ReturnType<typeof setTimeout> | null>, name: string) => {
    if (t.current) clearTimeout(t.current);
    s(name);
  };

  const hoverClose = (s: (v: string | null) => void, t: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    t.current = setTimeout(() => s(null), 180);
  };

  const suggestions = searchQuery.trim().length > 0
    ? ALL_PAGES.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : ALL_PAGES.slice(0, 6);

  const currentFlag = (LANGS.find(l => l.code === language) || LANGS[0]).flag;

  return (
    <>
      {/* Global navigation loader — green when navigating between pages */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-center p-4 rounded-full bg-black/90 border backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300 ${
          isNavigating
            ? 'translate-y-0 opacity-100 border-emerald-400/60 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
            : 'translate-y-10 opacity-0 pointer-events-none border-brand-light/50 text-brand-light'
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

      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-black/92 backdrop-blur-2xl border-b border-white/10' : 'bg-black/80 backdrop-blur-xl border-b border-white/5'}`}>

        {/* Animated Line Separator Bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-brand-light via-brand-accent to-brand-light shadow-[0_0_10px_rgba(58,107,240,0.35)]" />

        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center h-[64px] gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300">
              <Image
                src={assetResolver.resolve('projects/ciszu/content/logos/images/outline/isotype/color/ciszu_logo_isotipo_outline_zwhite_ccolor.svg')}
                alt={CISZU_NETWORK.name}
                width={34}
                height={34}
                className="group-hover:drop-shadow-[0_0_15px_rgba(58,107,240,0.8)] transition-all duration-300"
              />
              <Image
                src={assetResolver.resolve('projects/ciszu/content/logos/images/outline/logotype/monochrome/ciszu_logotipo_outline_zwhite_cwhite_simple.svg')}
                alt={CISZU_NETWORK.name}
                width={100}
                height={34}
                className="hidden lg:block group-hover:drop-shadow-[0_0_10px_rgba(58,107,240,0.6)] transition-all duration-300"
              />
            </Link>

            {/* Separator */}
            <div className="w-px h-7 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0" />

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1 flex-1 overflow-visible">
              {NAV_ITEMS.map((item) => {
                if (item.links) {
                  const isOpen = openDropdown === item.name;
                  return (
                    <div
                      key={item.name}
                      className="relative z-40 shrink-0"
                      onMouseEnter={() => hoverOpen(setOpenDropdown, dropdownTimer, item.name)}
                      onMouseLeave={() => hoverClose(setOpenDropdown, dropdownTimer)}
                    >
                      <button
                        onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                        className={navLinkCls(item.links[0].href)}
                      >
                        <span className="flex items-center justify-center shrink-0">{item.icon}</span>
                        <span className={navLabelCls(item.links[0].href)}>{item.name}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="absolute top-full left-0 pt-2 w-56 z-50 animate-fade-in-down origin-top drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]">
                          <div className="bg-[#070710]/98 backdrop-blur-2xl border border-white/10 rounded-xl py-2 shadow-2xl">
                            {item.links.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-center gap-3 px-4 py-2 text-sm font-header font-bold transition-all cursor-pointer ${
                                  isActive(sub.href) ? 'text-brand-light bg-brand-light/5 hover:text-white' : 'text-white hover:text-brand-light hover:bg-white/5'
                                }`}
                              >
                                <span className="shrink-0 text-brand-light/80">{sub.icon}</span>
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                const href = item.href!;
                const active = isActive(href);
                return (
                  <Link key={item.name} href={href} className={`${navLinkCls(href)} ${active ? 'flex' : 'flex'}`}>
                    <span className="flex items-center justify-center shrink-0">{item.icon}</span>
                    <span className={navLabelCls(href)}>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto shrink-0 min-w-fit">
              {/* Search icon toggle */}
              <button
                ref={searchToggleRef}
                onClick={toggleSearch}
                className={`p-2 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isSearchOpen
                    ? 'bg-brand-light border-brand-light text-black'
                    : 'bg-white/5 border-white/20 text-white hover:border-brand-light hover:shadow-[0_0_10px_rgba(58,107,240,0.2)]'
                }`}
                title="Buscar"
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {/* Hamburger contextual toggle (siempre visible) */}
              <button
                onClick={toggleMenu}
                className={`p-2 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isMenuOpen
                    ? 'bg-brand-light border-brand-light text-black'
                    : 'bg-white/5 border-white/20 text-white hover:border-brand-light hover:shadow-[0_0_10px_rgba(58,107,240,0.2)]'
                }`}
                title="Menú"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Account / User Button */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={toggleAccount}
                  className={`p-2 rounded-full border transition-all cursor-pointer shadow-sm active:scale-95 ${
                    isAccountOpen
                      ? 'bg-gradient-to-r from-brand-light via-brand-accent to-brand-light border-transparent text-white'
                      : 'bg-white/5 border-white/20 text-white hover:border-brand-light hover:opacity-100 opacity-90'
                  }`}
                  title="Cuenta"
                >
                  <IcoUser />
                </button>
                {isAccountOpen && (
                  <div className="absolute right-0 top-full pt-3 w-64 z-50 animate-fade-in-down origin-top">
                    <div className="bg-[#070710]/98 backdrop-blur-2xl border border-white/10 rounded-xl p-4 shadow-2xl">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Sistema · Cuenta</p>
                      <p className="text-xs text-white/85 font-header font-bold leading-relaxed">
                        El centro de cuentas de {CISZU_NETWORK.name} está en desarrollo.
                      </p>
                      <button
                        onClick={() => { setIsAccountOpen(false); }}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-light/10 border border-brand-light/30 text-brand-light text-xs font-bold hover:bg-brand-light hover:text-black transition-all cursor-pointer active:scale-95"
                      >
                        <Globe className="w-3 h-3" /> Próximamente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Search Bar */}
        {isSearchOpen && (
          <div ref={searchRef} className="border-t border-white/5 bg-[#070710]/98 backdrop-blur-2xl">
            <div className="max-w-screen-xl mx-auto px-4 py-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={language === 'es'
                    ? 'Busca páginas de Ciszu Network (ej: inicio, soporte, discord)...'
                    : 'Search Ciszu Network pages (example: home, support, discord)...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && suggestions[0]) { window.location.href = suggestions[0].href; } }}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 focus:border-brand-light rounded-xl text-white placeholder:text-gray-600 outline-none text-sm transition-all font-header font-bold"
                />
              </div>

              {searchQuery.trim().length > 0 && suggestions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 animate-fade-in-down space-y-3">
                  <p className="text-gray-500 font-header font-black uppercase text-xs tracking-widest italic">
                    {language === 'es' ? `Sin resultados para "${searchQuery}"` : `No results for "${searchQuery}"`}
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-2 bg-brand-light/20 border border-brand-light/40 text-brand-light rounded-full font-header font-bold text-[10px] uppercase tracking-widest hover:bg-brand-light hover:text-black transition-all active:scale-95"
                  >
                    {language === 'es' ? 'Reiniciar búsqueda' : 'Reset search'}
                  </button>
                </div>
              )}

              {searchQuery.trim().length > 0 && suggestions.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3 animate-fade-in-down">
                  {suggestions.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-brand-light/50 hover:text-brand-light text-white text-xs font-header font-bold transition-all cursor-pointer"
                    >
                      <span className="opacity-70 shrink-0">{p.icon}</span>
                      <span className="truncate">{p.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Slide-Right Contextual Menu (Sidebar) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div className="absolute top-[64px] right-0 w-[320px] max-w-[85vw] h-[calc(100vh-64px)] bg-[#05050a]/95 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto animate-slide-right-fade">
            {/* Animated left divider to match header */}
            <div className="absolute left-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-brand-light/50 to-transparent shadow-[0_0_15px_rgba(58,107,240,0.4)] z-10" />

            {/* Header: Theme Toggle | TITLE | Language Selector */}
            <div className="flex items-center justify-between px-5 pt-8 pb-6 border-b border-white/5 shrink-0 gap-3">
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

              <h2 className="text-brand-light text-base font-header font-black tracking-widest drop-shadow-[0_0_8px_rgba(58,107,240,0.8)]">
                {sidebarView === 'main' ? (language === 'es' ? 'MENÚ' : 'MENU') : 'IDIOMA'}
              </h2>

              {/* Language Selector (toggles sidebar view) */}
              <button
                onClick={() => setSidebarView(sidebarView === 'main' ? 'lang' : 'main')}
                className="group flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg cursor-pointer"
                title={language === 'es' ? 'Cambiar idioma' : 'Change language'}
              >
                <svg className={`w-5 h-5 transition-transform duration-500 ${sidebarView === 'lang' ? 'rotate-90 text-brand-light' : 'group-hover:rotate-12 text-white/70'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] shrink-0 transition-transform duration-300 group-hover:scale-110 [&>svg]:w-6 [&>svg]:h-6">
                  {currentFlag}
                </div>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
              {sidebarView === 'main' ? (
                <div className="animate-fade-in-up">
                  {NAV_ITEMS.map((item) => {
                    if (item.links) {
                      return (
                        <div key={item.name} className="mb-1">
                          <div className="flex items-center gap-3 px-4 py-3 font-header font-bold text-sm text-gray-300">
                            <span className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/70">{item.icon}</span>
                            {item.name}
                          </div>
                          <div className="ml-6 space-y-1 border-l border-white/10 pl-3">
                            {item.links.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                                  isActive(sub.href) ? 'bg-brand-light/15 text-brand-light border border-brand-light/30' : 'text-white/70 hover:text-brand-light hover:bg-white/5 border border-transparent'
                                }`}
                              >
                                <span className="shrink-0 text-brand-light/80">{sub.icon}</span>
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    const href = item.href!;
                    const active = isActive(href);
                    return (
                      <Link
                        key={item.name}
                        href={href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex justify-start items-center px-4 py-3 rounded-2xl transition-all font-header font-bold text-[15px] group mb-1 active:scale-95 border ${
                          active
                            ? 'border-brand-light bg-brand-light/20 shadow-[0_0_15px_rgba(58,107,240,0.3)] text-brand-light hover:text-white'
                            : 'border-transparent text-gray-300 hover:text-brand-light hover:bg-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            active ? 'bg-brand-light/20 text-brand-light shadow-[0_0_10px_rgba(58,107,240,0.3)]' : 'bg-black/40 text-gray-500 group-hover:text-brand-light group-hover:bg-brand-light/10'
                          }`}>
                            {item.icon}
                          </span>
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}

                  <div className="h-px bg-white/10 my-4" />

                  {/* Community / Account section */}
                  <p className="px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">
                    {language === 'es' ? 'Comunidad' : 'Community'}
                  </p>
                  <a
                    href={CISZU_NETWORK.social.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-header font-bold border border-transparent text-gray-300 hover:text-white hover:bg-[#5865F2]/10 hover:border-[#5865F2]/30 transition-all active:scale-95"
                  >
                    <span className="w-8 h-8 rounded-full bg-black/40 text-white/70 flex items-center justify-center"><IcoDiscord /></span>
                    Discord
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1 animate-fade-in-up pb-10">
                  {LANGS.map((l) => (
                    <button
                      key={l.label}
                      onClick={() => {
                        if (l.code === 'es' || l.code === 'en') {
                          setLanguage(l.code);
                        } else {
                          setToast('Esta función no está desarrollada para la beta aún');
                        }
                      }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-header font-bold transition-all cursor-pointer group ${
                        language === l.code ? 'bg-brand-light/20 text-brand-light border border-brand-light/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/10 shrink-0 transition-transform duration-300 group-hover:scale-110 [&>svg]:w-6 [&>svg]:h-6">
                        {l.flag}
                      </span>
                      <span className="flex-1 text-left">{l.label}</span>
                      {language === l.code && (
                        <svg className="w-4 h-4 text-brand-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast hint for non-ready language controls */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in-up pointer-events-none">
          <div className="bg-[#05050a]/95 border border-brand-light/40 px-6 py-3 rounded-full shadow-[0_4px_30px_rgba(58,107,240,0.4)] backdrop-blur-md flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand-light animate-pulse shrink-0" />
            <span className="text-brand-light font-bold uppercase tracking-widest text-[10px] sm:text-xs">{toast}</span>
          </div>
        </div>
      )}
    </>
  );
};

const Navbar = () => {
  return (
    <React.Suspense fallback={<div className="h-16 bg-black/50 animate-pulse" />}>
      <NavbarContent />
    </React.Suspense>
  );
};

export default Navbar;