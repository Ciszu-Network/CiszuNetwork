'use client';

// Botón de copiar junto a contenido copiable (TODO Cambios Generales:
// "cualquier cosa que se pueda copiar debe tener un boton alado para copiar
// automaticamente"). Comparte el mecanismo anti-copy: el contenido se protege
// con user-select:none, pero estos elementos se marcan copiables y muestran un
// botón para copiarlo con un clic.
import { useEffect, useRef, useState } from 'react';

export function copyText(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return Promise.resolve(false);
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  // Fallback para navegadores sin Clipboard API (o contextos inseguros)
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve(ok);
  } catch {
    return Promise.resolve(false);
  }
}

export interface CopyWithButtonProps {
  /** Texto que se copia al pulsar el botón. */
  value: string;
  /** Contenido visible (si no se pasa, se muestra el propio `value`). */
  children?: React.ReactNode;
  /** Texto de tooltip/aria. */
  label?: string;
  className?: string;
  /** Tamaño del botón. */
  size?: 'xs' | 'sm' | 'md';
  /** Mensaje de confirmación al copiar. */
  copiedLabel?: string;
}

const SIZES: Record<'xs' | 'sm' | 'md', string> = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
};

export default function CopyWithButton({
  value,
  children,
  label = 'Copiar',
  className = '',
  size = 'sm',
  copiedLabel = '¡Copiado!',
}: CopyWithButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {children ?? <span className="break-all">{value}</span>}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={label}
        title={copied ? copiedLabel : label}
        className={`${SIZES[size]} inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/50 transition-all shrink-0 cursor-pointer`}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </span>
  );
}