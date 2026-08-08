// @vitest-environment happy-dom
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Icon, IconButton, IconList } from '../src/Icon';
import { iconRegistry } from '../src/generated/icon-registry';

const filledOnlyName = Object.keys(iconRegistry.filled ?? {}).find(
  (n) => !iconRegistry.outline?.[n]
);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Icon — inline-first', () => {
  it('renderiza SVG inline para iconos registrados', () => {
    const { container } = render(<Icon name="home" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('home icon');
    expect(svg?.className).toContain('ciszu-icon-home');
    expect(svg?.innerHTML).toContain('<path');
  });

  it('cae al estilo opuesto si el pedido no existe en el registro', () => {
    if (!filledOnlyName) {
      return; // registro sin filled-only: sin caso que probar
    }
    const { container } = render(<Icon name={filledOnlyName} style="outline" />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('Icon — fallback remoto / recall local', () => {
  it('icono no registrado usa <img> hacia la ruta local (dev)', () => {
    const { container } = render(<Icon name="noexiste" />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/shared/icons/svg/outline/noexiste.svg');
    expect(img?.getAttribute('alt')).toBe('noexiste icon');
  });

  it('forceLocal salta el inline incluso para iconos registrados', () => {
    const { container } = render(<Icon name="home" forceLocal />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/shared/icons/svg/outline/home.svg');
  });

  it('en producción usa CDN y al fallar reintenta con la ruta local (recall)', () => {
    vi.stubEnv('NEXT_PUBLIC_CDN_URL', 'https://cdn.example.test');
    vi.stubEnv('VERCEL', '1');
    const { container } = render(<Icon name="noexiste" forceCdn />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toContain('cdn.example.test');

    fireEvent.error(img!);
    expect(img?.getAttribute('src')).toBe('/shared/icons/svg/outline/noexiste.svg');
  });

  it('si falla también la ruta local, oculta el icono (span)', () => {
    const { container } = render(<Icon name="noexiste" forceLocal />);
    const img = container.querySelector('img');
    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();
    const span = container.querySelector('span[aria-label="noexiste icon"]');
    expect(span).not.toBeNull();
  });
});

describe('IconButton / IconList', () => {
  it('IconButton muestra label y lanza onClick', () => {
    const onClick = vi.fn();
    const { container } = render(<IconButton name="home" label="Inicio" onClick={onClick} />);
    const button = container.querySelector('button.ciszu-icon-button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain('Inicio');
    fireEvent.click(button!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('IconList renderiza todos los iconos', () => {
    const { container } = render(<IconList icons={['home', 'search']} />);
    expect(container.querySelectorAll('svg.ciszu-icon-home').length).toBe(1);
    expect(container.querySelectorAll('svg.ciszu-icon-search').length).toBe(1);
  });
});