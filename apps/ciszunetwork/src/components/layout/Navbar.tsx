'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { CISZU_NETWORK, CISZUKO_ANTONY, SOCIAL_COLORS } from '@/config/site';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { Search, X, Menu, ChevronDown, Globe, Sun, Moon, ExternalLink, Code, Shield, Zap, Music, Gamepad2, Users, Building, MessageCircle, MessageSquare, Send, Pickaxe, User, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Inicio', href: '/', icon: <Code className="w-4 h-4" /> },
  {
    name: 'Información',
    icon: <Shield className="w-4 h-4" />,
    dropdown: [
      { name: 'Sobre Nosotros', href: '/about' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Políticas', href: '/policies' },
      { name: 'Guías', href: '/guidelines' },
      { name: 'Soporte', href: '/support' },
    ],
  },
  {
    name: 'Proyectos',
    icon: <Zap className="w-4 h-4" />,
    dropdown: [
      { name: 'Minecraft', href: '/projects/minecraft' },
      { name: 'Discord', href: '/projects/discord' },
      { name: 'WhatsApp', href: '/projects/whatsapp' },
      { name: 'Telegram', href: '/projects/telegram' },
      { name: 'MuzicMania', href: '/projects/muzicmania' },
      { name: 'Ciszu Network', href: '/projects/ciszunetwork' },
      { name: 'Ciszuko Antony', href: '/projects/ciszukoantony' },
    ],
  },
  { name: 'Equipo', href: '/team', icon: <Users className="w-4 h-4" /> },
  { name: 'Contacto', href: '/contact', icon: <Zap className="w-4 h-4" /> },
];

export const NavbarContent = () => {
  const pathname = usePathname();
  const { isMenuOpen, setIsMenuOpen, theme, setTheme, language, setLanguage, searchQuery, setSearchQuery } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
    setShowSearch(false);
  }, [pathname, setIsMenuOpen]);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => pathname === href;

  const socialLinks = [
    { platform: 'youtube' as const, url: CISZU_NETWORK.social.youtube },
    { platform: 'instagram' as const, url: CISZU_NETWORK.social.instagram },
    { platform: 'x' as const, url: CISZU_NETWORK.social.x },
    { platform: 'github' as const, url: CISZU_NETWORK.social.github },
    { platform: 'discord' as const, url: CISZU_NETWORK.social.discord },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-black/90 backdrop-blur-2xl border-b border-brand/20' : 'bg-transparent'}`}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-[64px] gap-4">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image
                src="/logos/imagen/outline/isotipo/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg"
                alt={CISZU_NETWORK.name}
                width={32}
                height={32}
                className="group-hover:drop-shadow-[0_0_10px_rgba(35,63,146,0.8)] transition-all"
              />
              <span className="font-header font-bold text-base tracking-tight hidden sm:block text-white/90 group-hover:text-brand-light transition-colors">
                {CISZU_NETWORK.name}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {NAV_ITEMS.map((item) => {
                if ('dropdown' in item && item.dropdown) {
                  const isOpen = openDropdown === item.name;
                  return (
                    <div key={item.name} className="relative">
                      <button
                        onClick={() => setOpenDropdown(isOpen ? null : item.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-header font-bold text-sm transition-all border ${
                          isOpen
                            ? 'bg-brand/20 text-brand-light border-brand/30'
                            : 'text-white/70 hover:text-brand-light hover:bg-brand/5 border-transparent'
                        }`}
                      >
                        {item.icon} {item.name} <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-[#0a0a0f] border border-brand/20 rounded-xl backdrop-blur-3xl overflow-hidden shadow-2xl animate-fade-in-down">
                          {item.dropdown.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-brand/10 ${
                                isActive(sub.href) ? 'text-brand-light bg-brand/10' : 'text-gray-300'
                              }`}
                            >
                              <ChevronRight className="w-3 h-3 text-brand-light" />
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                const active = 'href' in item && item.href ? isActive(item.href) : false;
                return (
                  <Link key={item.name} href={item.href!}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-header font-bold text-sm transition-all border ${
                      active
                        ? 'bg-brand/20 text-brand-light border-brand/30'
                        : 'text-white/70 hover:text-brand-light hover:bg-brand/5 border-transparent'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
              >
                <Globe className="w-3 h-3" /> {language === 'es' ? 'ES' : 'EN'}
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg border border-white/20 text-white hover:bg-brand/10 hover:border-brand/30 transition-all"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="pb-3 animate-fade-in-down">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'es' ? 'Buscar en Ciszu Network...' : 'Search Ciszu Network...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-[64px] right-0 w-[300px] h-[calc(100vh-64px)] bg-[#05050a]/95 backdrop-blur-3xl border-l border-brand/20 overflow-y-auto animate-slide-right-fade">
            <div className="p-6 space-y-2">
              {NAV_ITEMS.map((item) => {
                if ('dropdown' in item && item.dropdown) {
                  return (
                    <div key={item.name}>
                      <div className="flex items-center gap-3 px-4 py-3 text-white/70 font-header font-bold text-sm">
                        {item.icon} {item.name}
                      </div>
                      <div className="ml-6 space-y-1 border-l border-white/10 pl-3">
                        {item.dropdown.map((sub) => (
                          <Link key={sub.name} href={sub.href} onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              isActive(sub.href) ? 'text-brand-light bg-brand/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <ChevronRight className="w-3 h-3 text-brand-light" />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                const active = 'href' in item && item.href ? isActive(item.href) : false;
                return (
                  <Link key={item.name} href={item.href!} onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-header font-bold text-sm transition-all ${
                      active
                        ? 'bg-brand/20 text-brand-light border border-brand/30'
                        : 'text-white/70 hover:text-brand-light hover:bg-brand/5 border border-transparent'
                    }`}
                  >
                    {item.icon} {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/10"
                >
                  <Globe className="w-3 h-3" /> {language === 'es' ? 'Español' : 'English'}
                </button>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/10"
                >
                  {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {socialLinks.map((s) => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                    style={{ color: SOCIAL_COLORS[s.platform] }}
                  >
                    <SocialIcon platform={s.platform} size={20} />
                  </a>
                ))}
              </div>
            </div>
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
