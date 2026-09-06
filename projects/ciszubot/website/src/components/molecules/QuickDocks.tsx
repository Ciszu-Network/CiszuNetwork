'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type DockItem = {
  label: string;
  href: string;
  color: string;
  icon: React.ReactNode;
};

const DOCK_ITEMS: DockItem[] = [
  {
    label: 'Home',
    href: '/',
    color: 'cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Commands',
    href: '/comandos',
    color: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    color: 'purple',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Status',
    href: '/estado',
    color: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    label: 'Downloads',
    href: '/descargas',
    color: 'orange',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    label: 'Support',
    href: '/soporte',
    color: 'pink',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Terms',
    href: '/terminos',
    color: 'red',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: 'Privacy',
    href: '/privacidad',
    color: 'cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function QuickDocks() {
  const pathname = usePathname();

  const HOVER_COLORS: Record<string, string> = {
    cyan: '#68cfff', purple: '#4800ff', pink: '#ff33cc',
    blue: '#59b4ff', green: '#00ff88', orange: '#f97316',
    yellow: '#facc15', red: '#ef4444',
  };

  const colorMaps: Record<string, { border: string, borderActive: string, shadow: string, text: string, hoverText: string, dropShadow: string }> = {
    cyan: { border: 'border-neon-cyan/30', borderActive: 'border-neon-cyan/100', shadow: 'shadow-[0_0_15px_var(--color-neon-cyan)]', text: 'text-neon-cyan', hoverText: 'group-hover:text-neon-cyan', dropShadow: 'drop-shadow-neon-cyan' },
    purple: { border: 'border-neon-purple/30', borderActive: 'border-neon-purple/100', shadow: 'shadow-[0_0_15px_var(--color-neon-purple)]', text: 'text-neon-purple', hoverText: 'group-hover:text-neon-purple', dropShadow: 'drop-shadow-neon-purple' },
    pink: { border: 'border-neon-pink/30', borderActive: 'border-neon-pink/100', shadow: 'shadow-[0_0_15px_var(--color-neon-pink)]', text: 'text-neon-pink', hoverText: 'group-hover:text-neon-pink', dropShadow: 'drop-shadow-neon-pink' },
    blue: { border: 'border-neon-blue/30', borderActive: 'border-neon-blue/100', shadow: 'shadow-[0_0_15px_var(--color-neon-blue)]', text: 'text-neon-blue', hoverText: 'group-hover:text-neon-blue', dropShadow: 'drop-shadow-neon-blue' },
    green: { border: 'border-green-500/30', borderActive: 'border-green-500/100', shadow: 'shadow-[0_0_15px_#00ff88]', text: 'text-green-400', hoverText: 'group-hover:text-green-400', dropShadow: 'drop-shadow-md' },
    orange: { border: 'border-orange-500/30', borderActive: 'border-orange-500/100', shadow: 'shadow-[0_0_15px_#f97316]', text: 'text-orange-500', hoverText: 'group-hover:text-orange-500', dropShadow: 'drop-shadow-md' },
    yellow: { border: 'border-yellow-400/30', borderActive: 'border-yellow-400/100', shadow: 'shadow-[0_0_15px_#facc15]', text: 'text-yellow-400', hoverText: 'group-hover:text-yellow-400', dropShadow: 'drop-shadow-md' },
    red: { border: 'border-red-500/30', borderActive: 'border-red-500/100', shadow: 'shadow-[0_0_15px_#ef4444]', text: 'text-red-500', hoverText: 'group-hover:text-red-500', dropShadow: 'drop-shadow-md' },
  };

  return (
    <div className="container mx-auto px-4 mt-24 mb-16 relative z-20">
      <div className="relative bg-black border-2 border-white/10 rounded-[3.5rem] p-8 md:p-14 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/5 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <h3 className="text-4xl font-header font-black text-white uppercase tracking-[0.3em] leading-none mb-2">
              Quick Docks
            </h3>
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
              Acceso rápido a todas las secciones
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 gap-3">
            {DOCK_ITEMS.map((doc, i) => {
              const isActive = pathname === doc.href;
              const style = colorMaps[doc.color];
              const hoverColor = HOVER_COLORS[doc.color] ?? '#ffffff';

              return (
                <Link
                  key={i}
                  href={doc.href}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-black border-2 transition-all group active-depth hover:-translate-y-1 ${isActive ? `${style.borderActive} ${style.shadow} scale-[1.02]` : style.border}`}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.borderColor = hoverColor;
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${hoverColor}55`;
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.borderColor = '';
                      (e.currentTarget as HTMLElement).style.boxShadow = '';
                    }
                  }}
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
        </div>
      </div>
    </div>
  );
}
