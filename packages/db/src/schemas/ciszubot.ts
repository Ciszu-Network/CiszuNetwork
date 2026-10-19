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
    leaderboardEnabled: boolean('leaderboard_enabled').notNull().default(false),
    leaderboardSlug: text('leaderboard_slug'),
    coinEmoji: text('coin_emoji').notNull().default('🪙'),
    coinName: text('coin_name').notNull().default('monedas'),
    staffRoleId: text('staff_role_id'),
    levelMessage: text('level_message').notNull().default('🎉 ¡{user} subió al nivel {level} en {guild}!'),
    levelRoles: jsonb('level_roles').notNull().default([]),
    automodConfig: jsonb('automod_config').notNull().default({}),
    commandCooldowns: jsonb('command_cooldowns').notNull().default({}),
    drops: jsonb('drops').notNull().default({}),
    starboardChannelId: text('starboard_channel_id'),
    starboardEmoji: text('starboard_emoji').notNull().default('⭐'),
    starboardMin: integer('starboard_min').notNull().default(3),
    invitePointsPer: integer('invite_points_per').notNull().default(1),
    inviteRewards: jsonb('invite_rewards').notNull().default([]),
    privateVcHubId: text('private_vc_hub_id'),
    secretUserIds: jsonb('secret_user_ids').notNull().default([]),
    nitroRepostEnabled: boolean('nitro_repost_enabled').notNull().default(false),
    afkRoleId: text('afk_role_id'),
    afkPrefixEnabled: boolean('afk_prefix_enabled').notNull().default(false),
    afkAutoMinutes: integer('afk_auto_minutes').notNull().default(0),
    marriageEnabled: boolean('marriage_enabled').notNull().default(true),
    marriageAllowAdminPairs: boolean('marriage_allow_admin_pairs').notNull().default(true),
    commandGlobalCooldown: integer('command_global_cooldown').notNull().default(3),
    countingEnabled: boolean('counting_enabled').notNull().default(false),
    countingChannelId: text('counting_channel_id'),
    countingStart: integer('counting_start').notNull().default(0),
    countingStyle: text('counting_style').notNull().default('traditional'),
    countingAllowRepeat: boolean('counting_allow_repeat').notNull().default(false),
    countingAuthenticity: text('counting_authenticity').notNull().default('dependent'),
    suggestionsEnabled: boolean('suggestions_enabled').notNull().default(false),
    suggestionsChannelId: text('suggestions_channel_id'),
    suggestionsExcludedRoleIds: jsonb('suggestions_excluded_role_ids').notNull().default([]),
    suggestionsMaxActive: integer('suggestions_max_active').notNull().default(0),
    suggestionsCooldownMinutes: integer('suggestions_cooldown_minutes').notNull().default(0),
    marriageExcludedRoleIds: jsonb('marriage_excluded_role_ids').notNull().default([]),
    nitroRepostMode: text('nitro_repost_mode').notNull().default('auto'),
    nitroExcludedRoleIds: jsonb('nitro_excluded_role_ids').notNull().default([]),
    ownerRoleIds: jsonb('owner_role_ids').notNull().default([]),
    adminRoleIds: jsonb('admin_role_ids').notNull().default([]),
    modRoleIds: jsonb('mod_role_ids').notNull().default([]),
    botRoleIds: jsonb('bot_role_ids').notNull().default([]),
    historyEnabled: boolean('history_enabled').notNull().default(true),
    historyChannelId: text('history_channel_id'),
    allianceConfig: jsonb('alliance_config').notNull().default({}),
    ticketConfig: jsonb('ticket_config').notNull().default({}),
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
    category: text('category'),
    claimedBy: text('claimed_by'),
    answers: jsonb('answers'),
    closedBy: text('closed_by'),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    closeReason: text('close_reason'),
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
    status: text('status').notNull().default('running'),
    requiredRoleIds: jsonb('required_role_ids').notNull().default([]),
    grantRoleIds: jsonb('grant_role_ids').notNull().default([]),
    maxParticipants: integer('max_participants').notNull().default(0),
    requiredMessages: integer('required_messages').notNull().default(0),
    bonusRoles: jsonb('bonus_roles').notNull().default([]),
    createdSource: text('created_source').notNull().default('command'),
    pausedAt: timestamp('paused_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    winnerIds: jsonb('winner_ids').notNull().default([]),
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
    userId: text('user_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('alliances_guild_id_partner_id_key').on(t.guildId, t.partnerId)]
);

export const alliancePoints = ciszubot.table(
  'alliance_points',
  {
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    points: integer('points').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.userId] })]
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

export const profiles = ciszubot.table(
  'profiles',
  {
    id: text('id').primaryKey(),
    username: text('username').notNull(),
    displayName: text('display_name').notNull(),
    avatarUrl: text('avatar_url'),
    email: text('email'),
    settingsControls: jsonb('settings_controls').notNull().default('{}'),
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

export const featureFlags = ciszubot.table(
  'feature_flags',
  {
    feature: text('feature').primaryKey(),
    enabled: boolean('enabled').notNull().default(true),
    reason: text('reason'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text('updated_by'),
  }
);

export const guildFeatureFlags = ciszubot.table(
  'guild_feature_flags',
  {
    guildId: text('guild_id').notNull(),
    feature: text('feature').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text('updated_by'),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.feature] })]
);

export const premiumGuilds = ciszubot.table(
  'premium_guilds',
  {
    guildId: text('guild_id').primaryKey(),
    plan: text('plan').notNull().default('beta'),
    status: text('status').notNull().default('active'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
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

export const marriages = ciszubot.table(
  'marriages',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    partnerId: text('partner_id').notNull(),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_marriages_user').on(t.guildId, t.userId, t.active)]
);

export const invites = ciszubot.table(
  'invites',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    inviterId: text('inviter_id').notNull(),
    invitedId: text('invited_id').notNull(),
    code: text('code'),
    points: integer('points').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_invites_guild_inviter').on(t.guildId, t.inviterId)]
);

export const starboardPosts = ciszubot.table(
  'starboard_posts',
  {
    messageId: text('message_id').notNull(),
    guildId: text('guild_id').notNull(),
    channelId: text('channel_id').notNull(),
    starboardMessageId: text('starboard_message_id').notNull(),
    stars: integer('stars').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.messageId, t.guildId] })]
);

export const customEmbeds = ciszubot.table(
  'custom_embeds',
  {
    id: text('id').primaryKey(),
    guildId: text('guild_id').notNull(),
    name: text('name').notNull(),
    data: jsonb('data').notNull(),
    webhookUrl: text('webhook_url'),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_custom_embeds_guild').on(t.guildId, t.name)]
);

export const privateChannels = ciszubot.table(
  'private_channels',
  {
    channelId: text('channel_id').primaryKey(),
    guildId: text('guild_id').notNull(),
    ownerId: text('owner_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_private_channels_owner').on(t.guildId, t.ownerId)]
);

export const giveawayParticipants = ciszubot.table(
  'giveaway_participants',
  {
    giveawayId: text('giveaway_id').notNull(),
    userId: text('user_id').notNull(),
    entries: integer('entries').notNull().default(1),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.giveawayId, t.userId] })]
);

export const giveawayBans = ciszubot.table(
  'giveaway_bans',
  {
    giveawayId: text('giveaway_id').notNull(),
    userId: text('user_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.giveawayId, t.userId] })]
);

export const memberMessages = ciszubot.table(
  'member_messages',
  {
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    count: integer('count').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.userId] })]
);

export const botActions = ciszubot.table(
  'bot_actions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    type: text('type').notNull(),
    channelId: text('channel_id').notNull(),
    content: text('content').notNull(),
    createdBy: text('created_by'),
    source: text('source').notNull().default('dashboard'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    processed: boolean('processed').notNull().default(false),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    result: text('result'),
  },
  (t) => [index('idx_bot_actions_pending').on(t.processed, t.createdAt)]
);

/** Sugerencias de la comunidad (votos + decision del staff). */
export const suggestions = ciszubot.table(
  'suggestions',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    guildId: text('guild_id').notNull(),
    userId: text('user_id').notNull(),
    channelId: text('channel_id'),
    messageId: text('message_id'),
    content: text('content').notNull(),
    status: text('status').notNull().default('pending'),
    reason: text('reason'),
    decidedBy: text('decided_by'),
    upVotes: integer('up_votes').notNull().default(0),
    downVotes: integer('down_votes').notNull().default(0),
    voters: jsonb('voters').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
  },
  (t) => [index('idx_suggestions_guild').on(t.guildId, t.createdAt)],
);

/** Estado del canal contador por servidor (conteo actual + reto de suma). */
export const countingState = ciszubot.table('counting_state', {
  guildId: text('guild_id').primaryKey(),
  channelId: text('channel_id'),
  currentCount: integer('current_count').notNull().default(0),
  lastUserId: text('last_user_id'),
  lastMessageId: text('last_message_id'),
  challengeA: integer('challenge_a'),
  challengeB: integer('challenge_b'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
