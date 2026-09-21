'use client';

/**
 * Bloques compartidos para las páginas de información (about / team / help /
 * faq / information) de las 4 webs.
 *
 * Se crearon para que las páginas "institucionales" tengan la MISMA estructura
 * en todo Ciszu Network (hero → índice de enlaces → secciones → pasos → FAQ →
 * CTA), como las de MuzicMania, en vez de cuatro maquetaciones distintas.
 *
 * El tema se inyecta por props (`theme.accent`, `theme.card`, `theme.border`,
 * `theme.surface`) para que cada web conserve su paleta. Todo el texto visible
 * llega por props: los componentes no llevan copy propio, así cada web traduce
 * o escribe su contenido sin duplicar markup.
 */
import React from 'react';
import Link from 'next/link';
import { Icon } from './Icon';

export interface InfoTheme {
  /** Clase de color de acento para textos e iconos (p. ej. `text-neon-blue`). */
  accent: string;
  /** Clase de fondo suave con el acento (p. ej. `bg-neon-blue/10`). */
  accentBg: string;
  /** Clase del borde de acento (p. ej. `border-neon-blue/30`). */
  accentBorder: string;
  /** Clase de la superficie de tarjeta (p. ej. `bg-white/5`). */
  card: string;
  /** Clase del borde neutro de tarjeta (p. ej. `border-white/10`). */
  border: string;
  /** Clase del gradiente del título (p. ej. `from-neon-blue to-neon-purple`). */
  gradient: string;
}

export interface InfoHeroProps {
  /** Icono (nombre del registro del CDN). */
  icon: string;
  /** Título grande. */
  title: string;
  /** Bajada. */
  subtitle: string;
  /** Etiqueta pequeña sobre el título. */
  kicker?: string;
  theme: InfoTheme;
}

export function InfoHero({ icon, title, subtitle, kicker, theme }: InfoHeroProps) {
  return (
    <header className="text-center mb-14">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${theme.accentBg} ${theme.accent}`}
      >
        <Icon name={icon} size={30} />
      </div>
      {kicker ? (
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${theme.accent}`}>{kicker}</p>
      ) : null}
      <h1
        className={`text-4xl md:text-6xl font-header font-black uppercase tracking-tighter bg-gradient-to-r bg-clip-text text-transparent mb-4 ${theme.gradient}`}
      >
        {title}
      </h1>
      <p className="text-white/60 text-sm max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
    </header>
  );
}

export interface InfoLinkItem {
  name: string;
  href: string;
  icon: string;
  desc?: string;
}

export interface InfoLinkGroup {
  title: string;
  items: InfoLinkItem[];
}

export interface InfoLinkGridProps {
  groups: InfoLinkGroup[];
  theme: InfoTheme;
  /** Ruta actual para marcar el enlace activo. */
  currentPath?: string;
}

export function InfoLinkGrid({ groups, theme, currentPath }: InfoLinkGridProps) {
  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.title}>
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${theme.accent}`}>
            {group.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((item) => {
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-5 rounded-2xl border transition-all duration-300 group ${
                    active
                      ? `${theme.accentBorder} ${theme.accentBg}`
                      : `${theme.border} ${theme.card}`
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? theme.accent : 'text-white/50'
                      }`}
                    >
                      <Icon name={item.icon} size={18} />
                    </span>
                    <h3 className="font-header font-bold text-white truncate">{item.name}</h3>
                  </div>
                  {item.desc ? <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export interface InfoCardItem {
  icon: string;
  title: string;
  body: string;
}

export interface InfoCardGridProps {
  title?: string;
  items: InfoCardItem[];
  theme: InfoTheme;
  /** Columnas en pantallas grandes. */
  columns?: 2 | 3 | 4;
}

const GRID_COLS: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export function InfoCardGrid({ title, items, theme, columns = 3 }: InfoCardGridProps) {
  return (
    <section>
      {title ? (
        <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${theme.accent}`}>{title}</h2>
      ) : null}
      <div className={`grid grid-cols-1 ${GRID_COLS[columns]} gap-5`}>
        {items.map((item) => (
          <article key={item.title} className={`p-6 rounded-2xl border ${theme.border} ${theme.card}`}>
            <span
              className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${theme.accentBg} ${theme.accent}`}
            >
              <Icon name={item.icon} size={22} />
            </span>
            <h3 className="font-header font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export interface InfoAccordionItem {
  q: string;
  a: string;
}

export function InfoAccordion({ items, theme }: { items: InfoAccordionItem[]; theme: InfoTheme }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className={`group p-5 rounded-2xl border ${theme.border} ${theme.card}`}
        >
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
            <span className="text-white font-bold text-sm font-header">{item.q}</span>
            <Icon
              name="chevronRight"
              size={16}
              className={`shrink-0 group-open:rotate-90 transition-transform ${theme.accent}`}
            />
          </summary>
          <p className="mt-4 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export interface InfoStepGroup {
  title: string;
  body: string;
}

export function InfoSteps({ title, steps, theme }: { title?: string; steps: InfoStepGroup[]; theme: InfoTheme }) {
  return (
    <section>
      {title ? (
        <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${theme.accent}`}>{title}</h2>
      ) : null}
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className={`flex gap-4 p-5 rounded-2xl border ${theme.border} ${theme.card}`}>
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-black font-header ${theme.accentBg} ${theme.accent}`}
            >
              {index + 1}
            </span>
            <div>
              <h3 className="font-header font-bold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export interface InfoCta {
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
  variant?: 'primary' | 'ghost';
}

export function InfoCtaRow({ actions, theme }: { actions: InfoCta[]; theme: InfoTheme }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-14">
      {actions.map((action) => {
        const cls =
          action.variant === 'ghost'
            ? `inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-bold text-white transition-all ${theme.border} ${theme.card}`
            : `inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-bold transition-all ${theme.accentBorder} ${theme.accentBg} ${theme.accent}`;
        const content = (
          <>
            {action.icon ? <Icon name={action.icon} size={16} /> : null}
            {action.label}
          </>
        );
        return action.external ? (
          <a key={action.href} href={action.href} target="_blank" rel="noopener noreferrer" className={cls}>
            {content}
          </a>
        ) : (
          <Link key={action.href} href={action.href} className={cls}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
