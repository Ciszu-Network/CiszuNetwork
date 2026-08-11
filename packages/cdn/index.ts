import { assetUrl, encodePath } from './src/cdn-client';

export type AssetType = 'logos' | 'icons' | 'fonts' | 'images' | 'docs' | 'banners' | 'thumbnails' | 'flyers';
export type IconStyle = 'outline' | 'filled' | 'flag';
export type IconFormat = 'svg' | 'png' | 'ai';

export interface ResolveOptions {
  forceCdn?: boolean;
  forceLocal?: boolean;
}

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
  const useLocal = opts?.forceLocal || !cdnUrl;

  const dir = style === 'flag' ? 'flags' : style;
  const path = `shared/icons/${format}/${dir}/${name}.${format}`;

  if (useLocal) {
    return `/${encodePath(path)}`;
  }

  return `${cdnUrl}/${encodePath(path)}`;
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
    if (isAbsoluteUrl(path)) return path;
    const clean = path.replace(/^\//, '');
    const useLocal = opts?.forceLocal || !this.cdnUrl;

    if (useLocal) {
      return `/${encodePath(clean)}`;
    }

    return `${this.cdnUrl}/${encodePath(clean)}`;
  }
}

export const assetResolver = new AssetResolver();

/**
 * Resuelve la URL de cualquier asset del repositorio con estrategia híbrida CDN/local.
 * La ruta debe ser la ruta relativa del repo (ej: "projects/muzicmania/content/logos/...").
 * En producción usa CDN, en desarrollo usa ruta local.
 */
export function resolveAssetPath(path: string, opts?: ResolveOptions): string {
  return assetResolver.resolve(path, opts);
}

export { assetUrl, getContentType } from './src/cdn-client';

/** True si la ruta ya es una URL absoluta (http/https) — no re-resolverla. */
export function isAbsoluteUrl(p: string): boolean {
  return /^https?:\/\//i.test(p);
}

/**
 * Devuelve la lista ordenada de candidatos de ENTREGA (Capa 4) para una ruta
 * de Capa 3 (Sistema de Formatos): por orden de preferencia
 *   [avif, webp, original]  (imagen)  o  [opus, original] (audible)
 * Solo incluye derivadas que existen en el repo (o en CDN en producción).
 *
 * @example
 *   resolveDelivery('projects/muzicmania/content/music/albums/genesis_neon/cover.png')
 *   // -> ['...cover.avif', '...cover.webp', '...cover.png']  (si existen)
 */
export function deliveryVariants(path: string): string[] {
  const clean = path.replace(/^\//, '');
  const ext = clean.split('.').pop()?.toLowerCase() ?? '';
  const base = clean.slice(0, clean.length - ext.length - 1);
  const RASTER = ['png', 'jpg', 'jpeg', 'jpe', 'gif'];
  const candidates = !RASTER.includes(ext) && !['mp3', 'ogg', 'm4a', 'aac'].includes(ext)
    ? []
    : ext === 'gif'
      ? [`${base}.webp`]
      : ext === 'mp3' || ext === 'ogg' || ext === 'm4a' || ext === 'aac'
        ? [`${base}.opus`]
        : [`${base}.avif`, `${base}.webp`];
  return [...candidates, clean];
}

/** Resuelve la mejor URL de entrega (Capa 4) o el original como fallback.
 *   Opcional: pasa un set de nombres de archivo existentes (del CDN) para
 *   filtrar; por defecto devuelve todos los candidatos en orden. */
export function resolveDelivery(path: string, opts?: ResolveOptions): string[] {
  return deliveryVariants(path).map((p) => assetResolver.resolve(p, opts));
}

export const CDN_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public',
  bucket: 'ciszu-cdn',
  projectRef: 'obwzzmbvkrcscqwptlqo',
};