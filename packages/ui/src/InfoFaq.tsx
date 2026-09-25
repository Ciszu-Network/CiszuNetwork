'use client';

/**
 * InfoFaqExplorer — FAQ interactiva de las páginas de información.
 *
 * Nace para que la ruta `/faq` de las webs del ecosistema tenga el mismo
 * nivel que `/help` e `/information`: buscador en vivo (pregunta, respuesta,
 * palabras clave y categoría), índice por categorías (chips con contador),
 * acento e icono por categoría, acordeón accesible y transiciones CSS
 * (sin dependencias de animación).
 *
 * Igual que el resto de bloques de `InfoBlocks`, el tema y el copy llegan
 * por props para que cada web conserve su paleta e idioma sin duplicar
 * markup. Las clases de acento de cada categoría también llegan por props:
 * deben ser literales del código de la web (Tailwind las extrae de ahí).
 */
import React, { useId, useMemo, useState } from 'react';
import { Icon } from './Icon';
import type { InfoTheme } from './InfoBlocks';

export interface InfoFaqCategory {
  /** Identificador que usan los items en `InfoFaqItem.category`. */
  id: string;
  /** Nombre visible en el chip y en la cabecera de cada pregunta. */
  label: string;
  /** Icono registrado de `@ciszu/ui`. */
  icon: string;
  /** Clase de acento para texto e iconos (p. ej. `text-neon-cyan`). */
  accent: string;
  /** Fondo suave con el acento (p. ej. `bg-neon-cyan/10`). */
  accentBg: string;
  /** Borde de acento (p. ej. `border-neon-cyan/40`). */
  accentBorder: string;
}

export interface InfoFaqItem {
  /** Pregunta. */
  q: string;
  /** Respuesta. */
  a: string;
  /** Id de la categoría a la que pertenece. */
  category: string;
  /** Palabras clave extra para el buscador (sinónimos, términos técnicos). */
  tags?: string;
}

export interface InfoFaqCopy {
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
}

export interface InfoFaqExplorerProps {
  items: InfoFaqItem[];
  categories: InfoFaqCategory[];
  theme: InfoTheme;
  copy: InfoFaqCopy;
}

const FALLBACK_CATEGORY: InfoFaqCategory = {
  id: '',
  label: 'FAQ',
  icon: 'info',
  accent: 'text-white/60',
  accentBg: 'bg-white/5',
  accentBorder: 'border-white/15',
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function InfoFaqExplorer({ items, categories, theme, copy }: InfoFaqExplorerProps) {
  const baseId = useId();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const categoriesById = useMemo(() => {
    const map = new Map<string, InfoFaqCategory>();
    for (const category of categories) map.set(category.id, category);
    return map;
  }, [categories]);

  const normalizedQuery = normalizeText(query.trim());

  const matching = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) => {
      const category = categoriesById.get(item.category);
      const haystack = normalizeText(
        `${item.q} ${item.a} ${item.tags ?? ''} ${category?.label ?? ''}`,
      );
      return haystack.includes(normalizedQuery);
    });
  }, [items, normalizedQuery, categoriesById]);

  const visible = useMemo(
    () => matching.filter((item) => activeCategory === 'all' || item.category === activeCategory),
    [matching, activeCategory],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    map.set('all', matching.length);
    for (const item of matching) map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, [matching]);

  const toggleItem = (key: string) => {
    setOpenKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const clearFilters = () => {
    setQuery('');
    setActiveCategory('all');
  };

  const resultsText = copy.results
    .replace('{n}', String(visible.length))
    .replace('{total}', String(items.length));

  return (
    <section className="space-y-6" aria-label={copy.searchPlaceholder}>
      {/* Buscador en vivo */}
      <div className="group relative">
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-1 rounded-3xl blur-md opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 ${theme.accentBg}`}
        />
        <div
          className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 backdrop-blur-sm transition-colors duration-300 group-focus-within:border-white/25 ${theme.card} ${theme.border}`}
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
              className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
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
            <Icon name="faq" size={14} />
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

      {/* Acordeón */}
      {visible.length > 0 ? (
        <div className="space-y-3">
          {visible.map((item, index) => {
            const category = categoriesById.get(item.category) ?? FALLBACK_CATEGORY;
            const open = openKeys.includes(item.q);
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            return (
              <article
                key={item.q}
                style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
                className={`group animate-fade-in-up overflow-hidden rounded-2xl border transition-all duration-300 motion-reduce:animate-none motion-reduce:transition-none ${theme.card} ${
                  open ? category.accentBorder : theme.border
                } hover:border-white/20`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => toggleItem(item.q)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none ${category.accentBg} ${category.accent}`}
                    >
                      <Icon name={category.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[9px] font-black uppercase tracking-[0.25em] opacity-80 ${category.accent}`}
                      >
                        {category.label}
                      </span>
                      <span className="mt-1 block font-header text-sm font-bold leading-snug text-white">
                        {item.q}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 transition-transform duration-300 motion-reduce:transition-none ${
                        open ? 'rotate-90' : ''
                      } ${category.accent}`}
                    >
                      <Icon name="chevronRight" size={18} />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-all duration-300 ease-out motion-reduce:transition-none ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-white/5 px-4 pb-5 pt-4 text-sm leading-relaxed text-white/60 sm:pl-[72px] sm:pr-5">
                      {item.a}
                    </p>
                  </div>
                </div>
              </article>
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
            className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-colors ${theme.accentBorder} ${theme.accentBg} ${theme.accent}`}
          >
            <Icon name="refresh" size={14} />
            {copy.clear}
          </button>
        </div>
      )}
    </section>
  );
}

export default InfoFaqExplorer;
