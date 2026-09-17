/**
 * Sistema de Changelog compartido (Ciszu Network)
 *
 * Lógica PURA — sin React, sin red, sin acceso a `document` — para que sea
 * reutilizable por los 4 websites (ciszu, ciszukoantony, ciszubot, muzicmania)
 * y directamente testeable con Vitest.
 *
 * Responsabilidades:
 *   - Tipos canónicos del registro de cambios (item, detalle, tag, estado, fases, nodos).
 *   - Filtrado por texto (con normalización de acentos) y por etiquetas.
 *   - Ordenación por fecha / likes en ambos sentidos.
 *   - Distribución de etiquetas, paginación segura y changelogs relacionados.
 *   - Derivación del estado de despliegue (barra de progreso, fase actual, progreso global).
 */

/** Etiquetas semánticas de un cambio (conventional-commit style). */
export type ChangelogType =
  | 'hotfix' | 'add' | 'ui' | 'bugfix' | 'perf' | 'ux'
  | 'sec' | 'refactor' | 'build' | 'test' | 'docs' | 'chore'
  | 'feat' | 'style' | 'rework' | 'sync' | 'node'
  | 'delete' | 'ci' | 'revert' | 'fix' | 'bump';

/** Una línea de bitácora técnica dentro de un changelog. */
export interface ChangelogDetail {
  text: string;
  type: ChangelogType;
}

/** Ciclo de vida de una entrada publicada desde el devcon. */
export type ChangelogEntryStatus = 'planned' | 'in-progress' | 'released' | 'hotfix';

/** Etiqueta legible de cada estado (para chips de UI). */
export const CHANGELOG_STATUS_LABELS: Record<ChangelogEntryStatus, string> = {
  planned: 'Planificado',
  'in-progress': 'En progreso',
  released: 'Publicado',
  hotfix: 'Hotfix',
};

/** Una entrada del registro de cambios. */
export interface ChangelogItem {
  id: string;
  version: string;
  code: string;
  title: string;
  description: string;
  date: string;
  types: ChangelogType[];
  author: string;
  likes: number;
  details: ChangelogDetail[];
  /** De dónde viene la entrada: código (`static`) o almacén en vivo. */
  origin?: 'static' | 'global' | 'debug';
  /** Nombre del icono del catálogo compartido (solo entradas publicadas). */
  icon?: string;
  /** Ciclo de vida declarado por el admin (solo entradas publicadas). */
  status?: ChangelogEntryStatus;
  /** Fase/roadmap asociada. */
  phase?: string;
  /** Frases destacadas de la página interna. */
  highlights?: string[];
}

/** Estado de una fase del roadmap. */
export type ChangelogPhaseStatus = 'done' | 'current' | 'planned';

/** Fase de la hoja de ruta (agrupa tareas y su progreso). */
export interface ChangelogPhase {
  id: string;
  name: string;
  status: ChangelogPhaseStatus;
  progress: number;
  tasks: { text: string; done: boolean }[];
}

/** Estado de un nodo del diagrama de próximos pasos. */
export type ChangelogNodeStatus = 'done' | 'next' | 'locked';

/** Nodo del diagrama "Próximos Nodos". */
export interface ChangelogNode {
  label: string;
  desc: string;
  status: ChangelogNodeStatus;
}

/** Estado global de despliegue del proyecto que se muestra en el hero. */
export interface ChangelogStatus {
  headline: string;
  progress: number;
  progressStartLabel: string;
  progressEndLabel: string;
  version: string;
  deploy: string;
  developer: string;
  nodes: ChangelogNode[];
  phases: ChangelogPhase[];
}

export type ChangelogSortBy = 'date' | 'likes';
export type ChangelogSortDir = 'asc' | 'desc';

export interface ChangelogQuery {
  search?: string;
  tags?: readonly ChangelogType[];
  sortBy?: ChangelogSortBy;
  sortDir?: ChangelogSortDir;
}

/** Entradas por página por defecto. */
export const CHANGELOG_PAGE_SIZE = 5;

export interface ChangelogPage<T> {
  items: T[];
  /** Página realmente devuelta (ya recortada a los límites). */
  page: number;
  totalPages: number;
  totalItems: number;
  /** Índice 1-based del primer item de la página (0 si está vacía). */
  start: number;
  /** Índice 1-based del último item de la página (0 si está vacía). */
  end: number;
}

/**
 * Normaliza texto para búsquedas tolerantes: minúsculas, sin acentos y sin
 * espacios sobrantes. Así "búsqueda" encuentra "busqueda" y viceversa.
 */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Campos indexables de una entrada (título, descripción, bitácora, versión, tag...). */
function searchableHaystack(item: ChangelogItem): string {
  return [
    item.id,
    item.version,
    item.code,
    item.title,
    item.description,
    item.author,
    ...item.types,
    ...item.details.map((detail) => detail.text),
  ].join(' ');
}

/**
 * Comprueba si una entrada satisface la consulta.
 * - `search`: coincidencia parcial en cualquier campo indexable (sin acentos).
 * - `tags`: coincidencia OR (la entrada debe tener AL MENOS una etiqueta activa).
 */
export function changelogMatches(item: ChangelogItem, query: ChangelogQuery = {}): boolean {
  const term = query.search ? normalizeText(query.search) : '';
  if (term && !normalizeText(searchableHaystack(item)).includes(term)) {
    return false;
  }

  const tags = query.tags ?? [];
  if (tags.length > 0 && !item.types.some((type) => tags.includes(type))) {
    return false;
  }

  return true;
}

/** Ordena una lista de changelogs sin mutar el array original. */
export function sortChangelog(
  items: readonly ChangelogItem[],
  sortBy: ChangelogSortBy = 'date',
  sortDir: ChangelogSortDir = 'desc',
): ChangelogItem[] {
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const valueA = sortBy === 'likes' ? a.likes || 0 : Date.parse(a.date) || 0;
    const valueB = sortBy === 'likes' ? b.likes || 0 : Date.parse(b.date) || 0;
    if (valueA === valueB) {
      // Desempate estable y determinista para que la UI no baile.
      return a.id.localeCompare(b.id);
    }
    return (valueA - valueB) * dir;
  });
}

/** Filtra + ordena en un solo paso (lo que consumen las páginas). */
export function filterChangelog(
  items: readonly ChangelogItem[],
  query: ChangelogQuery = {},
): ChangelogItem[] {
  const filtered = items.filter((item) => changelogMatches(item, query));
  return sortChangelog(filtered, query.sortBy ?? 'date', query.sortDir ?? 'desc');
}

/** Número de entradas que usan cada etiqueta (para las chips de distribución). */
export function getTagStats(items: readonly ChangelogItem[]): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const item of items) {
    for (const type of item.types) {
      stats[type] = (stats[type] || 0) + 1;
    }
  }
  return stats;
}

/** Id de la entrada más reciente, o `null` si la lista está vacía. */
export function getMostRecentId(items: readonly ChangelogItem[]): string | null {
  if (items.length === 0) return null;
  const originRank = (origin?: string) => (origin === 'global' ? 2 : origin === 'debug' ? 1 : 0);
  return items.reduce((latest, item) => {
    const latestTime = Date.parse(latest.date) || 0;
    const itemTime = Date.parse(item.date) || 0;
    if (itemTime > latestTime) return item;
    if (itemTime < latestTime) return latest;
    const latestRank = originRank(latest.origin);
    const itemRank = originRank(item.origin);
    if (itemRank > latestRank) return item;
    if (itemRank < latestRank) return latest;
    return item;
  }).id;
}

/** Busca una entrada por id (los ids de ruta llegan como `string | string[]`). */
export function getChangelogById(
  items: readonly ChangelogItem[],
  id: string | undefined | null,
): ChangelogItem | undefined {
  if (!id) return undefined;
  return items.find((item) => item.id === id);
}

/**
 * Paginación segura: nunca devuelve índices fuera de rango y recorta la página
 * solicitada a `[1, totalPages]`. Con listas vacías devuelve `totalPages: 1`.
 */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number = CHANGELOG_PAGE_SIZE,
): ChangelogPage<T> {
  const size = Math.max(1, Math.floor(pageSize) || CHANGELOG_PAGE_SIZE);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const offset = (safePage - 1) * size;
  const slice = items.slice(offset, offset + size);

  return {
    items: slice,
    page: safePage,
    totalPages,
    totalItems,
    start: slice.length === 0 ? 0 : offset + 1,
    end: offset + slice.length,
  };
}

/**
 * Entradas relacionadas: prioriza las que comparten más etiquetas y, a igualdad,
 * la más reciente. Siempre excluye la entrada de referencia.
 */
export function getRelatedChangelog(
  target: ChangelogItem,
  items: readonly ChangelogItem[],
  limit = 3,
): ChangelogItem[] {
  const targetTags = new Set(target.types);
  return items
    .filter((item) => item.id !== target.id)
    .map((item) => {
      const shared = item.types.filter((type) => targetTags.has(type)).length;
      return { item, shared, date: Date.parse(item.date) || 0 };
    })
    .sort((a, b) => (b.shared - a.shared) || (b.date - a.date) || a.item.id.localeCompare(b.item.id))
    .slice(0, Math.max(0, limit))
    .map((entry) => entry.item);
}

/** Recorta un porcentaje al rango 0–100 (evita barras desbordadas). */
export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/** Fase marcada como `current`; si no hay, la primera pendiente. */
export function getCurrentPhase(
  phases: readonly ChangelogPhase[],
): ChangelogPhase | undefined {
  return phases.find((phase) => phase.status === 'current')
    ?? phases.find((phase) => phase.status === 'planned');
}

/**
 * Progreso global del roadmap: media de las fases (clamped). Si no hay fases,
 * usa `fallback` (normalmente el progreso declarado en `CHANGELOG_STATUS`).
 */
export function getOverallProgress(
  phases: readonly ChangelogPhase[],
  fallback = 0,
): number {
  if (phases.length === 0) return clampProgress(fallback);
  const total = phases.reduce((sum, phase) => sum + clampProgress(phase.progress), 0);
  return Math.round(total / phases.length);
}

/** Progreso de una fase derivado de sus tareas (útil si no se indica `progress`). */
export function getPhaseProgress(phase: ChangelogPhase): number {
  if (phase.tasks.length === 0) return clampProgress(phase.progress);
  const done = phase.tasks.filter((task) => task.done).length;
  return Math.round((done / phase.tasks.length) * 100);
}

/* ------------------------------------------------------------------ *
 * Entradas PUBLICADAS desde el devcon (almacén en vivo)
 * ------------------------------------------------------------------ */

/** Entrada tal como llega del almacén (Supabase / debug local). */
export interface PublishedChangelogInput {
  id?: number | string;
  slug: string;
  version: string;
  code?: string | null;
  title: string;
  description?: string | null;
  body?: { text?: string; type?: string }[] | null;
  highlights?: string[] | null;
  types?: string[] | null;
  icon?: string | null;
  status?: string | null;
  phase?: string | null;
  releaseDate?: string | null;
  release_date?: string | null;
  author?: string | null;
  origin?: 'global' | 'debug';
}

const KNOWN_TYPES: readonly string[] = [
  'hotfix', 'add', 'ui', 'bugfix', 'perf', 'ux', 'sec', 'refactor', 'build', 'test',
  'docs', 'chore', 'feat', 'style', 'rework', 'sync', 'node', 'delete', 'ci', 'revert',
  'fix', 'bump',
];

const KNOWN_STATUSES: readonly string[] = ['planned', 'in-progress', 'released', 'hotfix'];

/** Normaliza la fecha de la entrada a `YYYY-MM-DD` (o cadena vacía). */
function normalizeReleaseDate(value: string | null | undefined): string {
  if (!value) return '';
  const iso = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : '';
}

/**
 * Convierte una entrada publicada en `ChangelogItem`.
 *
 * Es defensivo a propósito: descarta etiquetas desconocidas (para que un dato
 * corrupto no rompa el render de `TAG_CONFIG`) y sanea la fecha.
 */
export function publishedToChangelogItem(entry: PublishedChangelogInput): ChangelogItem {
  const types = (entry.types ?? [])
    .map((type) => String(type).trim().toLowerCase())
    .filter((type): type is ChangelogType => KNOWN_TYPES.includes(type));
  const status = String(entry.status ?? '').toLowerCase();
  const details = (entry.body ?? [])
    .map((detail) => ({
      text: String(detail?.text ?? '').trim(),
      type: (KNOWN_TYPES.includes(String(detail?.type).toLowerCase())
        ? String(detail?.type).toLowerCase()
        : 'add') as ChangelogType,
    }))
    .filter((detail) => detail.text.length > 0);

  return {
    id: entry.slug,
    version: entry.version || entry.slug,
    code: entry.code || '',
    title: entry.title || entry.slug,
    description: entry.description || '',
    date: normalizeReleaseDate(entry.releaseDate ?? entry.release_date),
    types: types.length > 0 ? types : ['add'],
    author: entry.author || 'CiszukoAntony',
    likes: 0,
    details,
    origin: entry.origin ?? 'global',
    icon: entry.icon || undefined,
    status: (KNOWN_STATUSES.includes(status) ? status : 'released') as ChangelogEntryStatus,
    phase: entry.phase || undefined,
    highlights: (entry.highlights ?? []).filter((h) => typeof h === 'string' && h.trim().length > 0),
  };
}

/**
 * Fusiona las entradas publicadas (almacén en vivo) con las estáticas del
 * código. Si comparten `id`, gana la publicada; dentro de las publicadas, gana
 * la global sobre la de debug local.
 */
export function mergeChangelogSources(
  published: readonly PublishedChangelogInput[],
  staticItems: readonly ChangelogItem[],
): ChangelogItem[] {
  const byId = new Map<string, ChangelogItem>();

  for (const item of staticItems) {
    byId.set(item.id, item);
  }

  for (const entry of [...published].sort((a, b) => {
    // 'debug' antes que 'global' para que la global sobrescriba al final.
    const rank = (origin?: string) => (origin === 'global' ? 1 : 0);
    return rank(a.origin) - rank(b.origin);
  })) {
    if (!entry?.slug) continue;
    byId.set(entry.slug, publishedToChangelogItem(entry));
  }

  return Array.from(byId.values());
}

/** Cuenta entradas por origen (para el aviso de "registro en vivo"). */
export function countByOrigin(items: readonly ChangelogItem[]): Record<string, number> {
  const counts: Record<string, number> = { static: 0, global: 0, debug: 0 };
  for (const item of items) {
    const origin = item.origin ?? 'static';
    counts[origin] = (counts[origin] || 0) + 1;
  }
  return counts;
}
