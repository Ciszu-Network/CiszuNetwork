'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';
import { useAppStore } from '@/store';
import { useToast } from '@ciszu/ui';
import Link from 'next/link';

// --- Shared Icon Library ---
const I = {
  mail: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .62 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.62A2 2 0 0 1 22 16.92z"/></svg>,
  map: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  clock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  globe: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  copy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-full h-full"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-full h-full"><polyline points="20 6 9 17 4 12"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.046c0 2.121.54 4.191 1.566 6.04L0 24l6.105-1.602a11.832 11.832 0 005.94 1.604h.005c6.634 0 12.043-5.412 12.046-12.047a11.8 11.8 0 00-3.483-8.39z"/></svg>,
  team: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

// --- WhatsApp Button ---
function WhatsAppButton({ phone }: { phone: string }) {
  return (
    <Link
      href={`https://wa.me/${phone.replace(/\+/g, '').replace(/-/g, '').replace(/\s/g, '')}`}
      target="_blank"
      className="p-3 rounded-xl bg-[#25d366]/10 text-[#25d366] hover:bg-[#25d366] hover:text-white transition-all group/wa"
    >
      <div className="w-5 h-5 group-hover/wa:scale-110 transition-transform">{I.whatsapp}</div>
    </Link>
  );
}

// --- Reusable Copy Field Component ---
function CopyField({ value, label, subValue, icon, theme = 'blue', showWhatsApp = false }: { value: string, label: string, subValue?: string, icon?: React.ReactNode, theme?: 'blue' | 'green' | 'purple', showWhatsApp?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themes = {
    blue: 'border-brand-light/20 bg-brand-light/5 text-brand-light',
    green: 'border-neon-green/20 bg-neon-green/5 text-neon-green',
    purple: 'border-neon-purple/20 bg-neon-purple/5 text-neon-purple',
  };

  return (
    <div className={`flex items-center gap-4 p-4 border rounded-3xl transition-all group/field hover:border-opacity-50 ${themes[theme]}`}>
      {icon && (
        <div className="w-10 h-10 p-2 rounded-xl bg-white/5 group-hover/field:scale-110 transition-transform">
          {icon}
        </div>
      )}
      <div className="flex flex-col flex-1">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
        <span className="text-base md:text-lg font-header font-black text-white tracking-widest break-all">{value}</span>
        {subValue && <span className="text-[9px] text-white/60 font-bold uppercase tracking-widest mt-1">{subValue}</span>}
      </div>
      <div className="flex gap-2">
        {showWhatsApp && <WhatsAppButton phone={value} />}
        <button
          onClick={handleCopy}
          className={`p-3 rounded-xl transition-all ${copied ? 'bg-neon-green/20 text-neon-green' : 'bg-white/5 text-gray-400 hover:bg-white hover:text-black'}`}
        >
          <div className="w-4 h-4">{copied ? I.check : I.copy}</div>
        </button>
      </div>
    </div>
  );
}

// --- Social Button ---
function SocialButton({ name, href, textCol, borderCol, bgCol, hoverBg, hoverColor, icon, onClick }: {
  name: string; href: string; textCol: string; borderCol: string; bgCol: string; hoverBg: string; hoverColor: string; icon: React.ReactNode; onClick?: () => void;
}) {
  return (
    <button onClick={onClick || (() => window.open(href, '_blank'))}
      className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all hover:scale-105 ${borderCol} ${bgCol} ${textCol} ${hoverBg} ${hoverColor}`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{name}</span>
    </button>
  );
}

// --- Unified Socials for Contact Page ---
const MUZICMANIA_SOCIALS = [
  { name: 'Discord', href: 'https://discord.gg/W3kMtMMj6E', textCol: 'text-[#5865F2]', borderCol: 'border-[#5865F2]/40', bgCol: 'bg-[#5865F2]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> },
  { name: 'YouTube', href: 'https://www.youtube.com/@CiszuNetwork', textCol: 'text-[#FF0000]', borderCol: 'border-[#FF0000]/40', bgCol: 'bg-[#FF0000]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#FF0000] hover:to-[#cc0000]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: 'Instagram', href: 'https://www.instagram.com/ciszunetwork/', textCol: 'text-[#E1306C]', borderCol: 'border-[#E1306C]/40', bgCol: 'bg-[#E1306C]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { name: 'TikTok', href: 'https://www.tiktok.com/@ciszunetwork', textCol: 'text-[#00F2FE]', borderCol: 'border-[#00F2FE]/40', bgCol: 'bg-[#00F2FE]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-black hover:to-zinc-900', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.26 8.26 0 004.83 1.55V6.87a4.85 4.85 0 01-1.06-.18z"/></svg> },
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61572023767657', textCol: 'text-[#1877F2]', borderCol: 'border-[#1877F2]/40', bgCol: 'bg-[#1877F2]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#1877F2] hover:to-[#145dba]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { name: 'GitHub', href: 'https://github.com/Ciszu-Network', textCol: 'text-gray-300', borderCol: 'border-white/30', bgCol: 'bg-white/5', hoverBg: 'hover:bg-gradient-to-tr hover:from-gray-700 hover:to-black', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
];

const CISZUNETWORK_SOCIALS = [
  { name: 'Discord', href: 'https://discord.gg/W3kMtMMj6E', textCol: 'text-[#5865F2]', borderCol: 'border-[#5865F2]/40', bgCol: 'bg-[#5865F2]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> },
  { name: 'YouTube', href: 'https://www.youtube.com/@CiszuNetwork', textCol: 'text-[#FF0000]', borderCol: 'border-[#FF0000]/40', bgCol: 'bg-[#FF0000]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#FF0000] hover:to-[#cc0000]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: 'Instagram', href: 'https://www.instagram.com/ciszunetwork/', textCol: 'text-[#E1306C]', borderCol: 'border-[#E1306C]/40', bgCol: 'bg-[#E1306C]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { name: 'TikTok', href: 'https://www.tiktok.com/@ciszunetwork', textCol: 'text-[#00F2FE]', borderCol: 'border-[#00F2FE]/40', bgCol: 'bg-[#00F2FE]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-black hover:to-zinc-900', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.26 8.26 0 004.83 1.55V6.87a4.85 4.85 0 01-1.06-.18z"/></svg> },
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61572023767657', textCol: 'text-[#1877F2]', borderCol: 'border-[#1877F2]/40', bgCol: 'bg-[#1877F2]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#1877F2] hover:to-[#145dba]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { name: 'GitHub', href: 'https://github.com/Ciszu-Network', textCol: 'text-gray-300', borderCol: 'border-white/30', bgCol: 'bg-white/5', hoverBg: 'hover:bg-gradient-to-tr hover:from-gray-700 hover:to-black', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
];

const CISZUKO_ANTONY_SOCIALS = [
  { name: 'Discord', href: 'https://discord.gg/W3kMtMMj6E', textCol: 'text-[#5865F2]', borderCol: 'border-[#5865F2]/40', bgCol: 'bg-[#5865F2]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#5865F2] hover:to-[#7289da]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> },
  { name: 'YouTube', href: 'https://www.youtube.com/@CiszukoAntony', textCol: 'text-[#FF0000]', borderCol: 'border-[#FF0000]/40', bgCol: 'bg-[#FF0000]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#FF0000] hover:to-[#cc0000]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: 'Instagram', href: 'https://www.instagram.com/itz.ciszukoant0nyz/', textCol: 'text-[#E1306C]', borderCol: 'border-[#E1306C]/40', bgCol: 'bg-[#E1306C]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { name: 'Facebook', href: 'https://www.facebook.com/ciszukoantony', textCol: 'text-[#1877F2]', borderCol: 'border-[#1877F2]/40', bgCol: 'bg-[#1877F2]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-[#1877F2] hover:to-[#145dba]', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { name: 'X', href: 'https://x.com/CiszukoAntony', textCol: 'text-gray-300', borderCol: 'border-white/30', bgCol: 'bg-white/5', hoverBg: 'hover:bg-gradient-to-tr hover:from-gray-800 hover:to-gray-600', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: 'TikTok', href: 'https://www.tiktok.com/@ciszukoantony', textCol: 'text-[#00F2FE]', borderCol: 'border-[#00F2FE]/40', bgCol: 'bg-[#00F2FE]/10', hoverBg: 'hover:bg-gradient-to-tr hover:from-black hover:to-zinc-900', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  { name: 'GitHub', href: 'https://github.com/ciszukoantony', textCol: 'text-gray-300', borderCol: 'border-white/30', bgCol: 'bg-white/5', hoverBg: 'hover:bg-gradient-to-tr hover:from-gray-700 hover:to-black', hoverColor: 'hover:text-white', icon: <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.809 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12"/></svg> },
];

const DISCORD_IDS: Record<string, string> = {
  ciszunetwork: 'ciszunetwork',
  ciszubot: 'ciszubot',
  ciszukoantony_: 'ciszukoantony_',
};

export default function ContactPage() {
  usePageTitle('CONTACT');
  const { } = useAppStore();
  const { toast } = useToast();
  const [selectedDiscord, setSelectedDiscord] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } }
  };

  if (!mounted) return null;

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-neon-cyan/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-neon-blue/5 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 space-y-20">

        {/* --- HERO HEADER (Information Style Refined) --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-brand-light flex items-center justify-center">
                   {I.globe}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-brand-light via-brand-accent to-brand-light bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                   CONTACTO
                </h1>
             </div>
             <p className="text-brand-accent font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
                Núcleo de Asistencia y Canales de Comunicación
             </p>
          </div>
        </motion.header>

        {/* --- MAIN CONTACT GRID --- */}
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <div className="p-10 md:p-14 bg-doc-dark border border-white/5 rounded-[3rem] space-y-8 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
              <h2 className="text-4xl md:text-5xl font-header font-black text-white uppercase italic tracking-tighter leading-none">
                ¿TIENES DUDAS?
              </h2>
              <p className="text-white/80 font-bold text-xl md:text-2xl leading-relaxed tracking-tight group-hover:text-white transition-colors">
                Establece una conexión directa con nuestra matriz corporativa. Estamos listos para sincronizar soluciones y responder a tus requerimientos globales.
              </p>

              <div className="pt-10 border-t border-white/5 space-y-6">
                <CopyField label="Email de Consulta Primaria" value="ciszunetwork@gmail.com" icon={I.mail} theme="blue" />
                <CopyField label="Localidad de Operaciones" value="Coro, Falcón" subValue="Venezuela" icon={I.map} theme="purple" />
                <CopyField label="Línea Directa WhatsApp" value="+58 412 6858111" subValue="Venezuela" icon={I.phone} theme="green" showWhatsApp={true} />

                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neon-purple/70 pl-2">Emails secundarios</p>
                  <div className="grid grid-cols-1 gap-4">
                    <CopyField label="Outlook" value="ciszunetwork@outlook.com" icon={I.mail} theme="purple" />
                    <CopyField label="Hotmail" value="ciszunetwork@hotmail.com" icon={I.mail} theme="purple" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7">
             <div className="h-full min-h-[500px] p-10 bg-doc-dark border border-white/10 rounded-[3rem] overflow-hidden relative shadow-2xl group">
                <div className="flex flex-col h-full justify-center items-center text-center space-y-8">
                   <div className="w-20 h-20 text-brand-light p-5 bg-brand-accent/5 rounded-[2rem] border border-brand-accent/20">
                      {I.map}
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-4xl md:text-5xl font-header font-black text-white uppercase italic tracking-tighter">
                         Nuestra Localidad
                      </h3>
                      <p className="text-xl font-header font-black text-brand-accent italic uppercase tracking-tighter">
                         Coro, Falcón
                      </p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest max-w-md">
                         Base de Operaciones Suramericana - Venezuela (GMT-4)
                      </p>
                   </div>
                   <div className="flex flex-wrap justify-center gap-4 pt-8">
                      <CopyField label="Email de Consulta" value="ciszunetwork@gmail.com" icon={I.mail} theme="blue" />
                      <CopyField label="WhatsApp Directo" value="+58 412 6858111" icon={I.phone} theme="green" showWhatsApp={true} />
                   </div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* --- OPERATIONAL INFO --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-10 bg-black/40 border-2 border-neon-green/20 rounded-[3rem] space-y-6 flex flex-col items-center text-center group hover:border-neon-green transition-all shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <div className="relative">
                <div className="w-16 h-16 text-neon-green p-4 bg-neon-green/5 rounded-[2rem] border border-neon-green/20 group-hover:bg-neon-green group-hover:text-white transition-all">{I.clock}</div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-black animate-pulse" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-header font-black text-white italic uppercase tracking-tighter">DISPONIBILIDAD 24/7</h3>
                 <p className="text-neon-green font-black text-xs uppercase tracking-[0.5em] opacity-80 flex items-center justify-center gap-2">ONLINE AHORA</p>
              </div>
              <p className="text-gray-400 font-bold text-sm leading-relaxed max-w-sm uppercase tracking-widest italic flex items-center justify-center flex-wrap gap-2 text-center">
                Atención ininterrumpida los 365 días del año en horario <span className="text-white">Venezuela (GMT-4)</span>.
              </p>
           </div>
           <div className="p-10 bg-black/40 border-2 border-brand-accent/20 rounded-[3rem] space-y-6 flex flex-col items-center text-center group hover:border-brand-accent transition-all">
              <div className="w-16 h-16 text-brand-accent p-4 bg-brand-accent/5 rounded-[2rem] border border-brand-accent/20 group-hover:bg-brand-accent group-hover:text-black transition-all">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              </div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-header font-black text-white italic uppercase tracking-tighter">ESTRUCTURA TÉCNICA</h3>
                 <p className="text-brand-accent font-black text-xs uppercase tracking-[0.5em] opacity-80">Codex Digital Architecture</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                 {['React', 'Next.js', 'Supabase', 'Tailwind', 'Framer Motion', 'Vercel'].map(tech => (
                   <span key={tech} className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all cursor-default">{tech}</span>
                 ))}
              </div>
           </div>
        </motion.section>

        {/* --- CEO SECTION --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="relative py-12">
            <div className="flex flex-col md:flex-row items-center gap-12 p-12 bg-gradient-to-br from-indigo-950/40 to-black border-2 border-brand-accent/30 rounded-[4rem] relative overflow-hidden group hover:border-brand-light transition-all duration-700">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(0,240,255,0.15)_0%,transparent_60%)] pointer-events-none" />
               <div className="w-48 h-48 md:w-64 md:h-64 bg-black border-2 border-brand-accent/30 rounded-[4rem] shrink-0 transform rotate-6 group-hover:rotate-0 transition-transform duration-700 shadow-2xl overflow-hidden flex items-center justify-center p-12 text-white">
                  {I.user}
               </div>
               <div className="space-y-6 text-center md:text-left relative z-10 w-full">
                  <div>
                    <h3 className="text-5xl md:text-7xl font-header font-black text-white italic tracking-tighter uppercase leading-none">CISZUKO ANTONY</h3>
                    <p className="text-brand-light font-black tracking-[0.6em] uppercase text-xs md:text-sm pt-2 flex items-center justify-center md:justify-start gap-3">
                       CEO & CREADOR · NÚCLEO CISZU
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
                     <CopyField label="Email Personal" value="fplayersoffcial@gmail.com" icon={I.mail} theme="blue" />
                     <CopyField label="WhatsApp Personal" value="+58 412 6858111" subValue="Venezuela" icon={I.phone} theme="green" showWhatsApp={true} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-5 pt-6">
                    <button onClick={() => window.open('https://ciszukoantony.vercel.app', '_blank')} className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-brand-light hover:text-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4">
                      <div className="w-4 h-4">{I.globe}</div> Portafolio Personal
                    </button>
                    <Link href="/team#ceo" className="px-8 py-4 bg-transparent border-2 border-brand-light text-brand-light font-black uppercase text-xs tracking-[0.2em] rounded-3xl hover:bg-brand-light hover:text-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-4 group">
                       <div className="w-4 h-4 group-hover:scale-110 transition-transform">{I.team}</div> Perfil Completo
                    </Link>
                  </div>
               </div>
            </div>
        </motion.section>

        {/* --- SOCIAL GALAXY --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-12 bg-black/40 p-12 md:p-20 rounded-[5rem] border border-white/5">
           <div className="text-center space-y-2 mb-12">
             <h3 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">SISTEMA SOCIAL UNIFICADO</h3>
             <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em] flex items-center justify-center gap-2">Conexión Global</p>
           </div>

           <div className="space-y-16">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-[1px] flex-1 bg-neon-cyan/10" /><span className="text-neon-cyan font-black text-[10px] uppercase tracking-widest px-4">Ecosistema MuzicMania</span><div className="h-[1px] flex-1 bg-neon-cyan/10" />
                </div>
                   <div className="flex flex-wrap justify-center gap-4">
                    {MUZICMANIA_SOCIALS.filter(s => s.name !== 'GitHub').map(s => {
                      let actualHref = s.href;
                      let btnText = s.name;
                      if (s.name === 'Discord') { actualHref = 'https://discord.gg/W3kMtMMj6E'; btnText = 'Ciszugamens'; }
                      return (
                        <SocialButton key={s.name} {...s} href={actualHref} name={btnText} onClick={() => {if (s.name === 'Discord') setSelectedDiscord('ciszunetwork'); }} />
                      );
                    })}
                  </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-[1px] flex-1 bg-brand-light/10" /><span className="text-brand-light font-black text-[10px] uppercase tracking-widest px-4">Corporación Ciszu Network</span><div className="h-[1px] flex-1 bg-brand-light/10" />
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                   {CISZUNETWORK_SOCIALS.filter(s => s.name !== 'GitHub').map(s => {
                      let actualHref = s.href; let btnText = s.name;
                      if (s.name === 'Discord') { actualHref = 'https://discord.gg/W3kMtMMj6E'; btnText = 'Ciszugamens'; }
                      return (
                        <SocialButton key={s.name} {...s} href={actualHref} name={btnText} onClick={() => {if (s.name === 'Discord') setSelectedDiscord('ciszunetwork'); }} />
                      );
                    })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-[1px] flex-1 bg-white/5" /><span className="text-white font-black text-[10px] uppercase tracking-widest px-4">Portafolio Ciszuko Antony</span><div className="h-[1px] flex-1 bg-white/5" />
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                   {CISZUKO_ANTONY_SOCIALS.map(s => {
                      let actualHref = s.href;
                      if (s.name === 'Instagram') actualHref = 'https://www.instagram.com/itz.ciszukoant0nyz/';
                      else if (s.name === 'X') actualHref = 'https://x.com/CiszukoAntony';
                      else if (s.name === 'TikTok') actualHref = 'https://www.tiktok.com/@ciszukoantony';
                      else if (s.name === 'YouTube') actualHref = 'https://youtube.com/@ciszukoantony';
                      else if (s.name === 'GitHub') actualHref = 'https://github.com/ciszukoantony';
                      else if (s.name === 'Facebook') actualHref = 'https://facebook.com/ciszukoantony';
                      const isDiscord = s.name === 'Discord';
                      return (
                        <SocialButton key={s.name} {...s} href={actualHref} name={isDiscord ? 'Discord ID' : s.name} onClick={() => isDiscord ? setSelectedDiscord('ciszukoantony_') : undefined} />
                      );
                    })}
                </div>
              </div>
           </div>
        </motion.section>

        <QuickDocks />
      </div>

      <AnimatePresence>
        {selectedDiscord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-doc-dark border border-white/10 rounded-[3rem] p-10 space-y-8 relative"
            >
              <button onClick={() => setSelectedDiscord(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 bg-[#5865F2]/10 text-[#5865F2] rounded-[2rem] border border-[#5865F2]/20 p-5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-2xl font-header font-black text-white uppercase italic">Discord ID</h4>
                  <p className="text-[#5865F2] font-black uppercase tracking-[0.4em] text-[10px]">Ciszuko Antony</p>
                </div>
                <div className="w-full bg-black/60 rounded-3xl p-6 border border-white/5 space-y-4">
                  <div className="text-3xl font-header font-black text-white tracking-widest">{selectedDiscord}</div>
                  <button onClick={() => { navigator.clipboard.writeText(selectedDiscord); toast('[ÉXITO]: Discord ID copiado al portapapeles.', 'success'); setSelectedDiscord(null); }}
                    className="w-full py-4 bg-neon-green/20 border border-neon-green/40 text-neon-green font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-3 hover:bg-neon-green hover:text-black transition-all"
                  >
                    <div className="w-4 h-4">{I.copy}</div> Sincronizar ID
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
