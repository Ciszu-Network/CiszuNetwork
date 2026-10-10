'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@ciszu/ui';
import { getDict, readCookieLang, type Dict } from '@/lib/i18n';
import type { GuildInfo } from '@/lib/discordGuild';
import { SaveDock, type SaveStatus } from '@/components/dashboard/SaveDock';

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
}

type SectionKey = 'general' | 'levels' | 'welcome' | 'extras';

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

interface Props {
  guildId: string;
  guildName: string;
  guildIcon: string | null;
  username: string | null;
  guildInfo: GuildInfo | null;
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
      <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
        {dict.guildPage.free}
      </span>
    );
  }
  return (
    <span className="rounded-full border border-neon-pink/50 bg-neon-pink/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-neon-pink">
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

export default function DashboardGuildClient({ guildId, guildName, guildIcon, username, guildInfo }: Props) {
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

  useEffect(() => {
    setAutoSave(localStorage.getItem('cz-dash-autosave') !== '0');
  }, []);

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
      const json = (await res.json()) as { config?: GuildConfig | null };
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

  const dirty = useMemo(
    () => Boolean(config) && JSON.stringify(config) !== baseline,
    [config, baseline]
  );
  const busy = status === 'saving';

  const update = useCallback(
    (patch: Partial<GuildConfig>) => {
      setConfig((prev) => {
        if (!prev || status === 'saving') return prev;
        setHistory((h) => [...h.slice(-99), prev]);
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
      if (!res.ok) throw new Error('save_failed');
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
      if (okTimer.current) clearTimeout(okTimer.current);
      okTimer.current = setTimeout(() => setStatus('idle'), 1200);
    },
    onError: () => {
      setStatus('error');
      setError(t.saveError);
    },
  });

  useEffect(() => {
    if (!autoSave || !dirty || busy || !config) return;
    const id = setTimeout(() => {
      if (!saveMutation.isPending) saveMutation.mutate(config);
    }, 2000);
    return () => clearTimeout(id);
  }, [autoSave, dirty, busy, config, saveMutation]);

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
      const data =
        scope === 'all'
          ? config
          : (Object.fromEntries(SECTION_KEYS[scope].map((k) => [k, config[k]])) as Partial<GuildConfig>);
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
      setFlash(t.backupNote);
      setTimeout(() => setFlash(null), 3500);
    },
    [config, guildId, guildName, slug, username, t.backupNote]
  );

  const importFile = useCallback(
    async (file: File) => {
      if (!config) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as { config?: Partial<GuildConfig> } | Partial<GuildConfig>;
        const raw =
          parsed && typeof parsed === 'object' && 'config' in parsed && parsed.config
            ? parsed.config
            : (parsed as Partial<GuildConfig>);
        const clean: Partial<GuildConfig> = {};
        for (const key of Object.keys(raw)) {
          if ((ALL_KEYS as string[]).includes(key)) {
            clean[key as keyof GuildConfig] = raw[key as keyof GuildConfig] as never;
          }
        }
        if (Object.keys(clean).length === 0) throw new Error('empty');
        setHistory((h) => [...h.slice(-99), config]);
        setFuture([]);
        setConfig({ ...config, ...clean });
        setStatus('idle');
        setError(null);
        setFlash(t.imported);
        setTimeout(() => setFlash(null), 4000);
      } catch {
        setStatus('error');
        setError(t.importError);
      }
    },
    [config, t.imported, t.importError]
  );

  const hue = useMemo(() => {
    const n = parseInt(guildId.slice(-6), 10);
    return Number.isFinite(n) ? n % 360 : 210;
  }, [guildId]);

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
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-neon-blue"
        >
          <Icon name="arrow-right" size={14} className="rotate-180" /> {t.back}
        </Link>

        {/* Hero del servidor */}
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
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
              <p className={`text-lg font-bold ${guildData ? 'text-emerald-400' : 'text-red-400'}`}>
                {guildData ? t.botOnline : t.botOffline}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-white/35">{t.refreshHint}</p>
          {flash && <p className="mt-2 text-xs font-semibold text-emerald-400">{flash}</p>}
          {error && status !== 'error' && <p className="mt-2 text-xs font-semibold text-red-400">{error}</p>}
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/50">
            {t.betaNote}
          </div>
        </div>

        <div aria-busy={busy} className={`mt-8 space-y-6 ${muted}`}>
          {/* General */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="settings" size={18} className="text-neon-blue" /> {t.generalTitle}
              </h2>
              <Badge kind="free" dict={dict} />
              <button
                type="button"
                onClick={() => exportScope('general')}
                title={t.exportSection}
                className="ml-auto text-xs font-semibold text-white/40 transition hover:text-neon-blue"
              >
                ⬇ JSON
              </button>
            </div>
            <p className="mb-4 text-xs text-white/45">{t.generalHint}</p>
            <div className="grid gap-4 sm:grid-cols-2">
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
                  <option value="es" className="bg-[#0a0a14]">Español</option>
                  <option value="en" className="bg-[#0a0a14]">English</option>
                </select>
              </Field>
            </div>
          </section>

          {/* Niveles */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="star" size={18} className="text-neon-pink" /> {t.levelsTitle}
              </h2>
              <Badge kind="free" dict={dict} />
              <button
                type="button"
                onClick={() => exportScope('levels')}
                title={t.exportSection}
                className="ml-auto text-xs font-semibold text-white/40 transition hover:text-neon-blue"
              >
                ⬇ JSON
              </button>
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
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
          </section>

          {/* Bienvenidas */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="heart" size={18} className="text-neon-pink" /> {t.welcomeTitle}
              </h2>
              <Badge kind="free" dict={dict} />
              <button
                type="button"
                onClick={() => exportScope('welcome')}
                title={t.exportSection}
                className="ml-auto text-xs font-semibold text-white/40 transition hover:text-neon-blue"
              >
                ⬇ JSON
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t.welcomeMessageLabel} hint={t.varsHint}>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={config.welcome_message ?? ''}
                  onChange={(e) => update({ welcome_message: e.target.value })}
                />
              </Field>
              <Field label={t.goodbyeMessageLabel} hint={t.varsHint}>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={config.goodbye_message ?? ''}
                  onChange={(e) => update({ goodbye_message: e.target.value })}
                />
              </Field>
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

          {/* Tickets y extras */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Icon name="support" size={18} className="text-neon-blue" /> {t.extrasTitle}
              </h2>
              <Badge kind="premium" dict={dict} />
              <button
                type="button"
                onClick={() => exportScope('extras')}
                title={t.exportSection}
                className="ml-auto text-xs font-semibold text-white/40 transition hover:text-neon-blue"
              >
                ⬇ JSON
              </button>
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
              <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </div>

      <SaveDock
        dirty={dirty}
        status={status}
        busy={busy}
        autoSave={autoSave}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onAutoSave={setAutoSavePref}
        onUndo={undo}
        onRedo={redo}
        onSave={() => config && saveMutation.mutate(config)}
        onExport={() => exportScope('all')}
        onImport={(file) => void importFile(file)}
        labels={{
          save: t.save,
          saving: t.saving,
          saved: t.saved,
          saveError: t.saveError,
          autoSaveLabel: t.autoSaveLabel,
          autoSaveHint: t.autoSaveHint,
          undo: t.undo,
          redo: t.redo,
          exportJson: t.exportJson,
          importJson: t.importJson,
          unsaved: t.unsaved,
          allSaved: t.allSaved,
          backupNote: t.backupNote,
        }}
      />
    </div>
  );
}
