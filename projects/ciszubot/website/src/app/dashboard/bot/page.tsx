'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Icon, LANGUAGE_OPTIONS, Modal, useToast } from '@ciszu/ui';
import { useClientI18n } from '@/hooks/useClientI18n';
import { usePageTitle } from '@/lib/usePageTitle';
import InviteLink from '@/components/dashboard/InviteLink';
import { INVITE_URL } from '@/lib/i18n';
import { updatePreferences, loadPreferences, savePreferences, syncPreferencesToProfile } from '@/lib/preferences';
import { GuildPicker, NiceSelect, MultiSelect } from '@/components/dashboard/fields';
import { BOT_ID } from '@/lib/botStatus';

interface SaveEntry {
  ts: number;
  guildId: string;
  guildName: string;
  fields: string[];
  features?: Record<string, boolean>;
}

interface HistoryEntry {
  id: number;
  createdAt: string;
  target: string | null;
  guildName?: string | null;
  actorId: string | null;
  detail: { fields?: string[]; features?: Record<string, boolean> } | null;
}

/**
 * Preferencias globales del bot (vinculadas a la cuenta, no a un servidor):
 * plan/beta, idioma, tema, cuenta, invitación e historial de guardados y de
 * cambios (auditoría). Vive bajo "Overview" en el sidebar del dashboard.
 */
export default function BotPreferencesPage() {
  usePageTitle('BOT PREFS');
  const { lang, dict } = useClientI18n();
  const t = dict.botPrefs;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [beta, setBeta] = useState<boolean | null>(null);
  const [langModal, setLangModal] = useState(false);
  const [saves, setSaves] = useState<SaveEntry[]>([]);
  const [savesTotal, setSavesTotal] = useState(0);
  const [savesSession, setSavesSession] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [me, setMe] = useState<{ id: string; name: string | null; username?: string | null; avatar: string | null } | null>(null);
  const [dark, setDark] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [prefsQuery, setPrefsQuery] = useState('');
  const [jsonHistory, setJsonHistory] = useState<{ ts: number; guildName: string; kind: string; name: string }[]>([]);
  // Roles por servidor (owner/admin/mod/bots/mute) desde las preferencias del bot.
  const [roleGuilds, setRoleGuilds] = useState<{ id: string; name: string; icon: string | null }[]>([]);
  const [roleGuildId, setRoleGuildId] = useState<string | null>(null);
  const [roleList, setRoleList] = useState<{ id: string; name: string }[]>([]);
  const [roleCfg, setRoleCfg] = useState<{
    owner_role_ids: string[];
    admin_role_ids: string[];
    mod_role_ids: string[];
    bot_role_ids: string[];
    mute_role_id: string | null;
    nsfw_bot_preferences_enabled: boolean;
  }>({
    owner_role_ids: [],
    admin_role_ids: [],
    mod_role_ids: [],
    bot_role_ids: [],
    mute_role_id: null,
    nsfw_bot_preferences_enabled: false,
  });
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      fetch(`${url}/rest/v1/feature_flags?feature=eq.premium_beta&select=enabled`, {
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Accept-Profile': 'ciszubot' },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((rows) => setBeta(Array.isArray(rows) && rows[0] ? Boolean(rows[0].enabled) : true))
        .catch(() => setBeta(true));
    }
    try {
      setSaves(JSON.parse(localStorage.getItem('cz-dash-saves') ?? '[]') as SaveEntry[]);
      setSavesTotal(Number(localStorage.getItem('cz-dash-saves-total') ?? '0'));
      setSavesSession(Number(sessionStorage.getItem('cz-dash-saves-session') ?? '0'));
    } catch {
      /* sin storage */
    }
    setDark(document.documentElement.classList.contains('dark'));
    setAutoSave(localStorage.getItem('cz-dash-autosave') === '1');
    try {
      setJsonHistory(JSON.parse(localStorage.getItem('cz-dash-json-history') ?? '[]'));
    } catch {
      /* sin storage */
    }
    fetch('/api/auth/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setMe(j?.session ?? null))
      .catch(() => null);
    fetch('/api/dashboard/history')
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((j) => setHistory((j.entries ?? []) as HistoryEntry[]))
      .catch(() => setHistory([]));
  }, []);

  // Roles por servidor: carga la lista de servidores del bot al montar.
  useEffect(() => {
    fetch('/api/dashboard/bot-guilds', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { guilds: [] }))
      .then((j) => setRoleGuilds((j.guilds ?? []) as { id: string; name: string; icon: string | null }[]))
      .catch(() => setRoleGuilds([]));
  }, []);

  // Al elegir servidor: roles reales + config actual.
  useEffect(() => {
    if (!roleGuildId) return;
    let active = true;
    setRoleLoading(true);
    Promise.all([
      fetch(`/api/dashboard/${roleGuildId}/roles`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { roles: [] })),
      fetch(`/api/dashboard/${roleGuildId}`, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : { config: null })),
    ])
      .then(([rolesJson, cfgJson]) => {
        if (!active) return;
        setRoleList((rolesJson.roles ?? []) as { id: string; name: string }[]);
        const cfg = (cfgJson.config ?? {}) as Record<string, unknown>;
        setRoleCfg({
          owner_role_ids: Array.isArray(cfg.owner_role_ids) ? (cfg.owner_role_ids as string[]) : [],
          admin_role_ids: Array.isArray(cfg.admin_role_ids) ? (cfg.admin_role_ids as string[]) : [],
          mod_role_ids: Array.isArray(cfg.mod_role_ids) ? (cfg.mod_role_ids as string[]) : [],
          bot_role_ids: Array.isArray(cfg.bot_role_ids) ? (cfg.bot_role_ids as string[]) : [],
          mute_role_id: typeof cfg.mute_role_id === 'string' ? cfg.mute_role_id : null,
          nsfw_bot_preferences_enabled: Boolean(cfg.nsfw_bot_preferences_enabled),
        });
      })
      .catch(() => {
        if (active) setRoleList([]);
      })
      .finally(() => {
        if (active) setRoleLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roleGuildId]);

  const saveRoles = useCallback(async () => {
    if (!roleGuildId || roleSaving) return;
    setRoleSaving(true);
    try {
      const res = await fetch(`/api/dashboard/${roleGuildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleCfg),
      });
      if (res.ok) {
        void queryClient.invalidateQueries({ queryKey: ['guild-config', roleGuildId] });
        toast(t.rolesSaved ?? 'Roles guardados', 'success');
      }
      else toast(t.rolesSaveError ?? 'No se pudieron guardar los roles', 'error');
    } catch {
      toast(t.rolesSaveError ?? 'No se pudieron guardar los roles', 'error');
    } finally {
      setRoleSaving(false);
    }
  }, [roleGuildId, roleCfg, roleSaving, toast, t, queryClient]);

  // Buscador de secciones (filtra por el título de cada tarjeta).
  useEffect(() => {
    const root = document.getElementById('bot-prefs-root');
    if (!root) return;
    const q = prefsQuery.trim().toLowerCase();
    root.querySelectorAll('section').forEach((sec) => {
      const title = sec.querySelector('h2')?.textContent?.toLowerCase() ?? '';
      (sec as HTMLElement).style.display = !q || title.includes(q) ? '' : 'none';
    });
  }, [prefsQuery]);

  const setLang = useCallback(    (code: string) => {
      document.cookie = `ciszubot_lang=${code}; path=/; max-age=31536000`;
      // Persistir también en las preferencias (localStorage) y en la cuenta
      // (ciszubot.profiles) para que no se pierda al cambiar de página/equipo.
      try {
        const prefs = { ...loadPreferences(), lang: code as Parameters<typeof savePreferences>[0]['lang'] };
        savePreferences(prefs);
        if (me?.id) void syncPreferencesToProfile(me.id, prefs);
      } catch {
        /* sin storage/sesión */
      }
      toast(t.langSaved, 'success');
      window.setTimeout(() => window.location.reload(), 350);
    },
    [toast, t.langSaved, me]
  );

  const toggleTheme = useCallback(() => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    setDark(next === 'dark');
    updatePreferences({ theme: next });
    toast(next === 'dark' ? t.themeDark : t.themeLight, 'info');
  }, [dark, toast, t.themeDark, t.themeLight]);

  const copyBotId = useCallback(() => {
    void navigator.clipboard.writeText(BOT_ID).then(() => toast(t.copied, 'success'));
  }, [toast, t.copied]);

  const fmt = useCallback(
    (iso: string | number) =>
      new Date(iso).toLocaleString(lang === 'en-us' || lang === 'en-uk' ? 'en-US' : 'es-VE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [lang]
  );

  return (
    <div id="bot-prefs-root" className="space-y-6 pb-16">
      <label className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5">
        <Icon name="search" size={14} className="shrink-0 text-white/35" />
        <input
          value={prefsQuery}
          onChange={(e) => setPrefsQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
        />
      </label>
      {/* Plan */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="crown" size={18} className="text-neon-blue" /> {t.planTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            <Icon name="gift" size={11} className="shrink-0" />
            {t.planFree}
          </span>
          {beta !== false && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-neon-pink/50 bg-neon-pink/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neon-pink">
              <Icon name="clock" size={11} className="shrink-0" />
              {t.planBeta}
            </span>
          )}
          <p className="min-w-0 flex-1 text-xs text-white/60">{t.planBetaNote}</p>
        </div>
        <p className="mt-3 text-xs text-white/50">{t.planFreeNote}</p>
        <Link
          href="/premium"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
        >
          <Icon name="crown" size={15} />
          {t.planBuyCta}
        </Link>
      </section>

      {/* Preferencias (idioma + tema) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="palette" size={18} className="text-neon-blue" /> {t.prefsTitle}
          </h2>
        </div>
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-white/40">{t.langLabel}</p>
        {/* Un solo botón → modal con TODOS los idiomas (4 activos + bloqueados
            atenuados). Evita la fila de botones que se rompe al crecer la lista. */}
        {(() => {
          const current = LANGUAGE_OPTIONS.find((o) => o.code === lang) ?? LANGUAGE_OPTIONS[0];
          return (
            <button
              type="button"
              onClick={() => setLangModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white/80 transition hover:border-neon-blue/60 hover:text-white"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full [&>svg]:h-full [&>svg]:w-full">
                {current.flag}
              </span>
              {current.label}
              <Icon name="chevronRight" size={13} className="shrink-0 text-white/40" />
            </button>
          );
        })()}
        <Modal
          open={langModal}
          onOpenChange={setLangModal}
          title={t.langModalTitle}
          description={t.langModalDesc}
          size="lg"
        >
          <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-auto pr-1 sm:grid-cols-2">
            {LANGUAGE_OPTIONS.map((o) => (
              <button
                key={o.code}
                type="button"
                disabled={!o.available}
                onClick={() => {
                  if (!o.available) return;
                  setLang(o.code);
                  setLangModal(false);
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition ${
                  o.available
                    ? lang === o.code
                      ? 'border-neon-blue/60 bg-neon-blue/10 text-white'
                      : 'border-white/10 bg-black/20 text-white/60 hover:border-white/25 hover:text-white'
                    : 'cursor-not-allowed border-white/5 bg-black/10 text-white/25'
                }`}
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full [&>svg]:h-full [&>svg]:w-full">
                  {o.flag}
                </span>
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {!o.available && (
                  <span className="shrink-0 rounded-full border border-white/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/35">
                    {t.langSoon}
                  </span>
                )}
                {o.available && lang === o.code && (
                  <Icon name="verified" size={12} className="shrink-0 text-neon-blue" />
                )}
              </button>
            ))}
          </div>
        </Modal>
        <p className="mb-3 mt-5 text-[10px] font-black uppercase tracking-widest text-white/40">{t.themeLabel}</p>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-neon-blue/60 hover:text-white"
        >
          <Icon name="palette" size={14} className="text-neon-blue" />
          {dark ? t.themeDark : t.themeLight}
        </button>
        <p className="mb-3 mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40">
          <Icon name="history" size={12} className="text-neon-blue" />
          {t.autoSaveLabel}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={autoSave}
          onClick={() => {
            const next = !autoSave;
            setAutoSave(next);
            try {
              localStorage.setItem('cz-dash-autosave', next ? '1' : '0');
            } catch {
              /* sin storage */
            }
            toast(t.autoSaveHint, 'info');
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-neon-blue/60 hover:text-white"
        >
          <span
            className={`relative h-4 w-7 shrink-0 rounded-full transition ${
              autoSave ? 'bg-gradient-to-r from-neon-blue to-neon-pink' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                autoSave ? 'left-3.5' : 'left-0.5'
              }`}
            />
          </span>
          {autoSave ? 'ON' : 'OFF'}
        </button>
      </section>

      {/* Preferencias del bot (por servidor) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="settings" size={18} className="text-neon-blue" /> {t.botPrefsTitle}
          </h2>
        </div>
        <p className="mb-4 text-xs text-white/45">{t.botPrefsHint}</p>
        <GuildPicker
          guilds={roleGuilds}
          value={roleGuildId}
          placeholder={t.rolesGuildPick}
          onChange={(v) => setRoleGuildId(v)}
        />
        {roleGuildId && !roleLoading && (
          <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <Icon name="triangle-exclamation" size={14} className="text-red-400" />
                  {t.nsfwBotGateTitle}
                </p>
                <p className="mt-1 text-[10px] text-white/45">{t.nsfwBotGateHint}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setRoleCfg({ ...roleCfg, nsfw_bot_preferences_enabled: !roleCfg.nsfw_bot_preferences_enabled })
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-header text-[10px] font-black uppercase tracking-widest transition active:scale-95 ${
                  roleCfg.nsfw_bot_preferences_enabled
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                    : 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/15'
                }`}
              >
                <Icon name={roleCfg.nsfw_bot_preferences_enabled ? 'check' : 'triangle-exclamation'} size={12} />
                {roleCfg.nsfw_bot_preferences_enabled ? t.nsfwBotGateOn : t.nsfwBotGateOff}
              </button>
            </div>
            {!roleCfg.nsfw_bot_preferences_enabled && (
              <p className="mt-2 text-[10px] text-white/35">{t.nsfwBotGateWarning}</p>
            )}
            <button
              type="button"
              onClick={() => void saveRoles()}
              disabled={roleSaving}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Icon name="check" size={13} /> {t.rolesSave}
            </button>
          </div>
        )}
      </section>

      {/* Roles por servidor (owner/admin/mod/bots/mute) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="shield" size={18} className="text-neon-blue" /> {t.rolesSectionTitle}
          </h2>
        </div>
        <p className="mb-4 text-xs text-white/45">{t.rolesSectionHint}</p>
        <GuildPicker
          guilds={roleGuilds}
          value={roleGuildId}
          placeholder={t.rolesGuildPick}
          onChange={(v) => setRoleGuildId(v)}
        />
        {roleLoading && <p className="mt-3 text-xs text-white/40">{t.rolesLoading}</p>}
        {roleGuildId && !roleLoading && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                ['owner_role_ids', 'Owner'],
                ['admin_role_ids', 'Admin'],
                ['mod_role_ids', 'Mod'],
                ['bot_role_ids', 'Bots'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/45">{label}</p>
                <MultiSelect
                  values={roleCfg[key]}
                  options={roleList.map((r) => ({ id: r.id, label: `@${r.name}` }))}
                  placeholder="—"
                  onChange={(v) => setRoleCfg({ ...roleCfg, [key]: v })}
                />
              </div>
            ))}
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-white/45">Mute</p>
              <NiceSelect
                value={roleCfg.mute_role_id}
                options={roleList.map((r) => ({ id: r.id, label: `@${r.name}` }))}
                placeholder="—"
                onChange={(v) => setRoleCfg({ ...roleCfg, mute_role_id: v })}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => void saveRoles()}
                disabled={roleSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Icon name="shield" size={13} /> {t.rolesSave}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Cuenta */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="person" size={18} className="text-neon-blue" /> {t.accountTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
          {me?.avatar ? (
            <img src={me.avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full border border-white/15" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-sm font-black text-white">
              {(me?.name ?? 'C').charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">
              {me?.name ?? t.accountTitle}
              {me?.username && <span className="ml-2 font-mono text-[11px] font-normal text-white/45">@{me.username}</span>}
            </p>
            <p className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/45">
              <Icon name="discord" size={11} className="[&>g]:fill-current" />
              {me?.id ?? '—'}
            </p>
          </div>
          <a
            href="/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white/70 transition hover:border-neon-blue/60 hover:text-white"
          >
            <Icon name="settings" size={13} />
            {t.settingsCta}
          </a>
          <a
            href="/api/auth/logout"
            className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400/10"
          >
            <Icon name="logout" size={13} />
            {t.logoutCta}
          </a>
        </div>
      </section>

      {/* Invitación */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="discord" size={18} className="text-neon-blue [&>g]:fill-current" /> {t.inviteTitle}
          </h2>
        </div>
        <p className="mb-4 text-xs text-white/45">{t.inviteDesc}</p>
        <div className="flex flex-wrap items-center gap-3">
          <InviteLink
            href={INVITE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink px-5 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            <Icon name="discord" size={15} className="[&>g]:fill-current" />
            {t.inviteCta}
          </InviteLink>
          <button
            type="button"
            onClick={copyBotId}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-neon-blue/60 hover:text-white"
          >
            <Icon name="copy" size={13} />
            {t.botIdLabel}: <code className="font-mono text-neon-blue">{BOT_ID}</code>
          </button>
        </div>
      </section>

      {/* Historial de guardados */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="history" size={18} className="text-neon-blue" /> {t.savesTitle}
          </h2>
          <span className="ml-auto rounded-full border border-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/50">
            {t.savesTotal}: {savesTotal} · {t.savesSession}: {savesSession}
          </span>
        </div>
        {saves.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">{t.savesEmpty}</p>
        ) : (
          <ul className="grid gap-2">
            {saves.map((s) => (
              <li
                key={`${s.ts}-${s.guildId}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs"
              >
                <span className="font-mono text-white/45">{fmt(s.ts)}</span>
                <span className="min-w-0 flex-1 truncate font-bold text-white/80">{s.guildName}</span>
                <span className="text-[10px] text-white/40">
                  {(s.features ? Object.keys(s.features).length : 0) + (s.fields?.length ?? 0)} {t.fieldsLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Historial de JSON importados/exportados */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="json" size={18} className="text-neon-blue" /> {t.jsonHistoryTitle}
          </h2>
        </div>
        {jsonHistory.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">{t.jsonHistoryEmpty}</p>
        ) : (
          <ul className="grid gap-2">
            {jsonHistory.map((j, i) => (
              <li
                key={`${j.ts}-${i}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs"
              >
                <span className="font-mono text-white/45">{fmt(j.ts)}</span>
                <span className="min-w-0 flex-1 truncate text-white/70">{j.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{j.guildName}</span>
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/50">
                  {j.kind}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Historial de cambios (cuenta) */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="verified" size={18} className="text-neon-blue" /> {t.historyTitle}
          </h2>
        </div>
        <p className="mb-4 text-xs text-white/45">{t.historyHint}</p>
        {history === null && <p className="text-xs text-white/40">…</p>}
        {history !== null && history.length === 0 && (
          <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">{t.historyEmpty}</p>
        )}
        {history !== null && history.length > 0 && (
          <ul className="grid gap-2">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs"
              >
                <span className="font-mono text-white/45">{fmt(h.createdAt)}</span>
                <span className="min-w-0 flex-1 truncate font-bold text-white/80">
                  {h.guildName ?? h.target ?? '—'}
                </span>
                <span className="text-[10px] text-white/40">
                  {t.actorLabel}: <code className="font-mono">{h.actorId ?? '—'}</code>
                </span>
                <span className="text-[10px] text-white/40">
                  {t.fieldsLabel}: {h.detail?.fields?.length ?? 0}
                  {h.detail?.features && Object.keys(h.detail.features).length > 0
                    ? ` · ${t.featuresLabel}: ${Object.keys(h.detail.features).length}`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
