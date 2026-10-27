'use client';

/**
 * SiteSearch — buscador global compartido por las webs del ecosistema.
 *
 * UX: 1 input + filtros por categoría (multicheck) + orden asc/desc.
 * Resultados en dos secciones:
 *   - Páginas: fila horizontal de tarjetas.
 *   - Usuarios (si la web los soporta): mosaico con avatar, nombre, @username y
 *     botón para visitar el perfil. Buscar con "@" fuerza solo usuarios.
 */
import { useEffect, useMemo, useState } from 'react';
import { Icon } from './Icon';

type SearchMode = 'pages' | 'users';

export interface SearchPageItem {
  href: string;
  label: string;
  description?: string;
  icon?: string;
  category: string;
  keywords?: string[];
}

export interface SearchUserItem {
  id: string | number;
  displayName: string;
  username?: string | null;
  avatar?: string | null;
  href: string;
  meta?: string;
}

export interface SiteSearchProps {
  pages: SearchPageItem[];
  categories?: string[];
  /** Si la web soporta usuarios, pasar el buscador (async). */
  searchUsers?: (query: string) => Promise<SearchUserItem[]>;
  placeholder?: string;
  pagesLabel?: string;
  usersLabel?: string;
  usersHint?: string;
  loadingUsersLabel?: string;
  emptyLabel?: string;
  profileLabel?: string;
  sortAscLabel?: string;
  sortDescLabel?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SiteSearch({
  pages,
  categories,
  searchUsers,
  placeholder = 'Buscar…',
  pagesLabel = 'Páginas',
  usersLabel = 'Usuarios',
  usersHint = 'Escribe un @usuario para buscar.',
  loadingUsersLabel = 'Buscando usuarios…',
  emptyLabel = 'Sin resultados',
  profileLabel = 'Ver perfil',
  sortAscLabel = 'A → Z',
  sortDescLabel = 'Z → A',
  className = '',
  autoFocus = false,
}: SiteSearchProps) {
  const [query, setQuery] = useState('');
  const [modes, setModes] = useState<SearchMode[]>(['pages']);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [users, setUsers] = useState<SearchUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTick, setSearchTick] = useState(0);

  const cats = categories ?? Array.from(new Set(pages.map((p) => p.category))).filter(Boolean);
  const trimmedQuery = query.trim();
  const atMode = !!searchUsers && trimmedQuery.startsWith('@');
  const term = (trimmedQuery.startsWith('@') ? trimmedQuery.slice(1) : trimmedQuery).trim().toLowerCase();
  const pagesOn = modes.includes('pages');
  const usersOn = modes.includes('users');
  const showPages = !atMode && pagesOn;
  const showUsers = !!searchUsers && (atMode || usersOn);

  const filteredPages = useMemo(() => {
    if (!showPages) return [];
    const list = pages.filter((p) => {
      if (selected.length > 0 && !selected.includes(p.category)) return false;
      if (!term) return true;
      const haystack = [p.label, p.description ?? '', ...(p.keywords ?? []), p.href].join(' ').toLowerCase();
      return term.split(/\s+/).every((word) => haystack.includes(word));
    });
    return list.sort((a, b) => (sortAsc ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label)));
  }, [pages, selected, term, showPages, sortAsc]);

  useEffect(() => {
    let alive = true;
    if (!searchUsers || !showUsers || !term) {
      setUsers([]);
      setLoadingUsers(false);
      return () => {
        alive = false;
      };
    }
    setLoadingUsers(true);
    void searchUsers(term)
      .then((rows) => {
        if (alive) setUsers(rows.slice(0, 24));
      })
      .catch(() => {
        if (alive) setUsers([]);
      })
      .finally(() => {
        if (alive) setLoadingUsers(false);
      });
    return () => {
      alive = false;
    };
  }, [searchUsers, showUsers, term, searchTick]);

  const toggleCategory = (cat: string) =>
    setSelected((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));

  const toggleMode = (mode: SearchMode) => {
    setModes((prev) => {
      const on = prev.includes(mode);
      if (on && prev.length === 1) return prev;
      return on ? prev.filter((m) => m !== mode) : [...prev, mode];
    });
  };

  return (
    <div className={'w-full ' + className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchTick((v) => v + 1);
        }}
      >
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <Icon name="search" size={16} />
          </span>
          <input
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full rounded-xl border border-white/15 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/35 focus:border-neon-blue/60 focus:outline-none"
          />
        </div>
      </form>

      {/* Filtros + orden */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {searchUsers && (
          <>
            <button
              type="button"
              aria-pressed={pagesOn}
              disabled={atMode}
              onClick={() => toggleMode('pages')}
              className={
                'rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ' +
                (pagesOn
                  ? 'border-neon-blue/60 bg-neon-blue/20 text-neon-blue'
                  : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80') +
                (atMode ? ' cursor-not-allowed opacity-40' : '')
              }
            >
              {pagesLabel}
            </button>
            <button
              type="button"
              aria-pressed={usersOn || atMode}
              onClick={() => toggleMode('users')}
              className={
                'rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ' +
                (usersOn || atMode
                  ? 'border-neon-blue/60 bg-neon-blue/20 text-neon-blue'
                  : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80')
              }
            >
              {usersLabel}
            </button>
            {showPages && cats.length > 0 && <span className="mx-1 h-3 w-px bg-white/10" />}
          </>
        )}
        {showPages &&
          cats.map((cat) => {
            const on = selected.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={
                  'rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ' +
                  (on ? 'border-neon-blue/60 bg-neon-blue/20 text-neon-blue' : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80')
                }
              >
                {cat}
              </button>
            );
          })}
        {showPages && (
          <button
            type="button"
            onClick={() => setSortAsc((v) => !v)}
            className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-white"
            title={sortAsc ? sortDescLabel : sortAscLabel}
          >
            {sortAsc ? sortAscLabel : sortDescLabel}
          </button>
        )}
      </div>

      {/* Páginas */}
      {showPages && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-white/35">{pagesLabel}</p>
          {filteredPages.length === 0 ? (
            <p className="text-xs text-white/40">{emptyLabel}</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filteredPages.map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  className="group flex min-w-[190px] max-w-[240px] shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-all hover:border-neon-blue/50 hover:bg-white/10"
                >
                  <span className="text-neon-blue">{p.icon ? <Icon name={p.icon} size={16} /> : <Icon name="globe" size={16} />}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-white/90">{p.label}</span>
                    {p.description && <span className="block truncate text-[10px] text-white/40">{p.description}</span>}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Usuarios (si la web los soporta) */}
      {showUsers && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-white/35">{usersLabel}</p>
          {!term ? (
            <p className="text-xs text-white/40">{usersHint}</p>
          ) : loadingUsers ? (
            <p className="animate-pulse text-xs text-neon-blue">{loadingUsersLabel}</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-white/40">{emptyLabel}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
                  {u.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/50">
                      <Icon name="person" size={16} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white/90">{u.displayName}</p>
                    <p className="truncate text-[10px] text-white/40">{u.username ? '@' + u.username : u.meta ?? ''}</p>
                  </div>
                  <a href={u.href} className="rounded-lg border border-neon-blue/40 px-2 py-1 text-[9px] font-bold text-neon-blue hover:bg-neon-blue/10">
                    {profileLabel}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SiteSearch;
