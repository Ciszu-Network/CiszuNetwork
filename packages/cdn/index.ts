import { assetUrl } from './src/cdn-client';

export type AssetType = 'logos' | 'icons' | 'fonts' | 'images' | 'docs' | 'banners' | 'thumbnails' | 'flayers';
export type IconStyle = 'outline' | 'filled' | 'flag';
export type IconFormat = 'svg' | 'png' | 'ai';

export interface ResolveOptions {
  forceCdn?: boolean;
  forceLocal?: boolean;
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

/**
 * Construye una URL de CDN para un asset genérico.
 * La ruta relativa del repo se refleja 1:1 en el CDN.
 */
export function cdnUrl(type: AssetType, path: string): string {
  return assetUrl(`${type}/${path}`);
}

/**
 * Resuelve la URL de un icono con estrategia híbrida local/CDN.
 *
 * En producción usa CDN por defecto, en desarrollo usa rutas locales.
 * Se puede forzar con forceCdn/forceLocal.
 *
 * @param name     Nombre del icono (ej: 'home', 'projects')
 * @param style    Estilo: 'outline' | 'filled' | 'flag'
 * @param format   Formato: 'svg' | 'png' | 'ai'
 * @param opts     Opciones de resolución
 */
export function resolveIcon(
  name: string,
  style: IconStyle = 'outline',
  format: IconFormat = 'svg',
  opts?: ResolveOptions
): string {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  const useLocal = opts?.forceLocal || (!opts?.forceCdn && !isProduction);

  const path = `shared/icons/${format}/${style}/${name}.${format}`;

  if (useLocal || !cdnUrl) {
    return `/${path}`;
  }

  return `${cdnUrl}/${path}`;
}

/**
 * Clase para resolución genérica de assets (no iconos).
 * Usa la misma estrategia híbrida que resolveIcon.
 */
export class AssetResolver {
  private cdnUrl: string | undefined;

  constructor() {
    this.cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  }

  resolve(path: string, opts?: ResolveOptions): string {
    const useLocal = opts?.forceLocal || (!opts?.forceCdn && !isProduction);

    if (useLocal || !this.cdnUrl) {
      return `/${path.replace(/^\//, '')}`;
    }

    return `${this.cdnUrl}/${path.replace(/^\//, '')}`;
  }
}

export const assetResolver = new AssetResolver();

/**
 * Resuelve la URL de cualquier asset del repositorio con estrategia híbrida CDN/local.
 * La ruta debe ser la ruta relativa del repo (ej: "apps/muzicmania/content/logos/...").
 * En producción usa CDN, en desarrollo usa ruta local.
 */
export function resolveAssetPath(path: string, opts?: ResolveOptions): string {
  return assetResolver.resolve(path, opts);
}

export { assetUrl, getContentType } from './src/cdn-client';

export const CDN_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public',
  bucket: 'ciszu-cdn',
  projectRef: 'obwzzmbvkrcscqwptlqo',
};