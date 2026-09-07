# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/utils-v1.0.0...utils-v1.1.0) (2026-09-07)


### Features

* conecta logging a Better Stack (transporte logtail/pino) y corrige el worker Miniflare (rutas base) ([fef9191](https://github.com/Ciszu-Network/CiszuNetwork/commit/fef9191a910a10aad36d327fb6ba6645bf0626b4))
* **google:** CSP + env cleanup para GTM/GA4/AdSense; sharp dep + circle_1_yt.webp ([4618c40](https://github.com/Ciszu-Network/CiszuNetwork/commit/4618c40e74ac080d756b0059d3966ec75ca6c9c4))
* migra acceso a BD a Drizzle en webs y bot (F1) y statsServer a NestJS+Fastify (F2), eliminando supabase-js y express de ciszubot ([f44415f](https://github.com/Ciszu-Network/CiszuNetwork/commit/f44415f90d8960bec31dfc8e7e3576fd24b76a09))
* sistema de caché completo (memoria→Vercel KV→Postgres ciszu) — migración 15, leaderboard MuzicMania via API cacheada, dashboard ciszubot TTL 60s, rate-limit 10/h en webhooks de votos e INCR atómico ([335495f](https://github.com/Ciszu-Network/CiszuNetwork/commit/335495f50765f2c3745a240c42f7bb4d316f7669))


### Bug Fixes

* ciszukoantony CSP, PdfThumbnail fallback y categorias de certificados ([66fb8ce](https://github.com/Ciszu-Network/CiszuNetwork/commit/66fb8ce5ca5d54ec9cbb20c5f03a5bfcb82e40d5))
