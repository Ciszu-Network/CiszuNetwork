'use client';

/**
 * LegalDocument + CreditsRoll — bloques compartidos para las páginas
 * institucionales legales de las webs de Ciszu Network (policy, rules, license,
 * guidelines) y para la página de créditos.
 *
 * Replican la estructura de MuzicMania (hero con icono y título degradado,
 * contenedor tipo documento con artículos numerados, firma al pie; en créditos,
 * secciones de rol → nombre centradas) pero SIN framer-motion: `@ciszu/ui` no
 * depende de esa librería y las webs ya definen transiciones CSS propias. El
 * tema se inyecta por props (`InfoTheme`) para que cada web conserve su paleta.
 */
import React from 'react';
import { Icon } from './Icon';
import type { InfoTheme } from './InfoBlocks';

export interface LegalArticle {
  id: number;
  title: string;
  content: string;
  /** Renderiza el contenido como bloque monoespaciado (texto íntegro de licencias). */
  isCode?: boolean;
}

export interface LegalVersion {
  /** Etiqueta de versión del documento (p. ej. `v2026.1 · Política de Privacidad`). */
  label: string;
  /** Fecha de la última actualización (texto libre, p. ej. `2026`). */
  date: string;
  /** Estado del documento (p. ej. `Vigente`). */
  status?: string;
}

export interface LegalDocumentProps {
  /** Icono del registro (p. ej. `shield`, `rules`, `license`). */
  icon: string;
  /** Título grande del hero. */
  title: string;
  /** Bajada del hero (se muestra con tracking amplio). */
  subtitle: string;
  /** Etiqueta del documento en la cabecera del contenedor. */
  docLabel: string;
  /** Artículos numerados del documento. */
  articles: LegalArticle[];
  /** Firma al pie del documento. */
  signOff: { title: string; subtitle?: string };
  /** Bloque opcional de versión/fecha/estado al pie, antes de la firma. */
  version?: LegalVersion;
  theme: InfoTheme;
}

export function LegalDocument({
  icon,
  title,
  subtitle,
  docLabel,
  articles,
  signOff,
  version,
  theme,
}: LegalDocumentProps) {
  return (
    <div className="space-y-16 pt-12">
      {/* --- HERO --- */}
      <header className="relative space-y-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-5 md:gap-6 group">
            <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0 ${theme.accent}`}>
              <Icon name={icon} size={42} />
            </div>
            <h1
              className={`text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r bg-clip-text text-transparent [-webkit-text-stroke:1px_black] ${theme.gradient}`}
            >
              {title}
            </h1>
          </div>
          <p className={`font-black tracking-[0.5em] uppercase text-[10px] md:text-xs ${theme.accent}`}>
            {subtitle}
          </p>
        </div>
      </header>

      {/* --- DOCUMENT CONTAINER --- */}
      <div
        className={`relative rounded-[3rem] p-8 md:p-16 shadow-2xl overflow-hidden border ${theme.border} ${theme.card}`}
      >
        {/* Líneas sutiles de documento (decorativo) */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px)', backgroundSize: '100% 3rem' }}
          aria-hidden
        />

        <div className="relative space-y-12">
          <div className="flex items-center gap-4 pb-8 border-b border-white/5 opacity-50">
            <div className={`w-7 h-7 shrink-0 ${theme.accent}`}>
              <Icon name="shield" size={28} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{docLabel}</span>
          </div>

          <div className="space-y-10">
            {articles.map((art) => (
              <article key={art.id} className="group">
                <div className="flex gap-6 md:gap-8">
                  <div className="flex-shrink-0 pt-1">
                    <span
                      className={`font-mono font-bold text-lg opacity-40 group-hover:opacity-100 transition-opacity ${theme.accent}`}
                    >
                      {String(art.id).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1 overflow-hidden">
                    <h2 className="text-lg md:text-xl font-header font-black text-white italic uppercase tracking-tighter">
                      ART. {art.id}: {art.title}
                    </h2>
                    {art.isCode ? (
                      <div className="p-6 bg-black/40 border border-white/5 rounded-2xl font-mono text-[10px] md:text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
                        {art.content}
                      </div>
                    ) : (
                      <p className="text-gray-400 font-bold leading-relaxed text-sm md:text-base">{art.content}</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Versión completa del documento (opcional) */}
          {version ? (
            <div
              className={`rounded-2xl border p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${theme.border} ${theme.accentBg}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 shrink-0 ${theme.accent}`}>
                  <Icon name="certificates" size={32} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-500">
                    Versión completa del documento
                  </p>
                  <p className="font-mono text-xs md:text-sm font-bold text-white break-all">{version.label}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 md:justify-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Actualizado</span>
                  <span className="text-[11px] font-bold text-gray-300">{version.date}</span>
                </div>
                {version.status ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Estado</span>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${theme.accent}`}>
                      {version.status}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Firma */}
          <div className="pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-white">{signOff.title}</p>
              {signOff.subtitle ? (
                <p className="text-[9px] font-bold text-gray-500 italic">{signOff.subtitle}</p>
              ) : null}
            </div>
            <div className={`w-24 h-1 rounded-full ${theme.accentBg}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Créditos ─────────────────────────── */

export interface CreditEntry {
  role: string;
  name: string;
  /** Enlace externo opcional (tecnologías). */
  link?: string;
}

export interface CreditSection {
  title: string;
  credits: CreditEntry[];
}

export interface CreditsRollProps {
  icon: string;
  title: string;
  subtitle: string;
  sections: CreditSection[];
  /** Cierre de la página (cita/frase). */
  closing?: { note?: string; quote?: string };
  theme: InfoTheme;
}

export function CreditsRoll({ icon, title, subtitle, sections, closing, theme }: CreditsRollProps) {
  return (
    <div className="space-y-16 pt-12">
      {/* --- HERO --- */}
      <header className="relative space-y-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-5 md:gap-6 group">
            <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0 ${theme.accent}`}>
              <Icon name={icon} size={42} />
            </div>
            <h1
              className={`text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r bg-clip-text text-transparent [-webkit-text-stroke:1px_black] ${theme.gradient}`}
            >
              {title}
            </h1>
          </div>
          <p className={`font-black tracking-[0.5em] uppercase text-[10px] md:text-xs ${theme.accent}`}>
            {subtitle}
          </p>
        </div>
      </header>

      {/* --- SECCIONES DE CRÉDITOS --- */}
      {sections.map((section) => (
        <section key={section.title} className="space-y-8 mb-24">
          <h2 className="text-xl md:text-2xl font-black text-white/50 tracking-[0.4em] uppercase text-center">
            {section.title}
          </h2>
          <div className="flex flex-col items-center gap-10">
            {section.credits.map((item) => (
              <div key={`${item.role}-${item.name}`} className="text-center flex flex-col gap-2">
                <span className={`text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase ${theme.accent}`}>
                  {item.role}
                </span>
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg md:text-xl font-bold text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all cursor-pointer inline-block"
                  >
                    {item.name}
                  </a>
                ) : (
                  <span className="text-lg md:text-xl font-bold text-white tracking-widest uppercase">
                    {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* --- CIERRE --- */}
      {(closing?.note || closing?.quote) && (
        <div className="space-y-8 mt-40">
          <div className="flex flex-col items-center gap-6">
            {closing?.note ? (
              <span className="text-[10px] md:text-xs font-bold text-white/40 tracking-[0.3em] uppercase max-w-lg text-center leading-loose">
                {closing.note}
              </span>
            ) : null}
            {closing?.quote ? (
              <span className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase mt-12">
                &quot;{closing.quote}&quot;
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
