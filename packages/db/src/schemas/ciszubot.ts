import {
  pgSchema,
  bigint,
  bigserial,
  boolean,
  integer,
  jsonb,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Schema `ciszubot` — bot de Discord. Tablas de economía, niveles, tickets,
 * giveaways, warns, snipes, config de guilds, auditoría y estado en vivo.
 * RLS: la mayoría deny-all para anon/authenticated (solo service_role).
 */
export const ciszubot = pgSchema('ciszubot');

export const guildConfig = ciszubot.table(
  'guild_config',
  {
    guildId: text('guild_id').primaryKey(),
    prefix: text('prefix').default('/'),
    modRoleId: text('mod_role_id'),
    adminRoleId: text('admin_role_id'),
    welcomeChannelId: text('welcome_channel_id'),
    logChannelId: text('log_channel_id'),
    musicEnabled: boolean('music_enabled').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  }
);

export const guildConfigs = ciszubot.table(
  'guild_configs',
  {
    guildId: text('guild_id').primaryKey(),
    prefix: text('prefix').notNull().default('cz!'),
    lang: text('lang').notNull().default('es'),
    levelingEnabled: boolean('leveling_enabled').notNull().default(false),
    levelChannelId: text('level_channel_id'),
    xpRate: integer('xp_rate').notNull().default(1),
    welcomeChannelId: text('welcome_channel_id'),
    welcomeMessage: text('welcome_message').notNull().default('Bienvenido/a {user} a {guild}!'),
    goodbyeChannelId: text('goodbye_channel_id'),
    goodbyeMessage: text('goodbye_message').notNull().default('Adiós {user}, que te vaya bien!'),
    autoroleIds: jsonb('autorole_ids').notNull().default([]),
    logsChannelId: text('logs_channel_id'),
    counters: jsonb('counters').notNull().default([]),
    ticketsEnabled: boolean('tickets_enabled').notNull().default(false),
    ticketsCategoryId: text('tickets_category_id'),
    ticketsRoleId: text('tickets_role_id'),
    privateChannels: boolean('private_channels').notNull().default(false),
    privateCategoryId: text('private_category_id'),
    musicChannelId: text('music_channel_id'),
    automodEnabled: boolean('automod_enabled').notNull().default(false),
    muteRoleId: text('mute_role_id'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const commandLogs = ciszubot.table(
  'command_logs',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    command: text('command').notNull(),
    args: jsonb('args'),
    executedAt: timestamp('executed_at', { withTimezone: true }).defaultNow(),
  }
);

export const botStatus = ciszubot.table(
  'bot_status',
  {
    id: smallint('id').primaryKey().default(1),
    online: boolean('online').default(false),
    lastSeen: timestamp('last_seen', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
    version: text('version'),
    guilds: integer('guilds').default(0),
    commandsTotal: bigint('commands_total', { mode: 'number' }).default(0),
    prefix: text('prefix').default('cz!'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  }
);

export const wallets = ciszubot.table(
  'wallets',
  {
    userId: text('user_id').notNull(),
    guildId: text('guild_id').notNull(),
    balance: bigint('balance', { mode: 'number' }).notNull().default(0),
    bank: bigint('bank', { mode: 'number' }).notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.guildId] }),
    index('idx_wallets_guild').on(t.guildId, t.balance.desc()),
  ]
);

export const transactions = ciszubot.table(
  'transactions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    type: text('type').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const shopItems = ciszubot.table(
  'shop_items',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    name: text('name').notNull(),
    price: bigint('price', { mode: 'number' }).notNull().default(0),
    description: text('description'),
    roleId: text('role_id'),
    emoji: text('emoji').default('🎁'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const inventory = ciszubot.table(
  'inventory',
  {
    userId: text('user_id').notNull(),
    guildId: text('guild_id').notNull(),
    itemId: bigint('item_id', { mode: 'number' }).notNull(),
    quantity: integer('quantity').notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.userId, t.guildId, t.itemId] })]
);

export const levels = ciszubot.table(
  'levels',
  {
    userId: text('user_id').notNull(),
    guildId: text('guild_id').notNull(),
    xp: bigint('xp', { mode: 'number' }).notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.guildId] }),
    index('idx_levels_guild').on(t.guildId, t.xp.desc()),
  ]
);

export const warns = ciszubot.table(
  'warns',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    moderator: text('moderator').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_warns_guild').on(t.guildId, t.userId)]
);

export const botTickets = ciszubot.table(
  'tickets',
  {
    id: text('id').primaryKey(),
    guildId: text('guild_id').notNull(),
    channelId: text('channel_id').notNull(),
    userId: text('user_id').notNull(),
    topic: text('topic'),
    open: boolean('open').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_tickets_guild').on(t.guildId, t.open)]
);

export const giveaways = ciszubot.table(
  'giveaways',
  {
    id: text('id').primaryKey(),
    guildId: text('guild_id').notNull(),
    channelId: text('channel_id').notNull(),
    messageId: text('message_id').notNull(),
    prize: text('prize').notNull(),
    winners: integer('winners').notNull().default(1),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    hostedBy: text('hosted_by').notNull(),
    ended: boolean('ended').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const afk = ciszubot.table(
  'afk',
  {
    userId: text('user_id').notNull(),
    guildId: text('guild_id').notNull(),
    reason: text('reason'),
    since: timestamp('since', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.guildId] })]
);

export const alliances = ciszubot.table(
  'alliances',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    partnerId: text('partner_id').notNull(),
    partnerName: text('partner_name'),
    partnerInvite: text('partner_invite'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('alliances_guild_id_partner_id_key').on(t.guildId, t.partnerId)]
);

export const discordUsers = ciszubot.table(
  'discord_users',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    email: text('email'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    tokenExpires: timestamp('token_expires', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const snipes = ciszubot.table(
  'snipes',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    channelId: text('channel_id').notNull(),
    userId: text('user_id').notNull(),
    content: text('content'),
    attachment: text('attachment'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_snipes_channel').on(t.channelId, t.deletedAt.desc())]
);

export const auditLog = ciszubot.table(
  'audit_log',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    event: text('event').notNull(),
    actorId: text('actor_id'),
    actorName: text('actor_name'),
    target: text('target'),
    ip: text('ip'),
    detail: jsonb('detail'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_log_created_at_idx').on(t.createdAt.desc()),
    index('audit_log_event_idx').on(t.event),
  ]
);
