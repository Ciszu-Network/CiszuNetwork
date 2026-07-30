'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/store';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { CISZU_NETWORK, CISZUKO_ANTONY, EXTERNAL_LINKS, SOCIAL_COLORS } from '@/config/site';
import { Globe, Sun, Moon, Heart, ExternalLink, ChevronRight } from 'lucide-react';

const FOOTER_SECTIONS = [
  {
    title: 'Ciszu Network',
    links: [
      { name: 'Inicio', href: '/' },
      { name: 'Sobre Nosotros', href: '/about' },
      { name: 'Equipo', href: '/team' },
      { name: 'Contacto', href: '/contact' },
    ],
  },
  {
    title: 'Información',
    links: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Políticas', href: '/policies' },
      { name: 'Guías', href: '/guidelines' },
      { name: 'Soporte', href: '/support' },
    ],
  },
  {
    title: 'Proyectos',
    links: [
      { name: 'Minecraft', href: '/projects/minecraft' },
      { name: 'Discord', href: '/projects/discord' },
      { name: 'WhatsApp', href: '/projects/whatsapp' },
      { name: 'Telegram', href: '/projects/telegram' },
      { name: 'MuzicMania', href: 'https://muzicmania.vercel.app/' },
      { name: 'Ciszuko Antony', href: 'https://ciszukoantony.vercel.app/' },
    ],
  },
];

export const Footer = () => {
  const { theme, setTheme, language, setLanguage } = useAppStore();

  const socialLinks = [
    { platform: 'youtube' as const, url: CISZU_NETWORK.social.youtube },
    { platform: 'facebook' as const, url: CISZU_NETWORK.social.facebook },
    { platform: 'instagram' as const, url: CISZU_NETWORK.social.instagram },
    { platform: 'x' as const, url: CISZU_NETWORK.social.x },
    { platform: 'github' as const, url: CISZU_NETWORK.social.github },
    { platform: 'discord' as const, url: CISZU_NETWORK.social.discord },
  ];

  return (
    <footer className="relative bg-black border-t border-brand/20 pt-16 pb-8 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(35,63,146,0.15)_0%,transparent_100%)] pointer-events-none" />

      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logos/imagen/outline/isotipo/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg"
                alt={CISZU_NETWORK.name}
                width={32}
                height={32}
                className="drop-shadow-brand"
              />
              <span className="font-header font-bold text-base text-brand-light">
                {CISZU_NETWORK.name}
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-4 max-w-xs">
              Innovación digital y desarrollo de software de alto rendimiento. &ldquo;{CISZU_NETWORK.tagline}&rdquo;
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {socialLinks.map((s) => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:scale-110 hover:border-brand/30 transition-all group"
                  title={s.platform}
                >
                  <SocialIcon platform={s.platform} size={16} />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all border border-white/10"
              >
                <Globe className="w-3 h-3" /> {language === 'es' ? 'ES' : 'EN'}
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all border border-white/10"
              >
                {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <span className="text-brand-light text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                {section.title}
              </span>
              <div className="flex flex-col gap-2">
                {section.links.map((link) => {
                  const isExternal = link.href.startsWith('http');
                  const Comp = isExternal ? 'a' : Link;
                  const props = isExternal ? { href: link.href, target: '_blank', rel: 'noopener noreferrer' } : { href: link.href };
                  return (
                    <Comp key={link.name} {...props}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-brand-light transition-colors text-xs font-medium"
                    >
                      {link.name}
                      {isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-50" />}
                    </Comp>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-brand/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} <span className="text-brand-light">{CISZU_NETWORK.name}</span>. Todos los derechos reservados.
            </p>
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1">
              Hecho con <Heart className="w-2.5 h-2.5 text-red-500" /> por{' '}
              <a href={CISZUKO_ANTONY.social.github} target="_blank" rel="noopener noreferrer" className="text-brand-light hover:underline">
                {CISZUKO_ANTONY.name}
              </a>
              {' & el equipo de '}
              <span className="text-brand-light">{CISZU_NETWORK.name}</span>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
            {[
              { name: 'Next.js', url: 'https://nextjs.org' },
              { name: 'Vercel', url: 'https://vercel.com' },
              { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
              { name: 'IBM Plex Sans', url: 'https://fonts.google.com/specimen/IBM+Plex+Sans' },
              { name: 'Lucide', url: 'https://lucide.dev' },
              { name: 'Zustand', url: 'https://zustand-demo.pmnd.rs' },
            ].map((tech) => (
              <a key={tech.name} href={tech.url} target="_blank" rel="noopener noreferrer"
                className="text-[9px] text-gray-600 hover:text-brand-light uppercase tracking-wider transition-colors"
              >
                {tech.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
