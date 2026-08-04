'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveAssetPath } from '@ciszunetwork/cdn';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import ScrollSpy from '@/components/molecules/ScrollSpy';
import QuickDocks from '@/components/molecules/QuickDocks';

// --- Icons Library ---
const I = {
  home:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  supabase:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M21.362 9.354H12V.5L2.638 10.646H12V19.5z"/></svg>,
  react:       <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-full h-full" fill="none" stroke="currentColor"><circle r="2.05" fill="currentColor"/><g strokeWidth="1"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>,
  vercel:      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M24 22.525H0L12 1.736l12 20.789z"/></svg>,
  cloud:       <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.1-3.9-4.4-.5-3.1-3.2-5.1-6.1-5.1-2.2 0-4.2 1.2-5.2 3.1-2.9.2-5.3 2.6-5.3 5.5C1.5 16.5 3.7 18.5 6.4 18.5H17.5z"/></svg>,
  play:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  leaderboard: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  stats:       <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  changelog:   <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M16.13 7.07l2.12-2.12" strokeLinecap="round"/><path d="M12 2a10 10 0 1 0 10 10" stroke="currentColor"/><path d="M22 2v5h-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  info:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01" strokeLinecap="round" strokeWidth={3}/></svg>,
  contact:     <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  support:     <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  team:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  docs:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  license:     <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
  reviews:     <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  search:      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  arrow:       <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 12h14M12 5l7 7-7 7" /></svg>,
  copy:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  check:       <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>,
  download:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  identity:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="12" r="3" /></svg>,
  mission:     <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  vision:      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  settings:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  music:       <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  volume:      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  star:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  moon:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  lock:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  unlock:      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  heart:       <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  bell:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  mail:        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  terminal:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  database:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  nextjs:      <svg className="w-full h-full" fill="currentColor"><use href="/icons/sprites/sprite.svg#icon-ri-outline-nextjs"/></svg>,
  typescript:  <svg className="w-full h-full" fill="currentColor"><use href="/icons/sprites/sprite.svg#icon-ri-outline-typescript"/></svg>,
  tailwind:    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.639C13.679,10.65,15.115,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.639C16.323,6.15,14.887,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.639c1.191,1.214,2.627,2.661,5.513,2.661c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.639C10.323,13.35,8.887,12,6.001,12z"/></svg>,
  image:       <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  global:      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};

// --- Helper Comps ---
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`p-1.5 rounded-lg transition-all ${copied ? 'text-neon-green bg-neon-green/10' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}>
      {copied ? <div className="w-4 h-4">{I.check}</div> : <div className="w-4 h-4">{I.copy}</div>}
    </button>
  );
};

// --- Branding Data ---
const BRAND_COLORS = [
  { 
    name: 'Neon Glitch', color: 'blue',
    shades: [
      { hex: '#279EFF', rgb: '39, 158, 255', cmyk: '100, 17, 0, 0' },
      { hex: '#0073FF', rgb: '0, 115, 255', cmyk: '100, 50, 0, 0' },
      { hex: '#55E3FF', rgb: '85, 227, 255', cmyk: '60, 0, 0, 0' }
    ]
  },
  { 
    name: 'Abyssal Pulse', color: 'cyan',
    shades: [
      { hex: '#00F0FF', rgb: '0, 240, 255', cmyk: '100, 0, 0, 0' },
      { hex: '#0099FF', rgb: '0, 153, 255', cmyk: '100, 40, 0, 0' },
      { hex: '#00D4FF', rgb: '0, 212, 255', cmyk: '100, 20, 0, 0' }
    ]
  },
  { 
    name: 'Stellar Void', color: 'purple',
    shades: [
      { hex: '#4800FF', rgb: '72, 0, 255', cmyk: '50, 100, 0, 0' },
      { hex: '#3000AA', rgb: '48, 0, 170', cmyk: '70, 100, 0, 30' },
      { hex: '#8000FF', rgb: '128, 0, 255', cmyk: '60, 100, 0, 0' }
    ]
  },
  { 
    name: 'Hypernova Ember', color: 'pink',
    shades: [
      { hex: '#FF33CC', rgb: '255, 51, 204', cmyk: '0, 80, 20, 0' },
      { hex: '#AA2288', rgb: '170, 34, 136', cmyk: '0, 100, 20, 40' },
      { hex: '#FF66DD', rgb: '255, 102, 221', cmyk: '0, 60, 10, 0' }
    ]
  },
  { 
    name: 'Emerald Flow', color: 'green',
    shades: [
      { hex: '#00FF88', rgb: '0, 255, 136', cmyk: '100, 0, 47, 0' },
      { hex: '#00AA55', rgb: '0, 170, 85', cmyk: '100, 0, 60, 30' },
      { hex: '#55FFAA', rgb: '85, 255, 170', cmyk: '50, 0, 30, 0' }
    ]
  },
  { 
    name: 'Pure Ether', color: 'white',
    shades: [
      { hex: '#FFFFFF', rgb: '255, 255, 255', cmyk: '0, 0, 0, 0' },
      { hex: '#F1F5F9', rgb: '241, 245, 249', cmyk: '5, 0, 0, 0' },
      { hex: '#CBD5E1', rgb: '203, 213, 225', cmyk: '10, 5, 0, 10' }
    ]
  },
  { 
    name: 'Obsidian Deep', color: 'black',
    shades: [
      { hex: '#000000', rgb: '0, 0, 0', cmyk: '100, 100, 100, 100' },
      { hex: '#0F172A', rgb: '15, 23, 42', cmyk: '64, 45, 0, 84' },
      { hex: '#1E293B', rgb: '30, 41, 59', cmyk: '49, 31, 0, 77' }
    ]
  },
];

const ColorProfile = ({ profile }: { profile: typeof BRAND_COLORS[0] }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const current = profile.shades[activeIdx];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-8 bg-doc-dark border-2 border-white/5 rounded-[3rem] group hover:border-white/20 transition-all">
      <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="h-40 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center shadow-lg border-2 border-white/10 transition-colors duration-500" style={{ backgroundColor: current.hex }}>
            <span className="text-[10px] font-black text-black/40 uppercase mix-blend-difference">Preview Principal</span>
          </div>
          <div className="flex gap-2 h-10">
            {profile.shades.map((s, i) => (
              <button key={i} onClick={() => setActiveIdx(i)} 
                className={`flex-1 rounded-xl border-2 transition-all ${activeIdx === i ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                style={{ backgroundColor: s.hex }}
              />
            ))}
          </div>
      </div>
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className={`text-3xl font-header font-black uppercase italic text-neon-${profile.color}`}>{profile.name}</h4>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Variación {activeIdx + 1}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 border-t border-white/10 pt-4">
            {[
              { label: 'HEX', val: current.hex },
              { label: 'RGB', val: current.rgb },
              { label: 'CMYK', val: current.cmyk }
            ].map(attr => (
              <div key={attr.label} className="flex justify-between items-center bg-black/40 px-4 py-2 rounded-xl group/attr">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-white/30 uppercase w-8">{attr.label}</span>
                  <span className="text-lg font-header font-black text-white">{attr.val}</span>
                </div>
                <CopyButton text={attr.val} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const Keycap = ({ label, color, isPressed }: { label: string; color: string; isPressed: boolean }) => {
  return (
    <div 
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center font-header font-black text-2xl sm:text-3xl transition-all duration-100 select-none ${isPressed ? 'translate-y-1' : ''}`}
      style={{
        borderColor: isPressed ? color : `${color}40`,
        backgroundColor: isPressed ? `${color}20` : 'rgba(0,0,0,0.8)',
        color: isPressed ? '#FFF' : color,
        boxShadow: isPressed ? `0 0 20px ${color}40` : `0 6px 0 ${color}40`,
        transform: isPressed ? 'translateY(6px)' : 'translateY(0px)'
      }}
    >
      {label}
    </div>
  );
};

export default function InformationPage() {
  const [fontWeight, setFontWeight] = useState('font-normal');
  const [fontStyle, setFontStyle] = useState('not-italic');
  const [selectedIconKey, setSelectedIconKey] = useState<keyof typeof I>('home');
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});
  const [controlLayout, setControlLayout] = useState<'wasd' | 'arrows'>('arrows');

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setActiveKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setActiveKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <MainLayout>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-blue/5 rounded-full blur-[180px] animate-pulse" />
      </div>

      <ScrollSpy items={[
        { id: 'hero', label: 'Inicio' },
        { id: 'tutorial', label: 'Cómo Jugar' },
        { id: 'identidad', label: 'Identidad' },
        { id: 'color', label: 'Colorología' },
        { id: 'eslogan', label: 'Eslogan' },
        { id: 'formatos', label: 'Formatos' },
        { id: 'mision', label: 'Misión' },
        { id: 'vision', label: 'Visión' },
        { id: 'objetivos', label: 'Objetivos' },
        { id: 'ideologia', label: 'Ideología' },
        { id: 'filosofia', label: 'Filosofía' },
        { id: 'libreria', label: 'Iconos' },
        { id: 'caracteristicas', label: 'Atributos' },
        { id: 'ecosistema', label: 'Tecnologías' },
        { id: 'explora', label: 'Explora' },
      ]} />

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-28 space-y-24">
        
        {/* --- HERO --- */}
        <motion.header id="hero" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="relative space-y-8">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                  {I.info}
                </div>
                <h1 className="text-5xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  SOBRE MUZICMANIA
                </h1>
             </div>
             <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Explorando el Núcleo de MuzicMania
             </p>
          </div>
          
          <div className="max-w-4xl mx-auto text-center border-l-4 border-neon-blue/30 pl-8 py-2">
             <p className="text-gray-300 font-header font-bold text-lg md:text-xl leading-snug uppercase">
                MuzicMania nace en <span className="text-neon-blue underline decoration-neon-blue/30 underline-offset-8">Ciszu Network</span> como respuesta a la necesidad de un motor de ritmo web de alto rendimiento. 
                Nuestra historia se escribe con código, latencia cero y una pasión inquebrantable por la sincronización digital.
             </p>
          </div>
        </motion.header>

        {/* --- CÓMO JUGAR (TUTORIAL INTERACTIVO) --- */}
        <motion.section id="tutorial" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-neon-pink/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="flex items-center gap-4 justify-center relative">
            <div className="w-8 h-8 text-neon-pink">{I.play}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest drop-shadow-neon-pink">Cómo Jugar</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
            {/* Steps de Ejecución */}
            <div className="p-10 bg-doc-dark border border-white/5 rounded-[3rem] space-y-8 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-neon-cyan/20 group hover:border-white/10"
                style={{ transition: 'all 0.5s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; }}
            >
               <h3 className="text-xl font-header font-black text-neon-cyan uppercase italic tracking-wide">Flujo de Secuencia</h3>
               <div className="space-y-6">
                 {[
                   { step: '01', desc: 'Dirígete a la Terminal PLAY e inicializa el simulador.', color: '#00F0FF' },
                   { step: '02', desc: 'Selecciona una pista del repertorio (BPM y Dificultad adaptables).', color: '#279EFF' },
                   { step: '03', desc: 'Presiona INICIAR y prepárate para la sincronización perfecta.', color: '#00FF88' },
                 ].map((item, idx) => (
                   <div key={item.step} className="flex gap-5 items-start p-4 bg-black/40 rounded-2xl border-l-4 transition-all hover:bg-black/60 hover:pl-6" style={{ borderColor: item.color }}>
                      <div className="text-3xl font-header font-black italic drop-shadow-md" style={{ color: item.color }}>{item.step}</div>
                      <div className="pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{item.desc}</div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Interfaz de Controles Mapeado */}
            <div className="p-10 bg-doc-dark border border-white/5 rounded-[3rem] space-y-8 shadow-2xl flex flex-col justify-between transition-all duration-500 hover:-translate-y-2"
                style={{ transition: 'all 0.5s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255, 51, 204, 0.4)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 51, 204, 0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
               <div className="space-y-3">
                 <h3 className="text-xl font-header font-black text-neon-pink uppercase italic tracking-wide">Hardware Matrix</h3>
                 <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-white/5 pb-4">
                   <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">Pulsa las teclas en tiempo real</p>
                   <div className="bg-black/80 flex gap-1 p-1 rounded-xl border border-white/10 shadow-inner">
                     <button onClick={() => setControlLayout('wasd')} className={`px-4 py-1.5 text-[10px] uppercase font-black rounded-lg transition-colors ${controlLayout === 'wasd' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>WASD</button>
                     <button onClick={() => setControlLayout('arrows')} className={`px-4 py-1.5 text-[10px] uppercase font-black rounded-lg transition-colors ${controlLayout === 'arrows' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Flechas</button>
                   </div>
                 </div>
               </div>
               
               <div className="flex flex-col gap-3 items-center justify-center py-6 flex-1 min-h-[200px]">
                  {controlLayout === 'wasd' ? (
                     <>
                        <div className="flex justify-center w-full">
                           <Keycap label="W" color="#00F0FF" isPressed={activeKeys['w']} />
                        </div>
                        <div className="flex justify-center gap-3 w-full">
                           <Keycap label="A" color="#00FF88" isPressed={activeKeys['a']} />
                           <Keycap label="S" color="#FF33CC" isPressed={activeKeys['s']} />
                           <Keycap label="D" color="#8000FF" isPressed={activeKeys['d']} />
                        </div>
                     </>
                  ) : (
                     <>
                        <div className="flex justify-center w-full">
                           <Keycap label="↑" color="#00F0FF" isPressed={activeKeys['arrowup']} />
                        </div>
                        <div className="flex justify-center gap-3 w-full">
                           <Keycap label="←" color="#00FF88" isPressed={activeKeys['arrowleft']} />
                           <Keycap label="↓" color="#FF33CC" isPressed={activeKeys['arrowdown']} />
                           <Keycap label="→" color="#8000FF" isPressed={activeKeys['arrowright']} />
                        </div>
                     </>
                  )}
               </div>
            </div>
          </div>
        </motion.section>

        {/* --- IDENTIDAD VISUAL --- */}
        <motion.section id="identidad" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-12">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-8 h-8 text-neon-purple">{I.identity}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Identidad Visual</h2>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ISOTIPO */}
              <div className="p-10 rounded-[3rem] bg-doc-dark border border-white/5 hover:border-white/20 transition-all duration-500 hover:scale-[1.03] group shadow-xl">
                 <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start text-center xl:text-left">
                    <div className="w-32 h-32 relative flex-shrink-0 animate-float">
                       <Image src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')} alt="Isotipo" fill className="object-contain drop-shadow-neon-blue" />
                    </div>
                    <div className="flex-1 space-y-4">
                       <h3 className="text-2xl font-header font-black text-white uppercase italic">Isotipo Maestro</h3>
                       <div className="space-y-3">
                          <div className="bg-black/40 p-4 rounded-2xl border-l-4 border-neon-blue/40">
                             <p className="text-[10px] font-black text-neon-blue uppercase mb-1">Visión Artística</p>
                             <p className="text-xs text-gray-400 leading-relaxed font-bold">Un diamante tallado por vectores de ritmo. Representa la precisión matemática y la dureza de un motor optimizado para la competición.</p>
                          </div>
                          <div className="bg-black/40 p-4 rounded-2xl border-l-4 border-neon-purple/40">
                             <p className="text-[10px] font-black text-neon-purple uppercase mb-1">Especificación Técnica</p>
                             <p className="text-xs text-gray-400 leading-relaxed font-bold">Forma poligonal de 4 puntos con degradado axial. Optimizada para visibilidad crítica en resoluciones mínimas.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* LOGOTIPO */}
              <div className="p-10 rounded-[3rem] bg-doc-dark border border-white/5 hover:border-white/20 transition-all duration-500 hover:scale-[1.03] group shadow-xl">
                 <div className="flex flex-col gap-8 items-center text-center">
                    <div className="w-full max-w-[280px] h-32 relative flex-shrink-0">
                       <Image src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')} alt="Logotipo" fill className="object-contain" />
                    </div>
                    <div className="w-full space-y-4 text-left md:text-center">
                       <h3 className="text-2xl font-header font-black text-white uppercase italic">Logotipo</h3>
                       <div className="space-y-3">
                          <div className="bg-black/40 p-4 rounded-2xl border-l-4 border-neon-cyan/40 text-left">
                             <p className="text-[10px] font-black text-neon-cyan uppercase mb-1">Diseño Aerodinámico</p>
                             <p className="text-xs text-gray-400 leading-relaxed font-bold">Tipografía personalizada con ángulos de 45° que sugieren inercia y velocidad constante.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Imagotipo Featured */}
            <div className="p-12 rounded-[4rem] bg-doc-dark border-2 border-white/10 hover:border-neon-blue/30 transition-all duration-700 hover:scale-[1.01] group shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 text-white font-black text-9xl pointer-events-none select-none italic font-header uppercase tracking-tighter">IMAGOTIPO</div>
               <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                  <div className="flex flex-col items-center gap-4 group/img transition-transform duration-500 hover:-translate-y-2">
                     <div className="w-24 h-24 relative animate-float"><Image src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/isotype/gradient/color/muzicmania_logo_isotipo_notoutline_degradado_color.svg')} alt="Isotipo" fill className="object-contain" /></div>
                     <div className="w-72 h-14 relative"><Image src={resolveAssetPath('projects/muzicmania/content/logos/images/not-outline/logotype/gradient/color/muzicmania_logotipo_degradado_color.svg')} alt="Logotipo" fill className="object-contain" /></div>
                  </div>
                  <div className="flex-1 space-y-8">
                     <div className="space-y-2 text-center lg:text-left">
                        <h3 className="text-4xl font-header font-black text-white uppercase italic tracking-tight">Composición Maestra</h3>
                        <p className="text-neon-cyan font-black text-[10px] uppercase tracking-[0.5em]">El zen del diseño digital</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { title: 'Sincronía Visual', icon: I.vision, color: 'blue', desc: 'Reconocimiento instantáneo de marca mediante el balance visual.' },
                          { title: 'Estructura Técnica', icon: I.identity, color: 'purple', desc: 'Respetando márgenes de seguridad áureos en cada activo.' },
                          { title: 'Filosofía Diseño', icon: I.mission, color: 'pink', desc: 'Simboliza la integridad y el fluir de la música digital.' }
                        ].map(f => (
                          <div key={f.title} className="p-6 bg-black/50 rounded-3xl border border-white/5 space-y-3">
                             <div className={`w-8 h-8 text-neon-${f.color}`}>{f.icon}</div>
                             <h4 className="text-xs font-black text-white uppercase">{f.title}</h4>
                             <p className="text-[10px] text-gray-500 leading-relaxed font-bold">{f.desc}</p>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.section>

        {/* --- BRANDING COLOR --- */}
        <motion.section id="color" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-10">
           <div className="flex items-center gap-4 justify-center">
            <div className="w-8 h-8 text-neon-blue">{I.contact}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Colorología de Marca</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {BRAND_COLORS.map(profile => <ColorProfile key={profile.name} profile={profile} />)}
          </div>
        </motion.section>

        {/* --- ESLOGAN --- */}
        <motion.section id="eslogan" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-neon-blue/5 to-neon-cyan/10 rounded-[4rem]" />
          <div className="relative p-16 rounded-[4rem] border border-neon-purple/20 text-center space-y-6">
            <p className="text-[10px] font-black text-neon-purple uppercase tracking-[0.6em]">Eslogan Oficial · Ciszu Network</p>
            <h2 className="text-4xl md:text-7xl font-header font-black uppercase italic leading-none">
              <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">
                &quot;Donde el ritmo
              </span>
              <br />
              <span className="text-white">se convierte en arte.&quot;</span>
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-neon-purple/50" />
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-neon-cyan/50" />
            </div>
            <p className="text-gray-400 font-bold text-sm max-w-xl mx-auto">
              Cada nota es una decisión. Cada beat, una victoria. MuzicMania no es un juego — es una <span className="text-neon-cyan italic">declaración sonora.</span>
            </p>
          </div>
        </motion.section>

        {/* --- FORMATOS DE ARCHIVO --- */}
        <motion.section id="formatos" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-8">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-8 h-8 text-neon-green">{I.database}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Formatos de Archivo</h2>
          </div>
          <div className="p-8 rounded-[3rem] bg-doc-dark border border-white/5 space-y-4">
            {([
              { category: 'Audio & Ritmo',   icon: I.music,    formats: ['.ogg', '.mp3', '.wav', '.flac'], desc: 'Pistas de música y efectos sonoros del motor de juego',    color: '#00FF88', colorAlpha: 'rgba(0,255,136,0.08)',    colorBorder: 'rgba(0,255,136,0.15)'  },
              { category: 'Gráficos & UI',   icon: I.image,    formats: ['.svg', '.png', '.webp', '.gif'], desc: 'Assets visuales, iconos, animaciones e imagotipo de marca', color: '#279EFF', colorAlpha: 'rgba(39,158,255,0.08)', colorBorder: 'rgba(39,158,255,0.15)' },
              { category: 'Datos & Config',  icon: I.terminal, formats: ['.json', '.ts', '.env', '.sql'],  desc: 'Configuraciones del sistema, scores y esquemas de base de datos', color: '#00F0FF', colorAlpha: 'rgba(0,240,255,0.08)',  colorBorder: 'rgba(0,240,255,0.15)'  },
              { category: 'Documentación',   icon: I.docs,     formats: ['.md', '.txt', '.pdf'],           desc: 'Guías técnicas, logs de sesión y contratos visuales de la IA',  color: '#8000FF', colorAlpha: 'rgba(128,0,255,0.08)', colorBorder: 'rgba(128,0,255,0.15)' },
            ] as const).map(cat => (
              <div key={cat.category}
                className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border transition-all duration-300 group"
                style={{ borderColor: cat.colorBorder, backgroundColor: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = cat.colorAlpha; (e.currentTarget as HTMLDivElement).style.borderColor = cat.color + '55'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLDivElement).style.borderColor = cat.colorBorder; }}
              >
                <div className="w-10 h-10 flex-shrink-0 group-hover:scale-110 transition-transform" style={{ color: cat.color }}>{cat.icon}</div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-white font-black uppercase text-sm italic">{cat.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {cat.formats.map(f => (
                        <code key={f} className="px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider"
                          style={{ color: cat.color, backgroundColor: cat.colorAlpha, border: `1px solid ${cat.colorBorder}` }}
                        >{f}</code>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* --- MISIÓN --- */}
        <motion.section id="mision" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-8">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-8 h-8 text-neon-pink">{I.mission}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Nuestra Misión</h2>
          </div>
          <div className="relative p-12 rounded-[3rem] bg-doc-dark border-l-4 border-neon-pink overflow-hidden group hover:bg-white/5 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-pink/10 transition-all duration-700" />
            <div className="relative space-y-6">
              <p className="text-[10px] font-black text-neon-pink uppercase tracking-[0.5em]">· Declaración Central ·</p>
              <blockquote className="text-2xl md:text-3xl font-header font-black text-white uppercase italic leading-snug">
                &quot;Democratizar la experiencia del ritmo digital, creando un motor de juego musical que sea accesible, competitivo y artísticamente poderoso para cualquier persona en el mundo.&quot;
              </blockquote>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                {[
                  { label: 'Accesibilidad', value: '100%', sub: 'Open-web, sin instalación' },
                  { label: 'Latencia Target', value: '<16ms', sub: 'Respuesta en tiempo real' },
                  { label: 'Cobertura', value: 'Global', sub: 'Multi-idioma y dispositivo' },
                ].map(s => (
                  <div key={s.label} className="text-center space-y-1">
                    <p className="text-3xl font-header font-black text-neon-pink">{s.value}</p>
                    <p className="text-white font-black uppercase text-xs">{s.label}</p>
                    <p className="text-gray-500 text-[10px] font-bold">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* --- VISIÓN DE FUTURO --- */}
        <motion.section id="vision" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-8">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-8 h-8 text-neon-blue">{I.vision}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Visión de Futuro</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([
              { year: '2025', label: 'Fase Alpha', color: '#279EFF', colorAlpha: 'rgba(39,158,255,0.06)',  icon: I.terminal,   items: ['Motor de ritmo base', 'Sistema de cuentas Supabase', 'Librería de iconos industrial', 'Deploy en Vercel Edge'] },
              { year: '2026', label: 'Fase Beta',  color: '#00F0FF', colorAlpha: 'rgba(0,240,255,0.06)',   icon: I.leaderboard, items: ['Leaderboard global en tiempo real', 'Editor de canciones custom', 'API pública de MuzicMania', 'Modo multijugador 2P'] },
              { year: '2027+', label: 'Fase Orbital', color: '#8000FF', colorAlpha: 'rgba(128,0,255,0.06)', icon: I.star,       items: ['IA generadora de mapas de ritmo', 'App móvil nativa', 'Torneo mundial anual', 'Ecosistema de modding'] },
            ] as const).map(phase => (
              <div key={phase.year}
                className="relative p-8 rounded-[2.5rem] bg-doc-dark border transition-all duration-500 group overflow-hidden"
                style={{ borderColor: phase.color + '30' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = phase.color + '99'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = phase.color + '30'; }}
              >
                <div className="absolute inset-0 rounded-[2.5rem] transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{ background: `linear-gradient(to bottom, ${phase.colorAlpha}, transparent)` }} />
                <div className="relative space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-5xl font-header font-black italic" style={{ color: phase.color }}>{phase.year}</p>
                      <p className="text-white font-black uppercase text-xs tracking-widest mt-1">{phase.label}</p>
                    </div>
                    <div className="w-10 h-10 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" style={{ color: phase.color }}>{phase.icon}</div>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* --- OBJETIVOS --- */}
        <motion.section id="objetivos" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-8">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-8 h-8 text-neon-green">{I.stats}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Objetivos</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generales */}
            <div className="p-8 rounded-[3rem] bg-doc-dark border border-neon-green/20 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-green/10 rounded-2xl border border-neon-green/20 flex items-center justify-center">
                  <div className="w-5 h-5 text-neon-green">{I.mission}</div>
                </div>
                <div>
                  <h3 className="text-lg font-header font-black text-neon-green uppercase italic">Objetivos Generales</h3>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Macro Estrategia</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Posicionar MuzicMania como el motor de ritmo web de referencia en Latinoamérica.',
                  'Construir una comunidad activa de jugadores y creadores de contenido musical.',
                  'Desarrollar una infraestructura técnica escalable y de alto rendimiento.',
                  'Establecer alianzas con artistas independientes para contenido exclusivo.',
                ].map((obj, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green text-[10px] font-black mt-0.5">{i + 1}</span>
                    <p className="text-xs text-gray-400 font-bold leading-relaxed">{obj}</p>
                  </li>
                ))}
              </ul>
            </div>
            {/* Específicos */}
            <div className="p-8 rounded-[3rem] bg-doc-dark border border-neon-cyan/20 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-cyan/10 rounded-2xl border border-neon-cyan/20 flex items-center justify-center">
                  <div className="w-5 h-5 text-neon-cyan">{I.settings}</div>
                </div>
                <div>
                  <h3 className="text-lg font-header font-black text-neon-cyan uppercase italic">Objetivos Específicos</h3>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Micro Táctica</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  'Lograr latencia de audio <16ms mediante Web Audio API optimizada.',
                  'Implementar sistema de Supabase Auth con OAuth (Google, GitHub, Discord).',
                  'Lanzar leaderboard global con rankings en tiempo real antes de Q3 2025.',
                  'Desarrollar el editor de mapas de ritmo con exportación en formato JSON abierto.',
                ].map((obj, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <code className="flex-shrink-0 px-1.5 py-0.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[9px] font-black mt-0.5">0{i + 1}</code>
                    <p className="text-xs text-gray-400 font-bold leading-relaxed">{obj}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* --- IDEOLOGÍA --- */}
        <motion.section id="ideologia" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-8">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-8 h-8 text-neon-purple">{I.heart}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Ideología</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { title: 'Open Game',      icon: I.unlock, color: '#279EFF', colorAlpha: 'rgba(39,158,255,0.06)',   desc: 'El juego debe ser gratuito, abierto y accesible para todos. Sin pay-to-win, nunca.' },
              { title: 'Privacy First',  icon: I.lock,   color: '#00FF88', colorAlpha: 'rgba(0,255,136,0.06)',    desc: 'Tus datos no son nuestro producto. Transparencia total sobre el uso de información.' },
              { title: 'Creator Driven', icon: I.star,   color: '#FFD700', colorAlpha: 'rgba(255,215,0,0.06)',    desc: 'La comunidad da forma al roadmap. El creador de un mapa es tan importante como el dev.' },
              { title: 'Audio Justice', icon: I.music,   color: '#FF33CC', colorAlpha: 'rgba(255,51,204,0.06)',   desc: 'Respeto absoluto por los derechos de autor. Solo música con licencias claras y éticas.' },
            ] as const).map(pillar => (
              <div key={pillar.title}
                className="relative p-8 rounded-[2rem] border transition-all duration-300 group"
                style={{ borderColor: pillar.color + '33', background: `linear-gradient(to bottom, ${pillar.colorAlpha}, transparent)` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = pillar.color + '80'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = pillar.color + '33'; }}
              >
                <div className="w-12 h-12 mb-4 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300" style={{ color: pillar.color }}>{pillar.icon}</div>
                <h4 className="text-lg font-header font-black uppercase italic leading-none mb-3" style={{ color: pillar.color }}>{pillar.title}</h4>
                <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* --- FILOSOFÍA --- */}
        <motion.section id="filosofia" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-8">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-8 h-8 text-neon-cyan">{I.moon}</div>
            <h2 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Filosofía</h2>
          </div>
          <div className="relative p-12 rounded-[4rem] bg-doc-dark border border-white/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5 pointer-events-none" />
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 flex flex-col justify-center space-y-4 border-r border-white/5 pr-10">
                <p className="text-[9px] font-black text-neon-cyan uppercase tracking-[0.5em]">Nuestra Razón de Ser</p>
                <h3 className="text-3xl font-header font-black text-white uppercase italic leading-tight">El Código es el Lienzo</h3>
                <p className="text-gray-400 font-bold text-sm leading-relaxed">
                  Creemos que la tecnología, cuando se une a la música, produce algo más que software. Produce <span className="text-neon-cyan italic">cultura</span>.
                </p>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {([
                  { label: 'Minimalismo Técnico', color: '#00F0FF', colorAlpha: 'rgba(0,240,255,0.06)',   quote: '&quot;Cada línea de código que no existe es un bug que no puede ocurrir.&quot; Construimos con precisión quirúrgica.' },
                  { label: 'Belleza Funcional',   color: '#8000FF', colorAlpha: 'rgba(128,0,255,0.06)',  quote: '&quot;Si no es hermoso, no está terminado.&quot; La estética no es decoración — es funcionalidad para el cerebro.' },
                  { label: 'Iteración Radical',   color: '#279EFF', colorAlpha: 'rgba(39,158,255,0.06)', quote: '&quot;Lanzar roto y mejorarlo es mejor que no lanzar perfecto.&quot; La velocidad de aprendizaje supera la perfección inicial.' },
                  { label: 'Comunidad Primero',   color: '#00FF88', colorAlpha: 'rgba(0,255,136,0.06)',  quote: '&quot;El mejor feedback viene de quien juega, no de quien diseña.&quot; Escuchar es la habilidad técnica más subestimada.' },
                ] as const).map(f => (
                  <div key={f.label}
                    className="p-6 rounded-2xl bg-black/40 border-t-2 space-y-3 transition-all duration-300"
                    style={{ borderColor: f.color }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = f.colorAlpha; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(0,0,0,0.4)'; }}
                  >
                    <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: f.color }}>{f.label}</h4>
                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed italic">{f.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="libreria" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-10">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-wider">Librería de Iconos Maestro</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">Propiedad Intelectual MuzicMania v2.0</p>
          </div>
          <div className="p-4 rounded-[3rem] bg-doc-dark border border-white/5 shadow-inner">
             <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {(Object.keys(I) as Array<keyof typeof I>).map((key) => (
                 <button key={key} onClick={() => setSelectedIconKey(key)} className={`aspect-square bg-black/40 border transition-all flex items-center justify-center group relative overflow-hidden rounded-2xl ${selectedIconKey === key ? 'border-neon-blue bg-neon-blue/10 scale-95' : 'border-white/5 hover:border-white/20'}`}>
                    <div className={`w-8 h-8 transition-all ${selectedIconKey === key ? 'text-neon-blue' : 'text-white'}`}>{I[key]}</div>
                    {selectedIconKey === key && <div className="absolute inset-0 bg-neon-blue/5 animate-pulse-neon pointer-events-none" />}
                 </button>
               ))}
             </div>
          </div>
          <div className="p-12 rounded-[4rem] bg-doc-dark border-2 border-white/10 flex flex-col items-center gap-8 relative overflow-hidden group/viewer shadow-2xl">
             <div className="w-48 h-48 text-white drop-shadow-[0_0_30px_rgba(39,158,255,0.4)] transition-all duration-500 transform group-hover/viewer:scale-110">{I[selectedIconKey]}</div>
             <div className="text-center space-y-2">
                <h4 className="text-4xl font-header font-black text-white uppercase italic tracking-tighter">Icon_{selectedIconKey}</h4>
                <div className="px-6 py-2 bg-black/60 rounded-xl border border-white/5 flex items-center gap-4 mt-4">
                   <span className="text-[10px] font-black text-white/30">muzicmania_icon_{selectedIconKey}.svg</span>
                   <CopyButton text={`muzicmania_icon_${selectedIconKey}`} />
                </div>
             </div>
          </div>
        </motion.section>

        {/* --- CARACTERÍSTICAS ÚNICAS --- */}
        <motion.section id="caracteristicas" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-10">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Características Únicas</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.5em]">Ingeniería de Grado Superior</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Latencia Zero', desc: 'Audio procesado por WebAudio API para respuestas instantáneas.', color: 'cyan', icon: I.stats },
                { title: 'Visuales Reactivos', desc: 'El fondo y las luces bailan al ritmo de la frecuencia real del track.', color: 'purple', icon: I.vision },
                { title: 'Cloud Sync', desc: 'Tus récords se guardan y sincronizan en todos tus dispositivos.', color: 'green', icon: I.cloud },
                { title: 'Comunidad Directa', desc: 'Compite y comparte tus mejores jugadas con una comunidad global.', color: 'pink', icon: I.team }
              ].map((f, i) => (
                <div key={i} className={`p-8 bg-doc-dark border border-white/5 border-l-4 border-neon-${f.color} rounded-[2rem] hover:bg-white/5 hover:translate-x-2 transition-all duration-300 group shadow-lg`}>
                   <div className="flex flex-col gap-4">
                      <div className={`w-10 h-10 text-neon-${f.color} bg-white/5 p-2 rounded-xl border border-white/5 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                      <div className="space-y-2">
                         <h4 className="text-lg font-header font-black text-white uppercase italic tracking-tight">{f.title}</h4>
                         <p className="text-xs text-gray-400 font-bold leading-relaxed">{f.desc}</p>
                      </div>
                   </div>
                </div>
              ))}
          </div>
        </motion.section>

        {/* --- ECOSISTEMA TECNOLÓGICO --- */}
        <motion.section id="ecosistema" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-12">
            <div className="text-center space-y-2">
               <h3 className="text-2xl font-header font-black text-white uppercase italic tracking-widest">Ecosistema Tecnológico</h3>
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.5em]">La infraestructura que sostiene el ritmo</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                 { name: 'Next.js 15', icon: I.nextjs, color: 'white', link: 'https://nextjs.org/', use: 'Arquitectura base y renderizado SEO optimizado.', tech: 'App Router • Server Components' },
                 { name: 'TypeScript', icon: I.typescript, color: 'blue', link: 'https://www.typescriptlang.org/', use: 'Gestión estricta de lógica de juego y assets.', tech: 'Strict Mode • Generics • Safety' },
                 { name: 'Tailwind 4', icon: I.tailwind, color: 'cyan', link: 'https://tailwindcss.com/', use: 'Estilizado atómico y animaciones neon fluidas.', tech: 'JIT Engine • CSS Variables' },
                 { name: 'Supabase', icon: I.supabase, color: 'green', link: 'https://supabase.com/', use: 'Infraestructura de datos y autenticación global.', tech: 'PostgreSQL • Real-time • RLS' },
                 { name: 'React 19', icon: I.react, color: 'cyan', link: 'https://react.dev/', use: 'Gestión reactiva de la interfaz y estados del motor.', tech: 'Concurrent Mode • Hooks • Actions' },
                 { name: 'Vercel', icon: I.vercel, color: 'white', link: 'https://vercel.com/', use: 'Despliegue en el Edge y optimización de tráfico.', tech: 'Edge Runtime • CI/CD • Analytics' }
               ].map(tech => (
                 <Link key={tech.name} href={tech.link} target="_blank" className={`group p-8 bg-doc-dark border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-neon-${tech.color} hover:shadow-[0_0_30px_rgba(var(--neon-${tech.color}-rgb,0,0,0),0.1)] transition-all duration-500 flex flex-col items-start gap-6 cursor-pointer`}>
                    <div className={`w-12 h-12 text-neon-${tech.color} group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_10px_currentColor]`}>{tech.icon}</div>
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <h4 className="text-xl font-header font-black text-white uppercase italic tracking-tight">{tech.name}</h4>
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{tech.tech}</span>
                       </div>
                       <div className="pt-4 border-t border-white/5">
                          <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                            <span className="text-neon-cyan block mb-1">USO EN PROYECTO:</span>
                            {tech.use}
                          </p>
                       </div>
                    </div>
                    <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-black text-gray-500 group-hover:text-white transition-colors uppercase italic">
                      Ver Documentación Oficial <div className="w-3 h-3">{I.arrow}</div>
                    </div>
                 </Link>
               ))}
            </div>
        </motion.section>

        {/* --- EXPLORA EL PROYECTO --- */}
        <motion.section id="explora" data-scrollspy initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-5xl font-header font-black text-white uppercase italic tracking-tighter">Explora el Proyecto</h2>
            <p className="text-[10px] text-neon-cyan font-black uppercase tracking-[0.4em] opacity-60">Ecosistema MuzicMania</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Jugar Ahora', href: '/play', icon: I.play, color: 'green' },
              { name: 'Changelog', href: '/changelog', icon: I.changelog, color: 'blue' },
              { name: 'Soporte', href: '/support', icon: I.support, color: 'pink' },
              { name: 'Mi Equipo', href: '/team', icon: I.team, color: 'purple' },
              { name: 'Licencia', href: '/license', icon: I.license, color: 'cyan' },
              { name: 'Reseñas', href: '/reviews', icon: I.reviews, color: 'purple' },
            ].map(link => (
              <Link key={link.name} href={link.href} className={`group relative p-8 rounded-[3rem] bg-doc-dark border border-white/5 hover:bg-neon-${link.color}/5 transition-all active:scale-95 flex items-center justify-between overflow-hidden`}>
                <div className="flex items-center gap-6">
                   <div className={`w-8 h-8 text-neon-${link.color} transform group-hover:scale-110 transition-transform`}>{link.icon}</div>
                   <div className="space-y-1">
                      <h4 className="text-white font-black uppercase text-sm italic">{link.name}</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Portal Oficial</p>
                   </div>
                </div>
                <div className="w-6 h-6 text-white opacity-0 transform translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all italic">{I.arrow}</div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* --- DISCLAIMER / CONOCE AL EQUIPO --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants} className="pt-8 pb-4">
            <Link href="/team" className="mx-auto max-w-4xl p-6 md:p-8 bg-doc-dark border border-white/10 rounded-[2.5rem] hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all duration-500 group relative flex flex-col sm:flex-row items-center gap-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {/* Ícono Izquierdo Decorativo */}
                <div className="w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-neon-cyan/30 transition-transform duration-500 relative">
                   <div className="absolute inset-0 rounded-full bg-neon-cyan/10 animate-pulse pointer-events-none" />
                   <div className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">
                     {I.team}
                   </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                   <h3 className="text-xl font-header font-black text-white uppercase italic tracking-widest drop-shadow-md">
                     Orígenes & Arquitectura
                   </h3>
                   <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                     Explora la matriz creadora detrás del ecosistema. Identifica a <strong>Ciszuko Antony</strong> (CEO) y los cimientos de <strong>Ciszu Network</strong>.
                   </p>
                </div>

                {/* Botón Acción Lateral */}
                <div className="shrink-0">
                   <span className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white hover:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full group-hover:bg-neon-cyan group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all">
                      Ingresar a The Team
                      <div className="w-3 h-3 group-hover:translate-x-1 transition-transform">
                        {I.arrow}
                      </div>
                   </span>
                </div>
            </Link>
        </motion.section>

        <QuickDocks />

      </div>
    </MainLayout>
  );
}
