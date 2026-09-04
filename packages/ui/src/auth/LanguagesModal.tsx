'use client';

/* ------------------------------------------------------------------ *
 * LanguagesModal — selector de idioma en MODAL CENTRADO (compartido).
 *
 * Se abre desde el botón "Idioma" de los PreferencesPanel: muestra la
 * misma lista que el botón de idiomas del menú hamburguesa (bandera +
 * etiqueta + check del activo + badge BETA si no está disponible).
 *
 * Detalle del diseño (requisito LOGIN_REGISTER / preferencias):
 *  - "El de idioma debe abrir otro modal centrado parecido al ya modal
 *    de preferencias, abriendo la lista igual como está en el botón de
 *    idiomas del menú hamburguesa."
 *  - Tema oscuro/claro vía variables CSS de cada web (--bg-card, --border,
 *    --ink, --ink-muted).
 * ------------------------------------------------------------------ */

import React from 'react';
import { createPortal } from 'react-dom';

export interface LanguageOption {
  code: string;
  label: string;
  /** Bandera (SVG/ReactNode) reutilizada del navbar/hamburguesa. */
  flag?: React.ReactNode;
  /** false = idioma no implementado (muestra badge BETA). */
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
          background: 'var(--bg-card, #0a0a0f)',
          borderColor: 'var(--border, rgba(255,255,255,0.1))',
          color: 'var(--ink, #fff)',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Volver a preferencias"
              title="Volver a preferencias"
              className="w-7 h-7 inline-flex items-center justify-center rounded-full text-xs hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: 'var(--ink, #fff)' }}
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
            className="w-7 h-7 inline-flex items-center justify-center rounded-full text-xs hover:bg-white/10 transition-colors cursor-pointer"
            style={{ color: 'var(--ink, #fff)' }}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {langs.map((l) => {
            const active = l.active ?? l.code === current;
            const disabled = l.available === false;
            return (
              <button
                key={l.code}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelect(l.code);
                  onClose();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                  active
                    ? 'border-brand-light/60 bg-brand-light/10'
                    : 'border-transparent hover:bg-white/5'
                } ${disabled ? 'opacity-55 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  borderColor: active ? 'var(--accent, rgba(34,211,238,0.6))' : undefined,
                  background: active ? 'var(--accent-soft, rgba(34,211,238,0.1))' : undefined,
                  color: 'var(--ink, #fff)',
                }}
              >
                {l.flag && <span className="shrink-0">{l.flag}</span>}
                <span className="flex-1 text-xs font-bold truncate">{l.label}</span>
                {disabled && (
                  <span className="shrink-0 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/10 border border-white/20">
                    Beta
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