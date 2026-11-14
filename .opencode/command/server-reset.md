---
description: Reinicia el server headless de opencode en 127.0.0.1:4096 (detener + garantizar + no adjunta).
---

Reinicia el server headless de Ciszu-AI (`127.0.0.1:4096`): lo detiene si está escuchando y lo vuelve a levantar de forma idempotente (recarga config/plugins del server).

1. Ejecuta: `ciszu-ai-reset` — o si necesitas menos fricción: directamente el flujo `call "C:\Users\fplay\ciszu-ai\ciszu-ai.cmd" reset` (este adjunta sesión al final; usa `server-start`/`server-stop` para control seco).
2. Verifica que responde: `Invoke-WebRequest http://127.0.0.1:4096 -UseBasicParsing`.
3. Reporta el nuevo PID y errores de `.opencode/temp/opencode-server-err.log`.