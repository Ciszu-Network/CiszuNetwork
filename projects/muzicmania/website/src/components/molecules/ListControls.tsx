'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SortOption {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface ListControlsProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (value: string) => void;
  onOrderToggle: () => void;
  options: SortOption[];
  color?: string; // e.g. 'neon-yellow', 'neon-pink'
}

export const ListControls = ({
  sortBy,
  sortOrder,
  onSortChange,
  onOrderToggle,
  options,
  color = 'neon-yellow'
}: ListControlsProps) => {
  return (
    <div className="w-full flex flex-wrap items-center gap-6 bg-black/60 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Criteria Tags */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Filtrar Transmisiones:</span>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 group relative overflow-hidden ${
                sortBy === opt.value
                  ? `bg-${color} text-black shadow-[0_0_25px_rgba(255,217,0,0.3)] scale-105 z-10`
                  : 'bg-black/40 text-white/40 border border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className={`w-4 h-4 transition-transform duration-300 ${sortBy === opt.value ? 'scale-110' : 'group-hover:scale-110 opacity-50 group-hover:opacity-100'}`}>
                {opt.icon}
              </div>
              {opt.label}
              {sortBy === opt.value && (
                <motion.div layoutId="activeTag" className="absolute inset-0 bg-white/20 -z-10" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Direction / Sort By label */}
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Orden:</span>
        <button
          onClick={onOrderToggle}
          className={`relative w-12 h-12 flex items-center justify-center bg-black border-2 border-white/10 rounded-2xl group active:scale-90 transition-all hover:border-${color} hover:shadow-[0_0_20px_rgba(255,217,0,0.2)]`}
          title={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
        >
          <div className={`w-6 h-6 text-${color} transition-all duration-500 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </div>
          
          {/* Tooltip hint */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-black border border-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all">
            {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
          </div>
        </button>
      </div>
    </div>
  );
};
