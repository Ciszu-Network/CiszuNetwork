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

- RLS activo; `scores` es solo lectura desde el navegador. El resultado se envía a `/api/scores/submit` con una sesión de partida de un solo uso; la API llama `submit_game_score_as` como `service_role`.
- `SECURITY DEFINER` solo donde está justificado (triggers y RPC de puntuación con `search_path` fijo); preferir INVOKER en el resto.
- Rate limit en POST; parametrizacion; sin secretos en codigo.

## 4. Funciones / RPC

- RPC de escritura (ej. `submit_game_score_as` en MuzicMania) ejecutada solo por `service_role`; el cliente no puede invocarla directamente.
- `score_sessions` registra una sesión por partida (usuario, track, dificultad, expiración y consumo).

## 5. Migraciones

- SQL en `services/supabase/migrations/`, aplicadas con `scripts/apply-migration-XX.js`.

---
_Ultima revision: 10 nov 2026_. Relacionado: DB_SYSTEM, ORM_SYSTEM, SECURITY_PROTOCOLS.
