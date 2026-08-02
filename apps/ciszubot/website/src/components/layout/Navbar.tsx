'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { resolveAssetPath } from '@ciszunetwork/cdn';

const NAV_LINKS = [
  { href: '/', name: 'Inicio' },
  { href: '/#comandos', name: 'Comandos' },
  { href: '/#estado', name: 'Estado' },
  { href: '/#ecosistema', name: 'Ecosistema' },
];

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot%20applications.commands';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (typeof window !== 'undefined' && !scrolled) {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 20), { passive: true });
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.replace('/#', '/'));

  const linkCls = (href: string) =>
    `relative flex items-center px-3 py-1.5 rounded-lg font-header font-bold text-sm transition-all duration-300 border hover:-translate-y-0.5 active:scale-95 ${
      isActive(href)
        ? 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue'
        : 'border-transparent text-white hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]'
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/92 backdrop-blur-2xl border-b border-white/10' : 'bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/5'
      }`}
    >
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.3)] animate-gradient-x" />

      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center h-[60px] gap-3">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0 cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300">
            <Image
              src={resolveAssetPath('apps/ciszubot/content/logos/imagen/not outline/isotipo/color/ciszubot_logo_isotipo_color.png')}
              alt="CiszuBot" width={36} height={36}
              className="group-hover:drop-shadow-[0_0_15px_rgba(0,128,255,0.8)] transition-all duration-300"
            />
            <span className="hidden lg:block font-header font-black tracking-widest text-white text-lg group-hover:text-neon-blue transition-all duration-300">
              CISZUBOT
            </span>
          </Link>

          <div className="w-px h-7 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 shrink-0" />

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkCls(link.href)}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg font-header font-bold text-xs uppercase tracking-widest bg-electric-blue text-white active-depth hover:shadow-[0_0_20px_rgba(0,212,255,0.5)]"
            >
              Invitar
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full border bg-white/5 border-white/20 text-white hover:border-neon-blue transition-all active:scale-95"
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#070710]/98 backdrop-blur-2xl px-4 py-3 animate-fade-in-down">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 rounded-lg font-header font-bold text-sm text-white hover:text-neon-blue hover:bg-white/5 transition-all"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
