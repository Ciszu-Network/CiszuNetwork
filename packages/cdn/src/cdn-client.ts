export function assetUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_CDN_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn';
  return `${base}/${path.replace(/^\//, '')}`;
}

export function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() as string;
  const map: Record<string, string> = {
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    pdf: 'application/pdf',
    json: 'application/json',
    ico: 'image/x-icon',
  };
  return map[ext] || 'application/octet-stream';
}