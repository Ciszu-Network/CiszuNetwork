-- ============================================================
-- 14 · CiszuBot v3.2 — tablas de sistemas avanzados (ago 2026)
-- Schema: ciszubot
-- ============================================================

-- Configuración por servidor (la consume el bot y el dashboard web)
create table if not exists ciszubot.guild_configs (
  guild_id              text primary key,
  prefix                text not null default 'cz!',
  lang                  text not null default 'es',
  leveling_enabled      boolean not null default false,
  level_channel_id      text,
  xp_rate               integer not null default 1,
  welcome_channel_id    text,
  welcome_message       text not null default 'Bienvenido/a {user} a {guild}!',
  goodbye_channel_id    text,
  goodbye_message       text not null default 'Adiós {user}, que te vaya bien!',
  autorole_ids          jsonb not null default '[]'::jsonb,
  logs_channel_id       text,
  counters              jsonb not null default '[]'::jsonb,
  tickets_enabled       boolean not null default false,
  tickets_category_id   text,
  tickets_role_id       text,
  private_channels      boolean not null default false,
  private_category_id   text,
  music_channel_id      text,
  automod_enabled       boolean not null default false,
  mute_role_id          text,
  updated_at            timestamptz not null default now()
);

-- Economía por servidor (estilo UnbelievaBoat)
create table if not exists ciszubot.wallets (
  user_id    text not null,
  guild_id   text not null,
  balance    bigint not null default 0,
  bank       bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, guild_id)
);

create table if not exists ciszubot.transactions (
  id         bigserial primary key,
  guild_id   text not null,
  user_id    text not null,
  amount     bigint not null,
  type       text not null,
  note       text,
  created_at timestamptz not null default now()
);

create table if not exists ciszubot.shop_items (
  id          bigserial primary key,
  guild_id    text not null,
  name        text not null,
  price       bigint not null default 0,
  description text,
  role_id     text,
  emoji       text default '🎁',
  created_at  timestamptz not null default now()
);

create table if not exists ciszubot.inventory (
  user_id  text not null,
  guild_id text not null,
  item_id  bigint not null,
  quantity integer not null default 1,
  primary key (user_id, guild_id, item_id)
);

-- Niveles / XP
create table if not exists ciszubot.levels (
  user_id    text not null,
  guild_id   text not null,
  xp         bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, guild_id)
);

-- Moderación
create table if not exists ciszubot.warns (
  id          bigserial primary key,
  guild_id    text not null,
  user_id     text not null,
  moderator   text not null,
  reason      text,
  created_at  timestamptz not null default now()
);

-- Tickets
create table if not exists ciszubot.tickets (
  id         text primary key,
  guild_id   text not null,
  channel_id text not null,
  user_id    text not null,
  topic      text,
  open       boolean not null default true,
  created_at timestamptz not null default now()
);

-- Giveaways
create table if not exists ciszubot.giveaways (
  id           text primary key,
  guild_id     text not null,
  channel_id   text not null,
  message_id   text not null,
  prize        text not null,
  winners      integer not null default 1,
  ends_at      timestamptz not null,
  hosted_by    text not null,
  ended        boolean not null default false,
  created_at   timestamptz not null default now()
);

-- AFK
create table if not exists ciszubot.afk (
  user_id  text not null,
  guild_id text not null,
  reason   text,
  since    timestamptz not null default now(),
  primary key (user_id, guild_id)
);

-- Alianzas entre servidores
create table if not exists ciszubot.alliances (
  id              bigserial primary key,
  guild_id        text not null,
  partner_id      text not null,
  partner_name    text,
  partner_invite  text,
  created_at      timestamptz not null default now(),
  unique (guild_id, partner_id)
);

-- Usuarios vinculados (OAuth Discord de la web)
create table if not exists ciszubot.discord_users (
  id            text primary key,
  username      text not null,
  display_name  text,
  avatar_url    text,
  email         text,
  access_token  text,
  refresh_token text,
  token_expires timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Snipes (se guardan también en DB para persistir entre reinicios)
create table if not exists ciszubot.snipes (
  id         bigserial primary key,
  guild_id   text not null,
  channel_id text not null,
  user_id    text not null,
  content    text,
  attachment text,
  deleted_at timestamptz not null default now()
);

create index if not exists idx_wallets_guild   on ciszubot.wallets (guild_id, balance desc);
create index if not exists idx_levels_guild    on ciszubot.levels (guild_id, xp desc);
create index if not exists idx_snipes_channel  on ciszubot.snipes (channel_id, deleted_at desc);
create index if not exists idx_tickets_guild   on ciszubot.tickets (guild_id, open);
create index if not exists idx_warns_guild     on ciszubot.warns (guild_id, user_id);
