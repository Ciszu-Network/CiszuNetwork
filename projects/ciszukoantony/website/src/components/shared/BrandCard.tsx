'use client';

import React from 'react';
import { getIcon } from '@ciszu/ui';
import type { ProfileBrand } from '@/data/profile';

/**
 * Tarjeta de una marca/herramienta/navegador/IA con su icono real grande,
 * barra de nivel con degradado dinámico según la marca y tags de uso.
 * Se usa en About, Curriculum y donde se mencione una marca.
 */
export function BrandCard({ brand }: { brand: ProfileBrand }) {
  const entry = getIcon('brand', brand.icon);
  const brandColor = entry ? '#ffffff' : '#9ca3af';

  return (
    <div className="group flex flex-col gap-3 p-5 rounded-[1.75rem] bg-white/[0.04] border border-white/10 hover:border-white/30 transition-all hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] group-hover:scale-110 transition-transform"
          style={{ color: brandColor }}
        >
          {entry ? (
            <svg viewBox={entry.viewBox} className="h-9 w-9" role="img" aria-hidden>
              <g dangerouslySetInnerHTML={{ __html: entry.inner }} />
            </svg>
          ) : (
            <span className="text-2xl">🛠</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-white font-header font-bold text-sm leading-tight">{brand.name}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{brand.level}% dominio</p>
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