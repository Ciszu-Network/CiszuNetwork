# Historial del Proyecto Ciszu Network

Este documento registra los hitos importantes, correcciones y evoluciones del monorepo.

## 29 de Julio, 2026

### CDN Unificado y Seguridad de Base de Datos
- **@ciszunetwork/cdn**: Paquete CDN completado con `resolveIcon()` y `AssetResolver` para resolución híbrida CDN/local.
- **Integración en 4 websites**: Todos los websites (ciszunetwork-page, ciszukoantony, muzicmania-next, ciszubot-web) ahora importan `@ciszunetwork/cdn` y usan `resolveIcon()`.
- **upload-cdn.js reescrito**: Subida inteligente al CDN con diff-check (compara tamaño local vs objeto existente, solo sube si cambió).
- **backup-db.js reescrito**: Usa Management API de Supabase + pg_dump para backups automáticos. Script `pnpm db:backup` añadido.
- **Seguridad DB**: 27 advertencias Security Advisor corregidas (funciones a SECURITY INVOKER, permisos anon revocados, initplan wrapping, policies mergeadas).
- **Protección XSS**: `escapeHtml()` implementado en formularios de búsqueda y autenticación.
- **Protección SQLi**: Validación regex en scripts que construyen SQL dinámico.
- **Migraciones 08-10**: Aplicadas con fixes de seguridad y performance advisors.
- **Bucket unificado**: `ciszu-assets`→`ciszu-cdn` en todos los scripts y referencias.

## 28 de Julio, 2026

### Documentación Masiva del Monorepo
- **Reestructuración completa de documentación**: Todos los proyectos recibieron documentación real en todos los formatos (txt, md, docx, pdf).
- **Pipeline de formatos**: Creado pipeline `txt → md → docx → pdf` con scripts automatizados.
- **ia_docs reescritos**: Todos los directorios `ia_docs/` reestructurados siguiendo el modelo de MuzicMania.
- **public/docs/ creado**: Cada website ahora tiene su carpeta `public/docs/` con documentación descargable.

### Proyectos Documentados
- **CiszuNetwork Page**: Documentación completa en `docs/` (raíz).
- **Ciszuko Antony Portfolio**: Documentación en `apps/ciszukoantony/docs/`.
- **MuzicMania**: Documentación completa (proyecto de referencia).
- **CiszuBot**: Documentación en `apps/ciszubot/docs/`.
- **CiszuGamens**: Documentación reescrita con contenido real de comunidad gaming.

### Scripts Creados
- `scripts/txt2md.js` — Conversión de txt a markdown.
- `scripts/md2office.js` — Conversión de md a docx (pandoc).
- `scripts/txt2pdf.py` — Conversión de md a pdf (reportlab).
- `scripts/docx2pdf.ps1` — Conversión de docx a pdf (Word COM).
- `scripts/sync-public-docs.js` — Sincronización de docs a public/docs/.

### Correcciones
- Eliminados archivos temporales de `docs/ia_docs/`.
- Reemplazados junctions rotos en `apps/website/public/` con directorios reales.
- Contenido de MuzicMania reemplazado en `ciszugamens/docs/` con contenido propio.