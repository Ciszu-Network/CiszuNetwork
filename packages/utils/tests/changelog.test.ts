import { describe, expect, it } from 'vitest';

import {
  CHANGELOG_PAGE_SIZE,
  changelogMatches,
  clampProgress,
  filterChangelog,
  getChangelogById,
  getCurrentPhase,
  getMostRecentId,
  getOverallProgress,
  getPhaseProgress,
  getRelatedChangelog,
  getTagStats,
  normalizeText,
  paginate,
  sortChangelog,
  type ChangelogItem,
  type ChangelogPhase,
} from '../src/changelog';

const item = (overrides: Partial<ChangelogItem> = {}): ChangelogItem => ({
  id: 'patch-v1.0.0',
  version: 'PATCH V1.0.0',
  code: 'P-100-XX',
  title: 'Cambio base',
  description: 'Descripción base',
  date: '2026-01-01',
  types: ['build'],
  author: 'CiszukoAntony',
  likes: 0,
  details: [{ text: 'detalle base', type: 'build' }],
  ...overrides,
});

describe('normalizeText', () => {
  it('quita acentos, mayúsculas y espacios sobrantes', () => {
    expect(normalizeText('  Búsqueda  ')).toBe('busqueda');
    expect(normalizeText('CERTIFICACIÓN')).toBe('certificacion');
  });
});

describe('changelogMatches', () => {
  it('coincide por texto sin acentos en cualquier campo indexable', () => {
    const entry = item({ description: 'Optimización de búsqueda global' });
    expect(changelogMatches(entry, { search: 'busqueda' })).toBe(true);
    expect(changelogMatches(entry, { search: 'BÚSQUEDA' })).toBe(true);
    expect(changelogMatches(entry, { search: 'inexistente' })).toBe(false);
  });

  it('encuentra por versión, código y texto de la bitácora', () => {
    const entry = item({
      version: 'BETA V2.0.1',
      code: 'B-201-AR',
      details: [{ text: 'Migración a Discord.js v14', type: 'build' }],
    });
    expect(changelogMatches(entry, { search: 'v2.0.1' })).toBe(true);
    expect(changelogMatches(entry, { search: 'b-201-ar' })).toBe(true);
    expect(changelogMatches(entry, { search: 'discord' })).toBe(true);
  });

  it('filtra por etiquetas con semántica OR', () => {
    const entry = item({ types: ['sec', 'build'] });
    expect(changelogMatches(entry, { tags: ['sec'] })).toBe(true);
    expect(changelogMatches(entry, { tags: ['sec', 'ui'] })).toBe(true);
    expect(changelogMatches(entry, { tags: ['ui'] })).toBe(false);
    expect(changelogMatches(entry, { tags: [] })).toBe(true);
  });

  it('combina búsqueda y etiquetas', () => {
    const entry = item({ title: 'Seguridad', types: ['sec'] });
    expect(changelogMatches(entry, { search: 'seguridad', tags: ['sec'] })).toBe(true);
    expect(changelogMatches(entry, { search: 'seguridad', tags: ['ui'] })).toBe(false);
  });
});

describe('sortChangelog', () => {
  const older = item({ id: 'a', date: '2026-01-01', likes: 5 });
  const newer = item({ id: 'b', date: '2026-06-01', likes: 1 });
  const newest = item({ id: 'c', date: '2026-12-01', likes: 9 });

  it('ordena por fecha descendente por defecto', () => {
    expect(sortChangelog([older, newest, newer]).map((i) => i.id)).toEqual(['c', 'b', 'a']);
  });

  it('ordena por fecha ascendente y por likes en ambos sentidos', () => {
    expect(sortChangelog([newer, older, newest], 'date', 'asc').map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(sortChangelog([older, newest, newer], 'likes', 'desc').map((i) => i.id)).toEqual(['c', 'a', 'b']);
    expect(sortChangelog([older, newest, newer], 'likes', 'asc').map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });

  it('no muta el array original', () => {
    const input = [older, newer];
    sortChangelog(input);
    expect(input.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('es determinista con valores empatados', () => {
    const first = item({ id: 'aaa', date: '2026-01-01' });
    const second = item({ id: 'zzz', date: '2026-01-01' });
    expect(sortChangelog([second, first]).map((i) => i.id)).toEqual(['aaa', 'zzz']);
  });
});

describe('filterChangelog', () => {
  it('filtra y ordena en un paso', () => {
    const data = [
      item({ id: 'a', date: '2026-01-01', types: ['sec'] }),
      item({ id: 'b', date: '2026-03-01', types: ['ui'] }),
      item({ id: 'c', date: '2026-02-01', types: ['sec'] }),
    ];
    expect(filterChangelog(data, { tags: ['sec'] }).map((i) => i.id)).toEqual(['c', 'a']);
  });
});

describe('getTagStats', () => {
  it('cuenta cada etiqueta una vez por entrada', () => {
    const data = [
      item({ types: ['sec', 'build'] }),
      item({ id: 'x', types: ['sec'] }),
    ];
    expect(getTagStats(data)).toEqual({ sec: 2, build: 1 });
  });
});

describe('getMostRecentId y getChangelogById', () => {
  it('devuelve la entrada más reciente', () => {
    const data = [item({ id: 'a', date: '2026-01-01' }), item({ id: 'b', date: '2026-05-01' })];
    expect(getMostRecentId(data)).toBe('b');
  });

  it('devuelve null con la lista vacía (antes rompía el reduce)', () => {
    expect(getMostRecentId([])).toBeNull();
  });

  it('resuelve por id y tolera ids ausentes', () => {
    const data = [item({ id: 'a' })];
    expect(getChangelogById(data, 'a')?.id).toBe('a');
    expect(getChangelogById(data, 'zzz')).toBeUndefined();
    expect(getChangelogById(data, undefined)).toBeUndefined();
  });
});

describe('paginate', () => {
  const data = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }));

  it('pagina con el tamaño por defecto', () => {
    const page = paginate(data, 1);
    expect(page.items).toHaveLength(CHANGELOG_PAGE_SIZE);
    expect(page.totalPages).toBe(3);
    expect(page.totalItems).toBe(12);
    expect(page.start).toBe(1);
    expect(page.end).toBe(5);
  });

  it('recorta páginas fuera de rango', () => {
    expect(paginate(data, 99).page).toBe(3);
    expect(paginate(data, 99).items.map((i) => i.id)).toEqual([11, 12]);
    expect(paginate(data, 0).page).toBe(1);
    expect(paginate(data, -4).page).toBe(1);
  });

  it('soporta listas vacías', () => {
    const page = paginate([], 3);
    expect(page.items).toEqual([]);
    expect(page.totalPages).toBe(1);
    expect(page.page).toBe(1);
    expect(page.start).toBe(0);
    expect(page.end).toBe(0);
  });
});

describe('getRelatedChangelog', () => {
  it('prioriza las entradas con más etiquetas en común y excluye la propia', () => {
    const target = item({ id: 'target', types: ['sec', 'build'], date: '2026-06-01' });
    const twoShared = item({ id: 'two', types: ['sec', 'build'], date: '2026-01-01' });
    const oneShared = item({ id: 'one', types: ['sec'] });
    const noneShared = item({ id: 'none', types: ['docs'] });

    expect(getRelatedChangelog(target, [noneShared, oneShared, twoShared, target]).map((i) => i.id))
      .toEqual(['two', 'one', 'none']);
  });

  it('respeta el límite', () => {
    const target = item({ id: 'target' });
    const others = Array.from({ length: 8 }, (_, i) => item({ id: `o${i}` }));
    expect(getRelatedChangelog(target, [target, ...others], 2)).toHaveLength(2);
  });
});

describe('roadmap helpers', () => {
  const phases: ChangelogPhase[] = [
    { id: 'p1', name: 'Fase 1', status: 'done', progress: 100, tasks: [] },
    { id: 'p2', name: 'Fase 2', status: 'current', progress: 50, tasks: [] },
    { id: 'p3', name: 'Fase 3', status: 'planned', progress: 0, tasks: [] },
  ];

  it('recorta progresos fuera de rango', () => {
    expect(clampProgress(-20)).toBe(0);
    expect(clampProgress(140)).toBe(100);
    expect(clampProgress(Number.NaN)).toBe(0);
    expect(clampProgress(42.6)).toBe(42.6);
  });

  it('localiza la fase actual', () => {
    expect(getCurrentPhase(phases)?.id).toBe('p2');
    expect(getCurrentPhase([{ ...phases[2] }])?.id).toBe('p3');
    expect(getCurrentPhase([])).toBeUndefined();
  });

  it('calcula el progreso global como media de fases', () => {
    expect(getOverallProgress(phases)).toBe(50);
    expect(getOverallProgress([], 78)).toBe(78);
  });

  it('deriva el progreso de una fase desde sus tareas', () => {
    expect(getPhaseProgress({
      id: 'x', name: 'X', status: 'current', progress: 0,
      tasks: [{ text: 'a', done: true }, { text: 'b', done: false }],
    })).toBe(50);
    expect(getPhaseProgress({
      id: 'x', name: 'X', status: 'current', progress: 33, tasks: [],
    })).toBe(33);
  });
});
