# Ciszu Network — Backend y Schema de Base de Datos

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: BACKEND_SCHEMA_GLOBAL_SYSTEM_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Backend y esquema global de los 3 schemas.

---


## 1. Backend

- RSC server + API routes + Supabase (ciszunetwork + ciszubot + muzicmania).
- Cada web tiene su schema; RLS obligatorio.

## 2. Schema: ciszunetwork + ciszubot + muzicmania

Tablas:

- `global_announcements`
- `global_announcement_settings`
- `global_announcement_deliveries`
- `announcement_reads`
- `staff_members`
- `pages (Puck)`
- `auth.users`
- `profiles`
- `guild_settings`
- `economy`
- `levels`
- `log_config`
- `warnings`
- `announcements`
- `profiles`
- `scores`
- `tracks`
- `charts`
- `songs`
- `reviews`
- `matches`
- `report_logs`

## 3. RLS y seguridad

- RLS activo; entregas de anuncios con policies por site; staff_members para emisores verificados
- `SECURITY DEFINER` solo en triggers; preferir INVOKER con search_path.
- Rate limit en POST; parametrizacion; sin secretos en codigo.

## 4. Funciones / RPC

- RPC de escritura (ej. `submit_game_score` en MuzicMania), policies por comando.

## 5. Migraciones

- SQL en `services/supabase/migrations/`, aplicadas con `scripts/apply-migration-XX.js`.

---
_Ultima revision: 2026-08-26_. Relacionado: DB_SYSTEM, ORM_SYSTEM, SECURITY_PROTOCOLS.
