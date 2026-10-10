# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/utils-v1.0.0...utils-v1.1.0) (2026-10-10)


### Features

* **anticheat:** Fase 2 implementada - motor de senales ponderadas en @ciszunetwork/utils (+8 tests), endpoint /api/anticheat/signals en MuzicMania (auth+rate limit+escalada+sanciones+strikes+estado), hook en el juego y cuenta bot muzicmania_anticheat (rol bot) ([8b6ac6a](https://github.com/Ciszu-Network/CiszuNetwork/commit/8b6ac6aa292b3ff183a1522f2bc3868e9355d31d))
* **cuenta:** Video y voz sincronizado con el juego (muzicmania) y canal SMS preparado (telefono + sms_enabled + sendSms) ([b61711b](https://github.com/Ciszu-Network/CiszuNetwork/commit/b61711b8758e2db6e649c089f16da9adc7746219))
* **emails:** apartado EMAILS (debug) en la devcon - script email-debug.mts (webs x tipos con casillas, global, previsualizar/enviar sin rate limit), plantilla debugEmail y extraHtml; docs actualizadas ([d2255f4](https://github.com/Ciszu-Network/CiszuNetwork/commit/d2255f48cbf022938511fafeeb0be22424f7784f))
* **emails:** doble variante por plantilla en la devcon (real sin etiqueta + devcon con tag) para comparar; auth templates aceptan devcon ([324bfb7](https://github.com/Ciszu-Network/CiszuNetwork/commit/324bfb758b26ce7cfdac441a2d5a4ef864a17418))
* **emails:** ecosistema completo de emails con marca por web - isotipos SVG inline, plantillas (welcome/notification/sponsorship/accountWarning), preferencias RLS con UI de casillas, patrocinios diarios via cron, y fix del titulo de recovery en Supabase ([b43e7ec](https://github.com/Ciszu-Network/CiszuNetwork/commit/b43e7ec56e73efe10620c544b39ce4f4626ab60a))
* **emails:** envio real por Gmail API (OAuth del sistema con gmail.send) como transporte hasta el dominio, con Resend preferido como fallback; credencial del sistema para multi-empleado; flujo OAuth google-oauth-gmail; env vars en Vercel ([c737c5f](https://github.com/Ciszu-Network/CiszuNetwork/commit/c737c5f24ff8ddd9f326198e56d809f788ce89db))
* **emails:** logotipo real de Ciszu Network + isotipo por web en la cabecera (viewBox correcto), generador build-email-sites ampliado ([6f71779](https://github.com/Ciszu-Network/CiszuNetwork/commit/6f71779822d6f0d1adc0a3305bcfd7a99f9247d4))
* **emails:** rediseno UI - logos a color/degradado, iconos de categoria, flecha en boton, codigo C- con boton copiar, redes con color, fondos por web, emisor/receptor, plantillas error y ticket de soporte; devcon envia de verdad con tag devcon y datos por correo ([38cc374](https://github.com/Ciszu-Network/CiszuNetwork/commit/38cc37430314d35161cac6b0591b637f037331df))
* **seo:** helper SEO compartido (canonical, OG, Twitter, JSON-LD, robots) + sitemaps ampliados + robots con sitemap/GPTBot en las 4 webs ([3b694d7](https://github.com/Ciszu-Network/CiszuNetwork/commit/3b694d7bc47579469609c4b658ef668624383515))
* **sms:** soporte Textbelt (gratuito 1/dia) en sendSms + investigacion de proveedores documentada ([4e3f80b](https://github.com/Ciszu-Network/CiszuNetwork/commit/4e3f80bcf6fa76df5c0940eaf3f7e61e83d842a9))


### Bug Fixes

* **emails:** imagenes por CDN (URLs https) en vez de data:URI para que carguen en Gmail/Outlook; rediseno header (logotipo maestro con engranaje + extras por web) y footer (isotipo ciszu x iso web + copyright); C- en azul ([bc3e907](https://github.com/Ciszu-Network/CiszuNetwork/commit/bc3e90752cceb5fceafa145262bb33c79f2b0d71))
* **emails:** logos como data URI (Gmail los muestra sin 'Mostrar imagenes'); wordmark full; escalado uniforme (fitH); crossover X lucide; footer solo-isotipo en ciszu; extras por web (muzicmania isotipo, ciszubot logotipo); mas redes; y overrides pnpm audit (proxy-addr&gt;=2.0.8, source-map-js&gt;=1.2.2) ([cc3a5c6](https://github.com/Ciszu-Network/CiszuNetwork/commit/cc3a5c64f0efb73d1b468a36d871716449c5abd4))
* **emails:** logos reales como PNG embebido (renderizan en Gmail/Outlook) en vez de texto/SVG inline, redes sociales como PNG, y disclaimer de proveedor Supabase (sin dominio propio) ([60313f8](https://github.com/Ciszu-Network/CiszuNetwork/commit/60313f8c374a0c81b7cd5d44e430eb0647c67519))
