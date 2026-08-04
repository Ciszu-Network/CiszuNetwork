'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { assetResolver } from '@ciszunetwork/cdn';
import { usePathname } from 'next/navigation';
import { NAV_MAIN, SOCIALS, I, ALL_PAGES, SEARCH_INDEX, type NavGroup, type NavItem } from '@/config/navigation';

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
      <div className="px-5 py-3 rounded-xl bg-brand/20 border border-brand/30 backdrop-blur-xl text-sm text-white shadow-lg shadow-brand/10 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        {message}
        <button onClick={onClose} className="text-gray-400 hover:text-white ml-2">{I.close}</button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof SEARCH_INDEX>([]);
  const [lang, setLang] = useState('EN');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toast, setToast] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setSidebarOpen(false); setSearchOpen(false); setInfoOpen(false); }, [pathname]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) setInfoOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme as 'dark' | 'light');
    setToast('⚙ Theme changer is in beta — some styles may not apply correctly yet.');
  };

  const toggleLang = () => {
    setLang(l => l === 'EN' ? 'ES' : 'EN');
    setToast('⚙ Language changer is in beta — translations are incomplete.');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const results = SEARCH_INDEX.filter(p =>
        p.title.toLowerCase().includes(q) || p.href.toLowerCase().includes(q) || p.keywords.some(k => k.toLowerCase().includes(q))
      );
      setSearchResults(results);
    }
  };

  const sidebarVariants = {
    open: { transform: 'translateX(0)', opacity: 1 },
    closed: { transform: 'translateX(-100%)', opacity: 0 },
  };

  const isActive = (href: string) => pathname === href;
  const infoItems = (NAV_MAIN.find(n => 'items' in n && n.name === 'Info') as NavGroup)?.items || [];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Image
                src={assetResolver.resolve('projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png')}
                alt="Ciszuko" width={28} height={25}
                className="drop-shadow-brand"
              />
              <Image
                src={assetResolver.resolve('projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png')}
                alt="Ciszuko Antony" width={120} height={28}
                className="hidden sm:block group-hover:opacity-80 transition-opacity"
              />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_MAIN.map((item) => {
                if ('items' in item) {
                  const group = item as NavGroup;
                  return (
                    <div key={group.name} className="relative" ref={infoRef}>
                      <button onClick={() => setInfoOpen(!infoOpen)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          infoItems.some(i => isActive(i.href))
                            ? 'bg-brand/10 text-brand border border-brand/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {group.icon}
                        <span>{group.name}</span>
                        <span className={`transition-transform ${infoOpen ? 'rotate-180' : ''}`}>{I.chevronDown}</span>
                      </button>
                      {infoOpen && (
                        <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-black/95 backdrop-blur-xl border border-white/10 py-2 shadow-xl">
                          {group.items.map((sub) => (
                            <Link key={sub.href} href={sub.href}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                                isActive(sub.href)
                                  ? 'text-brand bg-brand/5'
                                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span className="w-4 h-4">{sub.icon}</span>
                              <span>{sub.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                const link = item as NavItem;
                return (
                  <Link key={link.href} href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? 'bg-brand/10 text-brand border border-brand/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                title="Search"
              >
                {I.search}
              </button>

              <button onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-white/5 transition-all"
                title="Menu"
              >
                {I.menu}
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-white/10 bg-black/95 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); if (e.target.value.trim()) handleSearch(e); }}
                  placeholder="Search pages..."
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{I.search}</span>
              </form>
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1">
                  {searchResults.map(r => (
                    <Link key={r.href} href={r.href}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    >
                      <span className="text-gray-500">{I.search}</span>
                      <span>{r.title}</span>
                      <span className="text-gray-600 text-xs ml-auto">{r.href}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-black/95 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <Image
                src={assetResolver.resolve('projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png')}
                alt="Ciszuko" width={24} height={22}
                className="drop-shadow-brand"
              />
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                {I.close}
              </button>
            </div>

            <div className="p-4 space-y-1">
              {ALL_PAGES.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-brand/10 text-brand border border-brand/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="w-5 h-5">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-white/10 p-4 space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-widest px-4">Preferences</p>
              <div className="flex gap-3 px-4">
                <button onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
                >
                  {theme === 'dark' ? I.sun : I.moon}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
                <button onClick={toggleLang}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all uppercase tracking-wider"
                >
                  {I.globe}
                  {lang}
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 px-4">Social</p>
              <div className="flex flex-wrap justify-center gap-3">
                {SOCIALS.slice(0, 8).map((s) => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand/50 transition-all hover:scale-110"
                    title={s.name}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
