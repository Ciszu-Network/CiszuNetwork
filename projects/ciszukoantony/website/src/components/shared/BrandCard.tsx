'use client';

import React from 'react';
import { getIcon } from '@ciszu/ui';
import type { ProfileBrand } from '@/data/profile';

/**
 * Tarjeta de una marca/herramienta/navegador/IA.
 *
 * - Icono REAL (SVG oficial de Simple Icons/VectorLogo/logo de marca) coloreado
 *   con el color de ÉNFASIS de la barra de nivel.
 * - Si la marca NO tiene SVG oficial de código abierto (Affinity, CapCut, etc.),
 *   se muestra un monograma (inicial) con el color de la barra — nunca un path
 *   inventado.
 * - Barra con degradado dinámico según la marca.
 * - Porcentaje en blanco o negro según el tema (clase `light` en <html>).
 */

/** Convierte el primer token de un gradiente Tailwind a color hex para el icono. */
const GRADIENT_ACCENT: Record<string, string> = {
  'from-red-600': '#dc2626', 'from-rose-500': '#f43f5e', 'from-orange-600': '#ea580c',
  'from-amber-500': '#f59e0b', 'from-yellow-400': '#facc15', 'from-emerald-600': '#059669',
  'from-green-600': '#16a34a', 'from-lime-400': '#a3e635', 'from-teal-600': '#0d9488',
  'from-cyan-600': '#0891b2', 'from-sky-600': '#0284c7', 'from-blue-600': '#2563eb',
  'from-indigo-600': '#4f46e5', 'from-violet-500': '#8b5cf6', 'from-purple-700': '#7e22ce',
  'from-fuchsia-600': '#c026d3', 'from-pink-600': '#db2777', 'from-slate-800': '#1e293b',
  'from-gray-800': '#1f2937', 'from-gray-700': '#374151', 'from-zinc-700': '#3f3f46',
  'from-neutral-800': '#262626',
};

export function BrandCard({ brand }: { brand: ProfileBrand }) {
  const entry = getIcon('brand', brand.icon);
  const accent = GRADIENT_ACCENT[brand.gradient.split(' ')[0]] ?? '#ffffff';
  const initial = brand.name.charAt(0).toUpperCase();

  return (
    <div className="group flex flex-col gap-3 p-5 rounded-[1.75rem] bg-white/[0.04] border border-white/10 hover:border-white/30 transition-all hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] group-hover:scale-110 transition-transform"
          style={{ color: accent }}
        >
          {entry ? (
            <svg viewBox={entry.viewBox} className="h-9 w-9" fill="currentColor" role="img" aria-hidden>
              <g dangerouslySetInnerHTML={{ __html: entry.inner }} />
            </svg>
          ) : (
            <span className="font-header font-black text-2xl leading-none" style={{ color: accent }}>
              {initial}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-white light:text-black font-header font-bold text-sm leading-tight">{brand.name}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-white light:text-black">{brand.level}% dominio</p>
        </div>
      </div>

      {/* Barra con degradado dinámico según la marca */}
      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${brand.gradient} transition-all duration-700 group-hover:brightness-125`}
          style={{ width: `${brand.level}%` }}
        />
      </div>

      {/* Tags de uso */}
      {brand.tags?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {brand.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default BrandCard;