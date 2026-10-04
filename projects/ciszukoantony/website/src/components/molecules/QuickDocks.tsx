'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDict } from '@/components/providers/I18nProvider';
import { navLabel } from '@/lib/i18n';

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
    label: 'About',
    href: '/about',
    color: 'purple',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  {
    label: 'Certificates',
    href: '/certificates',
    color: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    href: '/projects',
    color: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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
        <circle cx="23" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '/contact',
    color: 'orange',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: 'Support',
    href: '/support',
    color: 'red',
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
    label: 'Portfolio',
    href: '/portfolio',
    color: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6h2c3 0 5.5-2.5 5.5-5.5C22 6 17.5 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'Curriculum',
    href: '/curriculum',
    color: 'purple',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Commissions',
    href: '/commissions',
    color: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 18V6" />
      </svg>
    ),
  },
  {
    label: 'Musicboard',
    href: '/musicboard',
    color: 'pink',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    label: 'Socials',
    href: '/socials',
    color: 'cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
  {
    label: 'Changelog',
    href: '/changelog',
    color: 'yellow',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
  },
  {
    label: 'Reviews',
    href: '/reviews',
    color: 'orange',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    label: 'Stats',
    href: '/stats',
    color: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
  {
    label: 'Downloads',
    href: '/downloads',
    color: 'purple',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    label: 'Information',
    href: '/information',
    color: 'cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  {
    label: 'Forum',
    href: '/forum',
    color: 'pink',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    label: 'Donate',
    href: '/donate',
    color: 'red',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    label: 'Credits',
    href: '/credits',
    color: 'green',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h10" />
        <path d="M7 12h6" />
        <path d="M7 16h8" />
      </svg>
    ),
  },
  {
    label: 'Feedback',
    href: '/feedback',
    color: 'orange',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="13" x2="14" y2="13" />
      </svg>
    ),
  },
];

export default function QuickDocks() {
  const pathname = usePathname();
  const dict = useDict();

  const HOVER_COLORS: Record<string, string> = {
    cyan: '#68cfff', purple: '#b400ff', pink: '#ff33cc',
    blue: '#59b4ff', green: '#00ff9d', orange: '#f97316',
    yellow: '#facc15', red: '#ef4444',
  };

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

  return (
    <div className="container mx-auto px-4 mt-24 mb-16 relative z-20">
      <div className="relative bg-black border-2 border-white/10 rounded-[3.5rem] p-8 md:p-14 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-purple/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-pink/5 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <h3 className="text-4xl font-header font-black text-white uppercase tracking-[0.3em] leading-none mb-2">
              {dict.docks.title}
            </h3>
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
              {dict.docks.subtitle}
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
                    {navLabel(dict, doc.href)}
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
