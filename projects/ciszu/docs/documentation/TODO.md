# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Frontend General — estructura y diseño de páginas

**PDWA (Descargas) + Feedback botones flotantes.**

- Arreglar las advertencias al cerrar con X. Actualmente el unico que recive advertencia es uno de los 2. No los 2. Ademas la advertencia se sobre pone , queda mal. Y la informacion es incorrecta, debe indicar que puede reactivar el boton cierta pagina. Solamente eso. Ademas debe tener un contador para indicar que se quitara en 3 segundos. Visualmente.

**Footers de todas las websites**

- Centrar copyrights de footers y dejar espacio debajo. Ademas todo los copyright deben decir helaborado con amor por ciszukoantony, deben tener respaldo por ciszunetwork, y mencionar a la propia pagina, todo con copyright desde 2024 hasta el 2026. Icono oficial de copyrgiht, hipervinculos llamativos a color y funcionales a las paginas.

**Logo favicon error (ciszuko antony y ciszu network websites)**

- Actualmente sigue ocurriendo un error extraño, al cambiar de paginas dentro de una website, el favicon cambia a la version antigua de un archivo ya eliminado del logo de ciszukoantony. Esto ocurre en 2 paginas (ciszukoantony y ciszunetwork) debemos arreglar esto de manera que use ciszunetwork como isotipo con fondo transparente (no el actual que es cuadrada) y ciszukoantony debe usar el icono de perifl de youtube circular (archivo nuevo creado debemos subirlo a cdn) y (actualmente es uno cuadrado)
- Antes existian 3 archivos erroneos en content sin ningun tipo de razon o sentido, ya el CEO lo borro manualmente y recreo correctamente en las rutas reales. Uno de los archivos era el favicon.svg que replicaba el diseño malo antiguo incorrecto.
- Tambien ocurre algo similar al entra con el turnstile de cloudflare, el logo muestra unos segundos el logo de isotipo de ciszukoantony (no el de youtube) lo cual es ta muy mal, deberia ser igual al del favicon arreglado.

**Secciones de páginas fuera de los navbars**

- Aun existen ciertas paginas internas de websites que estan dentro de la seccion de informacion, como descargas o deefback, siempre debe estar afuera.

# Cambios por cada website para pulir errores de frontend (adema de las generales)

Ciszu Netowork Website:

- [ ] Reactualizar los iconos de ciszunetwork isotipo por la z blanca en vez de azul en toda la web. Incluso usando las versiones en degradado.
- [ ] Usar el tagline real (svg no html desde cdn) cada vez que se mencione o se debe usar por ejmplo en home y footer.
- [ ] El menu de hamburguesa debe estar antes del boton de auth, no despues.
- [ ] No hace el boton de togle theme y el boton de idioma en el navbar del header, quitalo.

Ciszuko Antony Website:

- [ ] Centrar el logo del footer con el menu de redes y ademas agregar el icono de perfil de yotube como en el header.

Ciszubot Website:

- [ ] Los iconos del header son muy diferentes a todos los demas paginas, le falta el menu hamburguesa, y mete alli dentro los botones de togle idioma y theme estilo muzicmania o cualquier otra website.
- [ ] El tema de oscuridad debe ser el por defecto al inicio.
- [ ] El boton de invitar debe decir invitar
- [ ] Ciszubot es la unica web con un diseño un poco mas diferente en especial la gui y botones, deben ser mas parecidos al estilo de las demas 3 paginas o usar el mismo.
- [ ] El footer debe agregar el boton de togle theme y idioma parecido a las demas apps.
- [ ] El footer le falta muchas redes sociales (replicar desde ciszunetwork si no existen)
- [ ] Debemos cambiar como funciona los clores del tema, el modo oscuro debe ser mas omoled como muzicmania, y el modo claro es el que mas fallas, el color del fondo del footer y header son diferentes en modo claro, deben ser iguales. Ademas, principalmente no deberia ser oscuros. Cuando cambiamos a modo claro realmente no quiero fondos negros, usa fondo grises o claros y el texto debe ser negro.

# #1 Implementaciones en la infraestructura masiva desde el backend y database

> Plan aprobado 14 ago 2026. Alcance: TODOS los proyectos (webs, bot, packages). Ejecución en
> fases: F1 Drizzle → F2 Ciszubot (exclusivo bot) → F3 herramienta client → F4 Chromatic/runtime → cierre.
>
> Estado: F1, F2, F3 y F4 **completados**. Queda la verificación final + commit (paso "Cierre").

## F1 — Drizzle ORM (ORM oficial, server-side)

- [x] Crear `packages/db/` con `drizzle-orm` + driver `pg` (server-only, sin binarios).
- [x] Definir schemas TS de los 4 esquemas: `ciszubot`, `muzicmania`, `ciszunetwork`, `ciszu`.
- [x] Migrar consumo server-side (API routes, RSC de server components, bot, scripts) a Drizzle.
- [x] Mantener `@supabase/supabase-js` + PostgREST + RLS para el navegador (anon key). El ORM
      nunca se expone al cliente.
- [x] Crear `ORM_SYSTEM.md` + actualizar `DB_SYSTEM.md`, `BACKEND_SYSTEM.md`, `FULL_STACK_SYSTEM.md`.

## F2 — Ciszubot: Express → NestJS+Fastify (exclusivo del bot)

- [x] Mantener el proceso Discord.js en Docker (larga duración; no es una web).
- [x] Reemplazar `statsServer.ts` (Express ^4) por microservicio **NestJS + adaptador Fastify**:
      `GET /api/stats`, `POST /api/update-stats`, `POST /api/votes`, `POST /api/votes/dbl`.
- [x] Lo no-Discord (panel/estado/webhooks) → `ciszubot-website` (Next.js) con API routes +
      lectura de `ciszubot.bot_status` en Supabase.
- [x] Eliminar dependencia `express` del bot.

## F3 — Herramientas client/validación (todos los proyectos)

- [x] **Zod**: validar todos los bodies de API routes que mutan sin validar (usa
      `@ciszunetwork/utils` `parseJsonBody`/`firstZodMessage`). Aplicado a `dashboard`,
      `resolve-username`, `invoice` (además de `verify-turnstile` ya cubierto).
- [x] **Server Actions**: adoptar patrón de escritura en formularios nuevos (feedback, contacto,
      soporte); API routes solo para webhooks/3rd-party.
      _Decisión 14 ago 2026 (YAGNI): los formularios actuales son `mailto:` cliente y el dashboard
      ya valida con Zod. No hay vacío real hoy; documentado para adoptar en formularios nuevos._
- [x] **Storybook**: setup dev-only para documentar `@ciszu/ui` (v10.5.8, stories de Icon/SmartImage).
- [x] **TanStack Query**: incremental — instalar cuando exista feature de datos client dinámico.
      Instalado en `ciszubot-website` (`QueryProvider` + dashboard con `useQuery`/`useMutation`).
- [x] **tRPC / GraphQL**: NO instalar (decisión final). Documentados como opción con disparador
      futuro (API público/multi-cliente/servicio grande). Ver `BACKEND_SYSTEM.md` §19-§20.

## F4 — Chromatic + decisión de runtime (14 ago 2026)

- [x] **Chromatic (Storybook visual testing)**: `chromatic` CLI 18.2 en `@ciszu/ui`; storybook publicado
      (build 1, 5 stories/2 componentes, 5 snapshots). appId `6a7f722e2641a24bc6249782`.
- [x] **Runtime Node vs Bun vs Deno**: documentada decisión en `FULL_STACK_SYSTEM.md` §Runtime —
      se mantiene Node 24 (LTS, soporte oficial Next/Vercel); Bun/Deno descartados para producción.
- [x] **Vault**: `TANSTACK_API_KEY` (submissions TanStack, pendiente revisión) y
      `CHROMATIC_PROJECT_TOKEN` guardados, re-cifrados (crypt+backup+verify OK, 14 ago).

## Cierre / pruebas / publicación

- [ ] `pnpm lint` + `pnpm build` + `pnpm test` (+ `pnpm e2e`) sobre el monorepo completo.
- [ ] Documentación final actualizada y `ORM_SYSTEM.md` creado.
- [ ] Commit descriptivo y push de todo el trabajo.

# #2 Implementaciones en la infraestructura masiva desde el backend y database (Futuro)

- [ ] Investigar si implementar estos servicios sin importar el tiempo que tome, investigar si son grauitos y no se solapan actualmente, teniendo en cuenta que la lista es extensa y muy diversa sin verificar: Logtail / Better Stack o Datadog, Turbopack / Rolldown, TypeBox, PocketHost o Coolify, Miniflare, ArkType, tku / Larvitar / Toolkits de Compilación Nativos (SWC / Rolldown), Temporal, Effect TS, Husky + Lint-Staged, Changesets, Release Please o Auto, Nuqs, Mock Service Worker, SeaQL / SeaORM, Directus, Joy UI / Radix UI (MSW)en los proyectos.
- [x] Investigar mas sobre el ecosistema de storybook, uso para mi con GUI, addons, que es chomatic.
      _Hecho 14 ago 2026: Storybook 10.5.8 instalado en `@ciszu/ui` (GUI en localhost:6006, Controls,
      autodocs, play functions). Chromatic conectado (build 1 publicado, visual testing alojado,
      token en vault). Ver F4._
- [x] Investigar y analizar si debemos de dejar de usar node.js vanilla y pasarnos a bun o deno.
      _Hecho 14 ago 2026: decisión documentada en `FULL_STACK_SYSTEM.md` §Runtime — mantener
      Node 24 (LTS hasta abr 2028, soporte oficial Next/Vercel); Bun/Deno descartados para prod._
