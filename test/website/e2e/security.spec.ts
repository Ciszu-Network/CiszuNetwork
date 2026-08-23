import { expect, test } from '@playwright/test';

/**
 * Security E2E — capa DAST interactiva sobre las 4 webs en producción.
 *
 * Verifica (sin navegador, vía HTTP):
 *  1. Cabeceras de seguridad HTTP del middleware (nosniff, referrer, HSTS).
 *  2. No reflejo de payloads XSS/SQLi en respuestas.
 *  3. No 500s al inyectar payloads (el server no crasha).
 *  4. Paths típicos de escáneres (/.env, /.git, /wp-admin…) → 404, no exposición.
 *
 * Complementa el sensor IAST runtime: aquí se prueban los payloads de forma
 * externa (DAST); en producción el middleware emite [IAST] con los mismos.
 */

/**
 * El flight data de Next.js (App Router) serializa en `self.__next_f.push(...)`
 * el estado del router de la petición, incluida la URL con su query DECODICADO.
 * Eso hace que un payload de prueba aparezca literal en el HTML aunque el server
 * NO lo refleje como contenido renderizado (falso positivo de DAST). Estos
 * bloques se eliminan antes de chequear reflejo.
 */
function stripFlightData(html: string): string {
  let out = html;
  // Iterar hasta estabilizar: un replace único puede dejar variantes del bloque
  // (atributos/espacios distintos) y falsear el chequeo de reflejo del DAST.
  let prev = '';
  while (prev !== out) {
    prev = out;
    out = out.replace(/<script[^>]*>self\.__next_f[\s\S]*?<\/script\s*>/gi, '');
  }
  return out;
}

const SITES = {
  ciszunetwork: 'https://ciszunetwork.vercel.app',
  ciszukoantony: 'https://ciszukoantony.vercel.app',
  ciszubot: 'https://ciszubot.vercel.app',
  muzicmania: 'https://muzicmania.vercel.app',
} as const;

const REQUIRED_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000',
  'content-security-policy': "default-src 'self'",
};

test('cabeceras de seguridad HTTP presentes en las 4 webs', async ({ request }) => {
  // El middleware se despliega con el push; en CI puede tardar hasta 180s.
  test.setTimeout(240_000);
  for (const [name, url] of Object.entries(SITES)) {
    // El edge de Vercel responde 403/429 transitorios con ráfagas de requests:
    // reintentar con backoff creciente antes de declarar fallo.
    let res = await request.get(url);
    for (let i = 0; i < 5 && res.status() === 403; i++) {
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
      res = await request.get(url);
    }
    expect(res.status() < 500, `${name}: ${url} → HTTP ${res.status()}`).toBeTruthy();
    for (const [header, expected] of Object.entries(REQUIRED_HEADERS)) {
      const value = res.headers()[header] ?? '';
      // El middleware se despliega con el push. En CI, esperar hasta que el
      // deploy de Vercel termine (máx 180s); en local fallar rápido.
      if (!value.toLowerCase().includes(expected) && process.env.CI) {
        let ok = false;
        for (let i = 0; i < 18 && !ok; i++) {
          await new Promise((r) => setTimeout(r, 10000));
          const retry = await request.get(url);
          ok = (retry.headers()[header] ?? '').toLowerCase().includes(expected);
        }
        expect(
          ok,
          `${name}: falta cabecera ${header} (¿deploy pendiente?)`
        ).toBeTruthy();
      } else {
        expect(
          value.toLowerCase().includes(expected),
          `${name}: falta cabecera ${header}=${value || '(ausente)'} (requiere deploy del middleware)`
        ).toBeTruthy();
      }
    }
  }
});

const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '"><svg onload=alert(1)>',
];

const SQLI_PAYLOADS = [
  "' OR 1=1 --",
  "' UNION SELECT 1,2,3 --",
  "'; DROP TABLE users; --",
];

const COMMON_ENDPOINTS = [
  '/',
  '/robots.txt',
  '/.env',
  '/.git/config',
  '/.aws/credentials',
  '/wp-admin/',
  '/.htaccess',
  '/admin.php',
  '/phpinfo.php',
  '/config.json',
  '/docker-compose.yml',
  '/../etc/passwd',
];

test('payloads XSS no se reflejan en la respuesta', async ({ request }) => {
  for (const [name, url] of Object.entries(SITES)) {
    for (const payload of XSS_PAYLOADS) {
      const res = await request.get(`${url}/?q=${encodeURIComponent(payload)}`);
      const body = stripFlightData(await res.text());
      expect(
        body.includes(payload),
        `${name}: payload XSS reflejado (${payload})`
      ).toBeFalsy();
    }
  }
});

test('payloads SQLi no producen errores ni reflejo', async ({ request }) => {
  for (const [name, url] of Object.entries(SITES)) {
    for (const payload of SQLI_PAYLOADS) {
      const res = await request.get(`${url}/buscar?q=${encodeURIComponent(payload)}`);
      expect(
        res.status() < 500,
        `${name}: SQLi causó 5xx (${res.status()})`
      ).toBeTruthy();
      const body = stripFlightData(await res.text());
      expect(
        body.includes(payload),
        `${name}: payload SQLi reflejado (${payload})`
      ).toBeFalsy();
    }
  }
});

test('paths de escáneres no exponen ficheros (404 o contenido inocuo)', async ({ request }) => {
  for (const [name, url] of Object.entries(SITES)) {
    for (const endpoint of COMMON_ENDPOINTS) {
      const res = await request.get(`${url}${endpoint}`);
      const status = res.status();
      const body = await res.text();
      const leaked =
        (endpoint.includes('.env') && body.includes('NEXT_PUBLIC')) ||
        (endpoint.includes('.git') && body.includes('ref:')) ||
        (endpoint.includes('passwd') && body.includes('root:'));
      expect(
        leaked,
        `${name}: ${endpoint} expuso contenido sensible (HTTP ${status})`
      ).toBeFalsy();
    }
  }
});

test('POST mutante a /api/votes del bot: 401/400/429, nunca 500', async ({ request }) => {
  // El bot expone /api/votes (top.gg webhook) — debe rechazar peticiones inválidas.
  const res = await request.post(`${SITES.ciszubot}/api/votes`, {
    data: { user: '1', vote: true },
  });
  expect(res.status() < 500, `HTTP ${res.status()}`).toBeTruthy();
});
