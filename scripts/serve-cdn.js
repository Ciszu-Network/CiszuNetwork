// ============================================================================
// serve-cdn.js — CDN local (offline) para desarrollo
//
// Sirve el ROOT del monorepo sobre HTTP en el puerto 8788, reflejando 1:1 las
// rutas del repo igual que lo hace Supabase Storage en produccion:
//   NEXT_PUBLIC_CDN_URL  ->  http://localhost:8788
//   resolveAssetPath('projects/ciszu/content/logos/...')
//       -> http://localhost:8788/projects/ciszu/content/logos/...  (archivo local)
//
// Requisitos: Node >= 20. Sin dependencias externas.
// Uso:  pnpm cdn:serve     (o: node scripts/serve-cdn.js [--port N])
// ============================================================================

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : 8788);

// MIME map basado en getContentType() de @ciszunetwork/cdn (sin deps).
function getContentType(filename) {
  const ext = String(filename).split('.').pop().toLowerCase();
  const map = {
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    ico: 'image/x-icon',
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
    md: 'text/markdown; charset=utf-8',
    txt: 'text/plain; charset=utf-8',
  };
  return map[ext] || 'application/octet-stream';
}

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(body);
}

function resolveSafe(rawPath) {
  try {
    const decoded = decodeURIComponent(rawPath);
    const rel = decoded.replace(/^[\\/]+/, '');
    const abs = path.resolve(ROOT, rel);
    if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null; // path traversal
    return abs;
  } catch {
    return null;
  }
}

// Fallback de ENTREGA (Capa 4): en dev el repo local no tiene las variantes
// derivadas (.avif/.webp/.opus) que sí existen en el CDN de producción. Cuando
// se pide una variante que no existe en disco, se sirve el ORIGINAL de la misma
// base (.png/.jpg/.jpeg/.gif/.mp3/.ogg/.wav...). Es lo que haría un CDN real con
// transformación de imágenes, y evita 404 en las webs en localhost.
function resolveDeliveryFallback(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const DELIVERY = { '.avif': ['.png', '.jpg', '.jpeg', '.gif'], '.webp': ['.png', '.jpg', '.jpeg', '.gif'], '.opus': ['.mp3', '.ogg', '.wav', '.m4a'] };
  const targets = DELIVERY[ext];
  if (!targets) return null;
  const base = absPath.slice(0, absPath.length - ext.length);
  for (const t of targets) {
    const cand = base + t;
    if (fs.existsSync(cand)) return cand;
  }
  return null;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method not allowed');
    return;
  }

  const abs = resolveSafe(req.url.split('?')[0]);
  if (!abs) {
    send(res, 400, 'Bad path');
    return;
  }

  fs.stat(abs, (err, stats) => {
    if (err || !stats.isFile()) {
      const fallback = resolveDeliveryFallback(abs);
      if (!fallback) {
        send(res, 404, `Not found: ${req.url}`);
        return;
      }
      fs.stat(fallback, (err2, stats2) => {
        if (err2 || !stats2.isFile()) {
          send(res, 404, `Not found: ${req.url}`);
          return;
        }
        const type = getContentType(fallback);
        const headers = {
          'Content-Type': type,
          'Cache-Control': 'no-cache',
          'Content-Length': stats2.size,
        };
        res.writeHead(200, headers);
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        fs.createReadStream(fallback).pipe(res);
      });
      return;
    }
    const type = getContentType(abs);
    const headers = {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
      'Content-Length': stats.size,
    };
    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(abs).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[cdn-serve] sirviendo el monorepo desde ${ROOT}`);
  console.log(`[cdn-serve] http://localhost:${PORT}/ (usa como NEXT_PUBLIC_CDN_URL)`);
});