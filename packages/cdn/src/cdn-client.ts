// Codifica la ruta relativa (espacios, acentos) sin tocar separadores '/' ni
// secuencias %XX ya codificadas. Las rutas del repo tienen espacios
// (ej: 'logos/images/not-outline/...') que rompen preload/img si no se
// codifican: el navegador no coincidía el preload con el src final.
export function encodePath(p: string): string {
  return p
    .split('/')
    .map((seg) => encodeURI(seg))
    .join('/');
}

export function assetUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_CDN_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn';
  return `${base}/${encodePath(path.replace(/^\//, ''))}`;
}

export function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() as string;
  const map: Record<string, string> = {
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    opus: 'audio/opus',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    pdf: 'application/pdf',
    json: 'application/json',
    ico: 'image/x-icon',
  };
  return map[ext] || 'application/octet-stream';
}