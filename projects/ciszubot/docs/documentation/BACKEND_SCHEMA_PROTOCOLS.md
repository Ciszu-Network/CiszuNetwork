# CiszuBot — Backend y Schema de Base de Datos

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: BACKEND_SCHEMA_ciszubot_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Backend y esquema de CiszuBot.

---


## 1. Backend

- RSC server + API routes + Supabase (ciszubot).
- RSC + API routes (auth/discord, dashboard/:guildId, verify-turnstile) + bot (discord.js)

## 2. Schema: ciszubot

Tablas:

- `guild_settings`
- `economy`
- `levels`
- `log_config`
- `warnings`
- `announcements`

## 3. RLS y seguridad

- RLS activo; datos de guilds solo para el bot (service role) y admin
- `SECURITY DEFINER` solo en triggers; preferir INVOKER con search_path.
- Rate limit en POST; parametrizacion; sin secretos en codigo.

## 4. Funciones / RPC

- RPC de escritura (ej. `submit_game_score` en MuzicMania), policies por comando.

## 5. Migraciones

- SQL en `services/supabase/migrations/`, aplicadas con `scripts/apply-migration-XX.js`.

---
_Ultima revision: 2026-08-26_. Relacionado: DB_SYSTEM, ORM_SYSTEM, SECURITY_PROTOCOLS.
