'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Modal, useToast } from '@ciszu/ui';
import { getDict, readCookieLang, INVITE_URL, type Dict } from '@/lib/i18n';
import InviteLink from '@/components/dashboard/InviteLink';
import type { GuildInfo } from '@/lib/discordGuild';
import { SaveDock, type SaveStatus } from '@/components/dashboard/SaveDock';
import DiscordMarkdownField from '@/components/dashboard/DiscordMarkdownField';
import { QuickHelp, HelpZone } from '@/components/dashboard/QuickHelp';
import { NiceSelect, RichInput, MultiSelect } from '@/components/dashboard/fields';
import { SECTION_HELP } from '@/lib/dashboardCommands';
import useLiveBotStatus from '@/components/home/useLiveBotStatus';
import { resolveBotStatus } from '@/lib/botStatus';
import { dashboardGuard } from '@/lib/dashboardGuard';

interface GuildConfig {
  prefix?: string;
  lang?: string;
  leveling_enabled?: boolean;
  level_channel_id?: string | null;
  xp_rate?: number;
  welcome_channel_id?: string | null;
  welcome_message?: string;
  goodbye_channel_id?: string | null;
  goodbye_message?: string;
  autorole_ids?: string[];
  counters?: { type: string; channel_id: string }[];
  logs_channel_id?: string | null;
  tickets_enabled?: boolean;
  tickets_category_id?: string | null;
  tickets_role_id?: string | null;
  private_channels?: boolean;
  private_category_id?: string | null;
  music_channel_id?: string | null;
  mute_role_id?: string | null;
  automod_enabled?: boolean;
  leaderboard_enabled?: boolean;
  leaderboard_slug?: string | null;
  coin_emoji?: string;
  coin_name?: string;
  staff_role_id?: string | null;
  level_message?: string;
  level_roles?: { level: number; role_id: string }[];
  automod_config?: { links: boolean; invites: boolean; caps: boolean; spam: boolean; flood: boolean; words: string[] };
  drops?: {
    list: {
      id: string;
      name: string;
      enabled: boolean;
      channels: string[];
      min: number;
      max: number;
      interval_min: number;
      interval_max: number;
      message: string | null;
      excluded_roles: string[];
    }[];
  };
  starboard_channel_id?: string | null;
  starboard_emoji?: string;
  starboard_min?: number;
  invite_points_per?: number;
  invite_rewards?: { invites: number; role_id: string }[];
  history_enabled?: boolean;
  history_channel_id?: string | null;
  afk_role_id?: string | null;
  afk_prefix_enabled?: boolean;
  afk_auto_minutes?: number;
  marriage_enabled?: boolean;
  marriage_allow_admin_pairs?: boolean;
  command_global_cooldown?: number;
  counting_enabled?: boolean;
  counting_channel_id?: string | null;
  counting_start?: number;
  counting_style?: 'traditional' | 'sum';
  counting_allow_repeat?: boolean;
  counting_authenticity?: 'solo' | 'dependent';
  marriage_excluded_role_ids?: string[];
  nitro_repost_mode?: 'auto' | 'manual';
  nitro_excluded_role_ids?: string[];
  owner_role_ids?: string[];
  admin_role_ids?: string[];
  mod_role_ids?: string[];
  bot_role_ids?: string[];
  nitro_repost_enabled?: boolean;
  private_vc_hub_id?: string | null;
  alliance_config?: {
    enabled: boolean;
    channel_id: string | null;
    role_id: string | null;
    notify_role_id: string | null;
    cooldown_hours: number;
    one_per_server: boolean;
    allow_nsfw: boolean;
    blocked_words: string[];
    blocked_servers: string[];
    sanction: 'none' | 'mute' | 'kick' | 'ban';
    sanction_minutes: number;
    rewards: { points: number; role_id?: string; money?: number }[];
    embed_success: { title: string; description: string; color: string };
    embed_error: { title: string; description: string; color: string };
    error_delete_after: number;
  };
  ticket_config?: {
    enabled: boolean;
    panel_channel_id: string | null;
    log_channel_id: string | null;
    auto_delete_hours: number;
    categories: {
      id: string;
      label: string;
      emoji: string;
      description: string;
      discord_category_id: string | null;
      role_ids: string[];
      grant_role_id: string | null;
      form: string[];
      welcome: string;
      color: string;
    }[];
  };
  /** Toggles por servidor de funciones del bot (slug → enabled). */
  features?: Record<string, boolean>;
  /** true si el servidor ya tiene al menos un cambio guardado en la DB. */
  configured?: boolean;
  /** true si el servidor tiene Premium activo (límites ampliados). */
  premium?: boolean;
}

type SectionKey = 'general' | 'messages' | 'levels' | 'welcome' | 'goodbye' | 'economy' | 'starboard' | 'nitro' | 'staff' | 'invites' | 'vcs' | 'counting' | 'automod' | 'alliance' | 'tickets' | 'stats' | 'history' | `feat:${string}`;
type PartialConfig = Partial<GuildConfig>;

/** Payload de un export JSON (vista previa + descarga). */
interface JsonPreviewPayload {
  meta: Record<string, unknown>;
  config: Record<string, unknown>;
}

/** Sub-opciones (toggles individuales) dentro de una opción de config. */
const SUB_TOGGLES: Record<string, { slug: string; labelKey: keyof Dict['guildPage']; descKey: keyof Dict['guildPage'] }[]> = {
  minigames: [
    { slug: 'minigame_dice', labelKey: 'featDice', descKey: 'featDiceDesc' },
    { slug: 'minigame_rps', labelKey: 'featRps', descKey: 'featRpsDesc' },
    { slug: 'minigame_rate', labelKey: 'featRate', descKey: 'featRateDesc' },
    { slug: 'minigame_8ball', labelKey: 'feat8ball', descKey: 'feat8ballDesc' },
  ],
  social: [
    { slug: 'social_afk', labelKey: 'socialAfk', descKey: 'socialAfkDesc' },
    { slug: 'social_marriage', labelKey: 'socialMarriage', descKey: 'socialMarriageDesc' },
  ],
  utility: [
    { slug: 'util_profile', labelKey: 'utilProfile', descKey: 'utilProfileDesc' },
    { slug: 'util_avatar', labelKey: 'utilAvatar', descKey: 'utilAvatarDesc' },
    { slug: 'util_animal', labelKey: 'utilAnimal', descKey: 'utilAnimalDesc' },
    { slug: 'util_serverinfo', labelKey: 'utilServerinfo', descKey: 'utilServerinfoDesc' },
    { slug: 'util_snipe', labelKey: 'utilSnipe', descKey: 'utilSnipeDesc' },
    { slug: 'util_text', labelKey: 'utilText', descKey: 'utilTextDesc' },
  ],
  misc: [
    { slug: 'misc_confess', labelKey: 'miscConfess', descKey: 'miscConfessDesc' },
    { slug: 'misc_hi', labelKey: 'miscHi', descKey: 'miscHiDesc' },
    { slug: 'misc_bye', labelKey: 'miscBye', descKey: 'miscByeDesc' },
    { slug: 'misc_test', labelKey: 'miscTest', descKey: 'miscTestDesc' },
  ],
};

const SECTION_KEYS: Record<'general' | 'messages' | 'levels' | 'welcome' | 'goodbye' | 'economy' | 'starboard' | 'nitro' | 'staff' | 'invites' | 'vcs' | 'counting' | 'automod' | 'alliance' | 'tickets' | 'stats' | 'history', (keyof GuildConfig)[]> = {
  general: ['prefix', 'lang', 'staff_role_id', 'owner_role_ids', 'admin_role_ids', 'mod_role_ids', 'bot_role_ids', 'mute_role_id'],
  messages: [],
  levels: ['leveling_enabled', 'level_channel_id', 'xp_rate', 'level_message', 'level_roles'],
  welcome: ['welcome_channel_id', 'welcome_message', 'autorole_ids'],
  goodbye: ['goodbye_channel_id', 'goodbye_message'],
  invites: ['invite_points_per', 'invite_rewards'],
  vcs: ['private_channels', 'private_category_id', 'private_vc_hub_id'],
  counting: ['counting_enabled', 'counting_channel_id', 'counting_start', 'counting_style', 'counting_allow_repeat', 'counting_authenticity'],
  history: ['history_enabled', 'history_channel_id'],
  economy: ['coin_emoji', 'coin_name', 'drops', 'invite_points_per'],
  starboard: ['starboard_channel_id', 'starboard_emoji', 'starboard_min'],
  nitro: ['nitro_repost_enabled'],
  staff: ['staff_role_id'],
  automod: ['automod_enabled', 'automod_config', 'admin_role_ids', 'mod_role_ids', 'mute_role_id'],
  alliance: ['alliance_config'],
  tickets: ['ticket_config', 'tickets_enabled', 'tickets_category_id', 'tickets_role_id', 'music_channel_id', 'mute_role_id', 'logs_channel_id'],
  stats: ['counters'],
};

const ALL_KEYS: (keyof GuildConfig)[] = Object.values(SECTION_KEYS).flat();

/** Scope de una función (`feat:<slug>`): exporta/importa solo su toggle. */
const featScope = (slug: string): SectionKey => `feat:${slug}`;
const isFeatScope = (s: SectionKey): s is `feat:${string}` => s.startsWith('feat:');
const featSlugOf = (s: SectionKey): string => s.slice('feat:'.length);

/** Funciones configurables por servidor (toggles del dashboard).
 *  Economía, Niveles y Configuración YA NO tienen toggle: sus opciones viven
 *  en las secciones de configuración (siempre activas salvo kill switch global
 *  desde la devcon). */
const FEATURE_ROWS: { slug: string; icon: string; labelKey: keyof Dict['guildPage']; descKey: keyof Dict['guildPage']; premium?: boolean; colorClass?: string }[] = [
  { slug: 'music', icon: 'music', labelKey: 'featMusic', descKey: 'featMusicDesc', premium: true },
  { slug: 'search', icon: 'search', labelKey: 'featSearch', descKey: 'featSearchDesc', premium: true },
  { slug: 'minigames', icon: 'gamepad', labelKey: 'featMinigames', descKey: 'featMinigamesDesc' },
  { slug: 'giveaways', icon: 'trophy', labelKey: 'featGiveaways', descKey: 'featGiveawaysDesc' },
  { slug: 'embeds', icon: 'ri-braces', labelKey: 'featEmbeds', descKey: 'featEmbedsDesc', premium: true, colorClass: 'text-purple-400' },
  { slug: 'misc', icon: 'box-archive', labelKey: 'featMisc', descKey: 'featMiscDesc' },
  { slug: 'utility', icon: 'ri-code-s-slash', labelKey: 'featUtility', descKey: 'featUtilityDesc' },
  { slug: 'moderation', icon: 'gavel', labelKey: 'featModeration', descKey: 'featModerationDesc' },
  { slug: 'social', icon: 'users', labelKey: 'featSocial', descKey: 'featSocialDesc' },
];

/** Permisos clave del bot (bitfields de Discord). */
const PERMS: { key: string; bit: number }[] = [
  { key: 'permManageGuild', bit: 32 },
  { key: 'permManageRoles', bit: 268435456 },
  { key: 'permManageChannels', bit: 16 },
  { key: 'permManageMessages', bit: 8192 },
  { key: 'permKick', bit: 2 },
  { key: 'permBan', bit: 4 },
];

/** ¿El bitfield del bot incluye el permiso? null = no se pudo verificar. */
function hasPerm(bitfield: string | null | undefined, bit: number): boolean | null {
  if (!bitfield) return null;
  try {
    const value = BigInt(bitfield);
    const admin = BigInt(8);
    if ((value & admin) === admin) return true;
    const needed = BigInt(bit);
    return (value & needed) === needed;
  } catch {
    return null;
  }
}

/** Aviso de permiso faltante con enlace de re-invitación. */
function PermWarning({
  perms,
  bit,
  label,
  missing,
  href,
}: {
  perms: string | null | undefined;
  bit: number;
  label: string;
  missing: string;
  href: string;
}) {
  if (hasPerm(perms, bit) !== false) return null;
  return (
    <InviteLink
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400 transition hover:bg-amber-400/20"
    >
      ⚠ {missing.replace('{perm}', label)}
    </InviteLink>
  );
}

interface Props {
  guildId: string;
  guildName: string;
  guildIcon: string | null;
  username: string | null;
  guildInfo: GuildInfo | null;
  /** Presencia real del bot: true | false | null (no se pudo verificar). */
  hasBotGuild?: boolean | null;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-white/85">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-white/45">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-neon-blue';

const toggleCls = (on: boolean) =>
  `relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-gradient-to-r from-neon-blue to-neon-pink' : 'bg-white/15'}`;

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className={toggleCls(on)} aria-pressed={on}>
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

function Badge({ kind, dict }: { kind: 'free' | 'premium'; dict: Dict }) {
  if (kind === 'free') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
        <Icon name="gift" size={9} className="shrink-0" />
        {dict.guildPage.free}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-neon-pink/50 bg-neon-pink/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-neon-pink">
      <Icon name="crown" size={9} className="shrink-0" />
      {dict.guildPage.premium}
      <span aria-hidden className="opacity-60">·</span>
      <Icon name="clock" size={9} className="shrink-0" />
      {dict.guildPage.betaBadge}
    </span>
  );
}

function SelectField({
  label,
  hint,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string | null | undefined;
  placeholder: string;
  options: { id: string; label: string }[];
  onChange: (v: string | null) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <select
        className={inputCls}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="" className="bg-[#0a0a14]">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-[#0a0a14]">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

const FloppyMini = ({ size = 11 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
    <path d="M5 3h11.2L21 7.8V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 2v5h8V5H7zm-1 9v5h12v-5H6z" />
  </svg>
);

/** Etiqueta de sub-opción Premium (gratis durante la beta). */
function PremiumTag({ label, betaNote, betaLabel }: { label: string; betaNote: string; betaLabel?: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span
        title={betaNote}
        className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-400"
      >
        <Icon name="crown" size={9} className="shrink-0" />
        {label}
      </span>
      {betaLabel && (
        <span
          title={betaNote}
          className="inline-flex items-center gap-1 rounded-full border border-neon-pink/50 bg-neon-pink/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-neon-pink"
        >
          <Icon name="clock" size={9} className="shrink-0" />
          {betaLabel}
        </span>
      )}
    </span>
  );
}

/**
 * Import/Export JSON de una sección: botones junto al título de la opción.
 * Solo funcionan con el estado guardado (sin cambios pendientes) y avisan
 * por flash de éxito o error.
 */
function SectionJson({
  disabled,
  disabledHint,
  exportLabel,
  importLabel,
  onExport,
  onImport,
}: {
  disabled: boolean;
  disabledHint: string;
  exportLabel: string;
  importLabel: string;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const btn =
    'inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-white/50 transition hover:border-neon-blue/60 hover:text-neon-blue disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <span className="ml-auto inline-flex items-center gap-1.5" title={disabled ? disabledHint : undefined}>
      <button type="button" disabled={disabled} onClick={onExport} className={btn} title={exportLabel}>
        <FloppyMini />
        <Icon name="json" size={11} />
        <Icon name="clock" size={10} />
        <span className="hidden sm:inline">{exportLabel}</span>
        <span>↓</span>
      </button>
      <button type="button" disabled={disabled} onClick={() => fileRef.current?.click()} className={btn} title={importLabel}>
        <FloppyMini />
        <Icon name="json" size={11} />
        <Icon name="clock" size={10} />
        <span className="hidden sm:inline">{importLabel}</span>
        <span>↑</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = '';
        }}
      />
    </span>
  );
}

export default function DashboardGuildClient({ guildId, guildName, guildIcon, username, guildInfo, hasBotGuild = null }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dict, setDict] = useState<Dict>(() => getDict('es-latam'));
  useEffect(() => {
    setDict(getDict(readCookieLang()));
  }, []);
  const t = dict.guildPage;

  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [config, setConfig] = useState<GuildConfig | null>(null);
  const [baseline, setBaseline] = useState<string>('');
  const [history, setHistory] = useState<GuildConfig[]>([]);
  const [future, setFuture] = useState<GuildConfig[]>([]);
  const [autoSave, setAutoSave] = useState(false);
  const okTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leavePrompt, setLeavePrompt] = useState<
    { kind: 'view'; target: GuildView } | { kind: 'nav'; href: string } | null
  >(null);
  const [blocked, setBlocked] = useState(false);
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [serverHistory, setServerHistory] = useState<
    { id: number; createdAt: string; actorId: string | null; detail: { fields?: string[]; features?: Record<string, boolean> } | null }[] | null
  >(null);
  const [resetAsk, setResetAsk] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [subnavQuery, setSubnavQuery] = useState('');
  const [subnavFilter, setSubnavFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [subnavSort, setSubnavSort] = useState<'asc' | 'desc'>('asc');
  // Say/DirectSay desde el dashboard (cola de acciones del bot).
  const [msgType, setMsgType] = useState<'say' | 'directsay'>('say');
  const [msgChannel, setMsgChannel] = useState<string | null>(null);
  const [msgContent, setMsgContent] = useState('');
  const [msgBusy, setMsgBusy] = useState(false);
  const [msgStatus, setMsgStatus] = useState<{ kind: 'ok' | 'error' | 'pending'; text: string } | null>(null);
  // Manager de giveaways (panel del feat:giveaways).
  type GwRow = {
    id: string;
    prize: string;
    status: string;
    ended: boolean;
    winners: number;
    winner_ids: string[];
    channel_id: string;
    hosted_by: string;
    source: string;
    ends_at: string;
    participants: number;
    max_participants: number;
    required_messages: number;
  };
  const [gwList, setGwList] = useState<GwRow[]>([]);
  const [gwFilter, setGwFilter] = useState<'all' | 'running' | 'paused' | 'ended' | 'cancelled'>('all');
  const [gwBusy, setGwBusy] = useState<string | null>(null);
  const [gwOpen, setGwOpen] = useState<string | null>(null);
  const [gwParts, setGwParts] = useState<Record<string, { participants: Array<{ userId: string; entries: number }>; bans: string[] }>>({});
  const [gwCreateOpen, setGwCreateOpen] = useState(false);
  const [gwForm, setGwForm] = useState<{
    prize: string;
    winners: number;
    minutes: number;
    channel: string | null;
    required: string[];
    grant: string[];
    maxPart: number;
    reqMsg: number;
    bonus: { role_id: string; multiplier: number }[];
  }>({ prize: '', winners: 1, minutes: 60, channel: null, required: [], grant: [], maxPart: 0, reqMsg: 0, bonus: [] });
  const [exportPreview, setExportPreview] = useState<{
    name: string;
    payload: JsonPreviewPayload;
  } | null>(null);
  const [importPreview, setImportPreview] = useState<{
    fileName: string;
    clean: PartialConfig;
    changed: { key: string; from: unknown; to: unknown }[];
    unchanged: string[];
    ignored: string[];
  } | null>(null);

  useEffect(() => {
    setAutoSave(localStorage.getItem('cz-dash-autosave') === '1');
  }, []);

  // Sub-sidebar por opción: resumen por defecto (spec del dashboard).
  type GuildView =
    | 'general'
    | 'messages'
    | 'levels'
    | 'welcome'
    | 'goodbye'
    | 'invites'
    | 'vcs'
    | 'counting'
    | 'economy'
    | 'starboard'
    | 'nitro'
    | 'staff'
    | 'automod'
    | 'alliance'
    | 'tickets'
    | 'stats'
    | 'history'
    | `feat:${string}`;
  const [view, setView] = useState<GuildView>('general');
  useEffect(() => {
    const saved = localStorage.getItem('cz-dash-view') as GuildView | null;
    if (
      saved &&
      (['general', 'messages', 'levels', 'welcome', 'goodbye', 'economy', 'starboard', 'nitro', 'staff', 'invites', 'vcs', 'counting', 'automod', 'alliance', 'tickets', 'stats', 'history'].includes(saved) ||
        saved.startsWith('feat:'))
    ) {
      setView(saved);
    }
  }, []);
  const dirtyRef = useRef(false);
  const shakeDock = useCallback(() => {
    setBlocked(true);
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    blockedTimer.current = setTimeout(() => setBlocked(false), 900);
  }, []);
  const changeView = useCallback(
    (next: GuildView) => {
      if (dirtyRef.current) {
        shakeDock();
        setLeavePrompt({ kind: 'view', target: next });
        return;
      }
      setView(next);
      try {
        localStorage.setItem('cz-dash-view', next);
      } catch {
        /* sin storage */
      }
    },
    [shakeDock]
  );

  // Deep-links del resumen global: #summary (primera info) y #config (config real).
  useEffect(() => {
    const hash = window.location.hash;
    if (hash !== '#summary' && hash !== '#config') return;
    if (hash === '#config') {
      setView('general');
      try {
        localStorage.setItem('cz-dash-view', 'general');
      } catch {
        /* sin storage */
      }
    } else {
      // #summary ya no es una vista: la info vive en el header del servidor.
      setView('general');
      try {
        localStorage.setItem('cz-dash-view', 'general');
      } catch {
        /* sin storage */
      }
    }
    const id = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    return () => clearTimeout(id);
  }, []);
  const SUBNAV: ReadonlyArray<{ key: GuildView; icon: string; label: keyof Dict['guildPage']; tag: 'free' | 'premium' | 'mixed' }> = [
    { key: 'general', icon: 'settings', label: 'subnavGeneral', tag: 'free' },
    { key: 'messages', icon: 'message', label: 'subnavMessages', tag: 'free' },
    ...FEATURE_ROWS.map((f) => ({
      key: `feat:${f.slug}` as GuildView,
      icon: f.icon,
      label: f.labelKey,
      tag: f.premium ? ('premium' as const) : ('free' as const),
    })),
    { key: 'levels', icon: 'chart-bar', label: 'subnavLevels', tag: 'mixed' },
    { key: 'economy', icon: 'money-bill-trend-up', label: 'subnavEconomy', tag: 'free' },
    { key: 'starboard', icon: 'star', label: 'subnavStarboard', tag: 'free' },
    { key: 'nitro', icon: 'bolt', label: 'subnavNitro', tag: 'free' },
    { key: 'staff', icon: 'admin-panel-settings', label: 'subnavStaff', tag: 'free' },
    { key: 'alliance', icon: 'handshake', label: 'subnavAlliance', tag: 'free' },
    { key: 'tickets', icon: 'support', label: 'subnavTickets', tag: 'free' },
    { key: 'automod', icon: 'shield', label: 'subnavAutomod', tag: 'free' },
    { key: 'stats', icon: 'chart-line', label: 'subnavStats', tag: 'free' },
    { key: 'welcome', icon: 'heart', label: 'subnavWelcome', tag: 'free' },
    { key: 'goodbye', icon: 'logout', label: 'subnavGoodbye', tag: 'free' },
    { key: 'invites', icon: 'address-book', label: 'subnavInvites', tag: 'free' },
    { key: 'vcs', icon: 'cast', label: 'subnavVcs', tag: 'free' },
    { key: 'counting', icon: 'calculator', label: 'subnavCounting', tag: 'free' },
    { key: 'history', icon: 'verified', label: 'subnavHistory', tag: 'free' },
  ];

  const activeFeature = view.startsWith('feat:')
    ? (FEATURE_ROWS.find((f) => `feat:${f.slug}` === view) ?? null)
    : null;

  const searchUi = dict.dashboardPage.searchUi;
  const visibleSubnav = SUBNAV.filter((item) => {
    const q = subnavQuery.trim().toLowerCase();
    const matchQ = !q || t[item.label].toLowerCase().includes(q);
    const matchF = subnavFilter === 'all' ? true : subnavFilter === 'free' ? item.tag === 'free' : item.tag !== 'free';
    return matchQ && matchF;
  }).sort((a, b) => {
    // General SIEMPRE fija arriba, independiente de filtros u ordenamiento.
    if (a.key === 'general') return -1;
    if (b.key === 'general') return 1;
    return subnavSort === 'asc' ? t[a.label].localeCompare(t[b.label]) : t[b.label].localeCompare(t[a.label]);
  });

  // Historial del servidor (auditoría): se carga al entrar a la pestaña.
  useEffect(() => {
    if (view !== 'history' || serverHistory !== null) return;
    let active = true;
    fetch(`/api/dashboard/history?guildId=${guildId}`)
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((j) => {
        if (active) setServerHistory(j.entries ?? []);
      })
      .catch(() => {
        if (active) setServerHistory([]);
      });
    return () => {
      active = false;
    };
  }, [view, serverHistory, guildId]);

  const setAutoSavePref = useCallback((value: boolean) => {
    setAutoSave(value);
    localStorage.setItem('cz-dash-autosave', value ? '1' : '0');
  }, []);

  // Manager de giveaways: carga + refresco en tiempo real (10s) mientras se ve.
  useEffect(() => {
    if (view !== 'feat:giveaways') return;
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/dashboard/${guildId}/giveaways`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as { giveaways?: GwRow[] };
        if (active) setGwList(json.giveaways ?? []);
      } catch {
        /* red */
      }
    };
    void load();
    const timer = setInterval(() => void load(), 10_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [view, guildId]);

  const gwAction = useCallback(
    async (action: string, giveawayId: string, userId?: string) => {
      setGwBusy(`${giveawayId}:${action}`);
      try {
        const res = await fetch(`/api/dashboard/${guildId}/giveaways`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, giveaway_id: giveawayId, ...(userId ? { user_id: userId } : {}) }),
        });
        toast(res.ok ? t.gwSent : t.gwError, res.ok ? 'success' : 'error');
      } catch {
        toast(t.gwError, 'error');
      } finally {
        setTimeout(() => setGwBusy(null), 3000);
      }
    },
    [guildId, toast, t.gwSent, t.gwError],
  );

  const gwToggleParticipants = useCallback(
    async (id: string) => {
      if (gwOpen === id) {
        setGwOpen(null);
        return;
      }
      setGwOpen(id);
      if (!gwParts[id]) {
        try {
          const res = await fetch(`/api/dashboard/${guildId}/giveaways?id=${id}`, { cache: 'no-store' });
          if (res.ok) {
            const json = (await res.json()) as { participants?: Array<{ userId: string; entries: number }>; bans?: string[] };
            setGwParts((p) => ({ ...p, [id]: { participants: json.participants ?? [], bans: json.bans ?? [] } }));
          }
        } catch {
          /* red */
        }
      }
    },
    [guildId, gwOpen, gwParts],
  );

  const gwCreate = useCallback(async () => {
    if (!gwForm.channel || !gwForm.prize.trim()) {
      toast(t.gwError, 'error');
      return;
    }
    setGwBusy('create');
    try {
      const res = await fetch(`/api/dashboard/${guildId}/giveaways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          prize: gwForm.prize.trim(),
          winners: gwForm.winners,
          duration_minutes: gwForm.minutes,
          channel_id: gwForm.channel,
          required_role_ids: gwForm.required,
          grant_role_ids: gwForm.grant,
          max_participants: gwForm.maxPart,
          required_messages: gwForm.reqMsg,
          bonus_roles: gwForm.bonus,
        }),
      });
      if (res.ok) {
        toast(t.gwSent, 'success');
        setGwForm({ prize: '', winners: 1, minutes: 60, channel: null, required: [], grant: [], maxPart: 0, reqMsg: 0, bonus: [] });
        setGwCreateOpen(false);
      } else {
        toast(t.gwError, 'error');
      }
    } catch {
      toast(t.gwError, 'error');
    } finally {
      setTimeout(() => setGwBusy(null), 3000);
    }
  }, [guildId, gwForm, toast, t.gwError, t.gwSent]);

  /** Say/DirectSay: inserta la acción y sondea el resultado hasta 20s. */
  const sendMessage = useCallback(async () => {
    if (!msgChannel || !msgContent.trim() || msgBusy) return;
    setMsgBusy(true);
    setMsgStatus({ kind: 'pending', text: t.msgSending });
    try {
      const res = await fetch(`/api/dashboard/${guildId}/say`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: msgType, channel_id: msgChannel, content: msgContent.trim() }),
      });
      const json = (await res.json()) as { ok?: boolean; id?: number; error?: string };
      if (!res.ok || !json.ok || !json.id) {
        setMsgStatus({ kind: 'error', text: json.error ?? t.msgSentError });
        return;
      }
      const actionId = json.id;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const poll = await fetch(`/api/dashboard/${guildId}/say?id=${actionId}`, { cache: 'no-store' });
        if (!poll.ok) continue;
        const data = (await poll.json()) as { action?: { processed: boolean; result: string | null } | null };
        const action = data.action;
        if (!action) continue;
        if (action.processed) {
          if (action.result === 'ok') {
            setMsgStatus({ kind: 'ok', text: t.msgSentOk });
            setMsgContent('');
          } else {
            setMsgStatus({ kind: 'error', text: action.result ?? t.msgSentError });
          }
          return;
        }
      }
      setMsgStatus({ kind: 'pending', text: t.msgPending });
    } catch {
      setMsgStatus({ kind: 'error', text: t.msgSentError });
    } finally {
      setMsgBusy(false);
    }
  }, [guildId, msgBusy, msgChannel, msgContent, msgType, t.msgPending, t.msgSentError, t.msgSentOk, t.msgSending]);

  const { data: serverConfig, isPending } = useQuery({
    queryKey: ['guild-config', guildId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/${guildId}`, { cache: 'no-store' });
      if (res.status === 403 || res.status === 401) {
        window.location.href = '/dashboard';
        return null;
      }
      const json = (await res.json()) as { config?: GuildConfig | null; features?: Record<string, boolean>; configured?: boolean; premium?: boolean };
      const cfg = json.config;
      return {
        prefix: cfg?.prefix ?? 'cz!',
        lang: cfg?.lang ?? 'es',
        leveling_enabled: cfg?.leveling_enabled ?? false,
        level_channel_id: cfg?.level_channel_id ?? null,
        xp_rate: cfg?.xp_rate ?? 1,
        welcome_channel_id: cfg?.welcome_channel_id ?? null,
        welcome_message: cfg?.welcome_message ?? 'Bienvenido/a {user} a {guild}!',
        goodbye_channel_id: cfg?.goodbye_channel_id ?? null,
        goodbye_message: cfg?.goodbye_message ?? 'Adiós {user}, que te vaya bien!',
        autorole_ids: Array.isArray(cfg?.autorole_ids) ? cfg.autorole_ids : [],
        logs_channel_id: cfg?.logs_channel_id ?? null,
        tickets_enabled: cfg?.tickets_enabled ?? false,
        private_channels: cfg?.private_channels ?? false,
        automod_enabled: cfg?.automod_enabled ?? false,
        tickets_category_id: cfg?.tickets_category_id ?? null,
        tickets_role_id: cfg?.tickets_role_id ?? null,
        private_category_id: cfg?.private_category_id ?? null,
        music_channel_id: cfg?.music_channel_id ?? null,
        mute_role_id: cfg?.mute_role_id ?? null,
        leaderboard_enabled: cfg?.leaderboard_enabled ?? false,
        leaderboard_slug: cfg?.leaderboard_slug ?? null,
        coin_emoji: cfg?.coin_emoji ?? '🪙',
        coin_name: cfg?.coin_name ?? 'monedas',
        staff_role_id: cfg?.staff_role_id ?? null,
        level_message: cfg?.level_message ?? '🎉 ¡{user} subió al nivel {level} en {guild}!',
        level_roles: Array.isArray(cfg?.level_roles) ? cfg.level_roles : [],
        automod_config: cfg?.automod_config ?? { links: false, invites: false, caps: false, spam: false, flood: false, words: [] },
        drops: cfg?.drops ?? { enabled: false, channels: [], min: 50, max: 200, interval_min: 60, interval_max: 180, message: null, excluded_roles: [] },
        starboard_channel_id: cfg?.starboard_channel_id ?? null,
        starboard_emoji: cfg?.starboard_emoji ?? '⭐',
        starboard_min: cfg?.starboard_min ?? 3,
        invite_points_per: cfg?.invite_points_per ?? 1,
        invite_rewards: Array.isArray(cfg?.invite_rewards) ? cfg.invite_rewards : [],
        history_enabled: cfg?.history_enabled ?? true,
        history_channel_id: cfg?.history_channel_id ?? null,
        afk_role_id: cfg?.afk_role_id ?? null,
        afk_prefix_enabled: cfg?.afk_prefix_enabled ?? false,
        afk_auto_minutes: cfg?.afk_auto_minutes ?? 0,
        marriage_enabled: cfg?.marriage_enabled ?? true,
        marriage_allow_admin_pairs: cfg?.marriage_allow_admin_pairs ?? true,
        command_global_cooldown: cfg?.command_global_cooldown ?? 3,
        counting_enabled: cfg?.counting_enabled ?? false,
        counting_channel_id: cfg?.counting_channel_id ?? null,
        counting_start: cfg?.counting_start ?? 0,
        counting_style: cfg?.counting_style ?? 'traditional',
        counting_allow_repeat: cfg?.counting_allow_repeat ?? false,
        counting_authenticity: cfg?.counting_authenticity ?? 'dependent',
        marriage_excluded_role_ids: Array.isArray(cfg?.marriage_excluded_role_ids) ? cfg.marriage_excluded_role_ids : [],
        nitro_repost_mode: cfg?.nitro_repost_mode ?? 'auto',
        nitro_excluded_role_ids: Array.isArray(cfg?.nitro_excluded_role_ids) ? cfg.nitro_excluded_role_ids : [],
        owner_role_ids: Array.isArray(cfg?.owner_role_ids) ? cfg.owner_role_ids : [],
        admin_role_ids: Array.isArray(cfg?.admin_role_ids) ? cfg.admin_role_ids : [],
        mod_role_ids: Array.isArray(cfg?.mod_role_ids) ? cfg.mod_role_ids : [],
        bot_role_ids: Array.isArray(cfg?.bot_role_ids) ? cfg.bot_role_ids : [],
        nitro_repost_enabled: cfg?.nitro_repost_enabled ?? false,
        private_vc_hub_id: cfg?.private_vc_hub_id ?? null,
        alliance_config: cfg?.alliance_config,
        ticket_config: cfg?.ticket_config,
        configured: json.configured === true,
        premium: json.premium === true,
        features: json.features ?? {},
      } as GuildConfig;
    },
  });

  useEffect(() => {
    if (serverConfig && !config) {
      setConfig(serverConfig);
      setBaseline(JSON.stringify(serverConfig));
    }
  }, [serverConfig, config]);

  const {
    data: liveGuild,
    refetch: refetchGuild,
    isFetching: guildFetching,
  } = useQuery({
    queryKey: ['guild-info', guildId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/${guildId}/guild`, { cache: 'no-store' });
      if (!res.ok) throw new Error('guild_info');
      return (await res.json()) as GuildInfo;
    },
    initialData: guildInfo ?? undefined,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });
  const guildData = liveGuild ?? guildInfo ?? null;

  // Estado real del bot (heartbeat/modo manual) para avisos y bloqueos suaves.
  const liveStatus = useLiveBotStatus(null);
  const resolved = resolveBotStatus(liveStatus, Date.now());
  const offline = liveStatus !== null && !resolved.online;
  const offlineReasonKey = resolved.reason ?? 'unknown';
  const botOnlineNow = liveStatus ? resolved.online : Boolean(guildData);
  const offlineRef = useRef(false);
  offlineRef.current = offline;
  const dictRef = useRef(dict);
  dictRef.current = dict;
  const liveStatusRef = useRef(liveStatus);
  liveStatusRef.current = liveStatus;
  const botStatusDict = () => dictRef.current.botStatus;

  const dirty = useMemo(
    () => Boolean(config) && JSON.stringify(config) !== baseline,
    [config, baseline]
  );
  const busy = status === 'saving';
  dirtyRef.current = dirty;

  // Guard compartido con el shell: bloquea el cambio de servidor con cambios
  // pendientes (el shell llama requestNav → sacudida + modal aquí).
  useEffect(() => {
    dashboardGuard.setDirty(dirty);
  }, [dirty]);
  useEffect(() => {
    const off = dashboardGuard.onShake(() => {
      const href = dashboardGuard.consumePending();
      shakeDock();
      setLeavePrompt({ kind: 'nav', href: href ?? '/dashboard' });
    });
    return off;
  }, [shakeDock]);

  const update = useCallback(
    (patch: Partial<GuildConfig>) => {
      setConfig((prev) => {
        if (!prev || status === 'saving') return prev;
        setHistory((h) => [...h.slice(-29), prev]);
        setFuture([]);
        return { ...prev, ...patch };
      });
    },
    [status]
  );

  const undo = useCallback(() => {
    setConfig((prev) => {
      if (!prev || history.length === 0) return prev;
      const last = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setFuture((f) => [...f, prev]);
      return last;
    });
  }, [history]);

  const redo = useCallback(() => {
    setConfig((prev) => {
      if (!prev || future.length === 0) return prev;
      const next = future[future.length - 1];
      setFuture((f) => f.slice(0, -1));
      setHistory((h) => [...h, prev]);
      return next;
    });
  }, [future]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const saveMutation = useMutation({
    mutationFn: async (patch: GuildConfig) => {
      const res = await fetch(`/api/dashboard/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error === 'slug_taken' ? 'slug_taken' : 'save_failed');
      }
      return res.json();
    },
    onMutate: () => {
      setError(null);
      setStatus('saving');
    },
    onSuccess: (_data, variables) => {
      setBaseline(JSON.stringify(variables));
      void queryClient.invalidateQueries({ queryKey: ['guild-config', guildId] });
      setStatus('ok');
      try {
        const entry = {
          ts: Date.now(),
          guildId,
          guildName,
          fields: Object.keys(variables).filter((k) => k !== 'features'),
          features: variables.features ?? undefined,
        };
        const list = JSON.parse(localStorage.getItem('cz-dash-saves') ?? '[]') as unknown[];
        list.unshift(entry);
        localStorage.setItem('cz-dash-saves', JSON.stringify(list.slice(0, 30)));
        localStorage.setItem(
          'cz-dash-saves-total',
          String(Number(localStorage.getItem('cz-dash-saves-total') ?? '0') + 1)
        );
        sessionStorage.setItem(
          'cz-dash-saves-session',
          String(Number(sessionStorage.getItem('cz-dash-saves-session') ?? '0') + 1)
        );
      } catch {
        /* sin storage */
      }
      if (offlineRef.current) {
        setFlash(botStatusDict().saveOfflineNote.replace('{reason}', botStatusDict().reasons[resolveBotStatus(liveStatusRef.current, Date.now()).reason ?? 'unknown']));
        setTimeout(() => setFlash(null), 4500);
      }
      if (okTimer.current) clearTimeout(okTimer.current);
      okTimer.current = setTimeout(() => setStatus('idle'), 1200);
    },
    onError: (err: unknown) => {
      setStatus('error');
      setError(err instanceof Error && err.message === 'slug_taken' ? t.slugTaken : t.saveError);
    },
  });

  useEffect(() => {
    if (!autoSave || !dirty || busy || !config) return;
    const id = setTimeout(() => {
      if (!saveMutation.isPending) saveMutation.mutate(config);
    }, 2000);
    return () => clearTimeout(id);
  }, [autoSave, dirty, busy, config, saveMutation]);

  /** Resolución del modal de salida: guardar / descartar / quedarse. */
  const resolveLeave = useCallback(
    async (action: 'save' | 'discard' | 'stay') => {
      if (!leavePrompt) return;
      const prompt = leavePrompt;
      if (action === 'stay') {
        setLeavePrompt(null);
        return;
      }
      if (action === 'save') {
        if (!config || hasBotGuild === false) {
          setLeavePrompt(null);
          return;
        }
        try {
          await saveMutation.mutateAsync(config);
        } catch {
          setLeavePrompt(null);
          return;
        }
      } else {
        if (baseline) setConfig(JSON.parse(baseline) as GuildConfig);
        setHistory([]);
        setFuture([]);
      }
      setLeavePrompt(null);
      if (prompt.kind === 'view') {
        if (action === 'save') toast(t.leaveSaved, 'success');
        else toast(t.leaveDiscarded, 'info');
        setView(prompt.target);
        try {
          localStorage.setItem('cz-dash-view', prompt.target);
        } catch {
          /* sin storage */
        }
      } else {
        toast(action === 'save' ? t.leaveSaved : t.leaveDiscarded, action === 'save' ? 'success' : 'info');
        if (/^https?:\/\//.test(prompt.href)) {
          window.open(prompt.href, '_blank', 'noopener,noreferrer');
        } else {
          router.push(prompt.href);
        }
      }
    },
    [leavePrompt, config, baseline, hasBotGuild, saveMutation, router, toast, t.leaveSaved, t.leaveDiscarded]
  );

  useEffect(() => {
    return () => {
      if (okTimer.current) clearTimeout(okTimer.current);
    };
  }, []);

  const emojis = guildInfo?.emojis ?? [];
  const roles = guildData?.roles ?? [];
  const channels = guildData?.channels ?? [];
  const hasGuildData = roles.length > 0 || channels.length > 0;
  const textChannelOptions = channels
    .filter((c) => c.type === 0 || c.type === 5)
    .map((c) => ({ id: c.id, label: `#${c.name}` }));
  const voiceChannelOptions = channels
    .filter((c) => c.type === 2 || c.type === 13)
    .map((c) => ({ id: c.id, label: `🔊 ${c.name}` }));
  const categoryOptions = channels
    .filter((c) => c.type === 4)
    .map((c) => ({ id: c.id, label: `📁 ${c.name}` }));
  const roleOptions = roles.map((r) => ({ id: r.id, label: `@${r.name}` }));
  const categories = channels.filter((c) => c.type === 4);

  /** Defaults de bloques JSONB (coinciden con los del bot). */
  const dropsCfg = config?.drops ?? { list: [] as NonNullable<GuildConfig['drops']>['list'] };
  const automodCfg = config?.automod_config ?? { links: false, invites: false, caps: false, spam: false, flood: false, words: [] as string[] };
  const levelRoles = config?.level_roles ?? [];
  const allianceCfg = config?.alliance_config ?? {
    enabled: false,
    channel_id: null as string | null,
    role_id: null as string | null,
    notify_role_id: null as string | null,
    cooldown_hours: 24,
    one_per_server: true,
    allow_nsfw: false,
    blocked_words: [] as string[],
    blocked_servers: [] as string[],
    sanction: 'none' as 'none' | 'mute' | 'kick' | 'ban',
    sanction_minutes: 1440,
    rewards: [] as { points: number; role_id?: string; money?: number }[],
    embed_success: { title: '🤝 Nueva alianza', description: '{user} publicó la alianza con **{server}** ({invite})', color: '#22c55e' },
    embed_error: { title: '❌ Alianza no válida', description: '{reason}', color: '#ef4444' },
    error_delete_after: 15,
  };
  const ticketCfg = config?.ticket_config ?? {
    enabled: false,
    panel_channel_id: null as string | null,
    log_channel_id: null as string | null,
    auto_delete_hours: 24,
    categories: [] as NonNullable<GuildConfig['ticket_config']>['categories'],
  };

  const slug = useMemo(
    () =>
      guildName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'servidor',
    [guildName]
  );

  const exportScope = useCallback(
    (scope: SectionKey | 'all') => {
      if (!config) return;
      if (dirty) {
        setFlash(t.jsonNeedSave);
        setTimeout(() => setFlash(null), 4000);
        return;
      }
      const data =
        scope === 'all'
          ? config
          : isFeatScope(scope)
            ? { features: { [featSlugOf(scope)]: config.features?.[featSlugOf(scope)] ?? true } }
            : (Object.fromEntries(SECTION_KEYS[scope].map((k) => [k, config[k]])) as PartialConfig);
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
      const user = (username ?? 'usuario').replace(/[^a-z0-9-_.]/gi, '') || 'usuario';
      const name = `ciszubot_${scope.replace(':', '-')}_${slug}_${stamp}_${user}.json`;
      const payload = {
        meta: {
          app: 'CiszuBot',
          version: 1,
          scope,
          guildId,
          guildName,
          date: d.toISOString(),
          user: username ?? null,
        },
        config: data,
      };
      setExportPreview({ name, payload: payload as unknown as JsonPreviewPayload });
    },
    [config, dirty, guildId, guildName, slug, username, t.jsonNeedSave]
  );

  /** Descarga real del export (tras la vista previa). */
  const confirmExport = useCallback(() => {
    if (!exportPreview) return;
    const blob = new Blob([JSON.stringify(exportPreview.payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportPreview.name;
    a.click();
    URL.revokeObjectURL(url);
    try {
      const list = JSON.parse(localStorage.getItem('cz-dash-json-history') ?? '[]') as unknown[];
      list.unshift({ ts: Date.now(), guildId, guildName, kind: 'export', name: exportPreview.name });
      localStorage.setItem('cz-dash-json-history', JSON.stringify(list.slice(0, 30)));
    } catch {
      /* sin storage */
    }
    setExportPreview(null);
    setFlash(t.exported);
    setTimeout(() => setFlash(null), 3500);
  }, [exportPreview, guildId, guildName, t.exported]);

  const importFile = useCallback(
    async (file: File, scope?: SectionKey) => {
      if (!config) return;
      if (dirty) {
        setFlash(t.jsonNeedSave);
        setTimeout(() => setFlash(null), 4000);
        return;
      }
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as { config?: Partial<GuildConfig> } | Partial<GuildConfig>;
        const raw =
          parsed && typeof parsed === 'object' && 'config' in parsed && parsed.config
            ? parsed.config
            : (parsed as PartialConfig);
        const allowed: readonly string[] = scope
          ? isFeatScope(scope)
            ? ['features']
            : SECTION_KEYS[scope]
          : ALL_KEYS;
        const clean: Partial<GuildConfig> = {};
        for (const key of Object.keys(raw)) {
          if (allowed.includes(key)) {
            clean[key as keyof GuildConfig] = raw[key as keyof GuildConfig] as never;
          }
        }
        // Scope de función: solo el toggle de esa función.
        if (scope && isFeatScope(scope)) {
          const slugKey = featSlugOf(scope);
          const feats = (clean.features ?? {}) as Record<string, unknown>;
          const val = feats[slugKey];
          if (typeof val !== 'boolean') throw new Error('empty');
          clean.features = { [slugKey]: val };
        }
        if (Object.keys(clean).length === 0) throw new Error('empty');

        // Vista previa: solo los cambios (y lo que queda sin cambios).
        const changed: { key: string; from: unknown; to: unknown }[] = [];
        const unchanged: string[] = [];
        for (const [key, value] of Object.entries(clean)) {
          if (key === 'features') {
            for (const [s, v] of Object.entries((value ?? {}) as Record<string, unknown>)) {
              const from = config.features?.[s] ?? true;
              if (from === v) unchanged.push(`features.${s}`);
              else changed.push({ key: `features.${s}`, from, to: v });
            }
            continue;
          }
          const from = config[key as keyof GuildConfig];
          if (JSON.stringify(from) === JSON.stringify(value)) unchanged.push(key);
          else changed.push({ key, from, to: value });
        }
        const ignored = Object.keys(raw).filter((k) => !allowed.includes(k));
        setImportPreview({ fileName: file.name, clean, changed, unchanged, ignored });
      } catch {
        setStatus('error');
        setError(t.importError);
        setFlash(t.importError);
        setTimeout(() => setFlash(null), 4000);
      }
    },
    [config, dirty, t.importError, t.jsonNeedSave]
  );

  /** Aplica el import tras la vista previa. */
  const applyImport = useCallback(() => {
    if (!importPreview || !config) return;
    setHistory((h) => [...h.slice(-29), config]);
    setFuture([]);
    setConfig({ ...config, ...importPreview.clean });
    setStatus('idle');
    setError(null);
    try {
      const list = JSON.parse(localStorage.getItem('cz-dash-json-history') ?? '[]') as unknown[];
      list.unshift({ ts: Date.now(), guildId, guildName, kind: 'import', name: importPreview.fileName });
      localStorage.setItem('cz-dash-json-history', JSON.stringify(list.slice(0, 30)));
    } catch {
      /* sin storage */
    }
    setImportPreview(null);
    setFlash(t.imported);
    setTimeout(() => setFlash(null), 4000);
  }, [importPreview, config, guildId, guildName, t.imported]);

  const hue = useMemo(() => {
    const n = parseInt(guildId.slice(-6), 10);
    return Number.isFinite(n) ? n % 360 : 210;
  }, [guildId]);

  const copyLeaderboardUrl = useCallback(() => {
    const slugOrId = config?.leaderboard_slug || guildId;
    void navigator.clipboard
      .writeText(`https://ciszubot.vercel.app/leaderboard/${slugOrId}`)
      .then(() => toast(t.lbCopied, 'success'));
  }, [config?.leaderboard_slug, guildId, toast, t.lbCopied]);

  const resetLeaderboard = useCallback(async () => {
    setResetBusy(true);
    try {
      const res = await fetch(`/api/dashboard/${guildId}/leaderboard/reset`, { method: 'POST' });
      if (!res.ok) throw new Error('reset');
      toast(t.lbResetDone, 'success');
      setResetAsk(false);
    } catch {
      toast(t.lbResetError, 'error');
    } finally {
      setResetBusy(false);
    }
  }, [guildId, toast, t.lbResetDone, t.lbResetError]);

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-neon-blue" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-bg px-4 py-20 text-center text-white/70">{error ?? t.errorLoad}</div>
    );
  }

  const muted = busy ? 'pointer-events-none opacity-70' : '';

  return (
    <div
      className="min-h-screen pb-40"
      style={{
        background: `radial-gradient(900px 380px at 15% -5%, hsla(${hue}, 90%, 60%, 0.16), transparent 60%), radial-gradient(700px 320px at 95% 10%, hsla(${(hue + 80) % 360}, 90%, 60%, 0.12), transparent 55%)`,
      }}
    >
      <div className="mx-auto max-w-5xl px-4 pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-neon-blue"
        >
          <Icon name="arrow-right" size={14} className="rotate-180" /> {t.back}
        </Link>

        {/* Hero del servidor */}
        <div id="summary" className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-4">
            {guildIcon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png`}
                alt=""
                className="h-14 w-14 rounded-2xl"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple text-xl font-bold text-white">
                {guildName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold text-white">{guildName}</h1>
                <Badge kind="free" dict={dict} />
                {dirty && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {t.unsaved}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/50">{t.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => void refetchGuild()}
              disabled={guildFetching}
              title={t.refreshData}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 transition hover:border-neon-blue/60 hover:text-white disabled:opacity-50"
            >
              <span className={guildFetching ? 'inline-block animate-spin' : 'inline-block'}>⟳</span>
              <span className="hidden sm:inline">{guildFetching ? t.refreshing : t.refreshData}</span>
            </button>
          </div>

          {/* Resumen: datos en vivo del servidor */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.membersLabel}</p>
              <p className="text-lg font-bold text-white">{guildData?.memberCount ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.rolesLabel}</p>
              <p className="text-lg font-bold text-white">{roles.length || '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.channelsLabel}</p>
              <p className="text-lg font-bold text-white">{channels.length || '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.botLabel}</p>
              <p className={`text-lg font-bold ${hasBotGuild === false || !botOnlineNow ? 'text-red-400' : 'text-emerald-400'}`}>
                {hasBotGuild === false ? t.botNotInGuildShort : botOnlineNow ? t.botOnline : t.botOffline}
              </p>
              {hasBotGuild === false && (
                <p className="mt-0.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                  {t.botNotInGuild}
                </p>
              )}
              {hasBotGuild !== false && !botOnlineNow && liveStatus !== null && (
                <p className="mt-0.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                  {dict.botStatus.reasons[offlineReasonKey]}
                </p>
              )}
            </div>
          </div>
          {guildData?.botPermissions && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {t.permsTitle}
              </span>
              {PERMS.map((perm) => {
                const ok = hasPerm(guildData.botPermissions, perm.bit);
                if (ok === null) return null;
                return (
                  <span
                    key={perm.key}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                      ok
                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
                        : 'border-red-400/40 bg-red-400/10 text-red-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {(t[perm.key as keyof typeof t] as string) ?? perm.key}
                  </span>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-[10px] text-white/35">{t.refreshHint}</p>
          {flash && <p className="mt-2 text-xs font-semibold text-emerald-400">{flash}</p>}
          {error && status !== 'error' && <p className="mt-2 text-xs font-semibold text-red-400">{error}</p>}
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/50">
            {t.betaNote}
          </div>
        </div>

        {offline && (
          <div className="mt-6 rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-red-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              {dict.botStatus.bannerTitle}
            </p>
            <p className="mt-1 text-xs text-white/70">
              {dict.botStatus.bannerBody.replace('{reason}', dict.botStatus.reasons[offlineReasonKey])}
            </p>
            <p className="mt-1 text-[11px] text-white/45">
              {dict.botStatus.disabledNote} {dict.botStatus.refreshHint}
            </p>
          </div>
        )}

        {hasBotGuild === false && (
          <div className="mt-6 rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400">
              {t.botNotInGuildTitle}
            </p>
            <p className="mx-auto mt-1 max-w-xl text-xs text-white/70">{t.botNotInGuild}</p>
            <div className="mt-3 flex justify-center">
              <InviteLink
                href={INVITE_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
              >
                <Icon name="discord" size={14} className="[&>g]:fill-current" />
                {dict.dashboardPage.inviteCta}
              </InviteLink>
            </div>
          </div>
        )}

        <div className="mt-8 lg:flex lg:items-start lg:gap-6">
          <nav className="mb-4 flex gap-1.5 overflow-x-auto pb-1 lg:mb-0 lg:w-72 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
            <div className="mb-2 w-full space-y-1.5 lg:w-72">
              <input
                value={subnavQuery}
                onChange={(e) => setSubnavQuery(e.target.value)}
                placeholder={searchUi.placeholder}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-white outline-none placeholder:text-white/30 focus:border-neon-blue/60"
              />
              <div className="flex flex-wrap gap-1">
                {(['all', 'free', 'premium'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSubnavFilter(f)}
                    className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest transition ${
                      subnavFilter === f
                        ? 'border-neon-blue/60 bg-neon-blue/10 text-neon-blue'
                        : 'border-white/15 text-white/45 hover:text-white'
                    }`}
                  >
                    {f === 'all' ? searchUi.all : f === 'free' ? searchUi.free : searchUi.premium}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSubnavSort(subnavSort === 'asc' ? 'desc' : 'asc')}
                  className="ml-auto rounded-full border border-white/15 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/45 transition hover:text-white"
                >
                  {subnavSort === 'asc' ? searchUi.asc : searchUi.desc}
                </button>
              </div>
            </div>
            {visibleSubnav.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => changeView(item.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  view === item.key
                    ? 'border-neon-blue/60 bg-neon-blue/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
                }`}
              >
                <Icon name={item.icon} size={14} className="text-neon-blue" />
                {t[item.label]}
                <span
                  className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest ${
                    item.tag === 'premium'
                      ? 'border-amber-400/40 bg-amber-400/10 text-amber-400'
                      : item.tag === 'mixed'
                        ? 'border-neon-pink/40 bg-neon-pink/10 text-neon-pink'
                        : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
                  }`}
                >
                  <Icon
                    name={item.tag === 'premium' ? 'crown' : item.tag === 'mixed' ? 'favorite' : 'gift'}
                    size={7}
                    className="shrink-0"
                  />
                  {item.tag === 'premium' ? (
                    <>
                      {t.featPremiumTag}
                      <span aria-hidden className="opacity-60">·</span>
                      <Icon name="clock" size={7} className="shrink-0" /> {t.betaBadge}
                    </>
                  ) : item.tag === 'mixed' ? (
                    t.tagMixed
                  ) : (
                    t.tagFree
                  )}
                </span>
              </button>
            ))}
          </nav>

          <div id="config" aria-busy={busy} className={`min-w-0 flex-1 space-y-6 ${muted}`}>
          {/* Resumen del servidor */}
          {/* Info del servidor (antes era la vista RESUMEN): siempre visible */}
          <div className="sticky top-2 z-30 mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#0b0f1a]/85 px-5 py-4 backdrop-blur-md">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-neon-blue">{t.serverInfoTitle}</p>
              <p className="truncate text-sm font-bold text-white">{guildName}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-center text-xs text-white/60">
              <div>
                <p className="text-base font-black text-white">{guildData?.memberCount ?? guildInfo?.memberCount ?? "—"}</p>
                <p>{t.membersLabel}</p>
              </div>
              <div>
                <p className="text-base font-black text-white">{guildData?.roles?.length ?? guildInfo?.roles?.length ?? "—"}</p>
                <p>{t.rolesLabel}</p>
              </div>
              <div>
                <p className="text-base font-black text-white">{guildData?.channels?.length ?? guildInfo?.channels?.length ?? "—"}</p>
                <p>{t.channelsLabel}</p>
              </div>
              <div>
                <p className={`text-base font-black ${hasBotGuild === false ? "text-amber-400" : "text-emerald-400"}`}>
                  {hasBotGuild === false ? dict.dashboardPage.botMissing : hasBotGuild === null ? dict.dashboardPage.botUnverified : dict.dashboardPage.botConfigured}
                </p>
                <p>{t.botLabel}</p>
              </div>
            </div>
          </div>

          {view === 'general' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="settings" size={18} className="text-neon-blue" /> {t.generalTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.general.title} commands={SECTION_HELP.general.commands} note={SECTION_HELP.general.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('general')}
                onImport={(file) => void importFile(file, 'general')}
              />
            </div>
            <p className="mb-4 text-xs text-white/45">{t.generalHint}</p>
              <div className="mt-5 grid gap-5">
                <Field label={t.prefixLabel} hint={t.prefixHint}>
                <input
                  className={inputCls}
                  value={config.prefix ?? 'cz!'}
                  maxLength={3}
                  onChange={(e) => update({ prefix: e.target.value })}
                />
              </Field>
              <Field label={t.langLabel}>
                <NiceSelect
                  value={config.lang ?? 'es'}
                  options={[
                    { id: 'es', label: '🇻🇪 Español' },
                    { id: 'en', label: '🇺🇸 English' },
                  ]}
                  onChange={(v) => update({ lang: v })}
                />
              </Field>
              <Field label={t.globalCooldownLabel} hint={t.globalCooldownHint}>
                <input
                  type="number"
                  min={0}
                  max={60}
                  className={inputCls}
                  value={config.command_global_cooldown ?? 3}
                  onChange={(e) =>
                    update({ command_global_cooldown: Math.min(60, Math.max(0, Number(e.target.value) || 0)) })
                  }
                />
              </Field>

              {/* Roles del servidor (owner/admin/mod/bots) — alimentan los
                  permisos de los comandos de gestión y la moderación. */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-bold text-white">
                  <Icon name="shield" size={15} className="text-neon-blue" /> {t.rolesTitle}
                </p>
                <p className="mb-3 text-[10px] text-white/40">{t.rolesHint}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label={t.ownerRoleLabel}>
                    <MultiSelect
                      values={config.owner_role_ids ?? []}
                      options={roleOptions}
                      placeholder={t.pickRole}
                      onChange={(v) => update({ owner_role_ids: v })}
                    />
                  </Field>
                  <Field label={t.adminRoleLabel}>
                    <MultiSelect
                      values={config.admin_role_ids ?? []}
                      options={roleOptions}
                      placeholder={t.pickRole}
                      onChange={(v) => update({ admin_role_ids: v })}
                    />
                  </Field>
                  <Field label={t.modRoleLabel}>
                    <MultiSelect
                      values={config.mod_role_ids ?? []}
                      options={roleOptions}
                      placeholder={t.pickRole}
                      onChange={(v) => update({ mod_role_ids: v })}
                    />
                  </Field>
                  <Field label={t.botRoleLabel} hint={t.botRoleHint}>
                    <MultiSelect
                      values={config.bot_role_ids ?? []}
                      options={roleOptions}
                      placeholder={t.pickRole}
                      onChange={(v) => update({ bot_role_ids: v })}
                    />
                  </Field>
                  <Field label={t.muteRoleLabel}>
                    {hasGuildData ? (
                      <NiceSelect
                        value={config.mute_role_id ?? null}
                        options={roleOptions}
                        placeholder={t.pickRole}
                        onChange={(v) => update({ mute_role_id: v })}
                      />
                    ) : (
                      <input
                        className={inputCls}
                        value={config.mute_role_id ?? ''}
                        onChange={(e) => update({ mute_role_id: e.target.value || null })}
                      />
                    )}
                  </Field>
                </div>
              </div>
            </div>
          </section>
          )}

          {activeFeature && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name={activeFeature.icon} size={18} className={activeFeature.colorClass ?? 'text-neon-blue'} /> {t[activeFeature.labelKey]}
              </h2>
              <QuickHelp
                title={SECTION_HELP[activeFeature.slug]?.title ?? t[activeFeature.labelKey]}
                commands={SECTION_HELP[activeFeature.slug]?.commands ?? []}
                note={SECTION_HELP[activeFeature.slug]?.note}
              />
              <Badge kind="free" dict={dict} />
              {activeFeature.premium && <PremiumTag label={t.featPremiumTag} betaNote={t.premiumFreeNote} betaLabel={t.betaBadge} />}
              <SectionJson
                disabled={dirty || !config}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope(featScope(activeFeature.slug))}
                onImport={(file) => void importFile(file, featScope(activeFeature.slug))}
              />
            </div>
            <p className="mb-5 text-xs text-white/45">{t[activeFeature.descKey]}</p>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${
                  config.features?.[activeFeature.slug] !== false ? 'text-emerald-400' : 'text-white/30'
                }`}
              >
                <Icon name={activeFeature.icon} size={17} className={activeFeature.colorClass} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{t[activeFeature.labelKey]}</p>
                <p className="mt-0.5 text-[11px] text-white/45">{t[activeFeature.descKey]}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.features?.[activeFeature.slug] !== false}
                aria-label={t[activeFeature.labelKey]}
                onClick={() =>
                  update({
                    features: {
                      ...(config.features ?? {}),
                      [activeFeature.slug]: config.features?.[activeFeature.slug] === false,
                    },
                  })
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  config.features?.[activeFeature.slug] !== false
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                    : 'bg-white/15'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    config.features?.[activeFeature.slug] !== false ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Sub-opciones por opción (minijuegos, social, utilidad, misceláneo) */}
            {SUB_TOGGLES[activeFeature.slug] && config.features?.[activeFeature.slug] !== false && (
              <div className="mt-4 grid gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/45">
                  Sub-opciones
                </p>
                {SUB_TOGGLES[activeFeature.slug].map(({ slug, labelKey, descKey }) => (
                  <div
                    key={slug}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/85">{t[labelKey]}</p>
                      <p className="text-[10px] text-white/40">{t[descKey]}</p>
                    </div>
                    <Toggle
                      on={config.features?.[slug] !== false}
                      onChange={(v) => update({ features: { ...(config.features ?? {}), [slug]: v } })}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Manager de giveaways: lista en tiempo real + acciones + creación */}
            {activeFeature.slug === 'giveaways' && (
              <div className="mt-4 grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      ['all', t.gwFilterAll],
                      ['running', t.gwFilterRunning],
                      ['paused', t.gwFilterPaused],
                      ['ended', t.gwFilterEnded],
                      ['cancelled', t.gwFilterCancelled],
                    ] as const
                  ).map(([f, label]) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setGwFilter(f)}
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
                        gwFilter === f ? 'border-neon-blue/60 bg-neon-blue/10 text-neon-blue' : 'border-white/15 text-white/50 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGwCreateOpen((v) => !v)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95"
                  >
                    + {t.gwCreate}
                  </button>
                </div>

                {gwCreateOpen && (
                  <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
                    <Field label={t.gwPrize}>
                      <input className={inputCls} value={gwForm.prize} onChange={(e) => setGwForm({ ...gwForm, prize: e.target.value })} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t.gwWinnersCount}>
                        <input type="number" min={1} className={inputCls} value={gwForm.winners} onChange={(e) => setGwForm({ ...gwForm, winners: Math.max(1, Number(e.target.value) || 1) })} />
                      </Field>
                      <Field label={t.gwDuration}>
                        <input type="number" min={1} className={inputCls} value={gwForm.minutes} onChange={(e) => setGwForm({ ...gwForm, minutes: Math.max(1, Number(e.target.value) || 1) })} />
                      </Field>
                    </div>
                    {hasGuildData ? (
                      <SelectField
                        label={t.gwChannel}
                        value={gwForm.channel}
                        placeholder={t.pickChannel}
                        options={textChannelOptions}
                        onChange={(v) => setGwForm({ ...gwForm, channel: v })}
                      />
                    ) : (
                      <Field label={t.gwChannel} hint={t.manualIdHint}>
                        <input className={inputCls} value={gwForm.channel ?? ''} onChange={(e) => setGwForm({ ...gwForm, channel: e.target.value || null })} />
                      </Field>
                    )}
                    <Field label={t.gwRequiredRoles}>
                      <MultiSelect values={gwForm.required} options={roleOptions} placeholder={t.pickRole} onChange={(v) => setGwForm({ ...gwForm, required: v })} />
                    </Field>
                    <Field label={t.gwGrantRoles}>
                      <MultiSelect values={gwForm.grant} options={roleOptions} placeholder={t.pickRole} onChange={(v) => setGwForm({ ...gwForm, grant: v })} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t.gwMaxParticipants}>
                        <input type="number" min={0} className={inputCls} value={gwForm.maxPart} onChange={(e) => setGwForm({ ...gwForm, maxPart: Math.max(0, Number(e.target.value) || 0) })} />
                      </Field>
                      <Field label={t.gwRequiredMessages}>
                        <input type="number" min={0} className={inputCls} value={gwForm.reqMsg} onChange={(e) => setGwForm({ ...gwForm, reqMsg: Math.max(0, Number(e.target.value) || 0) })} />
                      </Field>
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/45">{t.gwBonusRoles}</p>
                      <div className="grid gap-2">
                        {gwForm.bonus.map((b, idx) => (
                          <div key={`${b.role_id}-${idx}`} className="flex items-center gap-2">
                            <NiceSelect
                              className="w-44"
                              value={b.role_id}
                              options={roleOptions}
                              onChange={(v) => setGwForm({ ...gwForm, bonus: gwForm.bonus.map((x, i) => (i === idx ? { ...x, role_id: v } : x)) })}
                            />
                            <span className="text-[10px] text-white/40">×</span>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              className={`${inputCls} w-20`}
                              value={b.multiplier}
                              onChange={(e) => setGwForm({ ...gwForm, bonus: gwForm.bonus.map((x, i) => (i === idx ? { ...x, multiplier: Math.max(1, Number(e.target.value) || 1) } : x)) })}
                            />
                            <button
                              type="button"
                              onClick={() => setGwForm({ ...gwForm, bonus: gwForm.bonus.filter((_, i) => i !== idx) })}
                              className="rounded-lg border border-white/15 px-2 py-1 text-[10px] text-white/60 transition hover:border-red-400/50 hover:text-red-300"
                            >
                              {t.removeRow}
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          disabled={!hasGuildData || roleOptions.length === 0}
                          onClick={() => setGwForm({ ...gwForm, bonus: [...gwForm.bonus, { role_id: roleOptions[0].id, multiplier: 2 }] })}
                          className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-blue/60 hover:text-white disabled:opacity-40"
                        >
                          + {t.addRow}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => void gwCreate()}
                        disabled={gwBusy === 'create'}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                        {t.gwSubmit}
                      </button>
                    </div>
                  </div>
                )}

                {gwList.filter((g) => gwFilter === 'all' || g.status === gwFilter).length === 0 && (
                  <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">{t.gwNoGiveaways}</p>
                )}
                {gwList
                  .filter((g) => gwFilter === 'all' || g.status === gwFilter)
                  .map((gw) => {
                    const chip =
                      gw.status === 'running' && !gw.ended
                        ? { icon: '▶', cls: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' }
                        : gw.status === 'paused'
                          ? { icon: '⏸', cls: 'text-amber-400 border-amber-400/40 bg-amber-400/10' }
                          : gw.status === 'cancelled'
                            ? { icon: '✖', cls: 'text-red-400 border-red-400/40 bg-red-400/10' }
                            : { icon: '✔', cls: 'text-white/50 border-white/20 bg-white/5' };
                    const remainingMs = Math.max(0, new Date(gw.ends_at).getTime() - Date.now());
                    const remaining = remainingMs > 0 ? `${Math.floor(remainingMs / 3600000)}h ${Math.floor((remainingMs % 3600000) / 60000)}m` : t.gwEnded;
                    const btn =
                      'rounded-lg border border-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-blue/60 hover:text-white disabled:opacity-40';
                    return (
                      <div key={gw.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${chip.cls}`}>
                            {chip.icon} {gw.status}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-xs font-bold text-white">{gw.prize}</p>
                          <span className="text-[10px] text-white/50">
                            {t.gwEndsIn}: {remaining}
                          </span>
                          <span className="text-[10px] text-white/50">
                            👥 {gw.participants}
                            {gw.max_participants > 0 ? `/${gw.max_participants}` : ''}
                          </span>
                          <span className="text-[10px] text-white/50">🏆 {gw.winner_ids.length > 0 ? gw.winner_ids.map((w) => <code key={w} className="mr-1">{w}</code>) : gw.winners}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-white/35">
                          <span>
                            {t.gwBy}: <code>{gw.hosted_by}</code> · {gw.source}
                          </span>
                          <span>#{gw.channel_id}</span>
                          {gw.required_messages > 0 && <span>✉ {gw.required_messages}</span>}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {gw.status === 'running' && !gw.ended && (
                            <button type="button" disabled={gwBusy === `${gw.id}:pause`} onClick={() => void gwAction('pause', gw.id)} className={btn}>
                              {t.gwPause}
                            </button>
                          )}
                          {gw.status === 'paused' && (
                            <button type="button" disabled={gwBusy === `${gw.id}:resume`} onClick={() => void gwAction('resume', gw.id)} className={btn}>
                              {t.gwResume}
                            </button>
                          )}
                          {(gw.status === 'running' || gw.status === 'paused') && (
                            <button
                              type="button"
                              disabled={gwBusy === `${gw.id}:cancel`}
                              onClick={() => void gwAction('cancel', gw.id)}
                              className="rounded-lg border border-red-400/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
                            >
                              {t.gwCancel}
                            </button>
                          )}
                          {(gw.status === 'ended' || gw.ended) && (
                            <button type="button" disabled={gwBusy === `${gw.id}:reroll`} onClick={() => void gwAction('reroll', gw.id)} className={btn}>
                              {t.gwReroll}
                            </button>
                          )}
                          <button type="button" onClick={() => void gwToggleParticipants(gw.id)} className={btn}>
                            {t.gwParticipants} ({gw.participants})
                          </button>
                        </div>
                        {gwOpen === gw.id && (
                          <div className="mt-2 grid gap-1.5 rounded-lg border border-white/10 bg-black/30 p-2">
                            {(gwParts[gw.id]?.participants ?? []).length === 0 && <p className="text-[10px] text-white/35">—</p>}
                            {(gwParts[gw.id]?.participants ?? []).map((p) => (
                              <div key={p.userId} className="flex items-center gap-2 text-[10px] text-white/60">
                                <code className="min-w-0 flex-1 truncate">{p.userId}</code>
                                <span>{p.entries}×</span>
                                <button type="button" onClick={() => void gwAction('remove', gw.id, p.userId)} className={btn}>
                                  {t.gwRemove}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void gwAction('ban', gw.id, p.userId)}
                                  className="rounded-lg border border-red-400/30 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-red-300 transition hover:bg-red-400/10"
                                >
                                  {t.gwBan}
                                </button>
                              </div>
                            ))}
                            {(gwParts[gw.id]?.bans ?? []).length > 0 && (
                              <p className="text-[10px] text-red-300/70">
                                {t.gwBan}: {(gwParts[gw.id]?.bans ?? []).join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Social: configuración ANIDADA bajo cada sub-opción (solo se
                muestra lo que está activo: sin social → nada; sin AFK → sin
                ajustes de AFK; sin casamiento → sin ajustes de casamiento). */}
            {activeFeature.slug === 'social' && config.features?.['social'] !== false && (
              <div className="mt-4 grid gap-3">
                {config.features?.['social_afk'] !== false && (
                  <div className="ml-2 grid gap-3 border-l-2 border-neon-blue/30 pl-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.socialAfk}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={t.afkRoleLabel}>
                        {hasGuildData ? (
                          <NiceSelect
                            value={config.afk_role_id ?? null}
                            options={roleOptions}
                            placeholder={t.pickRole}
                            onChange={(v) => update({ afk_role_id: v })}
                          />
                        ) : (
                          <input
                            className={inputCls}
                            value={config.afk_role_id ?? ''}
                            onChange={(e) => update({ afk_role_id: e.target.value || null })}
                          />
                        )}
                      </Field>
                      <Field label={t.afkAutoLabel} hint={t.afkAutoHint}>
                        <input
                          type="number"
                          min={0}
                          max={1440}
                          className={inputCls}
                          value={config.afk_auto_minutes ?? 0}
                          onChange={(e) => update({ afk_auto_minutes: Math.max(0, Number(e.target.value) || 0) })}
                        />
                      </Field>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2.5">
                      <p className="text-xs font-semibold text-white/80">{t.afkPrefixLabel}</p>
                      <Toggle on={Boolean(config.afk_prefix_enabled)} onChange={(v) => update({ afk_prefix_enabled: v })} />
                    </div>
                  </div>
                )}

                {config.features?.['social_marriage'] !== false && (
                  <div className="ml-2 grid gap-3 border-l-2 border-neon-pink/30 pl-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.socialMarriage}</p>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white/80">{t.marriageToggleLabel}</p>
                        <p className="text-[10px] text-white/40">{t.marriageToggleHint}</p>
                      </div>
                      <Toggle on={config.marriage_enabled !== false} onChange={(v) => update({ marriage_enabled: v })} />
                    </div>
                    {config.marriage_enabled !== false && (
                      <>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2.5">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white/80">{t.marriageAdminPairsLabel}</p>
                            <p className="text-[10px] text-white/40">{t.marriageAdminPairsHint}</p>
                          </div>
                          <Toggle
                            on={config.marriage_allow_admin_pairs !== false}
                            onChange={(v) => update({ marriage_allow_admin_pairs: v })}
                          />
                        </div>
                        <Field label={t.marriageExcludedLabel} hint={t.marriageExcludedHint}>
                          <MultiSelect
                            values={config.marriage_excluded_role_ids ?? []}
                            options={roleOptions}
                            placeholder={t.pickRole}
                            onChange={(v) => update({ marriage_excluded_role_ids: v })}
                          />
                        </Field>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Emojis nitro: modo (auto/manual) y roles excluidos */}
            {activeFeature.slug === 'nitro' && (
              <div className="mt-4 grid gap-4">
                <Field label={t.nitroModeLabel}>
                  <NiceSelect
                    value={config.nitro_repost_mode ?? 'auto'}
                    options={[
                      { id: 'auto', label: t.nitroModeAuto },
                      { id: 'manual', label: t.nitroModeManual },
                    ]}
                    onChange={(v) => update({ nitro_repost_mode: v as 'auto' | 'manual' })}
                  />
                </Field>
                <Field label={t.nitroExcludedLabel}>
                  <MultiSelect
                    values={config.nitro_excluded_role_ids ?? []}
                    options={roleOptions}
                    placeholder={t.pickRole}
                    onChange={(v) => update({ nitro_excluded_role_ids: v })}
                  />
                </Field>
              </div>
            )}
          </section>
          )}

          {view === 'history' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="verified" size={18} className="text-neon-blue" /> {t.historyTitle}
              </h2>
              <Badge kind="free" dict={dict} />
            </div>
            <p className="mb-4 text-xs text-white/45">{t.historyHint}</p>
            <div className="mb-5 grid gap-4">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.historyToggle}</p>
                  <p className="text-xs text-white/50">{t.historyHint}</p>
                </div>
                <Toggle on={config.history_enabled !== false} onChange={(v) => update({ history_enabled: v })} />
              </div>
              {hasGuildData ? (
                <SelectField
                  label={t.historyChannelLabel}
                  hint={t.historyChannelHint}
                  value={config.history_channel_id ?? null}
                  placeholder={t.pickChannel}
                  options={textChannelOptions}
                  onChange={(v) => update({ history_channel_id: v })}
                />
              ) : (
                <Field label={t.historyChannelLabel} hint={t.manualIdHint}>
                  <input
                    className={inputCls}
                    value={config.history_channel_id ?? ''}
                    onChange={(e) => update({ history_channel_id: e.target.value || null })}
                  />
                </Field>
              )}
            </div>
            {serverHistory === null && <p className="text-xs text-white/40">…</p>}
            {serverHistory !== null && serverHistory.length === 0 && (
              <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">{t.historyEmpty}</p>
            )}
            {serverHistory !== null && serverHistory.length > 0 && (
              <ul className="grid gap-2">
                {serverHistory.map((h) => (
                  <li
                    key={h.id}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-white/45">
                        {new Date(h.createdAt).toLocaleString()}
                      </span>
                      <span className="min-w-0 flex-1 break-words text-white/70 [overflow-wrap:anywhere]">
                        {h.detail?.fields && h.detail.fields.length > 8
                          ? `${h.detail.fields.slice(0, 8).join(', ')}… (+${h.detail.fields.length - 8})`
                          : (h.detail?.fields ?? []).join(', ') || '—'}
                        {h.detail?.features && Object.keys(h.detail.features).length > 0
                          ? ` · ${Object.keys(h.detail.features).length} ${t.featuresLabel}`
                          : ''}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {t.actorLabel}: <code className="font-mono">{h.actorId ?? '—'}</code>
                      </span>
                    </div>
                    {h.detail?.fields && h.detail.fields.length > 8 && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-[10px] font-bold text-neon-blue">{t.showMore}</summary>
                        <p className="mt-1 break-words text-white/50 [overflow-wrap:anywhere]">{h.detail.fields.join(', ')}</p>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
          )}

          {view === 'levels' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="star" size={18} className="text-neon-pink" /> {t.levelsTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.levels.title} commands={SECTION_HELP.levels.commands} note={SECTION_HELP.levels.note} />
              <Badge kind="free" dict={dict} />
              <PermWarning
                perms={guildData?.botPermissions}
                bit={268435456}
                label={t.permManageRoles}
                missing={t.permMissing}
                href={`${INVITE_URL}&guild_id=${guildId}`}
              />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('levels')}
                onImport={(file) => void importFile(file, 'levels')}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white/90">{t.levelsToggle}</p>
                <p className="text-xs text-white/50">{t.levelsToggleHint}</p>
              </div>
              <Toggle
                on={Boolean(config.leveling_enabled)}
                onChange={(v) => update({ leveling_enabled: v })}
              />
            </div>
            {config.leveling_enabled && (
              <div className="mt-5 grid gap-5">
                <Field label={t.xpRateLabel} hint={t.xpRateHint}>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    className={inputCls}
                    value={config.xp_rate ?? 1}
                    onChange={(e) => update({ xp_rate: Number(e.target.value) })}
                  />
                </Field>
                {hasGuildData ? (
                  <SelectField
                    label={t.levelChannelLabel}
                    hint={t.levelChannelHint}
                    value={config.level_channel_id}
                    placeholder={t.pickChannel}
                    options={textChannelOptions}
                    onChange={(v) => update({ level_channel_id: v })}
                  />
                ) : (
                  <Field label={t.levelChannelLabel} hint={t.manualIdHint}>
                    <input
                      className={inputCls}
                      placeholder="ID"
                      value={config.level_channel_id ?? ''}
                      onChange={(e) => update({ level_channel_id: e.target.value || null })}
                    />
                  </Field>
                )}
                <Field label={t.levelMessageLabel} hint={t.levelMessageHint}>
                  <RichInput
                    value={config.level_message ?? '🎉 ¡{user} subió al nivel {level} en {guild}!'}
                    maxLength={500}
                    emojis={emojis}
                    onChange={(v) => update({ level_message: v })}
                  />
                </Field>
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/45">{t.levelRolesLabel}</p>
                  <p className="mb-3 text-[10px] text-white/35">{t.levelRolesHint}</p>
                  <div className="grid gap-2">
                    {levelRoles
                      .slice()
                      .sort((a, b) => a.level - b.level)
                      .map((row, idx) => (
                        <div key={`${row.level}-${row.role_id}-${idx}`} className="flex flex-wrap items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            className={`${inputCls} w-24`}
                            value={row.level}
                            onChange={(e) => {
                              const next = levelRoles.map((r) => (r === row ? { ...r, level: Math.max(1, Number(e.target.value) || 1) } : r));
                              update({ level_roles: next });
                            }}
                          />
                          {hasGuildData ? (
                            <NiceSelect
                              className="w-52"
                              value={row.role_id}
                              options={roleOptions}
                              onChange={(v) => {
                                const next = levelRoles.map((r) => (r === row ? { ...r, role_id: v } : r));
                                update({ level_roles: next });
                              }}
                            />
                          ) : (
                            <input
                              className={`${inputCls} w-52`}
                              value={row.role_id}
                              onChange={(e) => {
                                const next = levelRoles.map((r) => (r === row ? { ...r, role_id: e.target.value } : r));
                                update({ level_roles: next });
                              }}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => update({ level_roles: levelRoles.filter((r) => r !== row) })}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:border-red-400/50 hover:text-red-300"
                          >
                            {t.removeRow}
                          </button>
                        </div>
                      ))}
                    <button
                      type="button"
                      disabled={!hasGuildData || roleOptions.length === 0}
                      onClick={() =>
                        update({
                          level_roles: [...levelRoles, { level: (levelRoles.at(-1)?.level ?? 0) + 5, role_id: roleOptions[0].id }],
                        })
                      }
                      className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-blue/60 hover:text-white disabled:opacity-40"
                    >
                      + {t.addRow}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard público: sub-opciones premium marcadas (gratis en beta). */}
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <Icon name="trophy" size={15} className="text-neon-blue" /> {t.lbTitle}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.leaderboard_enabled === true}
                  aria-label={t.lbTitle}
                  onClick={() => update({ leaderboard_enabled: !(config.leaderboard_enabled === true) })}
                  className={`relative ml-auto h-6 w-11 shrink-0 rounded-full transition ${
                    config.leaderboard_enabled ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      config.leaderboard_enabled ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-white/45">{t.lbHint}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-neon-blue">
                  ciszubot.vercel.app/leaderboard/{config.leaderboard_slug || guildId}
                </code>
                <button
                  type="button"
                  onClick={copyLeaderboardUrl}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:border-neon-blue/60 hover:text-white"
                >
                  <Icon name="copy" size={11} /> {t.lbCopy}
                </button>
                <a
                  href={`/leaderboard/${config.leaderboard_slug || guildId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:border-neon-blue/60 hover:text-white"
                >
                  <Icon name="external" size={11} /> {t.lbOpen}
                </a>
              </div>

              <label className="mt-4 block">
                <span className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/45">
                  {t.lbCustom}
                  <PremiumTag label={t.featPremiumTag} betaNote={t.premiumFreeNote} betaLabel={t.betaBadge} />
                </span>
                <input
                  className={`${inputCls} mt-1`}
                  placeholder="mi-servidor"
                  value={config.leaderboard_slug ?? ''}
                  onChange={(e) =>
                    update({ leaderboard_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') || null })
                  }
                />
                <span className="mt-1 block text-[10px] text-white/35">{t.lbCustomHint}</span>
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <PremiumTag label={t.featPremiumTag} betaNote={t.premiumFreeNote} betaLabel={t.betaBadge} />
                {resetAsk ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void resetLeaderboard()}
                      disabled={resetBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/50 bg-red-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-300 transition hover:bg-red-400/20 disabled:opacity-50"
                    >
                      {resetBusy ? '…' : t.lbResetConfirm}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetAsk(false)}
                      className="text-[10px] font-bold uppercase tracking-widest text-white/40 transition hover:text-white/70"
                    >
                      {t.cancel}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetAsk(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:border-red-400/50 hover:text-red-300"
                  >
                    <Icon name="history" size={11} /> {t.lbReset}
                  </button>
                )}
              </div>
            </div>
          </section>
          )}

          {view === 'welcome' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="heart" size={18} className="text-neon-pink" /> {t.welcomeTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.welcome.title} commands={SECTION_HELP.welcome.commands} note={SECTION_HELP.welcome.note} />
              <Badge kind="free" dict={dict} />
              <PermWarning
                perms={guildData?.botPermissions}
                bit={268435456}
                label={t.permManageRoles}
                missing={t.permMissing}
                href={`${INVITE_URL}&guild_id=${guildId}`}
              />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('welcome')}
                onImport={(file) => void importFile(file, 'welcome')}
              />
            </div>
            <div className="grid gap-5">
              {hasGuildData ? (
                <SelectField
                  label={t.welcomeChannelLabel}
                  value={config.welcome_channel_id}
                  placeholder={t.pickChannel}
                  options={textChannelOptions}
                  onChange={(v) => update({ welcome_channel_id: v })}
                />
              ) : (
                <Field label={t.welcomeChannelLabel} hint={t.manualIdHint}>
                  <input
                    className={inputCls}
                    placeholder="ID"
                    value={config.welcome_channel_id ?? ''}
                    onChange={(e) => update({ welcome_channel_id: e.target.value || null })}
                  />
                </Field>
              )}
              <Field label={t.welcomeMessageLabel} hint={t.varsHint}>
                <RichInput
                  value={config.welcome_message ?? 'Bienvenido/a {user} a {guild}!'}
                  maxLength={500}
                  emojis={emojis}
                  onChange={(v) => update({ welcome_message: v })}
                />
              </Field>
              <Field label={t.autoroleLabel} hint={t.autoroleHint}>
                <MultiSelect
                  values={config.autorole_ids ?? []}
                  options={roleOptions}
                  placeholder={t.pickRole}
                  onChange={(v) => update({ autorole_ids: v })}
                />
              </Field>
            </div>
            <HelpZone title={SECTION_HELP.welcome.title} commands={SECTION_HELP.welcome.commands} note={SECTION_HELP.welcome.note} />
          </section>
          )}

          {view === 'economy' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="money" size={18} className="text-amber-300" /> {t.economyTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.economy.title} commands={SECTION_HELP.economy.commands} note={SECTION_HELP.economy.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('economy')}
                onImport={(file) => void importFile(file, 'economy')}
              />
            </div>
            <p className="mb-5 text-xs text-white/45">{t.economyHint}</p>
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t.coinEmojiLabel} hint={t.coinHint}>
                  <input
                    className={inputCls}
                    value={config.coin_emoji ?? '🪙'}
                    maxLength={64}
                    onChange={(e) => update({ coin_emoji: e.target.value })}
                  />
                </Field>
                <Field label={t.coinNameLabel} hint={t.coinHint}>
                  <input
                    className={inputCls}
                    value={config.coin_name ?? 'monedas'}
                    maxLength={32}
                    onChange={(e) => update({ coin_name: e.target.value })}
                  />
                </Field>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/60">
                Vista previa: <span className="font-bold text-white">1.500 {config.coin_emoji ?? '🪙'}</span> (
                {config.coin_name ?? 'monedas'})
              </div>

              {/* Drops (lista: free hasta 3 · premium ilimitados) */}
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="flex items-center gap-2 text-sm font-bold text-white">
                    <Icon name="star" size={15} className="text-amber-300" /> {t.dropsTitle}
                  </p>
                  <span className="ml-auto text-[10px] font-black text-white/40">
                    {dropsCfg.list.length}
                    {config.premium ? '' : ' / 3'}
                  </span>
                </div>
                <p className="mb-3 text-[10px] text-white/40">{t.dropsFreeNote}</p>
                <div className="grid gap-3">
                  {dropsCfg.list.map((drop, idx) => {
                    const patchDrop = (p: Partial<(typeof dropsCfg.list)[number]>) =>
                      update({ drops: { list: dropsCfg.list.map((d, i) => (i === idx ? { ...d, ...p } : d)) } });
                    return (
                      <div key={drop.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <code className="rounded bg-black/40 px-2 py-1 text-[11px] font-bold text-neon-blue">{drop.id}</code>
                          <input
                            className={`${inputCls} w-44`}
                            value={drop.name}
                            maxLength={50}
                            onChange={(e) => patchDrop({ name: e.target.value })}
                          />
                          <Toggle on={drop.enabled} onChange={(v) => patchDrop({ enabled: v })} />
                          <button
                            type="button"
                            onClick={() => update({ drops: { list: dropsCfg.list.filter((_, i) => i !== idx) } })}
                            className="ml-auto rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:border-red-400/50 hover:text-red-300"
                          >
                            {t.removeRow}
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label={`${t.dropsMinLabel} / ${t.dropsMaxLabel}`}>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min={1}
                                className={inputCls}
                                value={drop.min}
                                onChange={(e) => patchDrop({ min: Math.max(1, Number(e.target.value) || 1) })}
                              />
                              <input
                                type="number"
                                min={1}
                                className={inputCls}
                                value={drop.max}
                                onChange={(e) => patchDrop({ max: Math.max(1, Number(e.target.value) || 1) })}
                              />
                            </div>
                          </Field>
                          <Field label={t.dropsIntervalLabel} hint={t.dropsIntervalHint}>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min={5}
                                className={inputCls}
                                value={drop.interval_min}
                                onChange={(e) => patchDrop({ interval_min: Math.max(5, Number(e.target.value) || 5) })}
                              />
                              <input
                                type="number"
                                min={5}
                                className={inputCls}
                                value={drop.interval_max}
                                onChange={(e) => patchDrop({ interval_max: Math.max(5, Number(e.target.value) || 5) })}
                              />
                            </div>
                          </Field>
                          <Field label={t.dropsMessageLabel} hint={t.dropsMessageHint}>
                            <RichInput
                              value={drop.message ?? ''}
                              maxLength={300}
                              emojis={emojis}
                              onChange={(v) => patchDrop({ message: v || null })}
                            />
                          </Field>
                          <Field label={t.dropsChannelsLabel} hint={t.dropsChannelsHint}>
                            <MultiSelect
                              values={drop.channels}
                              options={textChannelOptions}
                              placeholder={t.pickChannel}
                              onChange={(channels) => patchDrop({ channels })}
                            />
                          </Field>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    disabled={!config.premium && dropsCfg.list.length >= 3}
                    onClick={() => {
                      const id = `drop${dropsCfg.list.length + 1}`;
                      update({
                        drops: {
                          list: [
                            ...dropsCfg.list,
                            {
                              id,
                              name: `Drop ${dropsCfg.list.length + 1}`,
                              enabled: false,
                              channels: [],
                              min: 50,
                              max: 200,
                              interval_min: 60,
                              interval_max: 180,
                              message: null,
                              excluded_roles: [],
                            },
                          ],
                        },
                      });
                    }}
                    className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-blue/60 hover:text-white disabled:opacity-40"
                  >
                    + {t.addRow}
                  </button>
                </div>
              </div>
              <Field label={t.invitePointsLabel} hint={t.invitePointsHint}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className={inputCls}
                  value={config.invite_points_per ?? 1}
                  onChange={(e) => update({ invite_points_per: Math.max(1, Number(e.target.value) || 1) })}
                />
              </Field>
            </div>
            <HelpZone title={SECTION_HELP.economy.title} commands={SECTION_HELP.economy.commands} note={SECTION_HELP.economy.note} />
          </section>
          )}

          {view === 'messages' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="message" size={18} className="text-neon-blue" /> {t.messagesTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.messages.title} commands={SECTION_HELP.messages.commands} note={SECTION_HELP.messages.note} />
              <Badge kind="free" dict={dict} />
            </div>
            <p className="mb-5 text-xs text-white/45">{t.messagesHint}</p>
            <div className="grid gap-5">
              <Field label={t.msgTypeLabel}>
                <div className="flex gap-2">
                  {(
                    [
                      ['say', t.msgSayLabel],
                      ['directsay', t.msgDirectSayLabel],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMsgType(value)}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                        msgType === value
                          ? 'border-neon-blue/60 bg-neon-blue/10 text-neon-blue'
                          : 'border-white/15 text-white/60 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              {hasGuildData ? (
                <SelectField
                  label={t.msgChannelLabel}
                  value={msgChannel}
                  placeholder={t.pickChannel}
                  options={textChannelOptions}
                  onChange={(v) => setMsgChannel(v)}
                />
              ) : (
                <Field label={t.msgChannelLabel} hint={t.manualIdHint}>
                  <input
                    className={inputCls}
                    placeholder="ID del canal"
                    value={msgChannel ?? ''}
                    onChange={(e) => setMsgChannel(e.target.value || null)}
                  />
                </Field>
              )}
              <Field label={t.msgContentLabel}>
                <textarea
                  className={`${inputCls} min-h-[90px]`}
                  value={msgContent}
                  maxLength={2000}
                  placeholder={t.msgContentLabel}
                  onChange={(e) => setMsgContent(e.target.value)}
                />
              </Field>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={msgBusy || !msgChannel || !msgContent.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  <Icon name="message" size={14} /> {t.msgSend}
                </button>
                {msgStatus && (
                  <p
                    className={`text-xs font-bold ${
                      msgStatus.kind === 'ok' ? 'text-emerald-400' : msgStatus.kind === 'error' ? 'text-red-400' : 'text-amber-300'
                    }`}
                  >
                    {msgStatus.text}
                  </p>
                )}
              </div>
            </div>
            <HelpZone title={SECTION_HELP.messages.title} commands={SECTION_HELP.messages.commands} note={SECTION_HELP.messages.note} />
          </section>
          )}

          {view === 'goodbye' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="logout" size={18} className="text-neon-pink" /> {t.goodbyeTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.goodbye.title} commands={SECTION_HELP.goodbye.commands} note={SECTION_HELP.goodbye.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('goodbye')}
                onImport={(file) => void importFile(file, 'goodbye')}
              />
            </div>
            <p className="mb-4 text-xs text-white/45">{t.goodbyeHint}</p>
            <div className="grid gap-5">
              {hasGuildData ? (
                <SelectField
                  label={t.goodbyeChannelLabel}
                  value={config.goodbye_channel_id ?? null}
                  placeholder={t.pickChannel}
                  options={textChannelOptions}
                  onChange={(v) => update({ goodbye_channel_id: v })}
                />
              ) : (
                <Field label={t.goodbyeChannelLabel} hint={t.manualIdHint}>
                  <input
                    className={inputCls}
                    value={config.goodbye_channel_id ?? ''}
                    onChange={(e) => update({ goodbye_channel_id: e.target.value || null })}
                  />
                </Field>
              )}
              <Field label={t.goodbyeMessageLabel} hint={t.varsHint}>
                <RichInput
                  value={config.goodbye_message ?? 'Adiós {user}, que te vaya bien!'}
                  maxLength={500}
                  emojis={emojis}
                  onChange={(v) => update({ goodbye_message: v })}
                />
              </Field>
            </div>
            <HelpZone title={SECTION_HELP.goodbye.title} commands={SECTION_HELP.goodbye.commands} note={SECTION_HELP.goodbye.note} />
          </section>
          )}

          {view === 'vcs' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="music" size={18} className="text-neon-blue" /> {t.vcsTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.vcs.title} commands={SECTION_HELP.vcs.commands} note={SECTION_HELP.vcs.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('vcs')}
                onImport={(file) => void importFile(file, 'vcs')}
              />
            </div>
            <p className="mb-4 text-xs text-white/45">{t.vcsHint}</p>
            <div className="grid gap-5">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.privateToggle}</p>
                  <p className="text-xs text-white/50">{t.privateToggleHint}</p>
                </div>
                <Toggle on={Boolean(config.private_channels)} onChange={(v) => update({ private_channels: v })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {hasGuildData ? (
                  <SelectField
                    label={t.privateVcHubLabel}
                    value={config.private_vc_hub_id ?? null}
                    placeholder={t.pickVoice}
                    options={voiceChannelOptions}
                    onChange={(v) => update({ private_vc_hub_id: v })}
                  />
                ) : (
                  <Field label={t.privateVcHubLabel} hint={t.manualIdHint}>
                    <input className={inputCls} value={config.private_vc_hub_id ?? ''} onChange={(e) => update({ private_vc_hub_id: e.target.value || null })} />
                  </Field>
                )}
                {hasGuildData ? (
                  <SelectField
                    label={t.privateCategoryLabel}
                    value={config.private_category_id ?? null}
                    placeholder={t.pickCategory}
                    options={categoryOptions}
                    onChange={(v) => update({ private_category_id: v })}
                  />
                ) : (
                  <Field label={t.privateCategoryLabel} hint={t.manualIdHint}>
                    <input className={inputCls} value={config.private_category_id ?? ''} onChange={(e) => update({ private_category_id: e.target.value || null })} />
                  </Field>
                )}
              </div>
            </div>
            <HelpZone title={SECTION_HELP.vcs.title} commands={SECTION_HELP.vcs.commands} note={SECTION_HELP.vcs.note} />
          </section>
          )}

          {view === 'counting' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="calculator" size={18} className="text-neon-blue" /> {t.countingTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.counting.title} commands={SECTION_HELP.counting.commands} note={SECTION_HELP.counting.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('counting')}
                onImport={(file) => void importFile(file, 'counting')}
              />
            </div>
            <p className="mb-4 text-xs text-white/45">{t.countingHint}</p>
            <div className="grid gap-5">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.countingToggle}</p>
                  <p className="text-xs text-white/50">{t.countingToggleHint}</p>
                </div>
                <Toggle on={Boolean(config.counting_enabled)} onChange={(v) => update({ counting_enabled: v })} />
              </div>
              {config.counting_enabled && (
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {hasGuildData ? (
                      <SelectField
                        label={t.countingChannelLabel}
                        value={config.counting_channel_id ?? null}
                        placeholder={t.pickChannel}
                        options={textChannelOptions}
                        onChange={(v) => update({ counting_channel_id: v })}
                      />
                    ) : (
                      <Field label={t.countingChannelLabel} hint={t.manualIdHint}>
                        <input
                          className={inputCls}
                          value={config.counting_channel_id ?? ''}
                          onChange={(e) => update({ counting_channel_id: e.target.value || null })}
                        />
                      </Field>
                    )}
                    <Field label={t.countingStartLabel} hint={t.countingStartHint}>
                      <input
                        type="number"
                        min={0}
                        max={1000000}
                        className={inputCls}
                        value={config.counting_start ?? 0}
                        onChange={(e) => update({ counting_start: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    </Field>
                  </div>
                  <Field label={t.countingStyleLabel} hint={t.countingStyleHint}>
                    <NiceSelect
                      value={config.counting_style ?? 'traditional'}
                      options={[
                        { id: 'traditional', label: t.countingStyleTraditional },
                        { id: 'sum', label: t.countingStyleSum },
                      ]}
                      onChange={(v) => update({ counting_style: v as 'traditional' | 'sum' })}
                    />
                  </Field>
                  <Field label={t.countingAuthLabel} hint={t.countingAuthHint}>
                    <NiceSelect
                      value={config.counting_authenticity ?? 'dependent'}
                      options={[
                        { id: 'solo', label: t.countingAuthSolo },
                        { id: 'dependent', label: t.countingAuthDependent },
                      ]}
                      onChange={(v) => update({ counting_authenticity: v as 'solo' | 'dependent' })}
                    />
                  </Field>
                  <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white/90">{t.countingRepeatLabel}</p>
                      <p className="text-xs text-white/50">{t.countingRepeatHint}</p>
                    </div>
                    <Toggle on={Boolean(config.counting_allow_repeat)} onChange={(v) => update({ counting_allow_repeat: v })} />
                  </div>
                </div>
              )}
            </div>
            <HelpZone title={SECTION_HELP.counting.title} commands={SECTION_HELP.counting.commands} note={SECTION_HELP.counting.note} />
          </section>
          )}

          {view === 'invites' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="person" size={18} className="text-neon-blue" /> {t.invitesTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.invites.title} commands={SECTION_HELP.invites.commands} note={SECTION_HELP.invites.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('invites')}
                onImport={(file) => void importFile(file, 'invites')}
              />
            </div>
            <p className="mb-4 text-xs text-white/45">{t.invitesHint}</p>
            <div className="grid gap-5">
              <Field label={t.invitePointsLabel} hint={t.invitePointsHint}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className={inputCls}
                  value={config.invite_points_per ?? 1}
                  onChange={(e) => update({ invite_points_per: Math.max(1, Number(e.target.value) || 1) })}
                />
              </Field>
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/45">{t.invitesRewardsLabel}</p>
                <p className="mb-3 text-[10px] text-white/35">{t.invitesRewardsHint}</p>
                <div className="grid gap-2">
                  {(config.invite_rewards ?? []).map((row, idx) => (
                    <div key={`${row.invites}-${idx}`} className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        className={`${inputCls} w-24`}
                        value={row.invites}
                        onChange={(e) => {
                          const next = (config.invite_rewards ?? []).map((r, i) => (i === idx ? { ...r, invites: Math.max(1, Number(e.target.value) || 1) } : r));
                          update({ invite_rewards: next });
                        }}
                      />
                      {hasGuildData ? (
                        <NiceSelect
                          className="w-52"
                          value={row.role_id}
                          options={roleOptions}
                          onChange={(v) => {
                            const next = (config.invite_rewards ?? []).map((r, i) => (i === idx ? { ...r, role_id: v } : r));
                            update({ invite_rewards: next });
                          }}
                        />
                      ) : (
                        <input
                          className={`${inputCls} w-52`}
                          value={row.role_id}
                          onChange={(e) => {
                            const next = (config.invite_rewards ?? []).map((r, i) => (i === idx ? { ...r, role_id: e.target.value } : r));
                            update({ invite_rewards: next });
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => update({ invite_rewards: (config.invite_rewards ?? []).filter((_, i) => i !== idx) })}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:border-red-400/50 hover:text-red-300"
                      >
                        {t.removeRow}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={!hasGuildData || roleOptions.length === 0}
                    onClick={() =>
                      update({
                        invite_rewards: [...(config.invite_rewards ?? []), { invites: ((config.invite_rewards ?? []).at(-1)?.invites ?? 0) + 10, role_id: roleOptions[0].id }],
                      })
                    }
                    className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-blue/60 hover:text-white disabled:opacity-40"
                  >
                    + {t.addRow}
                  </button>
                </div>
              </div>
            </div>
            <HelpZone title={SECTION_HELP.invites.title} commands={SECTION_HELP.invites.commands} note={SECTION_HELP.invites.note} />
          </section>
          )}

          {view === 'starboard' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="star" size={18} className="text-amber-300" /> {t.starboardTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.starboard.title} commands={SECTION_HELP.starboard.commands} note={SECTION_HELP.starboard.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('starboard')}
                onImport={(file) => void importFile(file, 'starboard')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {hasGuildData ? (
                <SelectField
                  label={t.starboardChannelLabel}
                  value={config.starboard_channel_id ?? null}
                  placeholder={t.pickChannel}
                  options={textChannelOptions}
                  onChange={(v) => update({ starboard_channel_id: v })}
                />
              ) : (
                <Field label={t.starboardChannelLabel} hint={t.manualIdHint}>
                  <input
                    className={inputCls}
                    placeholder="ID"
                    value={config.starboard_channel_id ?? ''}
                    onChange={(e) => update({ starboard_channel_id: e.target.value || null })}
                  />
                </Field>
              )}
              <Field label={t.starboardEmojiLabel}>
                <input
                  className={inputCls}
                  value={config.starboard_emoji ?? '⭐'}
                  maxLength={64}
                  onChange={(e) => update({ starboard_emoji: e.target.value })}
                />
              </Field>
              <Field label={t.starboardMinLabel}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className={inputCls}
                  value={config.starboard_min ?? 3}
                  onChange={(e) => update({ starboard_min: Math.max(1, Number(e.target.value) || 1) })}
                />
              </Field>
            </div>
            <HelpZone title={SECTION_HELP.starboard.title} commands={SECTION_HELP.starboard.commands} note={SECTION_HELP.starboard.note} />
          </section>
          )}

          {view === 'nitro' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="star" size={18} className="text-neon-pink" /> {t.nitroToggle}
              </h2>
              <QuickHelp title={SECTION_HELP.nitro.title} commands={SECTION_HELP.nitro.commands} note={SECTION_HELP.nitro.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('nitro')}
                onImport={(file) => void importFile(file, 'nitro')}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white/90">{t.nitroToggle}</p>
                <p className="text-xs text-white/50">{t.nitroToggleHint}</p>
              </div>
              <Toggle on={Boolean(config.nitro_repost_enabled)} onChange={(v) => update({ nitro_repost_enabled: v })} />
            </div>
            <HelpZone title={SECTION_HELP.nitro.title} commands={SECTION_HELP.nitro.commands} note={SECTION_HELP.nitro.note} />
          </section>
          )}

          {view === 'staff' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="shield" size={18} className="text-neon-blue" /> {t.staffRoleLabel}
              </h2>
              <QuickHelp title={SECTION_HELP.staff.title} commands={SECTION_HELP.staff.commands} note={SECTION_HELP.staff.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('staff')}
                onImport={(file) => void importFile(file, 'staff')}
              />
            </div>
            <p className="mb-4 text-xs text-white/45">{t.staffRoleHint}</p>
            {hasGuildData ? (
              <SelectField
                label={t.staffRoleLabel}
                hint={t.staffRoleHint}
                value={config.staff_role_id ?? null}
                placeholder={t.pickRole}
                options={roleOptions}
                onChange={(v) => update({ staff_role_id: v })}
              />
            ) : (
              <Field label={t.staffRoleLabel} hint={t.manualIdHint}>
                <input
                  className={inputCls}
                  placeholder="ID"
                  value={config.staff_role_id ?? ''}
                  onChange={(e) => update({ staff_role_id: e.target.value || null })}
                />
              </Field>
            )}
            <HelpZone title={SECTION_HELP.staff.title} commands={SECTION_HELP.staff.commands} note={SECTION_HELP.staff.note} />
          </section>
          )}

          {view === 'stats' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="chart-bar" size={18} className="text-neon-blue" /> {t.statsTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.stats.title} commands={SECTION_HELP.stats.commands} note={SECTION_HELP.stats.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('stats')}
                onImport={(file) => void importFile(file, 'stats')}
              />
            </div>
            <p className="mb-5 text-xs text-white/45">{t.statsHint}</p>
            <div className="grid gap-2">
              {((config.counters ?? []) as { type: string; channel_id: string }[]).map((row, idx) => (
                <div key={`${row.type}-${idx}`} className="flex flex-wrap items-center gap-2">
                  <NiceSelect
                    className="w-40"
                    value={row.type}
                    options={['members', 'bots', 'humans', 'channels', 'roles', 'online'].map((opt) => ({ id: opt, label: opt }))}
                    onChange={(v) => {
                      const next = (config.counters ?? []).map((r, i) => (i === idx ? { ...r, type: v } : r));
                      update({ counters: next });
                    }}
                  />
                  {hasGuildData ? (
                    <NiceSelect
                      className="w-56"
                      value={row.channel_id || null}
                      options={voiceChannelOptions}
                      placeholder={t.pickVoice}
                      onChange={(v) => {
                        const next = (config.counters ?? []).map((r, i) => (i === idx ? { ...r, channel_id: v } : r));
                        update({ counters: next });
                      }}
                    />
                  ) : (
                    <input
                      className={`${inputCls} w-56`}
                      placeholder="ID del canal de voz"
                      value={row.channel_id}
                      onChange={(e) => {
                        const next = (config.counters ?? []).map((r, i) => (i === idx ? { ...r, channel_id: e.target.value } : r));
                        update({ counters: next });
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => update({ counters: (config.counters ?? []).filter((_, i) => i !== idx) })}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-bold text-white/60 transition hover:border-red-400/50 hover:text-red-300"
                  >
                    {t.removeRow}
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={!hasGuildData || voiceChannelOptions.length === 0}
                onClick={() =>
                  update({
                    counters: [
                      ...(config.counters ?? []),
                      { type: 'members', channel_id: voiceChannelOptions[0]?.id ?? '' },
                    ],
                  })
                }
                className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-blue/60 hover:text-white disabled:opacity-40"
              >
                + {t.addRow}
              </button>
            </div>
            <HelpZone title={SECTION_HELP.stats.title} commands={SECTION_HELP.stats.commands} note={SECTION_HELP.stats.note} />
          </section>
          )}

          {view === 'automod' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="shield" size={18} className="text-red-400" /> {t.automodTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.automod.title} commands={SECTION_HELP.automod.commands} note={SECTION_HELP.automod.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('automod')}
                onImport={(file) => void importFile(file, 'automod')}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white/90">{t.automodToggle}</p>
                <p className="text-xs text-white/50">{t.automodToggleHint}</p>
              </div>
              <Toggle on={Boolean(config.automod_enabled)} onChange={(v) => update({ automod_enabled: v })} />
            </div>
            {config.automod_enabled && (
              <div className="mt-4 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ['links', t.automodWordLinks],
                      ['invites', t.automodWordInvites],
                      ['caps', t.automodWordCaps],
                      ['spam', t.automodWordSpam],
                      ['flood', t.automodWordFlood],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                      <p className="text-xs font-semibold text-white/80">{label}</p>
                      <Toggle
                        on={automodCfg[key]}
                        onChange={(v) => update({ automod_config: { ...automodCfg, [key]: v } })}
                      />
                    </div>
                  ))}
                </div>
                <Field label={t.automodWordsLabel} hint={t.automodWordsHint}>
                  <input
                    className={inputCls}
                    value={automodCfg.words.join(', ')}
                    placeholder="palabra1, palabra2"
                    onChange={(e) =>
                      update({
                        automod_config: {
                          ...automodCfg,
                          words: e.target.value
                            .split(',')
                            .map((s) => s.trim().toLowerCase())
                            .filter(Boolean)
                            .slice(0, 100),
                        },
                      })
                    }
                  />
                </Field>
              </div>
            )}
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <Icon name="clock" size={15} className="text-neon-blue" /> {t.cooldownTitle}
              </p>
              <p className="mt-1 text-[11px] text-white/45">{t.cooldownHint}</p>
            </div>

            {/* Roles de moderación (repartidos aquí desde General): quién puede
                moderar y qué rol reciben los silenciados. */}
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Icon name="shield" size={15} className="text-neon-blue" /> {t.rolesTitle}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label={t.adminRoleLabel}>
                  <MultiSelect
                    values={config.admin_role_ids ?? []}
                    options={roleOptions}
                    placeholder={t.pickRole}
                    onChange={(v) => update({ admin_role_ids: v })}
                  />
                </Field>
                <Field label={t.modRoleLabel}>
                  <MultiSelect
                    values={config.mod_role_ids ?? []}
                    options={roleOptions}
                    placeholder={t.pickRole}
                    onChange={(v) => update({ mod_role_ids: v })}
                  />
                </Field>
                <Field label={t.muteRoleLabel}>
                  {hasGuildData ? (
                    <NiceSelect
                      value={config.mute_role_id ?? null}
                      options={roleOptions}
                      placeholder={t.pickRole}
                      onChange={(v) => update({ mute_role_id: v })}
                    />
                  ) : (
                    <input
                      className={inputCls}
                      value={config.mute_role_id ?? ''}
                      onChange={(e) => update({ mute_role_id: e.target.value || null })}
                    />
                  )}
                </Field>
              </div>
            </div>
            <HelpZone title={SECTION_HELP.automod.title} commands={SECTION_HELP.automod.commands} note={SECTION_HELP.automod.note} />
          </section>
          )}

          {view === 'alliance' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="users" size={18} className="text-neon-blue" /> {t.allianceTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.alliance.title} commands={SECTION_HELP.alliance.commands} note={SECTION_HELP.alliance.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('alliance')}
                onImport={(file) => void importFile(file, 'alliance')}
              />
            </div>
            <p className="mb-5 text-xs text-white/45">{t.allianceHint}</p>
            <div className="grid gap-5">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.allianceTitle}</p>
                  <p className="text-xs text-white/50">{t.allianceHint}</p>
                </div>
                <Toggle on={allianceCfg.enabled} onChange={(v) => update({ alliance_config: { ...allianceCfg, enabled: v } })} />
              </div>
              {allianceCfg.enabled && (
                <>
                  <div className="grid gap-5 sm:grid-cols-3">
                    {hasGuildData ? (
                      <SelectField
                        label={t.allianceChannelLabel}
                        value={allianceCfg.channel_id}
                        placeholder={t.pickChannel}
                        options={textChannelOptions}
                        onChange={(v) => update({ alliance_config: { ...allianceCfg, channel_id: v } })}
                      />
                    ) : (
                      <Field label={t.allianceChannelLabel} hint={t.manualIdHint}>
                        <input className={inputCls} value={allianceCfg.channel_id ?? ''} onChange={(e) => update({ alliance_config: { ...allianceCfg, channel_id: e.target.value || null } })} />
                      </Field>
                    )}
                    {hasGuildData ? (
                      <SelectField
                        label={t.allianceRoleLabel}
                        hint={t.allianceRoleHint}
                        value={allianceCfg.role_id}
                        placeholder={t.pickRole}
                        options={roleOptions}
                        onChange={(v) => update({ alliance_config: { ...allianceCfg, role_id: v } })}
                      />
                    ) : (
                      <Field label={t.allianceRoleLabel} hint={t.manualIdHint}>
                        <input className={inputCls} value={allianceCfg.role_id ?? ''} onChange={(e) => update({ alliance_config: { ...allianceCfg, role_id: e.target.value || null } })} />
                      </Field>
                    )}
                    {hasGuildData ? (
                      <SelectField
                        label={t.allianceNotifyLabel}
                        hint={t.allianceNotifyHint}
                        value={allianceCfg.notify_role_id}
                        placeholder={t.pickRole}
                        options={roleOptions}
                        onChange={(v) => update({ alliance_config: { ...allianceCfg, notify_role_id: v } })}
                      />
                    ) : (
                      <Field label={t.allianceNotifyLabel} hint={t.manualIdHint}>
                        <input className={inputCls} value={allianceCfg.notify_role_id ?? ''} onChange={(e) => update({ alliance_config: { ...allianceCfg, notify_role_id: e.target.value || null } })} />
                      </Field>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.allianceCooldownLabel} hint={t.allianceCooldownHint}>
                      <input
                        type="number"
                        min={0}
                        max={8760}
                        className={inputCls}
                        value={allianceCfg.cooldown_hours}
                        onChange={(e) => update({ alliance_config: { ...allianceCfg, cooldown_hours: Math.max(0, Number(e.target.value) || 0) } })}
                      />
                    </Field>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                        <p className="text-xs font-semibold text-white/80">{t.allianceOnePerLabel}</p>
                        <Toggle on={allianceCfg.one_per_server} onChange={(v) => update({ alliance_config: { ...allianceCfg, one_per_server: v } })} />
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-2.5">
                        <p className="text-xs font-semibold text-white/80">{t.allianceNsfwLabel}</p>
                        <Toggle on={allianceCfg.allow_nsfw} onChange={(v) => update({ alliance_config: { ...allianceCfg, allow_nsfw: v } })} />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.allianceWordsLabel} hint={t.allianceWordsHint}>
                      <input
                        className={inputCls}
                        value={allianceCfg.blocked_words.join(', ')}
                        onChange={(e) =>
                          update({
                            alliance_config: {
                              ...allianceCfg,
                              blocked_words: e.target.value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 200),
                            },
                          })
                        }
                      />
                    </Field>
                    <Field label={t.allianceServersLabel} hint={t.allianceServersHint}>
                      <input
                        className={inputCls}
                        value={allianceCfg.blocked_servers.join(', ')}
                        onChange={(e) =>
                          update({
                            alliance_config: {
                              ...allianceCfg,
                              blocked_servers: e.target.value.split(',').map((s) => s.trim()).filter((s) => /^\d{17,20}$/.test(s)).slice(0, 500),
                            },
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.allianceSanctionLabel} hint={t.allianceSanctionHint}>
                      <select
                        className={inputCls}
                        value={allianceCfg.sanction}
                        onChange={(e) => update({ alliance_config: { ...allianceCfg, sanction: e.target.value as 'none' | 'mute' | 'kick' | 'ban' } })}
                      >
                        <option value="none">none</option>
                        <option value="mute">mute</option>
                        <option value="kick">kick</option>
                        <option value="ban">ban</option>
                      </select>
                    </Field>
                    <Field label={`${t.allianceSanctionLabel} — minutos`} hint="Solo para mute">
                      <input
                        type="number"
                        min={1}
                        className={inputCls}
                        value={allianceCfg.sanction_minutes}
                        onChange={(e) => update({ alliance_config: { ...allianceCfg, sanction_minutes: Math.max(1, Number(e.target.value) || 1440) } })}
                      />
                    </Field>
                  </div>
                  <Field label={t.allianceRewardsLabel} hint={t.allianceRewardsHint}>
                    <input
                      className={inputCls}
                      placeholder="5:@RolAliado:500"
                      value={allianceCfg.rewards.map((r) => `${r.points}:${r.role_id ?? ''}:${r.money ?? ''}`).join(', ')}
                      onChange={(e) => {
                        const rewards = e.target.value
                          .split(',')
                          .map((part) => {
                            const [points, role, money] = part.split(':').map((s) => s.trim());
                            const pts = parseInt(points ?? '', 10);
                            if (isNaN(pts) || pts < 1) return null;
                            const reward: { points: number; role_id?: string; money?: number } = { points: pts };
                            if (role) reward.role_id = role;
                            const moneyValue = money ? parseInt(money, 10) : NaN;
                            if (!isNaN(moneyValue)) reward.money = moneyValue;
                            return reward;
                          })
                          .filter((r): r is { points: number; role_id?: string; money?: number } => r !== null)
                          .slice(0, 50);
                        update({ alliance_config: { ...allianceCfg, rewards } });
                      }}
                    />
                  </Field>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="mb-2 text-sm font-bold text-white">{t.allianceEmbedSuccessLabel}</p>
                    <p className="mb-3 text-[10px] text-white/40">{t.allianceEmbedHint}</p>
                    <div className="grid gap-3">
                      <input
                        className={inputCls}
                        value={allianceCfg.embed_success.title}
                        placeholder={t.allianceEmbedSuccessLabel}
                        onChange={(e) => update({ alliance_config: { ...allianceCfg, embed_success: { ...allianceCfg.embed_success, title: e.target.value } } })}
                      />
                      <input
                        className={inputCls}
                        value={allianceCfg.embed_success.description}
                        placeholder="descripción"
                        onChange={(e) => update({ alliance_config: { ...allianceCfg, embed_success: { ...allianceCfg.embed_success, description: e.target.value } } })}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="mb-2 text-sm font-bold text-white">{t.allianceEmbedErrorLabel}</p>
                    <div className="grid gap-3">
                      <input
                        className={inputCls}
                        value={allianceCfg.embed_error.title}
                        placeholder={t.allianceEmbedErrorLabel}
                        onChange={(e) => update({ alliance_config: { ...allianceCfg, embed_error: { ...allianceCfg.embed_error, title: e.target.value } } })}
                      />
                      <input
                        className={inputCls}
                        value={allianceCfg.embed_error.description}
                        placeholder="{reason}"
                        onChange={(e) => update({ alliance_config: { ...allianceCfg, embed_error: { ...allianceCfg.embed_error, description: e.target.value } } })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <HelpZone title={SECTION_HELP.alliance.title} commands={SECTION_HELP.alliance.commands} note={SECTION_HELP.alliance.note} />
          </section>
          )}

          {view === 'tickets' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="support" size={18} className="text-neon-blue" /> {t.ticketsTitle}
              </h2>
              <QuickHelp title={SECTION_HELP.tickets.title} commands={SECTION_HELP.tickets.commands} note={SECTION_HELP.tickets.note} />
              <Badge kind="free" dict={dict} />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('tickets')}
                onImport={(file) => void importFile(file, 'tickets')}
              />
            </div>
            <p className="mb-5 text-xs text-white/45">{t.ticketsHint}</p>
            <div className="grid gap-5">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.ticketsTitle}</p>
                  <p className="text-xs text-white/50">{t.ticketsHint}</p>
                </div>
                <Toggle on={ticketCfg.enabled} onChange={(v) => update({ ticket_config: { ...ticketCfg, enabled: v } })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {hasGuildData ? (
                  <SelectField
                    label={t.ticketsPanelLabel}
                    value={ticketCfg.panel_channel_id}
                    placeholder={t.pickChannel}
                    options={textChannelOptions}
                    onChange={(v) => update({ ticket_config: { ...ticketCfg, panel_channel_id: v } })}
                  />
                ) : (
                  <Field label={t.ticketsPanelLabel} hint={t.manualIdHint}>
                    <input className={inputCls} value={ticketCfg.panel_channel_id ?? ''} onChange={(e) => update({ ticket_config: { ...ticketCfg, panel_channel_id: e.target.value || null } })} />
                  </Field>
                )}
                {hasGuildData ? (
                  <SelectField
                    label={t.ticketsLogLabel}
                    value={ticketCfg.log_channel_id}
                    placeholder={t.pickChannel}
                    options={textChannelOptions}
                    onChange={(v) => update({ ticket_config: { ...ticketCfg, log_channel_id: v } })}
                  />
                ) : (
                  <Field label={t.ticketsLogLabel} hint={t.manualIdHint}>
                    <input className={inputCls} value={ticketCfg.log_channel_id ?? ''} onChange={(e) => update({ ticket_config: { ...ticketCfg, log_channel_id: e.target.value || null } })} />
                  </Field>
                )}
                <Field label={t.ticketsAutoDeleteLabel}>
                  <input
                    type="number"
                    min={0}
                    max={720}
                    className={inputCls}
                    value={ticketCfg.auto_delete_hours}
                    onChange={(e) => update({ ticket_config: { ...ticketCfg, auto_delete_hours: Math.max(0, Number(e.target.value) || 0) } })}
                  />
                </Field>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/45">{t.ticketsCategoriesLabel}</p>
                <div className="grid gap-3">
                  {ticketCfg.categories.map((cat, idx) => (
                    <div key={cat.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <code className="rounded bg-black/40 px-2 py-1 text-[11px] font-bold text-neon-blue">{cat.id}</code>
                        <button
                          type="button"
                          onClick={() => update({ ticket_config: { ...ticketCfg, categories: ticketCfg.categories.filter((c) => c.id !== cat.id) } })}
                          className="ml-auto rounded-lg border border-white/15 px-3 py-1 text-[10px] font-bold text-white/60 transition hover:border-red-400/50 hover:text-red-300"
                        >
                          {t.removeRow}
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Field label={t.ticketsCatLabel}>
                          <input
                            className={inputCls}
                            value={cat.label}
                            onChange={(e) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, label: e.target.value } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }}
                          />
                        </Field>
                        <Field label={t.ticketsCatEmoji}>
                          <input
                            className={inputCls}
                            value={cat.emoji}
                            maxLength={64}
                            onChange={(e) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, emoji: e.target.value } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }}
                          />
                        </Field>
                        <Field label={t.ticketsCatColor}>
                          <input
                            className={inputCls}
                            value={cat.color}
                            onChange={(e) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, color: e.target.value } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }}
                          />
                        </Field>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {hasGuildData ? (
                          <SelectField
                            label={t.ticketsCatDiscordLabel}
                            value={cat.discord_category_id}
                            placeholder={t.pickCategory}
                            options={categoryOptions}
                            onChange={(v) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, discord_category_id: v } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }}
                          />
                        ) : (
                          <Field label={t.ticketsCatDiscordLabel} hint={t.manualIdHint}>
                            <input className={inputCls} value={cat.discord_category_id ?? ''} onChange={(e) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, discord_category_id: e.target.value || null } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }} />
                          </Field>
                        )}
                        <Field label={t.ticketsCatRolesLabel} hint="IDs separados por coma">
                          <MultiSelect
                            values={cat.role_ids}
                            options={roleOptions}
                            placeholder={t.pickRole}
                            onChange={(roleIds) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, role_ids: roleIds } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }}
                          />
                        </Field>
                        {hasGuildData ? (
                          <SelectField
                            label={t.ticketsCatGrantLabel}
                            value={cat.grant_role_id}
                            placeholder={t.pickRole}
                            options={roleOptions}
                            onChange={(v) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, grant_role_id: v } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }}
                          />
                        ) : (
                          <Field label={t.ticketsCatGrantLabel} hint={t.manualIdHint}>
                            <input className={inputCls} value={cat.grant_role_id ?? ''} onChange={(e) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, grant_role_id: e.target.value || null } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }} />
                          </Field>
                        )}
                      </div>
                      <div className="mt-3 grid gap-3">
                        <Field label={t.ticketsCatFormLabel} hint="Vacío = apertura directa">
                          <textarea
                            className={`${inputCls} min-h-[70px]`}
                            value={cat.form.join('\n')}
                            onChange={(e) => {
                              const form = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 5);
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, form } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }}
                          />
                        </Field>
                        <Field label={t.ticketsCatWelcomeLabel} hint="Variable: {user}">
                          <RichInput
                            value={cat.welcome}
                            emojis={emojis}
                            onChange={(v) => {
                              const categories = ticketCfg.categories.map((c, i) => (i === idx ? { ...c, welcome: v } : c));
                              update({ ticket_config: { ...ticketCfg, categories } });
                            }}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const id = `cat${ticketCfg.categories.length + 1}`;
                      update({
                        ticket_config: {
                          ...ticketCfg,
                          categories: [
                            ...ticketCfg.categories,
                            {
                              id,
                              label: 'Nueva categoría',
                              emoji: '🎫',
                              description: '',
                              discord_category_id: null,
                              role_ids: [],
                              grant_role_id: null,
                              form: [],
                              welcome: '¡Hola {user}! Cuéntanos tu caso y el equipo te atenderá pronto.',
                              color: '#00d4ff',
                            },
                          ],
                        },
                      });
                    }}
                    className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-blue/60 hover:text-white"
                  >
                    + {t.ticketsAddCategory}
                  </button>
                </div>
              </div>
            </div>
            {/* Sistema de tickets clásico + extras del servidor (fusionado) */}
            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Icon name="support" size={15} className="text-neon-blue" /> {t.extrasTitle}
              </p>
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white/90">{t.ticketsToggle}</p>
                    <p className="text-xs text-white/50">{t.ticketsToggleHint}</p>
                  </div>
                  <Toggle on={Boolean(config.tickets_enabled)} onChange={(v) => update({ tickets_enabled: v })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {hasGuildData ? (
                    <SelectField
                      label={t.ticketCategoryLabel}
                      value={config.tickets_category_id ?? null}
                      placeholder={t.pickCategory}
                      options={categoryOptions}
                      onChange={(v) => update({ tickets_category_id: v })}
                    />
                  ) : (
                    <Field label={t.ticketCategoryLabel} hint={t.manualIdHint}>
                      <input className={inputCls} value={config.tickets_category_id ?? ''} onChange={(e) => update({ tickets_category_id: e.target.value || null })} />
                    </Field>
                  )}
                  {hasGuildData ? (
                    <SelectField
                      label={t.ticketRoleLabel}
                      value={config.tickets_role_id ?? null}
                      placeholder={t.pickRole}
                      options={roleOptions}
                      onChange={(v) => update({ tickets_role_id: v })}
                    />
                  ) : (
                    <Field label={t.ticketRoleLabel} hint={t.manualIdHint}>
                      <input className={inputCls} value={config.tickets_role_id ?? ''} onChange={(e) => update({ tickets_role_id: e.target.value || null })} />
                    </Field>
                  )}
                  {hasGuildData ? (
                    <SelectField
                      label={t.logsChannelLabel}
                      value={config.logs_channel_id ?? null}
                      placeholder={t.pickChannel}
                      options={textChannelOptions}
                      onChange={(v) => update({ logs_channel_id: v })}
                    />
                  ) : (
                    <Field label={t.logsChannelLabel} hint={t.manualIdHint}>
                      <input className={inputCls} value={config.logs_channel_id ?? ''} onChange={(e) => update({ logs_channel_id: e.target.value || null })} />
                    </Field>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {hasGuildData ? (
                    <SelectField
                      label={t.musicChannelLabel}
                      hint={t.musicChannelHint}
                      value={config.music_channel_id ?? null}
                      placeholder={t.pickChannel}
                      options={textChannelOptions}
                      onChange={(v) => update({ music_channel_id: v })}
                    />
                  ) : (
                    <Field label={t.musicChannelLabel} hint={t.manualIdHint}>
                      <input className={inputCls} value={config.music_channel_id ?? ''} onChange={(e) => update({ music_channel_id: e.target.value || null })} />
                    </Field>
                  )}
                  {hasGuildData ? (
                    <SelectField
                      label={t.muteRoleLabel}
                      value={config.mute_role_id ?? null}
                      placeholder={t.pickRole}
                      options={roleOptions}
                      onChange={(v) => update({ mute_role_id: v })}
                    />
                  ) : (
                    <Field label={t.muteRoleLabel} hint={t.manualIdHint}>
                      <input className={inputCls} value={config.mute_role_id ?? ''} onChange={(e) => update({ mute_role_id: e.target.value || null })} />
                    </Field>
                  )}
                </div>
              </div>
            </div>
            <HelpZone title={SECTION_HELP.tickets.title} commands={SECTION_HELP.tickets.commands} note={SECTION_HELP.tickets.note} />
          </section>
          )}

          </div>
        </div>
      </div>

      {leavePrompt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[125] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="cz-shake w-full max-w-md rounded-3xl border border-red-500/60 bg-[#1a0509] p-7 text-center shadow-[0_0_60px_-12px_rgba(248,113,113,0.6)]">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/50 bg-red-500/15 text-xl">
              ⚠
            </div>
            <h2 className="font-header text-lg font-black uppercase tracking-wide text-red-400">{t.leaveTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{t.leaveBody}</p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => void resolveLeave('save')}
                disabled={busy || hasBotGuild === false}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.leaveSave}
              </button>
              <button
                type="button"
                onClick={() => void resolveLeave('discard')}
                className="inline-flex items-center justify-center rounded-xl border border-red-400/40 px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-red-300 transition hover:bg-red-400/10 active:scale-95"
              >
                {t.leaveDiscard}
              </button>
              <button
                type="button"
                onClick={() => void resolveLeave('stay')}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 font-header text-xs font-black uppercase tracking-widest text-white/70 transition hover:border-neon-blue/60 hover:text-white active:scale-95"
              >
                {t.leaveStay}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={exportPreview !== null}
        onOpenChange={(open) => {
          if (!open) setExportPreview(null);
        }}
        title={t.jsonExportTitle}
        description={t.jsonExportDesc}
        size="lg"
      >
        {exportPreview && (
          <div className="space-y-3">
            <p className="break-all rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11px] text-white/50">
              {exportPreview.name}
            </p>
            <div className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px]">
              {Object.entries(exportPreview.payload.config).map(([k, v]) => (
                <div key={k} className="flex gap-2 py-0.5">
                  <span className="shrink-0 text-neon-blue">{k}:</span>
                  <span className="truncate text-white/60">{JSON.stringify(v)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setExportPreview(null)}
                className="rounded-xl border border-white/15 px-4 py-2 font-header text-[10px] font-black uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
              >
                {t.jsonCancel}
              </button>
              <button
                type="button"
                onClick={confirmExport}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink px-4 py-2 font-header text-[10px] font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95"
              >
                <Icon name="json" size={12} /> {t.jsonDownload}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={importPreview !== null}
        onOpenChange={(open) => {
          if (!open) setImportPreview(null);
        }}
        title={t.jsonImportTitle}
        description={t.jsonImportDesc}
        size="lg"
      >
        {importPreview && (
          <div className="space-y-3">
            <p className="break-all rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11px] text-white/50">
              {importPreview.fileName}
            </p>
            {importPreview.changed.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-4 text-center text-xs text-white/50">
                {t.jsonNoChanges}
              </p>
            ) : (
              <div className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px]">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-400">{t.jsonChanged}</p>
                {importPreview.changed.map((c) => (
                  <div key={c.key} className="flex flex-wrap items-center gap-2 py-0.5">
                    <span className="shrink-0 text-neon-blue">{c.key}:</span>
                    <span className="text-red-400/80 line-through">{JSON.stringify(c.from)}</span>
                    <span className="text-white/40">→</span>
                    <span className="text-emerald-400">{JSON.stringify(c.to)}</span>
                  </div>
                ))}
              </div>
            )}
            {importPreview.unchanged.length > 0 && (
              <p className="text-[11px] text-white/40">
                <span className="font-black uppercase tracking-widest text-white/50">{t.jsonUnchanged}:</span>{' '}
                {importPreview.unchanged.join(', ')}
              </p>
            )}
            {importPreview.ignored.length > 0 && (
              <p className="text-[11px] text-white/40">
                <span className="font-black uppercase tracking-widest text-white/50">{t.jsonIgnored}:</span>{' '}
                {importPreview.ignored.join(', ')}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="rounded-xl border border-white/15 px-4 py-2 font-header text-[10px] font-black uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
              >
                {t.jsonCancel}
              </button>
              <button
                type="button"
                onClick={applyImport}
                disabled={importPreview.changed.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 font-header text-[10px] font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="json" size={12} /> {t.jsonApply}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <SaveDock
        note={offline ? dict.botStatus.saveOfflineNote.replace('{reason}', dict.botStatus.reasons[offlineReasonKey]) : null}
        dirty={dirty}
        status={status}
        busy={busy}
        autoSave={autoSave}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        blocked={blocked || leavePrompt !== null}
        saveDisabled={hasBotGuild === false}
        onAutoSave={setAutoSavePref}
        onUndo={undo}
        onRedo={redo}
        onSave={() => config && saveMutation.mutate(config)}
        onCancel={() => {
          if (baseline) setConfig(JSON.parse(baseline) as GuildConfig);
          setHistory([]);
          setFuture([]);
          setStatus('idle');
          setError(null);
        }}
        labels={{
          save: t.save,
          saving: t.saving,
          saved: t.saved,
          saveError: t.saveError,
          autoSaveLabel: t.autoSaveLabel,
          autoSaveHint: t.autoSaveHint,
          undo: t.undo,
          redo: t.redo,
          unsaved: t.unsaved,
          allSaved: t.allSaved,
          backupNote: t.backupNote,
          cancel: t.cancel,
        }}
      />
    </div>
  );
}
