# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/ui-v1.0.0...ui-v1.1.0) (2026-10-24)


### Features

* **ads:** aviso dinamico del estado de anuncios (AdStatusNotice) en las 4 webs - detecta consentimiento rechazado, adblocker (deja el modal al guard), anuncios rellenos (se oculta) o sin anuncios (estado real + donacion); auditoria AdSense OK; TODO actualizado ([9ae1d6f](https://github.com/Ciszu-Network/CiszuNetwork/commit/9ae1d6f53eae2fa14b1e7a943598ffb644587a66))
* **analytics:** UPD completo (datos proporcionados por el usuario) - ruta /api/analytics/user-data en las 4 webs (sesion -&gt; sha256(email) -&gt; GA4 Measurement Protocol con user_data) + GoogleScripts empuja user_id y user_data al dataLayer; secrets MP subidos a Vercel ([ba7693f](https://github.com/Ciszu-Network/CiszuNetwork/commit/ba7693ffe3eeb6bce051678882863f711819ce95))
* **analytics:** User-ID GA4 - GoogleScripts empuja user_id al dataLayer cuando hay sesion (DLV + tag GA4 configurados en los 4 contenedores GTM; pendiente publicar version en GTM UI) ([163634b](https://github.com/Ciszu-Network/CiszuNetwork/commit/163634ba290ca8fbd37ededf7986ba8b1c691b59))
* **ciszubot:** pulido del dashboard (save dock, JSON por seccion, guard de salida, bot real, sidebar, disclaimers y modal de login) ([e2ec6d1](https://github.com/Ciszu-Network/CiszuNetwork/commit/e2ec6d145a32aaa9a2cf1a7002ec0ee1aa4cfe7d))
* **search:** componente compartido SiteSearch (filtros por categoria multicheck, orden asc/desc, paginas en fila horizontal, usuarios en mosaico con avatar y boton de perfil, @ fuerza usuarios) integrado en el buscador de ciszubot + fix item 7: canvas del juego con aspect-ratio fijo (object-fit contain) para que las flechas no se distorsionen al alternar fullscreen ([a7a1fd3](https://github.com/Ciszu-Network/CiszuNetwork/commit/a7a1fd39d3a00fcf733b87b90d82bfdece98f9c7))
* **webs:** recaptcha visible con refresh, preferencias del bot (plan/autosave/json), leaderboard privado y ajustes de dashboard ([07a5d47](https://github.com/Ciszu-Network/CiszuNetwork/commit/07a5d473bf6b9dae50d9b6d37cca0de8af3d1d6c))


### Bug Fixes

* **ciszubot:** iconos del dashboard corregidos (registry regenerado con la lista completa: 321 iconos - calculator/lightbulb/chart-pie/gavel/handshake/terminal/etc ya no caen al CDN roto) + seccion separada de Confesiones (canal) + manager de Comandos personalizados en el dashboard (listar/crear/borrar via API con limites 5 free/ilimitado premium y sin colisiones) ([c1fe7f6](https://github.com/Ciszu-Network/CiszuNetwork/commit/c1fe7f667c8a4deb121a34576e7fbcbca0d81109))
* **debug:** bypass de GTM Preview/Tag Assistant en el guard de consentimiento y el AdBlockerGuard - con ?gtm_preview= los scripts de Google se permiten siempre (arregla el 'no conectado' amarillo de Tag Assistant en las webs con cookies rechazadas) ([221e26d](https://github.com/Ciszu-Network/CiszuNetwork/commit/221e26df311038eddd456c405f59f17bbd9a5297))
* **deps:** actualizacion de seguridad - next 15.5.28 (RCE Image Optimization SVG + DoS Server Actions), @sentry/nextjs 10.75.2 (bypass tunnel), storybook 10.6.2 (code injection preview/dev server), vitest 5.0.5/4.1.12 y @vitest/mocker/@vitest/ui parcheados, fastify 5.12.6 (header validation) - pnpm audit prod: 0 vulnerabilidades ([cc726d7](https://github.com/Ciszu-Network/CiszuNetwork/commit/cc726d78f009ef5dea68f1f503bade6293ffeba3))
* **emails+ciszubot:** SMTP de Gmail (App Password) como transporte, plantilla Supabase con iconos y CZ-, logo antony sin estirar, gate Cloudflare off en ciszubot (cubria el FAB) + watchdog ([72f466c](https://github.com/Ciszu-Network/CiszuNetwork/commit/72f466c7299ff35426d3c8c307e5fd36160875be))
* **webs:** seccion Ciszunetwork traducida es/en en el componente compartido (titulo/descripcion/botones auto-detectan idioma) + muzicmania es traducido en su dict + botones 'Ver proyectos' corregidos a Ayuda en muzicmania y ciszubot (evita 404) + pixi.js/unsafe-eval importado (fix Sentry MUZICMANIA-15 al cambiar de engine) ([5b6edff](https://github.com/Ciszu-Network/CiszuNetwork/commit/5b6edffc1c938a7766cd907f2f9bf65910dc51bf))
