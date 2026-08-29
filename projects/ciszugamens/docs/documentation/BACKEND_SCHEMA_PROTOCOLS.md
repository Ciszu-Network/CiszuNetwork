# BACKEND_SCHEMA_PROTOCOLS — Backend + Schema (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: BACKEND_SCHEMA_PROTOCOLS_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Esquema de datos y backend para CiszuGamens. Actualmente sin backend propio; usa Supabase compartido para CDN y potencial futuro de auth/dashboard.

## 1. Estado actual

**No hay backend dedicado**. CiszuGamens usa infraestructura compartida:

| Servicio | Uso | Configuración |
|---|---|---|
| **Supabase Storage** | CDN assets (`ciszu-cdn`) | Bucket público, RLS solo lectura pública |
| **Supabase Postgres** | — | Schema `ciszu` compartido (sin tablas propias) |
| **Supabase Auth** | — | Solo si se añade dashboard admin (futuro) |

## 2. Esquema futuro (Dashboard Admin - opcional)

Si se implementa dashboard de administración para gestión de servidor Discord:

### Tabla: `ciszugamens.admin_users`
```sql
CREATE TABLE ciszugamens.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT NOT NULL UNIQUE,        -- Discord user ID
  username TEXT NOT NULL,                 -- Discord username
  avatar_url TEXT,                        -- Discord avatar
  role TEXT NOT NULL DEFAULT 'admin',     -- 'owner' | 'admin' | 'moderator'
  permissions JSONB DEFAULT '{}',         -- Permisos granulares
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla: `ciszugamens.server_config`
```sql
CREATE TABLE ciszugamens.server_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,               -- 'welcome_channel', 'mod_log_channel', etc.
  value JSONB NOT NULL,                   -- Valor configurado
  description TEXT,
  updated_by UUID REFERENCES ciszugamens.admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla: `ciszugamens.moderation_logs`
```sql
CREATE TABLE ciszugamens.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,                   -- 'kick' | 'ban' | 'timeout' | 'warn' | 'role_add' | 'role_remove'
  target_discord_id TEXT NOT NULL,        -- Usuario afectado
  target_username TEXT NOT NULL,
  moderator_discord_id TEXT NOT NULL,     -- Quién ejecutó
  moderator_username TEXT NOT NULL,
  reason TEXT,
  duration_seconds INT,                   -- Para timeouts
  metadata JSONB DEFAULT '{}',            -- Datos extra (canal, mensaje, etc.)
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla: `ciszugamens.events`
```sql
CREATE TABLE ciszugamens.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  game TEXT,                              -- 'Valorant' | 'League of Legends' | 'CS2' | etc.
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  max_participants INT,
  status TEXT DEFAULT 'published',        -- 'draft' | 'published' | 'cancelled' | 'completed'
  created_by UUID REFERENCES ciszugamens.admin_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla: `ciszugamens.event_participants`
```sql
CREATE TABLE ciszugamens.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES ciszugamens.events(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL,
  username TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'registered',       -- 'registered' | 'confirmed' | 'cancelled' | 'attended'
  UNIQUE (event_id, discord_id)
);
```

## 3. RLS (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE ciszugamens.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszugamens.server_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszugamens.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszugamens.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciszugamens.event_participants ENABLE ROW LEVEL SECURITY;

-- Políticas: solo admins autenticados (vía Supabase Auth)
-- Ver SECURITY_PROTOCOLS.md para patrones estándar
```

## 4. API Endpoints (futuro - Next.js API Routes)

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/admin/users` | GET/POST | Admin | CRUD admin users |
| `/api/admin/config` | GET/PATCH | Admin | Config servidor |
| `/api/admin/logs` | GET | Admin | Logs moderación (paginado) |
| `/api/events` | GET/POST | Public/Admin | Listar/crear eventos |
| `/api/events/:id` | GET/PATCH/DELETE | Public/Admin | Detalle/actualizar/borrar evento |
| `/api/events/:id/register` | POST | User (Discord OAuth) | Inscripción a evento |

## 5. Integración Discord (Webhooks)

| Evento | Webhook | Payload |
|---|---|---|
| Nuevo evento publicado | `#anuncios` | Embed con título, fecha, game, link registro |
| Inicio de evento | `#eventos` | Mención @Eventos + link |
| Resultado evento | `#resultados` | Embed con ganadores |
| Moderación (ban/kick) | `#mod-log` | Embed con acción, moderador, target, razón |

## 6. CDN Assets (actual)

No requiere backend. Assets servidos desde Supabase Storage:

```
Bucket: ciszu-cdn (público)
Prefix: projects/ciszugamens/content/
├── logos/images/...
├── banners/images/ciszugamens_video_banner.gif
├── flyers/images/
└── thumbnails/images/
```

URL pública: `https://<project>.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszugamens/content/...`

## 7. Migraciones (si se activa backend)

```bash
# Desde raíz monorepo
pnpm --filter @ciszunetwork/db exec drizzle-kit generate --schema=ciszugamens
pnpm --filter @ciszunetwork/db exec drizzle-kit migrate --schema=ciszugamens
```

---

_Última revisión: 29 ago 2026._