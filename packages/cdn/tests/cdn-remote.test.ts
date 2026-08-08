import { vi } from 'vitest';
import { describe, expect, it } from 'vitest';

// Entorno CDN: se stubea el entorno ANTES de importar el módulo (top-level await),
// porque index.ts captura isProduction y el cdnUrl del AssetResolver en el import.
vi.stubEnv('NEXT_PUBLIC_CDN_URL', 'https://cdn.example.test');
vi.stubEnv('VERCEL', '1');

const { resolveIcon, resolveAssetPath, assetResolver, cdnUrl, assetUrl, CDN_CONFIG } = await import('../index');

const CDN = 'https://cdn.example.test';

describe('resolveIcon (modo CDN/producción)', () => {
  it('usa el CDN por defecto en producción', () => {
    expect(resolveIcon('home')).toBe(`${CDN}/shared/icons/svg/outline/home.svg`);
  });

  it('soporta estilo flag y formato png', () => {
    expect(resolveIcon('es', 'flag', 'png')).toBe(`${CDN}/shared/icons/png/flags/es.png`);
  });

  it('forceLocal gana sobre el modo CDN', () => {
    expect(resolveIcon('home', 'outline', 'svg', { forceLocal: true })).toBe(
      '/shared/icons/svg/outline/home.svg'
    );
  });

  it('codifica nombres con espacios', () => {
    expect(resolveIcon('mi icono')).toBe(`${CDN}/shared/icons/svg/outline/mi%20icono.svg`);
  });
});

describe('AssetResolver / resolveAssetPath (modo CDN)', () => {
  it('resuelve rutas de repositorio contra el CDN', () => {
    expect(assetResolver.resolve('projects/muzicmania/content/logo.png')).toBe(
      `${CDN}/projects/muzicmania/content/logo.png`
    );
  });

  it('quita la barra inicial y codifica', () => {
    expect(resolveAssetPath('/logos/logo con copy.png')).toBe(`${CDN}/logos/logo%20con%20copy.png`);
  });

  it('forceLocal devuelve la ruta local', () => {
    expect(assetResolver.resolve('x.png', { forceLocal: true })).toBe('/x.png');
  });
});

describe('cdnUrl / assetUrl / CDN_CONFIG (modo CDN)', () => {
  it('cdnUrl prefija el tipo de asset', () => {
    expect(cdnUrl('logos', 'a/b.png')).toBe(`${CDN}/logos/a/b.png`);
  });

  it('assetUrl usa la base del entorno', () => {
    expect(assetUrl('icono.svg')).toBe(`${CDN}/icono.svg`);
  });

  it('CDN_CONFIG usa el baseUrl del entorno', () => {
    expect(CDN_CONFIG.baseUrl).toBe(CDN);
    expect(CDN_CONFIG.bucket).toBe('ciszu-cdn');
  });
});