# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Prioridad Alta — CDN Multimedia
- [ ] **Subir assets multimedia a Supabase Storage** (bucket: ciszu-cdn)
  - [ ] Hacer inventario de assets por proyecto (GIFs, videos, imágenes grandes, música)
  - [ ] Ejecutar `pnpm cdn:upload` con SUPABASE_SERVICE_ROLE_KEY
  - [ ] Verificar subida de assets
- [ ] **Migrar referencias locales a CDN** en cada webpage (fase 2 — assets arbitrarios)
  - [ ] Identificar todas las rutas a assets locales en el código (`/content/`, `/public/images/`, etc.)
  - [ ] Reemplazar con llamadas a `assetResolver.resolve(path)` desde `@ciszunetwork/cdn`
  - [ ] Probar que cada webpage carga assets desde CDN correctamente
- [ ] **Limpiar assets locales del repositorio** después de migración exitosa
  - [ ] Actualizar `.gitignore` para excluir assets migrados
  - [ ] Verificar que el repo pesa menos después de la limpieza

## Prioridad Alta — Estructura
- [ ] **Reestructurar a Turbomonorepo** — Centralizar configuraciones, build cache, dependencias
  - [ ] Unificar configuraciones de TypeScript, Tailwind, ESLint en paquetes compartidos
  - [ ] Configurar remote caching de Turborepo
  - [ ] Optimizar pipeline de build
- [ ] **Centralizar Supabase DB** — Unificar esquemas de base de datos entre proyectos
  - [ ] Migrar esquemas individuales a un proyecto Supabase central
  - [ ] Configurar migraciones compartidas
  - [ ] Unificar políticas RLS

## Prioridad Alta — General
- [ ] Push + deploy de todas las páginas después de CDN
- [ ] Completar GUIDELINES/RULES/ACTA en DOCX y PDF (composición manual)
- [ ] Conectar Supabase Auth en MuzicMania (login/registro real)
- [ ] Implementar bot de Discord (apps/ciszubot/discord-bot/)

## Prioridad Media
- [ ] Implementar MuzicMania versión móvil (apps/muzicmania/mobile/)
- [ ] Añadir framework de tests (Playwright, Vitest)
- [ ] Sistema de leaderboard global en MuzicMania
- [ ] Integración de redes sociales en todos los websites
- [ ] Dashboard de monitoreo del monorepo

## Prioridad Baja
- [ ] Crear shared packages: ui/, config/, utils/
- [ ] Sistema de caché con Redis
- [ ] PWA para websites
- [ ] Traducción completa de todos los websites a inglés
- [ ] Generar instaladores para macOS y Linux (MuzicMania)

## Completado
- [x] CDN integration fase 1: @ciszunetwork/cdn package completado (resolveIcon, AssetResolver, bucket unificado)
- [x] CDN integration fase 2: los 4 websites importan @ciszunetwork/cdn y usan resolveIcon() en icons.ts + useIcon.tsx
- [x] upload-cdn.js reescrito con diff-check (solo sube archivos nuevos/modificados)
- [x] backup-db.js reescrito con Management API + pg_dump, script pnpm db:backup
- [x] 27 Security Advisor warnings corregidos en Supabase (migraciones 08-10)
- [x] Protección XSS + SQL injection implementada
- [x] AGENTS.md actualizado con estado de CDN y seguridad
- [x] Changelog visual en muzicmania website actualizado (PATCH V2.4.0)
- [x] PROJECT_HISTORY.md actualizado en todos los proyectos
- [x] Build + lint verificado para website (ciszunetwork-page) y muzicmania-next
- [x] Documentación completa en todos los formatos (txt → md → docx → pdf)
- [x] ia_docs reestructurados en todos los proyectos (siguiendo modelo MuzicMania)
- [x] public/docs/ creado en todos los websites
- [x] Scripts de automatización de documentación (txt2md, md2office, txt2pdf)
- [x] Pandoc 3.10 + Reportlab instalados
- [x] Contenido real escrito (sin placeholders)
- [x] Pipeline de CI/CD funcionando (GitHub Actions + Vercel)

## Notas
- Push a GitHub: el usuario hace push manualmente (DNS bloquea github.com)
- Archivos especiales (GUIDELINES/RULES/ACTA en DOCX/PDF): edición manual
- Proyecto de referencia para ia_docs: MuzicMania (19 archivos)