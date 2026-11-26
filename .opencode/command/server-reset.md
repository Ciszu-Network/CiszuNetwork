---
description: Reinicia el server headless de opencode en 127.0.0.1:7777 (detener + garantizar + no conecta).
---

Reinicia el server headless de Ciszu-AI (`127.0.0.1:7777`): lo detiene si está escuchando y lo vuelve a levantar de forma idempotente (recarga config/plugins del server).

1. Ejecuta: `ciszu-ai-reset` — o si necesitas menos fricción: directamente el flujo `call "C:\Users\fplay\ciszu-ai\ciszu-ai.cmd" reset` (este conecta la sesión al final; usa `server-start`/`server-stop` para control seco).
2. Verifica que responde: `opencode api get /api/info --server http://127.0.0.1:7777` (Basic auth: usuario `opencode` + `OPENCODE_PASSWORD`).
3. Reporta el nuevo PID y errores de `.opencode/temp/opencode-server-err.log`.

**Linux** (dentro del perfil `ciszu`):

```bash
ciszu-ai reset
ciszu-ai status
```