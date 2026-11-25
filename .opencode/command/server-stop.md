---
description: Detiene el server headless de opencode en 127.0.0.1:7777.
---

Detiene el server headless de Ciszu-AI (`127.0.0.1:7777`) — lo apaga por completo (tareas programadas y conexiones se desconectan).

1. Ejecuta: `ciszu-ai-stop` (o `call "C:\Users\fplay\ciszu-ai\ciszu-ai.cmd" stop` si falla el PATH).
2. Verifica que el puerto ya no escucha: `Get-NetTCPConnection -LocalPort 7777 -State Listen` (no debe dar resultados).
3. Reporta el PID detenido.