---
description: Detiene el server headless de opencode en 127.0.0.1:7777.
---

Detiene el server headless de Ciszu-AI (`127.0.0.1:7777`) — lo apaga por completo (tareas programadas y conexiones se desconectan).

1. Ejecuta: `ciszu-ai-stop` (o `call "C:\Users\fplay\ciszu-ai\ciszu-ai.cmd" stop` si falla el PATH).
2. Verifica que el puerto ya no escucha: `Get-NetTCPConnection -LocalPort 7777 -State Listen` (no debe dar resultados). En Linux: `ss -ltnp | grep 7777` (sin salida).
3. Reporta el PID detenido.

**Linux** (dentro del perfil `ciszu`): `ciszu-ai stop` y verifica con
`ciszu-ai status` o `ss -ltnp | grep 7777` (sin salida).