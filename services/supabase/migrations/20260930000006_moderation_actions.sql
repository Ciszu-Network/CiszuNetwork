-- Auditoría de moderación: toda acción de staff (o bot) queda registrada con
-- autor, fecha, objetivo y motivo. Las sanciones (ban/mute) viven en
-- `public.sanctions` (lectura pública para mostrar estado); este historial es
-- interno (solo service_role) siguiendo prácticas de trazabilidad completas.

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  website text not null,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  actor text not null,
  action text not null check (action in (
    'ban','unban','mute','unmute','warn','delete_review','delete_post','edit_bio','edit_friends','ip_ban'
  )),
  reason text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists moderation_actions_target_idx
  on public.moderation_actions (target_user_id, website, created_at desc);
create index if not exists moderation_actions_actor_idx
  on public.moderation_actions (actor, created_at desc);

alter table public.moderation_actions enable row level security;
-- Sin policies: historial interno (service_role). Los usuarios ven el efecto
-- (sanctions públicas + estado de cuenta), no el detalle operativo.
