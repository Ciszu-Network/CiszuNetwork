# EDUCATION — Estrategias de aprendizaje e investigación

Guía de cómo Ciszu Network (fundador único) aprende, investiga y se mantiene actualizado. Se aplica a desarrollo, diseño, marketing y gestión empresarial.

## Estrategias de investigación eficaz

1. **Empezar por fuentes PRIMARIAS y oficiales** antes que tutoriales genéricos:
   - Documentación oficial de herramientas reales del stack: Next.js, Tailwind, Supabase, Discord.js, Tauri, GitHub, Vercel, Cloudflare, PostHog, Spotify/nowpayments según sistema (ver `TECH_STACK.md`).
   - Repos/CHANGELOGs en GitHub (issues, releases) para versionado real.
2. **Búsquedas dirigidas**: usar `rg` (ripgrep) para explorar código propio; websearch con operadores (`site:`, `lang:es|en`, rangos de fechas) para temas actuales.
3. **Prueba empírica antes de confiar**: el patrón de Ciszu es *verificar con fuentes externas* (curl a prod, queries reales a la BD con `dbvr`, salida del build) y no confiar en el propio estado. Aplicado a decisiones técnicas (lecciones en `AGENTS.md`: ETag de Cloudflare, mimetypes del CDN, 403 del edge Vercel).
4. **Registrar lo aprendido**: las lecciones viven en `AGENTS.md`, `SECURITY_TASKS.md` y los docs de `documentation/` (no en cabezas).

## Cursos y plataformas recomendadas

- **Desarrollo**: freeCodeCamp (ES), Roadmap.sh (roadmaps por rol), The Odin Project, Documentación oficial (ver arriba).
- **Frontend/Next.js**: docs de Next.js + Learn, Vercel Learn, Tailwind CSS docs.
- **BD/Supabase**: Supabase Docs + Guides; SQL reales con `dbvr`.
- **Diseño/marca**: tutoriales de Adobe Illustrator/Photoshop (identidad visual con masters `.ai`/`.psd` propios), teoría de color, tipografía (Geomanist).
- **Música/audio**: producción digital (AV), teoría básica — el ecosistema incluye MuzicMania con música propia.
- **Empresa/finanzas**: cursos de SENIAT (impuestos y facturación VE), SAREN (marcas/registro mercantil), CFA/Market basics — ver docs legales (`COMPANY_REGISTRATION_PLAN.md`, `FREELANCER_TAX_GUIDE.md`).
- **IA/herramientas**: aprendizaje continuo de las herramientas de desarrollo y generación IA usadas (ver `TOOLS.md`, `ANALYTICS_POSTHOG.md`).

## Fuentes de información oficiales (Venezuela y tecnologías)

- SENIAT (tributos/certificación digital): `seniat.gob.ve`
- Registro Mercantil / SAREN: `saren.gob.ve`
- ONIDEX (documentos legales) / identidad
- Sitios oficiales de: Supabase, Vercel, GitHub, Cloudflare, Discord Developers, PostHog, top.gg/discordbotlist, nowpayments.

## Hábito de actualización

- Revisar dependabot (35/36 cerrado, queda glib) y advisories (`pnpm audit --prod`, `trivy`) como parte del ciclo de seguridad.
- Revisar releases de Next.js/Supabase/Discord.js al menos 1×/trimestre para decidir migraciones conscientes (ver `ERRORS_SYSTEM.md` y `CACHING_SYSTEM.md`).

_Última revisión: 11 ago 2026._