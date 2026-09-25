'use client';

import { useEffect, useRef, useState } from 'react';
import { copyText } from '@ciszu/ui';

export interface BrandColor {
  name: string;
  role: string;
  hex: string;
  rgb: string;
  cmyk: string;
}

const ROWS: Array<{ label: string; key: 'hex' | 'rgb' | 'cmyk' }> = [
  { label: 'HEX', key: 'hex' },
  { label: 'RGB', key: 'rgb' },
  { label: 'CMYK', key: 'cmyk' },
];

function CopyGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ColorSwatches({ colors }: { colors: BrandColor[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = async (value: string) => {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {colors.map((color) => (
        <article
          key={color.name}
          className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden transition-colors hover:border-white/25"
        >
          <button
            type="button"
            onClick={() => copy(color.hex)}
            aria-label={`Copiar ${color.name} ${color.hex}`}
            className="relative flex h-28 w-full items-center justify-center cursor-pointer"
            style={{ backgroundColor: color.hex }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white mix-blend-difference">
              {copied === color.hex ? 'Copiado' : 'Copiar HEX'}
            </span>
          </button>
          <div className="p-5 space-y-3">
            <div>
              <h3 className="font-header font-black uppercase italic text-white">{color.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{color.role}</p>
            </div>
            <div className="space-y-1.5 border-t border-white/10 pt-3">
              {ROWS.map((row) => {
                const value = color[row.key];
                const isCopied = copied === value;
                return (
                  <button
                    key={row.label}
                    type="button"
                    onClick={() => copy(value)}
                    aria-label={`Copiar ${row.label} de ${color.name}: ${value}`}
                    className="flex w-full items-center gap-3 rounded-xl bg-black/40 px-3 py-1.5 text-left transition-colors hover:bg-black/60 cursor-pointer"
                  >
                    <span className="w-10 shrink-0 text-[9px] font-black uppercase tracking-widest text-white/30">
                      {row.label}
                    </span>
                    <span className="flex-1 truncate text-sm font-header font-black text-white">{value}</span>
                    <span className={`shrink-0 ${isCopied ? 'text-neon-green' : 'text-white/30'}`}>
                      {isCopied ? <CheckGlyph /> : <CopyGlyph />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
