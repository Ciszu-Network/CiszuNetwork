---
description: Abre el panel visual interactivo de Vitest (vitest --ui) en el navegador.
---

Abre el panel visual de Vitest para inspeccionar/ejecutar tests desde el navegador:

1. Lanza el servidor: `pnpm test:ui` (script raíz, sirve en `http://localhost:51204/__vitest__/`).
2. Espera a que diga que está listening y confirma la URL exacta.
3. Avisa al usuario de la URL para que la abra en su navegador.

Si el servidor ya está corriendo (puerto ocupado), confírmalo y da la URL. Nunca matar el proceso por tu cuenta salvo que se pida.