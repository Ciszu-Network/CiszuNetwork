# Historial del Proyecto CiszuBot

## 13 de Noviembre, 2026

- **Top.gg**: denegó la verificación de CiszuBot porque `ciszubot.vercel.app` y su dashboard están caídos por la pausa de Vercel. Reintentar cuando la web esté operativa; el callback OAuth y `DISCORDBOTLIST_TOKEN` siguen pendientes.
- **Vercel**: comprobación externa de las 4 URLs; todas responden HTTP 402 `DEPLOYMENT_DISABLED`. El ecosistema sigue pausado, sin deploy ni validación online.
- Sin cambios funcionales en el bot ni en la web.

## 10 de Noviembre, 2026

- Auditoría documental: fechas de revisión actualizadas y estado sincronizado.
- Sin cambios funcionales en esta sesión; la verificación en Top GG sigue bloqueada por tokens de bot lists.

## 29 de Julio, 2026
- CDN integrado: `@ciszunetwork/cdn` con `resolveIcon()` en icons.ts y useIcon.tsx.
- vercel.json actualizado con `NEXT_PUBLIC_CDN_URL`.
- Build lint verificado.

## 28 de Julio, 2026

### Documentación Completa
- **Documentación reescrita**: Todos los formatos (txt, md, docx, pdf) con contenido real del bot.
- **documentation reestructurados**: Siguiendo el modelo de MuzicMania.
- **public/docs/ creado**: En `website/public/docs/` para distribución.
- **DOCX regenerados**: Re-extraídos de MD actualizados (ya no placeholders de MuzicMania).
- **Shigamens Server**: Documentación especial del servidor de Discord añadida.

### Pendiente
- Implementación del bot en `discord/` (pendiente de crear).

_Última revisión: 13 nov 2026._