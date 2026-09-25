'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@ciszu/ui';

export interface ColorSwatch {
  /** Nombre del token de marca (ej. `Brand Light`). */
  name: string;
  /** Valor HEX que se copia al portapapeles. */
  hex: string;
  /** Uso del color dentro de la marca. */
  role: string;
}

/**
 * Swatches de la paleta de marca con click-to-copy.
 *
 * Es el único fragmento de `/information` que necesita estado: el resto de la
 * página es un server component con `metadata`. El componente no conoce la
 * paleta — la recibe por props desde la página, que es la fuente de los hex.
 */
export default function ColorSwatches({ colors }: { colors: ColorSwatch[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = useCallback(async (hex: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1800);
    } catch {
      // Portapapeles bloqueado (contexto no seguro o permiso denegado).
    }
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {colors.map((color) => {
        const isCopied = copied === color.hex;
        return (
          <button
            key={color.name}
            type="button"
            onClick={() => copy(color.hex)}
            title={`Copiar ${color.hex}`}
            className="group text-left rounded-2xl border border-white/10 bg-white/5 p-3 transition-all hover:border-brand/40 hover:bg-white/10 active:scale-[0.98] cursor-pointer"
          >
            <span
              className="block h-20 rounded-xl border border-white/10 mb-3"
              style={{ backgroundColor: color.hex }}
            />
            <span className="flex items-center justify-between gap-2">
              <span className="font-header font-bold text-white text-sm truncate">{color.name}</span>
              <span
                className={`shrink-0 transition-colors ${
                  isCopied ? 'text-brand-light' : 'text-white/30 group-hover:text-brand-light'
                }`}
              >
                <Icon name={isCopied ? 'check' : 'copy'} size={14} />
              </span>
            </span>
            <code
              className={`block text-[11px] mt-1 uppercase tracking-wider transition-colors ${
                isCopied ? 'text-brand-light' : 'text-white/50'
              }`}
            >
              {isCopied ? 'Copiado' : color.hex}
            </code>
            <span className="block text-[10px] text-white/40 leading-relaxed mt-1">{color.role}</span>
          </button>
        );
      })}
    </div>
  );
}
