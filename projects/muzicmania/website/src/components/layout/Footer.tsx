'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';

import { I, SOCIALS, FOOTER_NAV as footerNav } from '@/config/navigation';

const IcoTwitter = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const IcoDiscord = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.079.112 18.1.13 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;
const IcoGithub = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>;
const IcoYoutube = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const IcoInsta = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
const IcoFacebook = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const IcoTiktok = () => <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.53 1.53-.3 2.7-1.67 2.68-3.23.03-4.32.01-8.64.02-12.96z"/></svg>;
const IcoUp = () => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}><path d="m18 15-6-6-6 6"/></svg>;
const IcoDown = () => <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6"/></svg>;
const IcoPhone = () => <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

export const Footer = () => {
  const pathname = usePathname();
  const { isNavigating, setIsMenuOpen, setSidebarView, darkMode, setDarkMode, toastMessage, showToast, hideToast } = useAppStore();

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => hideToast(), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, hideToast]);

  return (
    <footer className="relative bg-black border-t-2 border-white/10 pt-10 pb-6 px-4 md:px-8 overflow-hidden z-30">
      {/* Animated separator line Top of Footer */}
      <div className={`absolute top-0 left-0 w-full h-[3px] transition-colors duration-500 animate-gradient-x ${
        isNavigating
          ? 'bg-[length:200%_auto] bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
          : 'bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink shadow-[0_0_15px_rgba(0,212,255,0.4)]'
      }`} />

      {/* Floating scroll arrows (Global) */}
      {pathname !== '/play' && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3 [.is-fullscreen_&]:hidden">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-3 bg-black/60 backdrop-blur-md border-2 border-neon-blue rounded-full text-neon-blue shadow-neon-blue hover:text-neon-pink hover:border-neon-pink transition-all active:scale-95"><IcoUp /></button>
          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="p-3 bg-black/60 backdrop-blur-md border-2 border-neon-blue rounded-full text-neon-blue shadow-neon-blue hover:text-neon-pink hover:border-neon-pink transition-all active:scale-95"><IcoDown /></button>
        </div>
      )}

      <div className="max-w-[90rem] mx-auto">
        {/* Main Footer Layout Container */}
        <div className="flex flex-col xl:flex-row gap-6 mb-8 bg-[#050505] border border-white/5 p-6 lg:p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">

          {/* LEFT: Brand & Community */}
          <div className="flex flex-col items-center text-center xl:w-2/5 border-b xl:border-b-0 xl:border-r border-white/10 pb-8 xl:pb-0 xl:pr-10">
            <Link href="/" className="flex flex-col items-center gap-4 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 mb-6">
              <Image
                src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')}
                alt="Isotipo" width={72} height={72}
                className="drop-shadow-neon-blue group-hover:drop-shadow-[0_0_25px_rgba(0,212,255,0.9)] transition-all duration-300"
              />
              <Image
                src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')}
                alt="MuzicMania" width={220} height={48}
                className="group-hover:drop-shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-300"
              />
            </Link>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { Ico: IcoTwitter, href: 'https://x.com/CiszukoAntony', hoverClass: 'hover:border-[#1DA1F2] hover:bg-gradient-to-tr hover:from-[#1DA1F2]/30 hover:to-transparent hover:text-[#1DA1F2] hover:shadow-[0_0_15px_rgba(29,161,242,0.4)]' },
                { Ico: IcoDiscord, href: 'https://discord.gg/W3kMtMMj6E', hoverClass: 'hover:border-[#5865F2] hover:bg-gradient-to-tr hover:from-[#5865F2]/30 hover:to-transparent hover:text-[#5865F2] hover:shadow-[0_0_15px_rgba(88,101,242,0.4)]' },
                { Ico: IcoGithub, href: 'https://github.com/Ciszu-Network', hoverClass: 'hover:border-white hover:bg-gradient-to-tr hover:from-white/30 hover:to-transparent hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]' },
                { Ico: IcoYoutube, href: 'https://www.youtube.com/@CiszuNetwork', hoverClass: 'hover:border-[#FF0000] hover:bg-gradient-to-tr hover:from-[#FF0000]/30 hover:to-transparent hover:text-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]' },
                { Ico: IcoInsta, href: 'https://www.instagram.com/ciszunetwork/', hoverClass: 'hover:border-[#E1306C] hover:bg-gradient-to-tr hover:from-[#833AB4]/30 hover:via-[#FD1D1D]/30 hover:to-[#F56040]/30 hover:text-[#E1306C] hover:shadow-[0_0_15px_rgba(225,48,108,0.4)]' },
                { Ico: IcoTiktok, href: 'https://www.tiktok.com/@ciszunetwork', hoverClass: 'hover:border-white hover:bg-gradient-to-tr hover:from-black/30 hover:to-zinc-900/30 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]' },
                { Ico: IcoFacebook, href: 'https://www.facebook.com/profile.php?id=61572023767657', hoverClass: 'hover:border-[#1877F2] hover:bg-gradient-to-tr hover:from-[#1877F2]/30 hover:to-transparent hover:text-[#1877F2] hover:shadow-[0_0_15px_rgba(24,119,242,0.4)]' },
              ].map(({ Ico, href, hoverClass }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:scale-110 ${hoverClass}`}>
                  <Ico />
                </a>
              ))}
            </div>

            {/* Community Connectors (WhatsApp & Discord) */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full max-w-3xl mb-8">
              {/* WhatsApp Button */}
              <a
                href="https://wa.me/584126858111"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] hover:bg-gradient-to-r hover:from-[#25D366]/70 hover:to-[#128C7E]/70 px-6 py-4 rounded-2xl transition-all duration-300 hover:text-white shadow-lg shadow-[#25D366]/10 hover:shadow-[0_0_25px_#25D366] hover:scale-[1.02]"
              >
                <IcoPhone />
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">WhatsApp Directo</span>
                  <span className="text-base font-bold tracking-tight leading-none group-hover:text-white">+58 412 6858111</span>
                </div>
              </a>

              {/* Vertical Divider (Desktop Only) */}
              <div className="hidden sm:block w-[1px] bg-white/10 self-stretch my-2" />

              {/* Discord Server Button */}
              <a
                href="https://discord.gg/W3kMtMMj6E"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group flex items-center justify-center gap-4 bg-[#5865F2]/10 border border-[#5865F2]/40 text-[#5865F2] hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da] hover:text-white px-8 py-4 rounded-2xl transition-all shadow-lg active-depth"
              >
                <div className="w-6 h-6 transform group-hover:scale-110 transition-transform">
                  <IcoDiscord />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="font-header font-black tracking-tighter text-lg uppercase italic">Discord Server</span>
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT: Footer Nav Layout */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center sm:text-left content-start">
            {footerNav.map((section) => (
              <div key={section.title} className="flex flex-col items-center sm:items-start">
                <div className="flex flex-col gap-1.5 w-full">
                  {section.links.map((link) => {
                    const active = isActive(link.href);
                    const isPlay = link.href === '/play';
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center justify-center sm:justify-start gap-3 px-4 py-1.5 rounded-lg border font-header text-sm font-bold transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:scale-95 group
                          ${active
                            ? (isPlay ? 'border-green-500 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] text-black animate-pulse' : 'border-neon-blue bg-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.3)] text-neon-blue hover:text-white')
                            : (isPlay ? 'border-transparent text-white hover:border-green-500 hover:bg-green-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'border-transparent text-white hover:border-neon-blue hover:bg-neon-blue/15 hover:text-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]')
                          }
                        `}
                      >
                        <span className="transition-colors duration-300">
                          {link.icon}
                        </span>
                        <span className="tracking-wide">
                          {link.name}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Controls & Bottom Bar */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        <div className="flex flex-col items-center justify-center gap-8 pb-6 text-center">

          {/* LEFT: Navbar-style trigger buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => showToast('Esta función no está desarrollada para la beta aún')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-md border group ${
                darkMode ? 'bg-white border-gray-100 hover:scale-110' : 'bg-yellow-400 border-yellow-500 hover:scale-110'
              }`}
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-black transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-black transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="currentColor" stroke="black" strokeWidth={1}>
                  <circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            <button
              onClick={() => { setIsMenuOpen(true); setSidebarView('lang'); }}
              className="group flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 shadow-lg"
              title="Cambiar Idioma"
            >
              <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="text-gray-400 group-hover:text-white uppercase tracking-widest text-xs font-bold">LANG</span>
            </button>
          </div>

          {/* RIGHT: Copyright */}
          <div className="text-center space-y-2">
            <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
              <span className="text-neon-cyan">&copy;</span> 2024-{new Date().getFullYear()}{' '}
              <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors cursor-pointer uppercase font-black">CISZU NETWORK</a> &amp; MUZICMANIA. ALL RIGHTS RESERVED.
            </p>
            <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
              HECHO CON AMOR POR{' '}
              <a href="https://ciszukoantony.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neon-cyan font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">CISZUKO ANTONY</a>{' '}
              · RESPALDADO POR{' '}
              <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neon-cyan font-black transition-colors cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">CISZU NETWORK</a>
            </p>
          </div>
        </div>
      </div>

      {/* Push Notification (Toast Error System) */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
           <div className="bg-[#050000]/95 border border-red-600/50 px-6 py-4 rounded-full shadow-[0_4px_30px_rgba(220,38,38,0.4)] backdrop-blur-md flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <p className="text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                 {toastMessage}
              </p>
           </div>
        </div>
      )}

    </footer>
  );
};

export default Footer;
