'use client';

/* ------------------------------------------------------------------ *
 * LanguagesModal — selector de idioma en MODAL CENTRADO (compartido).
 *
 * Se abre desde el botón "Idioma" de los PreferencesPanel: muestra la
 * misma lista que el botón de idiomas del menú hamburguesa (bandera +
 * etiqueta + check del activo + badge de bloqueado si no está disponible).
 *
 * Comportamiento (requisito preferencias):
 *  - Los idiomas bloqueados (available: false) se muestran ATENUADOS pero
 *    siguen siendo clicables: el padre decide y avisa con toast de ERROR
 *    (rojo). NUNCA se deshabilitan con `disabled` (eso los dejaría mudos).
 *  - El botón de retroceder cierra SOLO este selector, nunca el modal de
 *    preferencias padre (el cierre por outside de Radix está bloqueado en
 *    PreferencesModal).
 *  - Tema oscuro/claro vía variables CSS de cada web (--bg-card, --border,
 *    --ink, --ink-muted, --hover, --accent...).
 * ------------------------------------------------------------------ */

import React from 'react';
import { createPortal } from 'react-dom';

export interface LanguageOption {
  code: string;
  label: string;
  /** Bandera (SVG/ReactNode) reutilizada del navbar/hamburguesa. */
  flag?: React.ReactNode;
  /** false = idioma no implementado (atenuado + badge, clickable con toast). */
  available?: boolean;
  /** Marca activo sin depender del código (los webs mapean varios códigos al mismo idioma). */
  active?: boolean;
}

export interface LanguagesModalProps {
  open: boolean;
  title?: string;
  langs: LanguageOption[];
  current: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

export default function LanguagesModal({
  open,
  title = 'Idioma',
  langs,
  current,
  onSelect,
  onClose,
}: LanguagesModalProps) {
  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // createPortal: el modal se renderiza en document.body para ESCAPAR del
  // PreferencesModal padre (que tiene transform + overflow-y-auto). Sin el
  // portal, el position:fixed del modal de idiomas quedaba relativo a ese
  // contenedor y se cortaba.
  return createPortal(
    (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'var(--overlay, rgba(0,0,0,0.7))', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={handleOverlayClick}
      />
      <div
        className="relative w-[94vw] max-w-sm max-h-[80vh] overflow-y-auto rounded-3xl border p-5 shadow-2xl animate-in fade-in zoom-in-95"
        style={{
          background: 'var(--bg-card, var(--surface, #0a0a0f))',
          borderColor: 'var(--border, rgba(255,255,255,0.1))',
          color: 'var(--ink, #fff)',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Volver a preferencias"
              title="Volver a preferencias"
              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-xs transition-colors cursor-pointer"
              style={{ color: 'var(--ink-muted, rgba(255,255,255,0.7))' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover, rgba(255,255,255,0.08))'; e.currentTarget.style.color = 'var(--ink, #fff)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-muted, rgba(255,255,255,0.7))'; }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-sm font-header font-black uppercase tracking-[0.2em]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de idioma"
            className="w-7 h-7 inline-flex items-center justify-center rounded-full text-xs transition-colors cursor-pointer"
            style={{ color: 'var(--ink-muted, rgba(255,255,255,0.7))' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover, rgba(255,255,255,0.08))'; e.currentTarget.style.color = 'var(--ink, #fff)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-muted, rgba(255,255,255,0.7))'; }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-1.5 pb-1">
          {langs.map((l) => {
            const active = l.active ?? l.code === current;
            const blocked = l.available === false;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  onSelect(l.code);
                  onClose();
                }}
                aria-disabled={blocked}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                  active
                    ? 'border-transparent'
                    : 'border-transparent'
                } ${blocked ? 'opacity-45 saturate-50 cursor-pointer' : 'cursor-pointer'}`}
                style={{
                  borderColor: active ? 'var(--accent, rgba(34,211,238,0.6))' : undefined,
                  background: active
                    ? 'var(--accent-soft, rgba(34,211,238,0.1))'
                    : blocked
                      ? 'var(--blocked-soft, rgba(255,255,255,0.03))'
                      : undefined,
                  color: 'var(--ink, #fff)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = blocked
                      ? 'var(--blocked-hover, rgba(255,255,255,0.07))'
                      : 'var(--hover, rgba(255,255,255,0.06))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = blocked ? 'var(--blocked-soft, rgba(255,255,255,0.03))' : 'transparent';
                  }
                }}
              >
                {l.flag && <span className="shrink-0">{l.flag}</span>}
                <span className="flex-1 text-xs font-bold truncate">{l.label}</span>
                {blocked && (
                  <span
                    className="shrink-0 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border"
                    style={{
                      background: 'var(--blocked-soft, rgba(255,255,255,0.08))',
                      borderColor: 'var(--border, rgba(255,255,255,0.15))',
                      color: 'var(--ink-faint, rgba(255,255,255,0.4))',
                    }}
                  >
                    No disponible
                  </span>
                )}
                {active && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
    ),
    document.body
  );
}