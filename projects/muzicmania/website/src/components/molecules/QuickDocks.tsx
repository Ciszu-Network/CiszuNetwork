'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type DockItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
};

const DOCK_ITEMS: DockItem[] = [
  // --- Juego ---
  {
    label: 'Play',
    href: '/play',
    color: 'cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    label: 'Library',
    href: '/library',
    color: 'red',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    label: 'Leaderboard',
    href: '/leaderboard',
    color: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
  },
  {
    label: 'Stats',
    href: '/stats',
    color: 'orange',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  // --- Información ---
  {
    label: 'Information',
    href: '/information',
    color: 'purple',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  {
    label: 'Team',
    href: '/team',
    color: 'pink',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Changelog',
    href: '/changelog',
    color: 'yellow',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M16.13 7.07l2.12-2.12"/><path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 2v5h-5"/>
      </svg>
    ),
  },
  {
    label: 'Guidelines',
    href: '/guidelines',
    color: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  // --- Soporte ---
  {
    label: 'Help',
    href: '/help',
    color: 'orange',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'FAQ',
    href: '/faq',
    color: 'cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h8M8 14h4" />
      </svg>
    ),
  },
  {
    label: 'Forum',
    href: '/forum',
    color: 'purple',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '/contact',
    color: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  // --- Legal ---
  {
    label: 'Rules',
    href: '/rules',
    color: 'pink',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    label: 'Terms',
    href: '/terms',
    color: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    label: 'Policy',
    href: '/policy',
    color: 'red',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    label: 'Credits',
    href: '/credits',
    color: 'yellow',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>
      </svg>
    ),
  },
];

export default function QuickDocks() {
  const pathname = usePathname();

  const HOVER_COLORS: Record<string, string> = {
    cyan: '#68cfff', purple: '#b400ff', pink: '#ff33cc',
    blue: '#59b4ff', green: '#00ff9d', orange: '#f97316',
    yellow: '#facc15', red: '#ef4444',
  };

  return (
    <div className="container mx-auto px-4 mt-24 mb-16 relative z-20">
      {/* Caja contenida y redondeada */}
      <div className="relative bg-black border-2 border-white/10 rounded-[3.5rem] p-8 md:p-14 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Decorative background elements inside the box */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/5 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <h3 className="text-4xl font-header font-black text-white uppercase tracking-[0.3em] leading-none mb-2">
              Quick Docks
            </h3>
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
              Acceso rápido a todas las secciones del ecosistema
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-3 mb-12">
            {DOCK_ITEMS.map((doc, i) => {
              const isActive = pathname === doc.href;
              const colorMaps: Record<string, { border: string, borderActive: string, shadow: string, text: string, hoverText: string, dropShadow: string }> = {
                cyan: { border: 'border-neon-cyan/30', borderActive: 'border-neon-cyan/100', shadow: 'shadow-[0_0_15px_var(--color-neon-cyan)]', text: 'text-neon-cyan', hoverText: 'group-hover:text-neon-cyan', dropShadow: 'drop-shadow-neon-cyan' },
                purple: { border: 'border-neon-purple/30', borderActive: 'border-neon-purple/100', shadow: 'shadow-[0_0_15px_var(--color-neon-purple)]', text: 'text-neon-purple', hoverText: 'group-hover:text-neon-purple', dropShadow: 'drop-shadow-neon-purple' },
                pink: { border: 'border-neon-pink/30', borderActive: 'border-neon-pink/100', shadow: 'shadow-[0_0_15px_var(--color-neon-pink)]', text: 'text-neon-pink', hoverText: 'group-hover:text-neon-pink', dropShadow: 'drop-shadow-neon-pink' },
                blue: { border: 'border-neon-blue/30', borderActive: 'border-neon-blue/100', shadow: 'shadow-[0_0_15px_var(--color-neon-blue)]', text: 'text-neon-blue', hoverText: 'group-hover:text-neon-blue', dropShadow: 'drop-shadow-neon-blue' },
                green: { border: 'border-neon-green/30', borderActive: 'border-neon-green/100', shadow: 'shadow-[0_0_15px_var(--color-neon-green)]', text: 'text-neon-green', hoverText: 'group-hover:text-neon-green', dropShadow: 'drop-shadow-neon-green' },
                orange: { border: 'border-orange-500/30', borderActive: 'border-orange-500/100', shadow: 'shadow-[0_0_15px_#f97316]', text: 'text-orange-500', hoverText: 'group-hover:text-orange-500', dropShadow: 'drop-shadow-md' },
                yellow: { border: 'border-yellow-400/30', borderActive: 'border-yellow-400/100', shadow: 'shadow-[0_0_15px_#facc15]', text: 'text-yellow-400', hoverText: 'group-hover:text-yellow-400', dropShadow: 'drop-shadow-md' },
                red: { border: 'border-red-500/30', borderActive: 'border-red-500/100', shadow: 'shadow-[0_0_15px_#ef4444]', text: 'text-red-500', hoverText: 'group-hover:text-red-500', dropShadow: 'drop-shadow-md' },
              };
              const style = colorMaps[doc.color];

              const hoverColor = HOVER_COLORS[doc.color] ?? '#ffffff';

              return (
                <Link
                  key={i}
                  href={doc.href}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-black border-2 transition-all group active-depth hover:-translate-y-1 ${isActive ? `${style.borderActive} ${style.shadow} scale-[1.02]` : style.border}`}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = hoverColor; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${hoverColor}55`; } }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; } }}
                >
                  <div className={`flex items-center justify-center transition-colors ${isActive ? `${style.text} ${style.dropShadow}` : `text-gray-500 ${style.hoverText}`}`}>
                    {doc.icon}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors text-center leading-tight ${isActive ? style.text : `text-white/40 group-hover:text-white`}`}>
                    {doc.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Support Banner */}
          <div className="relative group active-depth mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-700 via-red-600 to-orange-700 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-1000" />
            <div className="relative flex flex-col md:flex-row items-center justify-between p-8 rounded-[2rem] bg-gradient-to-br from-red-800/90 via-red-900/90 to-black border border-red-500/40 leading-none gap-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-red-500/20 rounded-2xl text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="text-left space-y-1">
                  <h4 className="text-white font-black text-base uppercase tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    ¿Necesitas ayuda urgente?
                  </h4>
                  <p className="text-red-300/80 text-[9px] font-medium uppercase tracking-[0.1em]">
                    Centro de operaciones activo. Reporta anomalías ahora.
                  </p>
                </div>
              </div>
              <Link
                href="/support"
                className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-black rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all whitespace-nowrap uppercase tracking-[0.2em] hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]"
              >
                IR AL SOPORTE
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
