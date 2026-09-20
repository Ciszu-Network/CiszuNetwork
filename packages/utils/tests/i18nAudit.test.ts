import { describe, expect, it } from 'vitest';
import {
  applyDialect,
  auditLocales,
  cloneLocale,
  diffLocales,
  flattenLocale,
  type LocaleTree,
} from '../src/i18nAudit';

describe('flattenLocale', () => {
  it('aplana objetos anidados a rutas con punto', () => {
    const flat = flattenLocale({ nav: { home: 'Inicio' }, top: 'x' });
    expect(flat).toEqual({ 'nav.home': 'Inicio', top: 'x' });
  });

  it('ignora arrays y valores no textuales', () => {
    const flat = flattenLocale({ a: { b: 'ok', c: 3 as unknown as string } });
    expect(flat).toEqual({ 'a.b': 'ok' });
  });
});

describe('cloneLocale', () => {
  it('no comparte referencias con el original', () => {
    const original = { a: { b: 'x' } };
    const copy = cloneLocale(original);
    copy.a.b = 'y';
    expect(original.a.b).toBe('x');
  });
});

describe('diffLocales', () => {
  it('clasifica faltantes, extra, iguales y distintas', () => {
    const diff = diffLocales({ a: '1', b: '2' }, { a: '1', b: 'X', c: '3' });
    expect(diff.identical).toEqual(['a']);
    expect(diff.different).toEqual(['b']);
    expect(diff.missing).toEqual([]);
    expect(diff.extra).toEqual(['c']);
  });

  it('detecta claves ausentes', () => {
    expect(diffLocales({ a: '1', b: '2' }, { a: '1' }).missing).toEqual(['b']);
  });
});

describe('auditLocales', () => {
  const base: LocaleTree = { nav: { home: 'Inicio', about: 'Acerca de' }, common: { ok: 'OK' } };

  it('no se queja de un conjunto completo y diferenciado', () => {
    const issues = auditLocales(
      {
        'es-latam': flattenLocale(base),
        'es-es': flattenLocale({ ...base, nav: { home: 'Inicio', about: 'Sobre' } }),
      },
      { minDifferences: 1 },
    );
    expect(issues).toEqual([]);
  });

  it('marca un locale idéntico a su referencia como duplicado', () => {
    const flat = flattenLocale(base);
    const issues = auditLocales({ 'es-latam': flat, 'es-es': { ...flat } }, { minDifferences: 1 });
    expect(issues.map((i) => i.code)).toContain('duplicate-locale');
    expect(issues[0].locale).toBe('es-es');
  });

  it('marca las claves que faltan en un locale', () => {
    const issues = auditLocales(
      {
        'es-latam': flattenLocale(base),
        'es-es': { 'nav.home': 'Inicio' },
      },
      { minDifferences: 0 },
    );
    expect(issues.map((i) => i.code)).toContain('missing-keys');
  });

  it('marca las cadenas vacías', () => {
    const issues = auditLocales(
      {
        'es-latam': { 'nav.home': 'Inicio', 'nav.about': '  ' },
      },
      { minDifferences: 0 },
    );
    expect(issues.map((i) => i.code)).toContain('empty-value');
  });

  it('marca un dialecto por debajo del mínimo de diferencias', () => {
    const issues = auditLocales(
      {
        'en-us': { a: 'Color', b: 'Center', c: 'License', d: 'Same', e: 'Same2' },
        'en-uk': { a: 'Colour', b: 'Center', c: 'Licence', d: 'Same', e: 'Same2' },
      },
      { minDifferences: 5 },
    );
    expect(issues.map((i) => i.code)).toContain('stub-locale');
  });
});

describe('applyDialect', () => {
  it('aplica la ortografía británica en en-uk', () => {
    const tree = { a: 'Change the color', b: 'Center of the page', c: 'Your license' };
    expect(applyDialect(tree, 'en-uk')).toEqual({
      a: 'Change the colour',
      b: 'Centre of the page',
      c: 'Your licence',
    });
  });

  it('respeta la mayúscula inicial', () => {
    expect(applyDialect({ a: 'Color settings' }, 'en-uk')).toEqual({ a: 'Colour settings' });
  });

  it('no toca palabras que contienen el término pero son otra cosa', () => {
    // "size" no debe convertirse en "sise" ni "parameter" en "parametre".
    const tree = { a: 'Adjust the size', b: 'Pass a parameter', c: 'A prize' };
    expect(applyDialect(tree, 'en-uk')).toEqual(tree);
  });

  it('aplica la variante de España en es-es', () => {
    expect(applyDialect({ a: 'Usa tu computadora y tu celular' }, 'es-es')).toEqual({
      a: 'Usa tu ordenador y tu móvil',
    });
  });

  it('no cambia nada cuando el dialecto pedido es la base', () => {
    const tree = { a: 'Change the color' };
    expect(applyDialect(tree, 'en-us')).toEqual(tree);
    expect(applyDialect(tree, 'es-latam')).toEqual(tree);
  });

  it('no muta el árbol original', () => {
    const tree = { a: 'the color' };
    applyDialect(tree, 'en-uk');
    expect(tree.a).toBe('the color');
  });
});
