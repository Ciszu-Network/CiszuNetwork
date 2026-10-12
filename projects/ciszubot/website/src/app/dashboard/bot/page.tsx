'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon, LANGUAGE_OPTIONS, useToast } from '@ciszu/ui';
import { useClientI18n } from '@/hooks/useClientI18n';
import { usePageTitle } from '@/lib/usePageTitle';
import InviteLink from '@/components/dashboard/InviteLink';
import { INVITE_URL } from '@/lib/i18n';
import { updatePreferences } from '@/lib/preferences';
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
  const [beta, setBeta] = useState<boolean | null>(null);
  const [saves, setSaves] = useState<SaveEntry[]>([]);
  const [savesTotal, setSavesTotal] = useState(0);
  const [savesSession, setSavesSession] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [me, setMe] = useState<{ id: string; name: string | null; username?: string | null; avatar: string | null } | null>(null);
  const [dark, setDark] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [jsonHistory, setJsonHistory] = useState<{ ts: number; guildName: string; kind: string; name: string }[]>([]);

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

  const setLang = useCallback(
    (code: string) => {
      document.cookie = `ciszubot_lang=${code}; path=/; max-age=31536000`;
      toast(t.langSaved, 'success');
      window.setTimeout(() => window.location.reload(), 350);
    },
    [toast, t.langSaved]
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
    <div className="space-y-6 pb-16">
      {/* Plan */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-bold text-white">
            <Icon name="crown" size={18} className="text-neon-blue" /> {t.planTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-4">
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {t.planFree}
          </span>
          {beta !== false && (
            <span className="rounded-full border border-neon-pink/50 bg-neon-pink/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neon-pink">
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
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.filter((o) => o.available).map((o) => (
            <button
              key={o.code}
              type="button"
              onClick={() => setLang(o.code)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                lang === o.code
                  ? 'border-neon-blue/60 bg-neon-blue/10 text-white'
                  : 'border-white/10 bg-black/20 text-white/60 hover:border-white/25 hover:text-white'
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full [&>svg]:h-full [&>svg]:w-full">
                {o.flag}
              </span>
              {o.label}
            </button>
          ))}
        </div>
        <p className="mb-3 mt-5 text-[10px] font-black uppercase tracking-widest text-white/40">{t.themeLabel}</p>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-neon-blue/60 hover:text-white"
        >
          <Icon name="palette" size={14} className="text-neon-blue" />
          {dark ? t.themeDark : t.themeLight}
        </button>
        <p className="mb-3 mt-5 text-[10px] font-black uppercase tracking-widest text-white/40">{t.autoSaveLabel}</p>
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
