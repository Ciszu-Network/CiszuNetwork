'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@ciszu/ui';

export interface WidgetSnippet {
  /** Etiqueta corta del widget (ej. `Top.gg · Servidor`). */
  label: string;
  /** Código HTML que se copia al portapapeles. */
  code: string;
}

/**
 * Snippets de widgets con click-to-copy.
 *
 * Es el único fragmento de `/projects/ciszugamens` que necesita estado: el
 * resto de la página es un server component. Solo copia texto recibido por
 * props; no conoce URLs ni IDs.
 */
export default function WidgetCode({ snippets }: { snippets: WidgetSnippet[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = useCallback(async (snippet: WidgetSnippet) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(snippet.label);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1800);
    } catch {
      // Portapapeles bloqueado (contexto no seguro o permiso denegado).
    }
  }, []);

  return (
    <div className="space-y-3">
      {snippets.map((snippet) => {
        const isCopied = copied === snippet.label;
        return (
          <div key={snippet.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{snippet.label}</span>
              <button
                type="button"
                onClick={() => copy(snippet)}
                title={`Copiar widget: ${snippet.label}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:border-brand/50 hover:text-brand-light transition-all cursor-pointer"
              >
                <Icon name={isCopied ? 'check' : 'copy'} size={12} />
                {isCopied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="overflow-x-auto text-[10px] leading-relaxed text-white/60">
              <code>{snippet.code}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
}
