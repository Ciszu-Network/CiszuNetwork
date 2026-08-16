---
description: Abre la consola TUI interactiva de pruebas locales (test/website/debug/dev_console.ps1).
---

Abre la consola interactiva de debugging local (`Console Dev Debugging`) para probar las
4 webs en el navegador. Es un TUI de PowerShell navegable con flechas:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test/website/debug/dev_console.ps1
```

Qué permite:
- Encender / reiniciar / detener cada web en su puerto fijo (3000-3003).
- Encender o detener TODAS las webs.
- Estado de puertos y abrir las apps en el navegador.
- Ver logs a tiempo real (ventana PowerShell separada).
- Herramientas extra (limpiar logs, procesos node, ocupación de puertos).
- Ayuda, créditos y versión integrados.

Reglas:
- Este comando abre una sesión interactiva que requiere teclado (flechas + Enter).
  Para automatización usar el comando `/dev` (modo CLI) en su lugar.
- Los logs de las webs viven en `.opencode/temp/dev-logs/`.
- Guía completa: `test/website/debug/dev_console.md`; doc del sistema:
  `DEV_CONSOLE_SYSTEM.md`.