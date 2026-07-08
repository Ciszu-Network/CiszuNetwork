const CDN_BASE = 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public';

type AssetType = 'logos' | 'icons' | 'fonts' | 'images' | 'docs' | 'banners' | 'thumbnails' | 'flayers';

const CRITICAL_ASSETS: Record<string, string[]> = {
  logos: ['isotipo.svg', 'logotipo.svg', 'tagline_black.svg', 'tagline_white.svg'],
  icons: ['favicon.ico'],
};

export function cdnUrl(type: AssetType, path: string): string {
  return `${CDN_BASE}/ciszu-assets/${type}/${path}`;
}

export function getCiszAsset(type: AssetType, filename: string): string {
  const isCritical = CRITICAL_ASSETS[type]?.includes(filename);

  if (isCritical && typeof window !== 'undefined') {
    const localUrl = `/${type}/${filename}`;
    const img = new Image();
    img.src = localUrl;
    return localUrl;
  }

  return cdnUrl(type, filename);
}

export const CDN_CONFIG = {
  baseUrl: CDN_BASE,
  bucket: 'ciszu-assets',
  projectRef: 'obwzzmbvkrcscqwptlqo',
};
