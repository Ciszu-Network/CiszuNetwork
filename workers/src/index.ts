/**
 * Worker de ejemplo para el ecosistema (edge).
 * Simula endpoints serverless en el runtime workerd vía Miniflare/Wrangler.
 * Ver TOOLS_EVALUATION_PLAN §7 para el contexto de preparación.
 */

export interface Env {
  KV_NAMESPACE: KVNamespace;
  SECRET_API_TOKEN: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ status: 'ok', service: 'ciszu-edge' });
    }

    if (url.pathname === '/' || url.pathname === '/favicon.ico') {
      return json({ status: 'ok', service: 'ciszu-edge', routes: ['/health'] });
    }

    return json({ status: 'error', message: 'Not found' }, 404);
  },
};