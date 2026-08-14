import {
  pgSchema,
  bigint,
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql as drizzleSql } from 'drizzle-orm';

/**
 * Schema `muzicmania` — juego de música. Perfiles, scores, reviews, tickets,
 * métricas globales, salud de servidores y relaciones entre usuarios.
 * RLS activa en todas las tablas.
 */
export const muzicmania = pgSchema('muzicmania');

export const profiles = muzicmania.table(
  'profiles',
  {
    id: uuid('id').primaryKey(),
    username: text('username').notNull().unique(),
    displayName: text('display_name').notNull(),
    avatarUrl: text('avatar_url'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    likedSongs: jsonb('liked_songs').default(drizzleSql`'[]'`),
    totalLikesReceived: integer('total_likes_received').default(0),
    settingsLang: text('settings_lang').default('EN-US'),
    settingsTheme: text('settings_theme').default('dark'),
    settingsControls: jsonb('settings_controls').default(drizzleSql`'{}'`),
    totalPlaytimeMinutes: bigint('total_playtime_minutes', { mode: 'bigint' }).default(drizzleSql`0`),
    tracksCreated: integer('tracks_created').default(0),
    maxMultiplier: real('max_multiplier').default(1.0),
    highestScore: bigint('highest_score', { mode: 'bigint' }).default(drizzleSql`0`),
    globalRank: integer('global_rank'),
    statusMessage: text('status_message'),
    country: text('country'),
    birthDate: date('birth_date'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phone: text('phone'),
    isAdmin: boolean('is_admin').default(false),
    badges: text('badges').array().default(drizzleSql`'{}'`),
    level: integer('level').default(1),
    xp: integer('xp').default(0),
    bio: text('bio'),
    highScore: bigint('high_score', { mode: 'bigint' }).default(drizzleSql`0`),
    role: text('role').default('user'),
    email: text('email'),
    gamesPlayed: integer('games_played').default(0),
    accuracy: numeric('accuracy').default('0'),
    exp: integer('exp').default(0),
    playTime: bigint('play_time', { mode: 'bigint' }).default(drizzleSql`0`),
    rank: integer('rank'),
    birthPrivacy: text('birth_privacy').default('private'),
    emailVerified: boolean('email_verified').default(false),
  },
  (t) => [
    index('idx_profiles_username_lower').on(drizzleSql`lower(${t.username})`),
    uniqueIndex('idx_profiles_phone_unique')
      .on(t.phone)
      .where(drizzleSql`${t.phone} is not null and ${t.phone} <> ''`),
  ]
);

export const scores = muzicmania.table(
  'scores',
  {
    id: bigint('id', { mode: 'number' }).generatedByDefaultAsIdentity().primaryKey(),
    userId: uuid('user_id').notNull(),
    trackId: text('track_id').notNull(),
    score: integer('score').notNull().default(0),
    accuracy: numeric('accuracy').default('0'),
    maxCombo: integer('max_combo').default(0),
    difficulty: text('difficulty'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const likes = muzicmania.table(
  'likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    trackId: text('track_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('likes_user_id_track_id_key').on(t.userId, t.trackId)]
);

export const trackStats = muzicmania.table(
  'track_stats',
  {
    trackId: text('track_id').primaryKey(),
    playCount: bigint('play_count', { mode: 'number' }).default(0),
    likeCount: bigint('like_count', { mode: 'number' }).default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const reviews = muzicmania.table(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique(),
    rating: numeric('rating', { precision: 2, scale: 1 }).notNull(),
    comment: text('comment').notNull(),
    isAnonymous: boolean('is_anonymous').default(false),
    isVerified: boolean('is_verified').default(false),
    likesCount: integer('likes_count').default(0),
    isEdited: boolean('is_edited').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('reviews_rating_idx').on(t.rating),
    index('reviews_likes_count_idx').on(t.likesCount),
    index('reviews_created_at_idx').on(t.createdAt),
  ]
);

export const reviewLikes = muzicmania.table(
  'review_likes',
  {
    userId: uuid('user_id').notNull(),
    reviewId: uuid('review_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.reviewId] })]
);

export const deletedAccounts = muzicmania.table(
  'deleted_accounts',
  {
    id: uuid('id').primaryKey(),
    username: text('username'),
    displayName: text('display_name'),
    emailHash: text('email_hash'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }).notNull().defaultNow(),
    reason: text('reason').default('user_request'),
  }
);

export const globalMetrics = muzicmania.table(
  'global_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    snapshotDate: date('snapshot_date').default(drizzleSql`CURRENT_DATE`),
    activePlayers: integer('active_players').default(0),
    newAccounts: integer('new_accounts').default(0),
    tracksCreated: integer('tracks_created').default(0),
    totalPlaytimeMinutes: bigint('total_playtime_minutes', { mode: 'number' }).default(0),
    avgPerformanceMs: integer('avg_performance_ms').default(0),
    maxMultiplier: real('max_multiplier').default(1.0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  }
);

export const serverHealth = muzicmania.table(
  'server_health',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    region: text('region').notNull(),
    status: text('status').default('online'),
    loadPercent: integer('load_percent').default(0),
    latencyMs: integer('latency_ms').default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  }
);

export const userRelations = muzicmania.table(
  'user_relations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'),
    targetUserId: uuid('target_user_id'),
    relationType: text('relation_type').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex('user_relations_user_id_target_user_id_relation_type_key').on(
      t.userId,
      t.targetUserId,
      t.relationType
    ),
  ]
);

export const supportTickets = muzicmania.table(
  'support_tickets',
  {
    id: text('id').primaryKey(),
    userId: uuid('user_id'),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: text('status').default('open'),
    priority: text('priority').default('normal'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  }
);

export const tickets = muzicmania.table(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    displayName: text('display_name'),
    username: text('username'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text('email'),
    region: text('region'),
    contactType: text('contact_type'),
    phone: text('phone'),
    device: text('device'),
    category: text('category'),
    subCategory: text('sub_category'),
    message: text('message'),
    status: text('status').default('pending'),
    priority: text('priority').default('normal'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_tickets_user_id').on(t.userId)]
);