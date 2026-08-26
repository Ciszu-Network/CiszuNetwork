# Ciszuko Antony — Backend y Schema de Base de Datos

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: BACKEND_SCHEMA_ciszukoantony_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Backend y esquema de Ciszuko Antony.

---


## 1. Backend

- RSC server + API routes + Supabase (ciszunetwork (auth/profiles)).
- RSC server + API routes (verify-turnstile, puck/save) + Supabase

## 2. Schema: ciszunetwork (auth/profiles)

Tablas:

- `auth.users`
- `profiles`

## 3. RLS y seguridad

- RLS: perfiles publicos de lectura, edicion solo del dueno
- `SECURITY DEFINER` solo en triggers; preferir INVOKER con search_path.
- Rate limit en POST; parametrizacion; sin secretos en codigo.

## 4. Funciones / RPC

- RPC de escritura (ej. `submit_game_score` en MuzicMania), policies por comando.

## 5. Migraciones

- SQL en `services/supabase/migrations/`, aplicadas con `scripts/apply-migration-XX.js`.

---
_Ultima revision: 2026-08-26_. Relacionado: DB_SYSTEM, ORM_SYSTEM, SECURITY_PROTOCOLS.
