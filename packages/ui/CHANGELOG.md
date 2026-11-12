# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/ui-v1.0.0...ui-v1.1.0) (2026-11-12)


### Features

* aviso local, auth local y registro con retorno local ([6353054](https://github.com/Ciszu-Network/CiszuNetwork/commit/63530546e6cde2eb847090fb33518c957aa3da02))
* **ciszubot:** redes sociales, encuestas, NSFW e i18n; docs y assets ([d6c0845](https://github.com/Ciszu-Network/CiszuNetwork/commit/d6c08455c0cb4a407e39b42d4491021489d43594))
* **ciszubot:** trivia, confesiones, matrimonio, social y ajustes de checklist ([ae82957](https://github.com/Ciszu-Network/CiszuNetwork/commit/ae829572a0978b242e81f0188c54790c77a3fb9c))
* **contacto:** unificar formularios y tickets de soporte en las cuatro webs ([16fe117](https://github.com/Ciszu-Network/CiszuNetwork/commit/16fe1171400f8a7acb514c77c104057e62ecf651))
* **debug:** whitelist staff, placeholders locales, cheats y editor oficial ([c0c0ecc](https://github.com/Ciszu-Network/CiszuNetwork/commit/c0c0eccc689e78d2030303556204eba43c0d9972))
* **mobile:** header minimo, flotantes adaptativos y layouts responsivos ([3084c61](https://github.com/Ciszu-Network/CiszuNetwork/commit/3084c6119dd002d5c8d39da877e555a3e9d04bbb))
* **perfiles:** completar perfil publico, settings y badges ([0bec49c](https://github.com/Ciszu-Network/CiszuNetwork/commit/0bec49c32b3ddc33a1a22c3a43c97b10f0cb1e96))
* **premium:** activaciones por servidor, cuenta y billing ([58ca5c0](https://github.com/Ciszu-Network/CiszuNetwork/commit/58ca5c06e53605b979d58a32cc8b28eb6f219dd2))
* **premium:** añadir premium propio de Muzicmania y sellos de pago ([02a01a5](https://github.com/Ciszu-Network/CiszuNetwork/commit/02a01a5679296a6dc18eaf6b2d018a711b1311cf))
* **premium:** planes, facturacion, terminos y fixes de seguridad ([7eb83ce](https://github.com/Ciszu-Network/CiszuNetwork/commit/7eb83ce5c78115eccb04b6b0204f3a95e3623c5f))
* **search:** componente compartido SiteSearch (filtros por categoria multicheck, orden asc/desc, paginas en fila horizontal, usuarios en mosaico con avatar y boton de perfil, @ fuerza usuarios) integrado en el buscador de ciszubot + fix item 7: canvas del juego con aspect-ratio fijo (object-fit contain) para que las flechas no se distorsionen al alternar fullscreen ([a7a1fd3](https://github.com/Ciszu-Network/CiszuNetwork/commit/a7a1fd39d3a00fcf733b87b90d82bfdece98f9c7))
* **ui:** busqueda de usuarios, perfiles publicos e iconos del dashboard ([79bbea0](https://github.com/Ciszu-Network/CiszuNetwork/commit/79bbea0c29aa32a6244be33328e439a44334fbd9))


### Bug Fixes

* **ciszubot:** iconos del dashboard corregidos (registry regenerado con la lista completa: 321 iconos - calculator/lightbulb/chart-pie/gavel/handshake/terminal/etc ya no caen al CDN roto) + seccion separada de Confesiones (canal) + manager de Comandos personalizados en el dashboard (listar/crear/borrar via API con limites 5 free/ilimitado premium y sin colisiones) ([c1fe7f6](https://github.com/Ciszu-Network/CiszuNetwork/commit/c1fe7f667c8a4deb121a34576e7fbcbca0d81109))
* **deps:** actualizacion de seguridad - next 15.5.28 (RCE Image Optimization SVG + DoS Server Actions), @sentry/nextjs 10.75.2 (bypass tunnel), storybook 10.6.2 (code injection preview/dev server), vitest 5.0.5/4.1.12 y @vitest/mocker/@vitest/ui parcheados, fastify 5.12.6 (header validation) - pnpm audit prod: 0 vulnerabilidades ([cc726d7](https://github.com/Ciszu-Network/CiszuNetwork/commit/cc726d78f009ef5dea68f1f503bade6293ffeba3))
* reducir consumo de vercel y pausar reintentos ([db63cde](https://github.com/Ciszu-Network/CiszuNetwork/commit/db63cde723fee59679c32f763123992e0c7d4fdf))
* **seguridad:** scores server-side, launcher sin tokens y actualizaciones ([ab8037d](https://github.com/Ciszu-Network/CiszuNetwork/commit/ab8037ddf0592834012eef214511a7571d161a15))
* **webs:** seccion Ciszunetwork traducida es/en en el componente compartido (titulo/descripcion/botones auto-detectan idioma) + muzicmania es traducido en su dict + botones 'Ver proyectos' corregidos a Ayuda en muzicmania y ciszubot (evita 404) + pixi.js/unsafe-eval importado (fix Sentry MUZICMANIA-15 al cambiar de engine) ([5b6edff](https://github.com/Ciszu-Network/CiszuNetwork/commit/5b6edffc1c938a7766cd907f2f9bf65910dc51bf))


### Performance Improvements

* **ads:** registrar impresiones directo en supabase ([6fe4763](https://github.com/Ciszu-Network/CiszuNetwork/commit/6fe47632eb426bdcb9267191464ccbbe591b27db))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @ciszunetwork/cdn bumped to 1.0.1
