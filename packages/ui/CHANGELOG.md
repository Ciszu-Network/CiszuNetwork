# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/ui-v1.0.0...ui-v1.1.0) (2026-10-10)


### Features

* **anticheat:** fases 3-6 - estado de cuenta (AccountStatusPanel con roadmap/strikes/cards/sanciones/historial) en las 4 webs, apelaciones (SanctionAppeal + API + /appeal en las 4), avisos por email con marca y roadmap del doc actualizado ([dc45021](https://github.com/Ciszu-Network/CiszuNetwork/commit/dc45021c289b6201f0a1bc67757460f8c36faa44))
* **brands:** iconos reales de marcas en About y Curriculum - BrandCard con barras degradadas, porcentajes y tags (herramientas, navegadores, IA, plataformas) ([c3da16f](https://github.com/Ciszu-Network/CiszuNetwork/commit/c3da16f5cb0dcd62c7216626f037f44e65654593))
* **cuenta:** Video y voz sincronizado con el juego (muzicmania) y canal SMS preparado (telefono + sms_enabled + sendSms) ([b61711b](https://github.com/Ciszu-Network/CiszuNetwork/commit/b61711b8758e2db6e649c089f16da9adc7746219))
* **cv:** curriculum mejorado - SVGs oficiales de lenguajes, modal descarga multi-formato (pdf/pptx/zip/png), CV custom destacado + resumen validado, iconos consistentes, navbar ciszu Courses visible, About fuera de Information, pantalla completa responsiva ([6b3c958](https://github.com/Ciszu-Network/CiszuNetwork/commit/6b3c958feb12ecd5aa29f76906dd246e33973335))
* **emails:** ecosistema completo de emails con marca por web - isotipos SVG inline, plantillas (welcome/notification/sponsorship/accountWarning), preferencias RLS con UI de casillas, patrocinios diarios via cron, y fix del titulo de recovery en Supabase ([b43e7ec](https://github.com/Ciszu-Network/CiszuNetwork/commit/b43e7ec56e73efe10620c544b39ce4f4626ab60a))
* **home:** rediseno con perfil real (chips, datos personales, roles, skills con logos, aspiraciones, intereses, herramientas) + nuevos iconos ([f718b4c](https://github.com/Ciszu-Network/CiszuNetwork/commit/f718b4c1d7bb8da3a7c0d9d8d335b4c04941e94e))
* **seo:** helper SEO compartido (canonical, OG, Twitter, JSON-LD, robots) + sitemaps ampliados + robots con sitemap/GPTBot en las 4 webs ([3b694d7](https://github.com/Ciszu-Network/CiszuNetwork/commit/3b694d7bc47579469609c4b658ef668624383515))
* **settings:** Informacion de la cuenta + Novedades en el panel de cuenta (fase 7) - secciones con datos reales en las 4 webs ([8377f51](https://github.com/Ciszu-Network/CiszuNetwork/commit/8377f511cfe186cc24e1a93ca4de3680ccd2d954))


### Bug Fixes

* **brands:** iconos oficiales de Simple Icons/VectorLogo para herramientas, navegadores e IA (adobe, affinity, capcut, filmora, office, edge, openai) - normalizados a currentColor para heredar el color de la barra en BrandCard ([5588542](https://github.com/Ciszu-Network/CiszuNetwork/commit/55885427e6f45fd37b120f57effc9a7608ebd02c))
* **deps:** sharp 0.35.5 (CVE-2026-96889 librsvg) y next 15.5.27 (cache poisoning SSG/ISR) en las 4 webs + ui ([f8ab276](https://github.com/Ciszu-Network/CiszuNetwork/commit/f8ab27629cf75d4084324d3a29dc1aca6ac6cca0))
* **disclaimers,auth,launcher:** traduccion dinamica de disclaimers (API + cache + backfill), auth Discord corregido (state + secret y DATABASE_URL en Vercel) y rustls 0.23.45 (RUSTSEC-2026-0285) ([1602225](https://github.com/Ciszu-Network/CiszuNetwork/commit/1602225c348d335bef2095d8a03baf36544470bd))
* **i18n:** disclaimer usa el idioma de la web (no del navegador) y se autotraduce al enviar (message_i18n); idioma por defecto de usuarios nuevos = en-US en las 4 webs ([f50b98b](https://github.com/Ciszu-Network/CiszuNetwork/commit/f50b98b91d13e91022cb10bfb0f778672243397b))
