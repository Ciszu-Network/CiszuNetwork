# PROJECT_STATE — Estado actual de CiszuGamens

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: PROJECT_STATE_V1.0.0_2026_08_29_ciszugamens

> **Definición**: estado vivo del proyecto CiszuGamens (comunidad gaming / servidor Discord). Se actualiza en cada sesión de trabajo.

---

## Qué funciona ✅

- Servidor Discord activo: https://discord.gg/W3kMtMMj6E
- Discord Bot List: https://discordbotlist.com/servers/ciszugamens
- Content recuperado y normalizado en `content/` (logos, banners, thumbnails, flyers, icons, assets)
- Estructura de carpetas creada (`projects/ciszugamens/`)
- Documentación completa en `docs/documentation/` (ARCHITECTURE, STACK, BRAND, WORKFLOW, DISCORD_SECURITY + protocolos)
- **SERVER_RULES** restaurada en 4 formatos: `docs/{txt,md,docx,pdf}/SERVER_RULES.*`
- Integración con sistema de ads: `source: 'ciszugamens'` en `Ads.tsx` con isotipo y logotipo **reales** de ciszugamens (ya no usa placeholder de ciszu)
- Derivadas de entrega (Capa 4): 146 `.webp` generadas desde los PNG de `content/`
- `upload-cdn.js` y `convert-media.py` incluyen `projects/ciszugamens/content`

---

## Qué falta 🚧

- [ ] Subir content + docs de ciszugamens al CDN (`pnpm cdn:upload`) — **bloqueado**: `SUPABASE_ACCESS_TOKEN` vencido/rotado (401 en Management API)
- [ ] Renombrar duplicados de `content/logos/video/` (114 grupos idénticos entre ramas outline/not-outline y gif/) si se confirma que no son intencionales
- [ ] Landing page web (descartada por ahora — proyecto sin website)

---

## Blockers 🚫

- **CDN**: `SUPABASE_ACCESS_TOKEN` en el vault (`services/supabase/.env`) devuelve HTTP 401 en Management API. Requiere rotar el token (Ciszuko) para poder subir content/docs al bucket `ciszu-cdn`.

---

## Próximos pasos

1. Rotar `SUPABASE_ACCESS_TOKEN` y ejecutar `pnpm cdn:upload` (sube ciszugamens content+docs con upsert)
2. Ejecutar `pnpm cdn:upload -- --prune` para limpiar objetos antiguos del bucket que ya no existen localmente
3. Revisar duplicados de `content/logos/video/` (confirmar si se conservan o se limpian)
4. Documentar la plantilla template `SERVER_RULES` v4.2.0.0 en `DISCORD_SECURITY_PROTOCOLS.md` (hecho)

---

_Última revisión: 01 sep 2026._