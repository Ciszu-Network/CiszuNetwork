# MuzicMania — Backend y Schema de Base de Datos

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: BACKEND_SCHEMA_muzicmania_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Backend y esquema de MuzicMania.

---


## 1. Backend

- RSC server + API routes + Supabase (muzicmania).
- RSC + API routes (auth/resolve-username, leaderboard, download/windows, build-status, ping, verify-turnstile) + Supabase RPC

## 2. Schema: muzicmania

Tablas:

- `profiles`
- `scores`
- `tracks`
- `charts`
- `songs`
- `reviews`
- `matches`
- `report_logs`

## 3. RLS y seguridad

- RLS activo; scores insertables con RPC (submit_game_score); perfiles publicos
- `SECURITY DEFINER` solo en triggers; preferir INVOKER con search_path.
- Rate limit en POST; parametrizacion; sin secretos en codigo.

## 4. Funciones / RPC

- RPC de escritura (ej. `submit_game_score` en MuzicMania), policies por comando.

## 5. Migraciones

- SQL en `services/supabase/migrations/`, aplicadas con `scripts/apply-migration-XX.js`.

---
_Ultima revision: 2026-08-26_. Relacionado: DB_SYSTEM, ORM_SYSTEM, SECURITY_PROTOCOLS.
