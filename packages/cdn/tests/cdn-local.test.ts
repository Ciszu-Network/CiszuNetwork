import { describe, expect, it, vi, afterEach } from 'vitest';
import { encodePath, assetUrl, getContentType } from '../src/cdn-client';
import { resolveIcon, assetResolver, cdnUrl, resolveAssetPath } from '../index';

// Entorno LOCAL (por defecto en dev/test): NODE_ENV === 'test' → sin CDN.

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('encodePath', () => {
  it('codifica espacios y acentos por segmento', () => {
    expect(encodePath('logos/images/not-outline/ciszu logo ñ.svg')).toBe(
      'logos/images/not-outline/ciszu%20logo%20%C3%B1.svg'
    );
  });

  it('conserva los separadores /', () => {
    expect(encodePath('projects/ciszu/content/banner.png')).toBe('projects/ciszu/content/banner.png');
  });

  it('no re-codifica un % suelto (encodeURI por segmento)', () => {
    expect(encodePath('a%20b.txt')).toBe('a%2520b.txt');
  });

  it('codifica espacios en segmentos con sub-delims intactos (encodeURI)', () => {
    // encodeURI codifica espacios/accentos pero deja ! ( ) # sin tocar
    expect(encodePath('logo (copy)!.png')).toBe('logo%20(copy)!.png');
    expect(encodePath('icono#1.svg')).toBe('icono#1.svg');
  });
});

describe('assetUrl', () => {
  it('usa el bucket por defecto si NEXT_PUBLIC_CDN_URL no está', () => {
    expect(assetUrl('logos/x.png')).toBe(
      'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/logos/x.png'
    );
  });

  it('usa la base configurada y codifica la ruta', () => {
    vi.stubEnv('NEXT_PUBLIC_CDN_URL', 'https://cdn.foo.test');
    expect(assetUrl('ruta con acento/logo Ñ.png')).toBe(
      'https://cdn.foo.test/ruta%20con%20acento/logo%20%C3%91.png'
    );
  });

  it('elimina la barra inicial de la ruta', () => {
    vi.stubEnv('NEXT_PUBLIC_CDN_URL', 'https://cdn.foo.test');
    expect(assetUrl('/con/slash.png')).toBe('https://cdn.foo.test/con/slash.png');
  });
});

describe('getContentType', () => {
  it('mapea extensiones conocidas', () => {
    expect(getContentType('a.svg')).toBe('image/svg+xml');
    expect(getContentType('a.png')).toBe('image/png');
    expect(getContentType('a.jpg')).toBe('image/jpeg');
    expect(getContentType('a.webp')).toBe('image/webp');
    expect(getContentType('a.mp4')).toBe('video/mp4');
    expect(getContentType('a.mp3')).toBe('audio/mpeg');
    expect(getContentType('a.pdf')).toBe('application/pdf');
    expect(getContentType('a.json')).toBe('application/json');
  });

  it('ignora mayúsculas en la extensión', () => {
    expect(getContentType('a.PNG')).toBe('image/png');
    expect(getContentType('a.Svg')).toBe('image/svg+xml');
  });

  it('devuelve octet-stream para extensiones desconocidas', () => {
    expect(getContentType('a.xyz')).toBe('application/octet-stream');
    expect(getContentType('sin extension')).toBe('application/octet-stream');
  });
});

describe('resolveIcon (modo local/dev)', () => {
  it('resuelve a ruta local por defecto en dev', () => {
    expect(resolveIcon('home')).toBe('/shared/icons/svg/outline/home.svg');
  });

  it('usa el directorio flags para estilo flag', () => {
    expect(resolveIcon('es', 'flag')).toBe('/shared/icons/svg/flags/es.svg');
  });

  it('soporta formato png', () => {
    expect(resolveIcon('home', 'outline', 'png')).toBe('/shared/icons/png/outline/home.png');
  });

  it('forceCdn sin CDN configurado cae a local', () => {
    expect(resolveIcon('home', 'outline', 'svg', { forceCdn: true })).toBe('/shared/icons/svg/outline/home.svg');
  });
});

describe('AssetResolver / resolveAssetPath (modo local/dev)', () => {
  it('resuelve rutas relativas locales', () => {
    expect(assetResolver.resolve('projects/ciszu/content/banner.png')).toBe(
      '/projects/ciszu/content/banner.png'
    );
  });

  it('codifica rutas con espacios', () => {
    expect(assetResolver.resolve('logos/images/not-outline/logo con copy.png')).toBe(
      '/logos/images/not-outline/logo%20con%20copy.png'
    );
  });

  it('quita la barra inicial', () => {
    expect(resolveAssetPath('/con/slash.png')).toBe('/con/slash.png');
  });
});

describe('cdnUrl', () => {
  it('prefija el tipo de asset contra el CDN (assetUrl siempre usa base)', () => {
    // cdnUrl delega en assetUrl, que siempre devuelve URL absoluta (base
    // por defecto o NEXT_PUBLIC_CDN_URL) aunque el resto del resolver sea local.
    expect(cdnUrl('logos', 'a/b.png')).toBe(
      'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/logos/a/b.png'
    );
    expect(cdnUrl('icons', 'x.svg')).toBe(
      'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/icons/x.svg'
    );
  });
});