'use client';

import { Icon, SocialIcon, type SocialPlatform as BrandPlatform } from '@ciszu/ui';
import type { GuildEmoji } from '@/lib/discordGuild';
import type { Dict } from '@/lib/i18n';
import DiscordMarkdownField from './DiscordMarkdownField';
import { NiceSelect } from './fields';

export type SocialPlatform =
  | 'x'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'twitch'
  | 'linkedin'
  | 'spotify'
  | 'soundcloud'
  | 'github'
  | 'reddit'
  | 'pinterest'
  | 'patreon'
  | 'kofi'
  | 'buymeacoffee'
  | 'other';

export type SocialFeedKind = 'profile' | 'page' | 'user' | 'group' | 'channel' | 'subreddit' | 'feed';

export interface SocialFeed {
  id: string;
  platform: SocialPlatform;
  kind: SocialFeedKind;
  account: string;
  channel_id: string;
  ping_role_id: string | null;
  message: string;
  enabled: boolean;
}

type T = Dict['guildPage'];
type Option = { id: string; label: string };

const PLATFORMS: SocialPlatform[] = [
  'x',
  'instagram',
  'facebook',
  'tiktok',
  'youtube',
  'twitch',
  'linkedin',
  'spotify',
  'soundcloud',
  'github',
  'reddit',
  'pinterest',
  'patreon',
  'kofi',
  'buymeacoffee',
  'other',
];

const META: Record<
  SocialPlatform,
  { label: string; color: string; brand?: BrandPlatform; icon: string; kinds: SocialFeedKind[]; placeholder: string }
> = {
  x: { label: 'X', color: '#74A9FF', brand: 'x', icon: 'x', kinds: ['profile', 'user', 'feed'], placeholder: 'https://...rss (Nitter/RSSHub)' },
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    brand: 'instagram',
    icon: 'instagram',
    kinds: ['profile', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    brand: 'facebook',
    icon: 'facebook',
    kinds: ['page', 'user', 'group', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  tiktok: {
    label: 'TikTok',
    color: '#00F2FE',
    brand: 'tiktok',
    icon: 'tiktok',
    kinds: ['profile', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    brand: 'youtube',
    icon: 'youtube',
    kinds: ['channel', 'user', 'feed'],
    placeholder: '@canal, UC... o https://youtube.com/...',
  },
  twitch: {
    label: 'Twitch',
    color: '#9146FF',
    brand: 'twitch',
    icon: 'twitch',
    kinds: ['channel', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0A66C2',
    brand: 'linkedin',
    icon: 'briefcase',
    kinds: ['profile', 'page', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  spotify: {
    label: 'Spotify',
    color: '#1DB954',
    brand: 'spotify',
    icon: 'spotify',
    kinds: ['profile', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  soundcloud: {
    label: 'SoundCloud',
    color: '#FF5500',
    brand: 'soundcloud',
    icon: 'soundcloud',
    kinds: ['profile', 'user', 'feed'],
    placeholder: 'usuario o https://soundcloud.com/...',
  },
  github: {
    label: 'GitHub',
    color: '#E6EDF3',
    brand: 'github',
    icon: 'github',
    kinds: ['user', 'profile', 'feed'],
    placeholder: 'usuario u owner/repo',
  },
  reddit: {
    label: 'Reddit',
    color: '#FF4500',
    brand: 'reddit',
    icon: 'comment',
    kinds: ['subreddit', 'user', 'feed'],
    placeholder: 'r/subreddit, u/usuario o URL',
  },
  pinterest: {
    label: 'Pinterest',
    color: '#E60023',
    brand: 'pinterest',
    icon: 'globe',
    kinds: ['profile', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  patreon: {
    label: 'Patreon',
    color: '#FF424D',
    icon: 'patreon',
    kinds: ['profile', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  kofi: {
    label: 'Ko-fi',
    color: '#FF5E5B',
    icon: 'kofi',
    kinds: ['profile', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  buymeacoffee: {
    label: 'Buy Me a Coffee',
    color: '#FFDD00',
    icon: 'buymeacoffee',
    kinds: ['profile', 'user', 'feed'],
    placeholder: 'https://...rss (RSSHub)',
  },
  other: {
    label: 'Otra red / RSS',
    color: '#22D3EE',
    icon: 'globe',
    kinds: ['feed', 'profile', 'user', 'page', 'group', 'channel', 'subreddit'],
    placeholder: 'https://...rss o https://...atom',
  },
};

const DEFAULT_KIND: Record<SocialPlatform, SocialFeedKind> = {
  x: 'profile',
  instagram: 'profile',
  facebook: 'page',
  tiktok: 'profile',
  youtube: 'channel',
  twitch: 'channel',
  linkedin: 'profile',
  spotify: 'profile',
  soundcloud: 'profile',
  github: 'user',
  reddit: 'subreddit',
  pinterest: 'profile',
  patreon: 'profile',
  kofi: 'profile',
  buymeacoffee: 'profile',
  other: 'feed',
};

function kindLabel(t: T, kind: SocialFeedKind): string {
  switch (kind) {
    case 'page':
      return t.socialFeedsKindPage;
    case 'user':
      return t.socialFeedsKindUser;
    case 'group':
      return t.socialFeedsKindGroup;
    case 'channel':
      return t.socialFeedsKindChannel;
    case 'subreddit':
      return t.socialFeedsKindSubreddit;
    case 'feed':
      return t.socialFeedsKindFeed;
    default:
      return t.socialFeedsKindProfile;
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `feed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function newFeed(platform: SocialPlatform, channels: Option[]): SocialFeed {
  return {
    id: newId(),
    platform,
    kind: DEFAULT_KIND[platform],
    account: '',
    channel_id: channels[0]?.id ?? '',
    ping_role_id: null,
    message: '',
    enabled: true,
  };
}

function PlatformMark({ platform, size = 18 }: { platform: SocialPlatform; size?: number }) {
  const meta = META[platform];
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
    >
      {meta.brand ? (
        <SocialIcon platform={meta.brand} size={size} colored={false} />
      ) : (
        <Icon name={meta.icon} size={size} color={meta.color} />
      )}
    </span>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/75">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] leading-relaxed text-white/40">{hint}</span>}
    </label>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-gradient-to-r from-neon-blue to-neon-pink' : 'bg-white/15'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

function FeedCard({
  feed,
  t,
  channels,
  roles,
  emojis,
  platformOptions,
  onChange,
  onRemove,
}: {
  feed: SocialFeed;
  t: T;
  channels: Option[];
  roles: Option[];
  emojis: GuildEmoji[];
  platformOptions: Option[];
  onChange: (patch: Partial<SocialFeed>) => void;
  onRemove: () => void;
}) {
  const meta = META[feed.platform];
  const kindOptions = meta.kinds.map((kind) => ({ id: kind, label: kindLabel(t, kind) }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <PlatformMark platform={feed.platform} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">
            {meta.label} <span className="text-white/35">·</span>{' '}
            <span className="font-medium text-white/65">{feed.account || t.socialFeedsAccount}</span>
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/35">{kindLabel(t, feed.kind)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.socialFeedsEnabled}</span>
          <Switch on={feed.enabled} onChange={(value) => onChange({ enabled: value })} label={t.socialFeedsEnabled} />
          <button
            type="button"
            onClick={onRemove}
            title={t.socialFeedsRemove}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/5 text-red-400 transition hover:bg-red-400/15"
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label={t.socialFeedsPlatform}>
          <NiceSelect
            value={feed.platform}
            options={platformOptions}
            onChange={(value) => {
              const platform = value as SocialPlatform;
              onChange({ platform, kind: DEFAULT_KIND[platform], account: '' });
            }}
          />
        </Field>
        <Field label={t.socialFeedsKind}>
          <NiceSelect value={feed.kind} options={kindOptions} onChange={(value) => onChange({ kind: value as SocialFeedKind })} />
        </Field>
        <Field label={t.socialFeedsAccount} hint={t.socialFeedsAccountHint}>
          <input
            className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-neon-blue"
            value={feed.account}
            placeholder={meta.placeholder}
            maxLength={300}
            onChange={(event) => onChange({ account: event.target.value })}
          />
        </Field>
        <Field label={t.socialFeedsChannel}>
          <NiceSelect
            value={feed.channel_id || ''}
            options={[{ id: '', label: t.socialFeedsNoChannel }, ...channels]}
            onChange={(value) => onChange({ channel_id: value })}
          />
        </Field>
        <Field label={t.socialFeedsPingRole}>
          <NiceSelect
            value={feed.ping_role_id ?? ''}
            options={[{ id: '', label: t.socialFeedsPingNone }, ...roles]}
            onChange={(value) => onChange({ ping_role_id: value || null })}
          />
        </Field>
        <div className="sm:col-span-2">
          <DiscordMarkdownField
            label={t.socialFeedsMessage}
            hint={t.socialFeedsMessageHint}
            value={feed.message}
            onChange={(value) => onChange({ message: value })}
            variables={['{account}', '{platform}', '{title}', '{url}', '{author}']}
            emojis={emojis}
            roles={roles}
            channels={channels}
            labels={{
              bold: t.mdBold,
              italic: t.mdItalic,
              underline: t.mdUnderline,
              spoiler: t.mdSpoiler,
              code: t.mdCode,
              preview: t.mdPreview,
              edit: t.mdEdit,
              vars: t.mdVars,
              emoji: t.emojiServerSelect,
              quote: t.mdQuote,
              role: t.mdRole,
              channel: t.mdChannel,
              serverEmojis: t.mdServerEmojis,
              discordEmojis: t.mdDiscordEmojis,
              search: t.mdSearch,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SocialFeedsEditor({
  enabled,
  feeds,
  premium,
  channels,
  roles,
  emojis,
  t,
  onEnabledChange,
  onFeedsChange,
}: {
  enabled: boolean;
  feeds: SocialFeed[];
  premium: boolean;
  channels: Option[];
  roles: Option[];
  emojis: GuildEmoji[];
  t: T;
  onEnabledChange: (value: boolean) => void;
  onFeedsChange: (feeds: SocialFeed[]) => void;
}) {
  const used = new Set(feeds.map((feed) => feed.platform));
  const limit = premium ? 1000 : 5;
  const canAdd = feeds.length < limit;
  const nextPlatform = PLATFORMS.find((platform) => !used.has(platform)) ?? (premium ? 'other' : undefined);
  const globalPlatformOptions = PLATFORMS.map((platform) => ({ id: platform, label: META[platform].label }));

  const add = () => {
    if (!canAdd || !nextPlatform) return;
    onFeedsChange([...feeds, newFeed(nextPlatform, channels)]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div>
          <p className="text-sm font-bold text-white">{t.socialFeedsToggle}</p>
          <p className="mt-1 text-[11px] text-white/45">{t.socialFeedsToggleHint}</p>
        </div>
        <Switch on={enabled} onChange={onEnabledChange} label={t.socialFeedsToggle} />
      </div>

      <p className="text-xs leading-relaxed text-white/45">{t.socialFeedsHint}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
        <span className="text-[10px] text-white/45">{premium ? t.socialFeedsPremiumLimit : t.socialFeedsFreeLimit}</span>
        <span className="text-[10px] font-black tabular-nums text-white/60">
          {feeds.length}
          {premium ? '' : `/${limit}`}
        </span>
      </div>

      {feeds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/35">
          {t.socialFeedsEmpty}
        </div>
      ) : (
        <div className="grid gap-3">
          {feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              t={t}
              channels={channels}
              roles={roles}
              emojis={emojis}
              platformOptions={
                premium
                  ? globalPlatformOptions
                  : globalPlatformOptions.filter((option) => option.id === feed.platform || !used.has(option.id as SocialPlatform))
              }
              onChange={(patch) =>
                onFeedsChange(feeds.map((entry) => (entry.id === feed.id ? { ...entry, ...patch } : entry)))
              }
              onRemove={() => onFeedsChange(feeds.filter((entry) => entry.id !== feed.id))}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={add}
        disabled={!canAdd || !nextPlatform}
        className="inline-flex items-center gap-2 rounded-xl border border-neon-blue/40 bg-neon-blue/10 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-neon-blue transition hover:bg-neon-blue/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon name="plus" size={13} />
        {t.socialFeedsAdd}
      </button>
    </div>
  );
}
