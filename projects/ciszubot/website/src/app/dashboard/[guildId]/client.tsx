'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, useToast } from '@ciszu/ui';
import { getDict, readCookieLang, INVITE_URL, type Dict } from '@/lib/i18n';
import InviteLink from '@/components/dashboard/InviteLink';
import type { GuildInfo } from '@/lib/discordGuild';
import { SaveDock, type SaveStatus } from '@/components/dashboard/SaveDock';
import DiscordMarkdownField from '@/components/dashboard/DiscordMarkdownField';
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
  /** Toggles por servidor de funciones del bot (slug → enabled). */
  features?: Record<string, boolean>;
}

type SectionKey = 'general' | 'levels' | 'welcome' | 'extras';
type PartialConfig = Partial<GuildConfig>;

const SECTION_KEYS: Record<SectionKey, (keyof GuildConfig)[]> = {
  general: ['prefix', 'lang'],
  levels: ['leveling_enabled', 'level_channel_id', 'xp_rate'],
  welcome: [
    'welcome_channel_id',
    'welcome_message',
    'goodbye_channel_id',
    'goodbye_message',
    'autorole_ids',
  ],
  extras: [
    'tickets_enabled',
    'tickets_category_id',
    'tickets_role_id',
    'private_channels',
    'private_category_id',
    'music_channel_id',
    'mute_role_id',
    'automod_enabled',
    'logs_channel_id',
  ],
};

const ALL_KEYS: (keyof GuildConfig)[] = Object.values(SECTION_KEYS).flat();

/** Funciones configurables por servidor (toggles del dashboard). */
const FEATURE_ROWS: { slug: string; icon: string; labelKey: keyof Dict['guildPage']; descKey: keyof Dict['guildPage']; premium?: boolean }[] = [
  { slug: 'music', icon: 'star', labelKey: 'featMusic', descKey: 'featMusicDesc', premium: true },
  { slug: 'search', icon: 'search', labelKey: 'featSearch', descKey: 'featSearchDesc', premium: true },
  { slug: 'minigames', icon: 'gamepad', labelKey: 'featMinigames', descKey: 'featMinigamesDesc' },
  { slug: 'economy', icon: 'trophy', labelKey: 'featEconomy', descKey: 'featEconomyDesc' },
  { slug: 'help', icon: 'help', labelKey: 'featHelp', descKey: 'featHelpDesc' },
  { slug: 'utility', icon: 'settings', labelKey: 'featUtility', descKey: 'featUtilityDesc' },
  { slug: 'moderation', icon: 'shield', labelKey: 'featModeration', descKey: 'featModerationDesc' },
  { slug: 'setup', icon: 'palette', labelKey: 'featSetup', descKey: 'featSetupDesc' },
  { slug: 'levels', icon: 'chart-bar', labelKey: 'featLevels', descKey: 'featLevelsDesc' },
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
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
        <span aria-hidden>✔</span>
        {dict.guildPage.free}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-neon-pink/50 bg-neon-pink/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-neon-pink">
      <span aria-hidden>★</span>
      {dict.guildPage.premium} · {dict.guildPage.betaBadge}
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
function PremiumTag({ label, betaNote }: { label: string; betaNote: string }) {
  return (
    <span
      title={betaNote}
      className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-400"
    >
      <Icon name="crown" size={9} />
      {label}
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
        <span className="hidden sm:inline">{exportLabel}</span>
        <span>↓</span>
      </button>
      <button type="button" disabled={disabled} onClick={() => fileRef.current?.click()} className={btn} title={importLabel}>
        <FloppyMini />
        <Icon name="json" size={11} />
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

  useEffect(() => {
    setAutoSave(localStorage.getItem('cz-dash-autosave') === '1');
  }, []);

  // Sub-sidebar por opción: resumen por defecto (spec del dashboard).
  type GuildView = 'summary' | 'general' | 'features' | 'levels' | 'welcome' | 'extras' | 'history';
  const [view, setView] = useState<GuildView>('summary');
  useEffect(() => {
    const saved = localStorage.getItem('cz-dash-view') as GuildView | null;
    if (saved && ['summary', 'general', 'features', 'levels', 'welcome', 'extras', 'history'].includes(saved)) setView(saved);
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
      setView('summary');
    }
    const id = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    return () => clearTimeout(id);
  }, []);
  const SUBNAV = [
    { key: 'summary', icon: 'server', label: 'subnavSummary' },
    { key: 'general', icon: 'settings', label: 'subnavGeneral' },
    { key: 'features', icon: 'sparkles', label: 'subnavFeatures' },
    { key: 'levels', icon: 'star', label: 'subnavLevels' },
    { key: 'welcome', icon: 'heart', label: 'subnavWelcome' },
    { key: 'extras', icon: 'support', label: 'subnavExtras' },
    { key: 'history', icon: 'verified', label: 'subnavHistory' },
  ] as const satisfies ReadonlyArray<{ key: GuildView; icon: string; label: keyof Dict['guildPage'] }>;

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

  const { data: serverConfig, isPending } = useQuery({
    queryKey: ['guild-config', guildId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/${guildId}`, { cache: 'no-store' });
      if (res.status === 403 || res.status === 401) {
        window.location.href = '/dashboard';
        return null;
      }
      const json = (await res.json()) as { config?: GuildConfig | null; features?: Record<string, boolean> };
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
          : (Object.fromEntries(SECTION_KEYS[scope].map((k) => [k, config[k]])) as PartialConfig);
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
      const user = (username ?? 'usuario').replace(/[^a-z0-9-_.]/gi, '') || 'usuario';
      const name = `ciszubot_${scope}_${slug}_${stamp}_${user}.json`;
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
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      setFlash(t.exported);
      setTimeout(() => setFlash(null), 3500);
    },
    [config, dirty, guildId, guildName, slug, username, t.backupNote, t.exported, t.jsonNeedSave]
  );

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
        const allowed: readonly string[] = scope ? SECTION_KEYS[scope] : ALL_KEYS;
        const clean: Partial<GuildConfig> = {};
        for (const key of Object.keys(raw)) {
          if (allowed.includes(key)) {
            clean[key as keyof GuildConfig] = raw[key as keyof GuildConfig] as never;
          }
        }
        if (Object.keys(clean).length === 0) throw new Error('empty');
        setHistory((h) => [...h.slice(-29), config]);
        setFuture([]);
        setConfig({ ...config, ...clean });
        setStatus('idle');
        setError(null);
        setFlash(t.imported);
        setTimeout(() => setFlash(null), 4000);
      } catch {
        setStatus('error');
        setError(t.importError);
        setFlash(t.importError);
        setTimeout(() => setFlash(null), 4000);
      }
    },
    [config, dirty, t.imported, t.importError, t.jsonNeedSave]
  );

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
          <nav className="mb-4 flex gap-1.5 overflow-x-auto pb-1 lg:mb-0 lg:w-44 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
            {SUBNAV.map((item) => (
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
              </button>
            ))}
          </nav>

          <div id="config" aria-busy={busy} className={`min-w-0 flex-1 space-y-6 ${muted}`}>
          {/* Resumen del servidor */}
          {view === 'summary' && (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h2 className="flex items-center gap-2 font-bold text-white">
                  <Icon name="server" size={18} className="text-neon-blue" /> {t.serverInfoTitle}
                </h2>
                <Badge kind="free" dict={dict} />
              </div>
              {!hasGuildData ? (
                <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {hasBotGuild === false ? t.botNotInGuild : t.noGuildData}
                </div>
              ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/45">
                    {t.rolesListTitle} · {roles.length}
                  </p>
                  <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
                    {roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/75"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5' }}
                        />
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-white/45">
                    {t.channelsListTitle} · {channels.length}
                  </p>
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">📁 {cat.name}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {channels
                            .filter((c) => c.parentId === cat.id)
                            .map((c) => (
                              <span key={c.id} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                                {c.type === 2 || c.type === 13 ? '🔊' : c.type === 5 ? '📢' : '#'} {c.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-1.5">
                      {channels
                        .filter((c) => !c.parentId && c.type !== 4)
                        .map((c) => (
                          <span key={c.id} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">
                            {c.type === 2 || c.type === 13 ? '🔊' : c.type === 5 ? '📢' : '#'} {c.name}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              )}
            </section>
          )}

          {view === 'general' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="settings" size={18} className="text-neon-blue" /> {t.generalTitle}
              </h2>
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
                <select
                  className={inputCls}
                  value={config.lang ?? 'es'}
                  onChange={(e) => update({ lang: e.target.value })}
                >
                  <option value="es" className="bg-[#0a0a14]">{'Español'}</option>
                  <option value="en" className="bg-[#0a0a14]">English</option>
                </select>
              </Field>
            </div>
          </section>
          )}

          {view === 'features' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="sparkles" size={18} className="text-neon-blue" /> {t.featuresTitle}
              </h2>
              <Badge kind="free" dict={dict} />
            </div>
            <p className="mb-5 text-xs text-white/45">{t.featuresHint}</p>
            <div className="grid gap-3">
              {FEATURE_ROWS.map((f) => {
                const enabled = config.features?.[f.slug] !== false;
                return (
                  <div
                    key={f.slug}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${
                        enabled ? 'text-emerald-400' : 'text-white/30'
                      }`}
                    >
                      <Icon name={f.icon} size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
                        {t[f.labelKey]}
                        {f.premium && (
                          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-400">
                            {t.featPremiumTag}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/45">{t[f.descKey]}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={t[f.labelKey]}
                      onClick={() => update({ features: { ...(config.features ?? {}), [f.slug]: !enabled } })}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        enabled ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-white/15'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                          enabled ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
          )}

          {view === 'history' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="verified" size={18} className="text-neon-blue" /> {t.historyTitle}
              </h2>
            </div>
            <p className="mb-4 text-xs text-white/45">{t.historyHint}</p>
            {serverHistory === null && <p className="text-xs text-white/40">…</p>}
            {serverHistory !== null && serverHistory.length === 0 && (
              <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">{t.historyEmpty}</p>
            )}
            {serverHistory !== null && serverHistory.length > 0 && (
              <ul className="grid gap-2">
                {serverHistory.map((h) => (
                  <li
                    key={h.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs"
                  >
                    <span className="font-mono text-white/45">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-white/70">
                      {(h.detail?.fields ?? []).join(', ') || '—'}
                      {h.detail?.features && Object.keys(h.detail.features).length > 0
                        ? ` · ${Object.keys(h.detail.features).length} ${t.featuresLabel}`
                        : ''}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {t.actorLabel}: <code className="font-mono">{h.actorId ?? '—'}</code>
                    </span>
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
                  <PremiumTag label={t.featPremiumTag} betaNote={t.premiumFreeNote} />
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
                <PremiumTag label={t.featPremiumTag} betaNote={t.premiumFreeNote} />
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
              {hasGuildData ? (
                <SelectField
                  label={t.goodbyeChannelLabel}
                  value={config.goodbye_channel_id}
                  placeholder={t.pickChannel}
                  options={textChannelOptions}
                  onChange={(v) => update({ goodbye_channel_id: v })}
                />
              ) : (
                <Field label={t.goodbyeChannelLabel} hint={t.manualIdHint}>
                  <input
                    className={inputCls}
                    placeholder="ID"
                    value={config.goodbye_channel_id ?? ''}
                    onChange={(e) => update({ goodbye_channel_id: e.target.value || null })}
                  />
                </Field>
              )}
            </div>
            <div className="mt-5 grid gap-5">
              <DiscordMarkdownField
                label={t.welcomeMessageLabel}
                hint={t.varsHint}
                value={config.welcome_message ?? ''}
                onChange={(v) => update({ welcome_message: v })}
                labels={{
                  bold: t.mdBold,
                  italic: t.mdItalic,
                  underline: t.mdUnderline,
                  spoiler: t.mdSpoiler,
                  code: t.mdCode,
                  preview: t.mdPreview,
                  edit: t.mdEdit,
                  vars: t.mdVars,
                }}
              />
              <DiscordMarkdownField
                label={t.goodbyeMessageLabel}
                hint={t.varsHint}
                value={config.goodbye_message ?? ''}
                onChange={(v) => update({ goodbye_message: v })}
                labels={{
                  bold: t.mdBold,
                  italic: t.mdItalic,
                  underline: t.mdUnderline,
                  spoiler: t.mdSpoiler,
                  code: t.mdCode,
                  preview: t.mdPreview,
                  edit: t.mdEdit,
                  vars: t.mdVars,
                }}
              />
            </div>
            {hasGuildData ? (
              <div className="mt-4">
                <p className="mb-1 block text-sm font-semibold text-white/85">{t.autoroleLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {(config.autorole_ids ?? []).map((id) => {
                    const role = roles.find((r) => r.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-semibold text-white/85"
                      >
                        @{role?.name ?? id}
                        <button
                          type="button"
                          aria-label="Quitar"
                          onClick={() =>
                            update({
                              autorole_ids: (config.autorole_ids ?? []).filter((r) => r !== id),
                            })
                          }
                          className="text-white/40 transition hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  <select
                    className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/80 outline-none focus:border-neon-blue"
                    value=""
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id && !(config.autorole_ids ?? []).includes(id)) {
                        update({ autorole_ids: [...(config.autorole_ids ?? []), id] });
                      }
                    }}
                  >
                    <option value="" className="bg-[#0a0a14]">
                      + {t.pickRole}
                    </option>
                    {roles
                      .filter((r) => !(config.autorole_ids ?? []).includes(r.id))
                      .map((r) => (
                        <option key={r.id} value={r.id} className="bg-[#0a0a14]">
                          @{r.name}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-white/45">{t.autoroleHint}</p>
              </div>
            ) : (
              <div className="mt-4">
                <Field label={t.autoroleLabel} hint={t.manualIdHint}>
                  <input
                    className={inputCls}
                    placeholder="123456789, 987654321"
                    value={Array.isArray(config.autorole_ids) ? config.autorole_ids.join(', ') : ''}
                    onChange={(e) =>
                      update({
                        autorole_ids: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>
              </div>
            )}
          </section>
          )}

          {view === 'extras' && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="support" size={18} className="text-neon-blue" /> {t.extrasTitle}
              </h2>
              <Badge kind="premium" dict={dict} />
              <PermWarning
                perms={guildData?.botPermissions}
                bit={16}
                label={t.permManageChannels}
                missing={t.permMissing}
                href={`${INVITE_URL}&guild_id=${guildId}`}
              />
              <SectionJson
                disabled={dirty || busy}
                disabledHint={t.jsonNeedSave}
                exportLabel={t.jsonExport}
                importLabel={t.jsonImport}
                onExport={() => exportScope('extras')}
                onImport={(file) => void importFile(file, 'extras')}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.ticketsToggle}</p>
                  <p className="text-xs text-white/50">{t.ticketsToggleHint}</p>
                </div>
                <Toggle
                  on={Boolean(config.tickets_enabled)}
                  onChange={(v) => update({ tickets_enabled: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.privateToggle}</p>
                  <p className="text-xs text-white/50">{t.privateToggleHint}</p>
                </div>
                <Toggle
                  on={Boolean(config.private_channels)}
                  onChange={(v) => update({ private_channels: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/90">{t.automodToggle}</p>
                  <p className="text-xs text-white/50">{t.automodToggleHint}</p>
                </div>
                <Toggle
                  on={Boolean(config.automod_enabled)}
                  onChange={(v) => update({ automod_enabled: v })}
                />
              </div>
              <div className="grid gap-5">
                {hasGuildData ? (
                  <SelectField
                    label={t.ticketCategoryLabel}
                    value={config.tickets_category_id}
                    placeholder={t.pickCategory}
                    options={categoryOptions}
                    onChange={(v) => update({ tickets_category_id: v })}
                  />
                ) : (
                  <Field label={t.ticketCategoryLabel} hint={t.manualIdHint}>
                    <input
                      className={inputCls}
                      placeholder="ID"
                      value={config.tickets_category_id ?? ''}
                      onChange={(e) => update({ tickets_category_id: e.target.value || null })}
                    />
                  </Field>
                )}
                {hasGuildData ? (
                  <SelectField
                    label={t.ticketRoleLabel}
                    value={config.tickets_role_id}
                    placeholder={t.pickRole}
                    options={roleOptions}
                    onChange={(v) => update({ tickets_role_id: v })}
                  />
                ) : (
                  <Field label={t.ticketRoleLabel} hint={t.manualIdHint}>
                    <input
                      className={inputCls}
                      placeholder="ID"
                      value={config.tickets_role_id ?? ''}
                      onChange={(e) => update({ tickets_role_id: e.target.value || null })}
                    />
                  </Field>
                )}
                {hasGuildData ? (
                  <SelectField
                    label={t.privateCategoryLabel}
                    value={config.private_category_id}
                    placeholder={t.pickCategory}
                    options={categoryOptions}
                    onChange={(v) => update({ private_category_id: v })}
                  />
                ) : (
                  <Field label={t.privateCategoryLabel} hint={t.manualIdHint}>
                    <input
                      className={inputCls}
                      placeholder="ID"
                      value={config.private_category_id ?? ''}
                      onChange={(e) => update({ private_category_id: e.target.value || null })}
                    />
                  </Field>
                )}
                {hasGuildData ? (
                  <SelectField
                    label={t.musicChannelLabel}
                    hint={t.musicChannelHint}
                    value={config.music_channel_id}
                    placeholder={t.pickVoice}
                    options={[...voiceChannelOptions, ...textChannelOptions]}
                    onChange={(v) => update({ music_channel_id: v })}
                  />
                ) : (
                  <Field label={t.musicChannelLabel} hint={t.musicChannelHint}>
                    <input
                      className={inputCls}
                      placeholder="ID"
                      value={config.music_channel_id ?? ''}
                      onChange={(e) => update({ music_channel_id: e.target.value || null })}
                    />
                  </Field>
                )}
                {hasGuildData ? (
                  <SelectField
                    label={t.muteRoleLabel}
                    value={config.mute_role_id}
                    placeholder={t.pickRole}
                    options={roleOptions}
                    onChange={(v) => update({ mute_role_id: v })}
                  />
                ) : (
                  <Field label={t.muteRoleLabel} hint={t.manualIdHint}>
                    <input
                      className={inputCls}
                      placeholder="ID"
                      value={config.mute_role_id ?? ''}
                      onChange={(e) => update({ mute_role_id: e.target.value || null })}
                    />
                  </Field>
                )}
              </div>
              {hasGuildData ? (
                <SelectField
                  label={t.logsChannelLabel}
                  value={config.logs_channel_id}
                  placeholder={t.pickChannel}
                  options={textChannelOptions}
                  onChange={(v) => update({ logs_channel_id: v })}
                />
              ) : (
                <Field label={t.logsChannelLabel} hint={t.manualIdHint}>
                  <input
                    className={inputCls}
                    placeholder="ID"
                    value={config.logs_channel_id ?? ''}
                    onChange={(e) => update({ logs_channel_id: e.target.value || null })}
                  />
                </Field>
              )}
            </div>
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
