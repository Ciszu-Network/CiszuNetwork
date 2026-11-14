---
description: Consulta el estado operativo, métricas y estado semanal sin enviar notificaciones. Uso: /ops [status|digest|report]
---

Comandos de solo lectura (dry-run) sobre la infraestructura:

- `/ops status` → `pnpm ops:status`: webs, Supabase REST y CDN.
- `/ops digest` → `pnpm ops:digest`: cuentas, reseñas, wallets, MuzicMania y bot.
- `/ops report` → `pnpm ops:report`: estado + fallos de GitHub Actions de 7 días.

Reglas:

- No ejecutes los workflows de envío real (`workflow_dispatch`) sin pedirlo.
- No imprimas secretos; los scripts leen `NOTIFY_TOPIC`/`SUPABASE_*` del entorno o vault local.
- Si un sistema está `paused` por Vercel, no lo reportes como caída.
- Para el estado persistente: `ciszu.ops_monitor_state` (solo service_role).
