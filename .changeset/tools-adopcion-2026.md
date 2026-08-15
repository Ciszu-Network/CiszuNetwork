---
"@ciszu/ui": minor
"@ciszunetwork/utils": minor
---

Adopción de herramientas del plan TOOLS_EVALUATION_PLAN:

- **@ciszu/ui**: Radix UI primitives + `Modal` accesible (Dialog con focus trap,
  teclado y scroll-lock); `'use client'` en `ZoomWarning`/`ScrollSpy`.
- **@ciszunetwork/utils**: subpath exports nuevos `logger` (pino, server-only),
  `schema` (TypeBox JSON-Schema) y `effect` (retries tipados con backoff). Se
  exponen por subpath para no cargar dependencias pesadas en los middlewares
  de las webs (edge runtime).