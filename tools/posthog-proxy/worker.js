// Cloudflare Worker — reverse proxy para PostHog (sin dominio propio, gratis)
// 1) Cloudflare Dashboard -> Workers & Pages -> Create -> Worker
// 2) Pegar este codigo y Deploy
// 3) Copiar la URL: https://ciszu-posthog.<tu-subdominio>.workers.dev
// 4) En Vercel: NEXT_PUBLIC_POSTHOG_HOST = esa URL (4 proyectos, targets prod+preview+dev)
// 5) En PostHog: Project Settings -> Web Analytics -> Reverse proxy -> activar y poner la URL
//    (el check de Installation Health desaparece)
// 6) Redeploy de las 4 webs (o push del repo)

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/ingest')) {
      const target = new URL('https://us.i.posthog.com');
      target.pathname = url.pathname.replace(/^\/ingest/, '');
      target.search = url.search;
      const headers = new Headers(request.headers);
      headers.set('Origin', 'https://' + url.hostname);
      const res = await fetch(new Request(target, { method: request.method, headers, body: request.body }));
      const out = new Response(res.body, res);
      out.headers.set('Access-Control-Allow-Origin', '*');
      return out;
    }
    return new Response('PostHog proxy: /ingest/* -> us.i.posthog.com', { status: 200 });
  },
};