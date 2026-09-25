'use client';

import { useState } from 'react';
import { Icon, copyText } from '@ciszu/ui';

export interface ShowcaseIcon {
  name: string;
  label: string;
}

interface IconShowcaseProps {
  icons: ShowcaseIcon[];
  /** Clase de texto del acento (p. ej. `text-neon-blue`). */
  accent: string;
  /** Clase de fondo suave del acento (p. ej. `bg-neon-blue/10`). */
  accentBg: string;
  /** Clase del borde de acento (p. ej. `border-neon-blue/40`). */
  accentBorder: string;
  /** Clase del glow decorativo del preview (p. ej. `bg-neon-blue/20`). */
  glow: string;
}

/**
 * Visor interactivo de la librería de iconos del portfolio de Ciszuko Antony:
 * grid seleccionable + preview grande con copia del identificador.
 */
export default function IconShowcase({
  icons,
  accent,
  accentBg,
  accentBorder,
  glow,
}: IconShowcaseProps) {
  const [selected, setSelected] = useState(icons[0]?.name ?? 'home');
  const [copied, setCopied] = useState(false);

  const current = icons.find((item) => item.name === selected) ?? icons[0];

  const handleCopy = async () => {
    if (!current) return;
    const ok = await copyText(current.name);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (!current) return null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className={`rounded-[2.5rem] border p-4 ${accentBorder} bg-white/5`}>
        <div className="grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-6">
          {icons.map((item) => {
            const active = item.name === current.name;
            return (
              <button
                key={item.name}
                type="button"
                title={item.name}
                aria-pressed={active}
                onClick={() => setSelected(item.name)}
                className={`group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border bg-black/40 transition-all duration-300 ${
                  active
                    ? `${accentBorder} ${accentBg} scale-95`
                    : 'border-white/10 hover:-translate-y-0.5 hover:border-white/30'
                }`}
              >
                <span
                  className={`transition-transform duration-300 group-hover:scale-110 ${
                    active ? accent : 'text-white/70'
                  }`}
                >
                  <Icon name={item.name} size={24} />
                </span>
                <span className="px-1 text-center text-[8px] font-black uppercase leading-tight tracking-widest text-white/40 group-hover:text-white/70">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside
        className={`relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-[2.5rem] border p-8 text-center ${accentBorder} bg-white/5`}
      >
        <div
          className={`pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${glow}`}
        />
        <span className={`relative h-24 w-24 ${accent}`}>
          <Icon name={current.name} size={96} />
        </span>
        <div className="relative space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
            {current.label}
          </p>
          <code
            className={`inline-block rounded-lg border px-3 py-1 text-sm font-black ${accentBorder} ${accentBg} ${accent}`}
          >
            {current.name}
          </code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`relative inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
            copied
              ? `${accentBorder} ${accentBg} ${accent}`
              : 'border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
          }`}
        >
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? 'Copiado' : 'Copiar nombre'}
        </button>
      </aside>
    </div>
  );
}
