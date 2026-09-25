'use client';

/**
 * InfoHelpExplorer — centro de ayuda interactivo de las páginas `/help`.
 *
 * Mismo sistema que `InfoFaq`: buscador en vivo, índice por categorías (chips
 * con contador) y acento por categoría, pero con el patrón del centro de ayuda
 * de MuzicMania: grid de tarjetas de ayuda y, al pulsar una, un MODAL central
 * accesible (Radix `Modal`) con detalle, pasos rápidos y CTA.
 *
 * Igual que el resto de bloques de `InfoBlocks`, el contenido, el copy y los
 * acentos llegan por props para que cada web conserve su paleta e idioma sin
 * duplicar markup. Las clases de acento deben ser literales del código de la
 * web (Tailwind las extrae de ahí).
 */
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import Modal from './Modal';
import type { InfoTheme } from './InfoBlocks';

export interface InfoHelpCategory {
  /** Identificador que usan las tarjetas en `InfoHelpCard.category`. */
  id: string;
  /** Nombre visible en el chip y en la tarjeta. */
  label: string;
  /** Icono registrado de `@ciszu/ui` para el chip. */
  icon: string;
  /** Clase de acento para texto e iconos (p. ej. `text-neon-cyan`). */
  accent: string;
  /** Fondo suave con el acento (p. ej. `bg-neon-cyan/10`). */
  accentBg: string;
  /** Borde de acento (p. ej. `border-neon-cyan/40`). */
  accentBorder: string;
  /** Clases del CTA primario del modal (botón sólido de la categoría). */
  cta: string;
}

export interface InfoHelpCard {
  title: string;
  /** Id de la categoría a la que pertenece. */
  category: string;
  /** Icono registrado de `@ciszu/ui`. */
  icon: string;
  /** Texto corto que se ve en la tarjeta. */
  summary: string;
  /** Detalle completo que se ve dentro del modal. */
  detail: string;
  /** Pasos rápidos que se numeran en el modal. */
  steps?: string[];
  /** Palabras clave extra para el buscador (sinónimos, términos técnicos). */
  tags?: string;
  /** CTA que cierra el modal llevando a la página o servicio real. */
  cta: { label: string; href: string; external?: boolean };
}

export interface InfoHelpCopy {
  /** Placeholder y etiqueta accesible del buscador. */
  searchPlaceholder: string;
  /** Etiqueta del chip que muestra todas las categorías. */
  allCategories: string;
  /** Contador de resultados; admite `{n}` y `{total}`. */
  results: string;
  /** Título del estado vacío. */
  emptyTitle: string;
  /** Ayuda bajo el título del estado vacío. */
  emptyHint: string;
  /** Botón para limpiar búsqueda y categoría. */
  clear: string;
  /** Encabezado de la lista de pasos del modal. */
  stepsTitle: string;
  /** Texto del botón que abre la ayuda desde la tarjeta. */
  open: string;
  /** Texto del botón que cierra el modal. */
  close: string;
}

export interface InfoHelpExplorerProps {
  cards: InfoHelpCard[];
  categories: InfoHelpCategory[];
  theme: InfoTheme;
  copy: InfoHelpCopy;
  /** Columnas del grid en pantallas grandes. */
  columns?: 3 | 4;
}

const FALLBACK_CATEGORY: InfoHelpCategory = {
  id: '',
  label: 'Help',
  icon: 'help',
  accent: 'text-white/60',
  accentBg: 'bg-white/5',
  accentBorder: 'border-white/15',
  cta: 'bg-white/10 text-white hover:bg-white/20',
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const GRID_COLS: Record<3 | 4, string> = {
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

export function InfoHelpExplorer({
  cards,
  categories,
  theme,
  copy,
  columns = 4,
}: InfoHelpExplorerProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selected, setSelected] = useState<InfoHelpCard | null>(null);

  const categoriesById = useMemo(() => {
    const map = new Map<string, InfoHelpCategory>();
    for (const category of categories) map.set(category.id, category);
    return map;
  }, [categories]);

  const normalizedQuery = normalizeText(query.trim());

  const matching = useMemo(() => {
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return cards;
    return cards.filter((card) => {
      const category = categoriesById.get(card.category);
      const haystack = normalizeText(
        [
          card.title,
          card.summary,
          card.detail,
          card.tags ?? '',
          category?.label ?? '',
          ...(card.steps ?? []),
        ].join(' '),
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [cards, normalizedQuery, categoriesById]);

  const visible = useMemo(
    () => matching.filter((card) => activeCategory === 'all' || card.category === activeCategory),
    [matching, activeCategory],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    map.set('all', matching.length);
    for (const card of matching) map.set(card.category, (map.get(card.category) ?? 0) + 1);
    return map;
  }, [matching]);

  const clearFilters = () => {
    setQuery('');
    setActiveCategory('all');
  };

  const resultsText = copy.results
    .replace('{n}', String(visible.length))
    .replace('{total}', String(cards.length));

  const selectedCategory = selected
    ? (categoriesById.get(selected.category) ?? FALLBACK_CATEGORY)
    : FALLBACK_CATEGORY;

  return (
    <section className="space-y-8" aria-label={copy.searchPlaceholder}>
      {/* Buscador en vivo */}
      <div className="group relative mx-auto max-w-2xl">
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-md transition-opacity duration-500 group-focus-within:opacity-100 motion-reduce:transition-none ${theme.accentBg}`}
        />
        <div
          className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 backdrop-blur-sm transition-colors duration-300 group-focus-within:border-white/25 motion-reduce:transition-none ${theme.card} ${theme.border}`}
        >
          <Icon name="search" size={18} className={`shrink-0 ${theme.accent}`} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/40 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={copy.clear}
              className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white motion-reduce:transition-none"
            >
              <Icon name="close" size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Índice por categorías + contador */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div role="group" aria-label={copy.allCategories} className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            aria-pressed={activeCategory === 'all'}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 motion-reduce:transition-none ${
              activeCategory === 'all'
                ? `${theme.accentBg} ${theme.accentBorder} ${theme.accent}`
                : `${theme.card} ${theme.border} text-white/60 hover:-translate-y-0.5 hover:border-white/25 hover:text-white`
            }`}
          >
            <Icon name="help" size={14} />
            {copy.allCategories}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                activeCategory === 'all' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40'
              }`}
            >
              {counts.get('all') ?? 0}
            </span>
          </button>

          {categories.map((category) => {
            const active = activeCategory === category.id;
            const count = counts.get(category.id) ?? 0;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 motion-reduce:transition-none ${
                  active
                    ? `${category.accentBg} ${category.accentBorder} ${category.accent}`
                    : `${theme.card} ${theme.border} text-white/60 hover:-translate-y-0.5 hover:border-white/25 hover:text-white`
                }`}
              >
                <Icon name={category.icon} size={14} />
                {category.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                    active ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <p
          role="status"
          aria-live="polite"
          className="shrink-0 text-[11px] font-black uppercase tracking-[0.25em] text-white/40 lg:pt-2.5"
        >
          {resultsText}
        </p>
      </div>

      {/* Grid de tarjetas de ayuda */}
      {visible.length > 0 ? (
        <div className={`grid grid-cols-1 ${GRID_COLS[columns]} gap-4`}>
          {visible.map((card, index) => {
            const category = categoriesById.get(card.category) ?? FALLBACK_CATEGORY;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => setSelected(card)}
                aria-haspopup="dialog"
                style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
                className={`group animate-fade-in-up flex h-full w-full flex-col items-start gap-4 rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:animate-none motion-reduce:transition-none ${theme.card} ${category.accentBorder} ${category.accentBg}`}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none ${category.accentBg} ${category.accent}`}
                  >
                    <Icon name={card.icon} size={22} />
                  </span>
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-white/30 transition-all duration-300 group-hover:rotate-45 group-hover:text-white/80 motion-reduce:transition-none ${category.accentBorder}`}
                  >
                    <Icon name="add" size={14} />
                  </span>
                </span>
                <span className="space-y-1.5">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] ${category.accentBorder} ${category.accentBg} ${category.accent}`}
                  >
                    {category.label}
                  </span>
                  <span className="block font-header text-base font-bold leading-snug text-white">
                    {card.title}
                  </span>
                  <span className="block text-xs leading-relaxed text-white/50">{card.summary}</span>
                </span>
                <span
                  className={`mt-auto inline-flex items-center gap-1.5 pt-2 text-[10px] font-black uppercase tracking-[0.25em] transition-opacity duration-300 ${category.accent}`}
                >
                  {copy.open}
                  <Icon name="add" size={12} />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          role="status"
          className={`rounded-3xl border border-dashed p-10 text-center ${theme.border}`}
        >
          <span
            className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${theme.accentBg} ${theme.accent}`}
          >
            <Icon name="search" size={22} className="animate-pulse motion-reduce:animate-none" />
          </span>
          <p className="font-header font-bold text-white">{copy.emptyTitle}</p>
          <p className="mt-1 text-sm text-white/50">{copy.emptyHint}</p>
          <button
            type="button"
            onClick={clearFilters}
            className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-colors motion-reduce:transition-none ${theme.accentBorder} ${theme.accentBg} ${theme.accent}`}
          >
            <Icon name="refresh" size={14} />
            {copy.clear}
          </button>
        </div>
      )}

      {/* Modal central de detalle */}
      <Modal
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected?.title ?? ''}
        description={selected?.summary}
        size="lg"
        className="animate-fade-in-up max-h-[85vh] overflow-y-auto motion-reduce:animate-none"
      >
        {selected ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${selectedCategory.accentBg} ${selectedCategory.accent}`}
              >
                <Icon name={selected.icon} size={24} />
              </span>
              <span
                className={`inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${selectedCategory.accentBorder} ${selectedCategory.accentBg} ${selectedCategory.accent}`}
              >
                {selectedCategory.label}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-gray-300">{selected.detail}</p>

            {selected.steps?.length ? (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  {copy.stepsTitle}
                </h4>
                <ol className="space-y-3">
                  {selected.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-gray-300">
                      <span
                        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${selectedCategory.accentBg} ${selectedCategory.accent}`}
                      >
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
              {selected.cta.external ? (
                <a
                  href={selected.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-transform hover:scale-[1.02] motion-reduce:transition-none ${selectedCategory.cta}`}
                >
                  {selected.cta.label}
                  <Icon name="external" size={14} />
                </a>
              ) : (
                <Link
                  href={selected.cta.href}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-transform hover:scale-[1.02] motion-reduce:transition-none ${selectedCategory.cta}`}
                >
                  {selected.cta.label}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-white/70 transition-colors hover:bg-white/10 hover:text-white motion-reduce:transition-none"
              >
                {copy.close}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

export default InfoHelpExplorer;
