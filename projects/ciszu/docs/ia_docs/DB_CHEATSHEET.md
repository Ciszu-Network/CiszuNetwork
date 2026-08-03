# Cheat-Sheet BD Supabase — Ciszu Network (2 ago 2026)

Consultas útiles por schema. **Siempre con datos reales de producción — solo SELECT si no estás seguro.**

- **DBeaver GUI**: clic derecho en conexión `supabase` → SQL Editor → pegar → Ctrl+Enter
- **CLI (dbvr)**: `dbvr sql -ds=supabase "SELECT ..."`

---

## 🐝 ciszubot — bot de Discord

```sql
-- Estado del bot en vivo (lo usa la web)
SELECT online, last_seen, version, guilds, commands_total, prefix FROM ciszubot.bot_status;

-- Economía: top 10 wallets por balance
SELECT user_id, guild_id, balance, bank FROM ciszubot.wallets ORDER BY balance DESC LIMIT 10;

-- Últimas transacciones
SELECT id, guild_id, user_id, amount, type, note, created_at FROM ciszubot.transactions ORDER BY created_at DESC LIMIT 20;

-- Niveles: top 10 XP
SELECT user_id, guild_id, xp FROM ciszubot.levels ORDER BY xp DESC LIMIT 10;

-- Comandos más usados (últimos 7 días)
SELECT command, count(*) AS veces FROM ciszubot.command_logs WHERE executed_at > now() - interval '7 days' GROUP BY command ORDER BY veces DESC LIMIT 15;

-- Tickets abiertos
SELECT id, guild_id, channel_id, user_id, topic FROM ciszubot.tickets WHERE open = true;

-- Giveaways activos
SELECT id, guild_id, prize, winners, ends_at FROM ciszubot.giveaways WHERE ended = false ORDER BY ends_at;

-- Warns recientes
SELECT id, guild_id, user_id, moderator, reason, created_at FROM ciszubot.warns ORDER BY created_at DESC LIMIT 20;

-- Usuarios con AFK activo
SELECT user_id, guild_id, reason, since FROM ciszubot.afk;

-- Config de un servidor (por guild_id)
SELECT * FROM ciszubot.guild_configs WHERE guild_id = 'TU_GUILD_ID';

-- Snipes recientes
SELECT id, channel_id, user_id, content, deleted_at FROM ciszubot.snipes ORDER BY deleted_at DESC LIMIT 10;

-- Tienda de un servidor
SELECT id, name, price, emoji FROM ciszubot.shop_items WHERE guild_id = 'TU_GUILD_ID' ORDER BY price;
```

---

## 🎵 muzicmania — juego de música

```sql
-- Top 10 leaderboard global (scores)
SELECT id, user_id, track_id, score, accuracy, created_at FROM muzicmania.scores ORDER BY score DESC LIMIT 10;

-- Mejor score de un jugador
SELECT * FROM muzicmania.scores WHERE user_id = 'UUID' ORDER BY score DESC LIMIT 5;

-- Perfil de un usuario (por username)
SELECT id, username, display_name, high_score, level, xp, role, country FROM muzicmania.profiles WHERE username = 'nombre';

-- Usuarios totales y admins
SELECT count(*) AS total FROM muzicmania.profiles;
SELECT username, is_admin FROM muzicmania.profiles WHERE is_admin = true;

-- Estadísticas de una canción
SELECT track_id, play_count, like_count FROM muzicmania.track_stats ORDER BY play_count DESC LIMIT 10;

-- Reviews recientes con likes
SELECT id, user_id, rating, likes_count, created_at FROM muzicmania.reviews ORDER BY created_at DESC LIMIT 10;

-- Cuentas eliminadas
SELECT id, username, deleted_at, reason FROM muzicmania.deleted_accounts ORDER BY deleted_at DESC LIMIT 10;

-- Métricas globales del juego
SELECT * FROM muzicmania.global_metrics ORDER BY snapshot_date DESC LIMIT 1;

-- Tickets de soporte abiertos
SELECT id, user_id, title, status, priority, created_at FROM muzicmania.support_tickets WHERE status = 'open' ORDER BY created_at;
```

---

## 🌐 ciszunetwork — web principal

```sql
-- Mensajes del formulario de contacto
SELECT * FROM ciszunetwork.messages ORDER BY created_at DESC LIMIT 20;
```

---

## ⚠️ NUNCA tocar (infraestructura Supabase)

- `auth.*` (111 tablas: usuarios, sesiones, tokens) — solo lectura si acaso
- `storage.*` (buckets `ciszu-cdn`, `avatars`) — gestionar por Dashboard/CLI, no SQL directo
- `realtime`, `vault`, `supabase_migrations`, `extensions` — internos

---

## Consejos DBeaver (novato)

- Doble clic en `supabase` → conectar; doble clic en `Schemas` → `ciszubot` → doble clic en tabla → pestaña **Data**
- **SELECT** es seguro. **INSERT/UPDATE/DELETE** en DBeaver modifican la BD real al instante — son cambios de producción
- Pestaña **ER Diagram** de una tabla → relaciones con otras
- Para probar SQL sin riesgo: `SELECT ... WHERE 1=0;` no devuelve filas pero valida sintaxis
