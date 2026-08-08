import { describe, expect, it } from 'vitest';
import { getIcon, iconRegistry } from '../src/generated/icon-registry';
import { iconUtils } from '../src/Icon';

describe('iconRegistry (archivo generado)', () => {
  it('contiene outline, filled y flag con entradas', () => {
    for (const style of ['outline', 'filled', 'flag']) {
      expect(Object.keys(iconRegistry[style] ?? {}).length, `style ${style}`).toBeGreaterThan(0);
    }
  });

  it('todas las entradas tienen viewBox e inner no vacíos', () => {
    for (const style of Object.keys(iconRegistry)) {
      for (const [name, entry] of Object.entries(iconRegistry[style])) {
        expect(entry.viewBox.trim(), `${style}/${name} viewBox`).not.toBe('');
        expect(entry.inner.trim(), `${style}/${name} inner`).not.toBe('');
      }
    }
  });

  it('getIcon devuelve entradas conocidas y undefined para desconocidas', () => {
    expect(getIcon('outline', 'home')).toBeDefined();
    expect(getIcon('outline', 'home')?.viewBox).toContain('960');
    expect(getIcon('outline', 'no-existe-xyz')).toBeUndefined();
    expect(getIcon('filled', 'home')).toBeDefined();
  });
});

describe('iconUtils', () => {
  it('iconExists distingue existentes', () => {
    expect(iconUtils.iconExists('home')).toBe(true);
    expect(iconUtils.iconExists('no-existe-xyz')).toBe(false);
  });

  it('getAvailableIcons lista los nombres del estilo', () => {
    const names = iconUtils.getAvailableIcons('outline');
    expect(names).toContain('home');
    expect(names).toContain('search');
  });
});