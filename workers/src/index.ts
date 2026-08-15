/**
 * Worker de ejemplo para el ecosistema (edge).
 * Simula endpoints serverless en el runtime workerd vía Miniflare/Wrangler.
 * Ver TOOLS_EVALUATION_PLAN §7 para el contexto de preparación.
 */

export interface Env {
  KV_NAMESPACE: KVNamespace;
  SECRET_API_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'ciszu-edge' }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};