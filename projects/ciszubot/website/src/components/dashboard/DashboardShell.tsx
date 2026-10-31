'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Icon, LanguagesModal, LANGUAGE_OPTIONS, isLangAvailable, LANG_BLOCKED_MESSAGE, useToast } from '@ciszu/ui';
import { updatePreferences } from '@/lib/preferences';
import InviteLink from './InviteLink';
import QuickDocks from '@/components/molecules/QuickDocks';
import { dashboardGuard } from '@/lib/dashboardGuard';

export interface ShellGuild {
  id: string;
  name: string;
  icon: string | null;
  invited?: boolean | null;
}

export interface ShellMe {
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

interface Props {
  guilds: ShellGuild[];
  lang: 'es' | 'en';
  inviteUrl: string;
  me: ShellMe | null;
  /** Secciones pre-QuickDocks (fuera de la zona de configuración, ancho completo). */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const L: Record<'es' | 'en', Record<string, string>> = {
  es: {
    overview: 'Resumen',
    servers: 'Servidores',
    global: 'Global (sin servidor)',
    select: 'Cambiar de servidor',
    noServers: 'No administras ningún servidor con CiszuBot todavía.',
    invite: 'Invitar a mi servidor',
    menu: 'Servidores',
    account: 'Cuenta',
    profile: 'Perfil y configuración',
    settings: 'Ajustes de cuenta',
    language: 'Idioma',
    theme: 'Tema',
    dark: 'Oscuro',
    light: 'Claro',
    shortcuts: 'Atajos',
    faq: 'Preguntas frecuentes',
    help: 'Centro de ayuda',
    support: 'Soporte',
    inviteBtn: 'Invitar',
    configure: 'Configurar',
    notInvited: 'No invitado',
    notInvitedMsg: 'Invita a CiszuBot a este servidor para poder configurarlo.',
    collapse: 'Ocultar panel',
    expand: 'Mostrar panel',
    panel: 'Panel',
    configuringIn: 'Configurando',
    changeServer: 'Cambiar servidor',
    accountHint: 'Gestiona tu cuenta',
    signOut: 'Cerrar sesión',
    botPrefs: 'Preferencias del bot',
    changelog: 'Novedades',
    stats: 'Estadísticas',
    news: 'Redes y noticias',
    verify: 'Sin verificar',
    searchPlaceholder: 'Buscar…',
    filterAll: 'Todos',
    filterInvited: 'Invitados',
    filterUnverified: 'Sin verificar',
    sortAsc: 'A-Z',
    sortDesc: 'Z-A',
    noResults: 'Sin resultados.',
  },
  en: {
    overview: 'Overview',
    servers: 'Servers',
    global: 'Global (no server)',
    select: 'Switch server',
    noServers: 'You do not manage any server with CiszuBot yet.',
    invite: 'Invite to my server',
    menu: 'Servers',
    account: 'Account',
    profile: 'Profile & settings',
    settings: 'Account settings',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    shortcuts: 'Shortcuts',
    faq: 'FAQ',
    help: 'Help center',
    support: 'Support',
    inviteBtn: 'Invite',
    configure: 'Configure',
    notInvited: 'Not invited',
    notInvitedMsg: 'Invite CiszuBot to this server before configuring it.',
    collapse: 'Hide panel',
    expand: 'Show panel',
    panel: 'Panel',
    configuringIn: 'Configuring',
    changeServer: 'Switch server',
    accountHint: 'Manage your account',
    signOut: 'Sign out',
    botPrefs: 'Bot preferences',
    changelog: 'Changelog',
    stats: 'Statistics',
    news: 'Social & news',
    verify: 'Unverified',
    searchPlaceholder: 'Search…',
    filterAll: 'All',
    filterInvited: 'Invited',
    filterUnverified: 'Unverified',
    sortAsc: 'A-Z',
    sortDesc: 'Z-A',
    noResults: 'No results.',
  },
};

/** Gradientes únicos por opción (hover + seleccionado). */
const ACCENTS: { hover: string; active: string; icon: string }[] = [
  { hover: 'hover:border-neon-blue/60 hover:bg-neon-blue/10', active: 'border-neon-blue/50 bg-gradient-to-r from-neon-blue/20 to-transparent', icon: 'text-neon-blue' },
  { hover: 'hover:border-neon-pink/60 hover:bg-neon-pink/10', active: 'border-neon-pink/50 bg-gradient-to-r from-neon-pink/20 to-transparent', icon: 'text-neon-pink' },
  { hover: 'hover:border-neon-purple/60 hover:bg-neon-purple/10', active: 'border-neon-purple/50 bg-gradient-to-r from-neon-purple/20 to-transparent', icon: 'text-neon-purple' },
  { hover: 'hover:border-neon-cyan/60 hover:bg-neon-cyan/10', active: 'border-neon-cyan/50 bg-gradient-to-r from-neon-cyan/20 to-transparent', icon: 'text-neon-cyan' },
  { hover: 'hover:border-emerald-400/60 hover:bg-emerald-400/10', active: 'border-emerald-400/50 bg-gradient-to-r from-emerald-400/20 to-transparent', icon: 'text-emerald-400' },
  { hover: 'hover:border-amber-400/60 hover:bg-amber-400/10', active: 'border-amber-400/50 bg-gradient-to-r from-amber-400/20 to-transparent', icon: 'text-amber-400' },
];

const INVITE_GRADIENT = 'bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white';

/** Iconos del toggle de tema: los MISMOS SVGs que el Navbar (luna blanca, sol amarillo). */
const ThemeMoon = () => (
  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const ThemeSun = () => (
  <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1} aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12M19.78 4.22l-2.12 2.12" strokeLinecap="round" />
  </svg>
);

function GuildAvatar({ guild, size = 32 }: { guild: ShellGuild; size?: number }) {
  if (guild.icon) {
    return (
      <img
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full"
      />
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {guild.name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * Shell del dashboard de CiszuBot (rediseño 10 oct 2026):
 *  · Cuenta ARRIBA con avatar real de Discord y ambos nombres + popover de perfil.
 *  · Servidores como MOSAICO en popover (selección única; Global por defecto).
 *  · Banda superior con el servidor actual cuando se está dentro de uno.
 *  · ATAJOS con idioma (LanguagesModal compartido) y tema (misma lógica de
 *    preferencias), FAQ/ayuda/soporte e invitación con el degradado del header.
 *  · Gradientes hover/selección únicos por opción; sidebar más ancho y pegado
 *    a la izquierda; retraíble.
 */
export default function DashboardShell({ guilds, lang, inviteUrl, me, footer, children }: Props) {
  const t = L[lang];
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const activeId = pathname.split('/')[2] || null;
  const activeGuild = activeId ? guilds.find((g) => g.id === activeId) ?? null : null;
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [serversOpen, setServersOpen] = useState(false);
  const [serverQuery, setServerQuery] = useState('');
  const [serverFilter, setServerFilter] = useState<'all' | 'invited' | 'unknown'>('all');
  const [serverSort, setServerSort] = useState<'asc' | 'desc'>('asc');
  const [accountOpen, setAccountOpen] = useState(false);
  const [warnId, setWarnId] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [langCode, setLangCode] = useState('es-latam');
  const [langOpen, setLangOpen] = useState(false);
  const serversRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem('dash-sidebar-collapsed') === '1');
      setDark(document.documentElement.classList.contains('dark'));
      const m = document.cookie.match(/(?:^|;\s*)ciszubot_lang=([^;]+)/);
      if (m) setLangCode(m[1]);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (serversRef.current && !serversRef.current.contains(target)) setServersOpen(false);
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('dash-sidebar-collapsed', next ? '1' : '0');
      } catch {
        /* noop */
      }
      return next;
    });
  };

  /** Tema: misma lógica de preferencias que el panel local (persistencia + clase). */
  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.toggle('dark', next === 'dark');
    setDark(next === 'dark');
    try {
      updatePreferences({ theme: next });
    } catch {
      try {
        window.localStorage.setItem('ciszubot-theme', next);
      } catch {
        /* noop */
      }
    }
    toast(next === 'dark' ? t.dark : t.light, 'info');
  };

  /** Idioma: mismo LanguagesModal compartido y mismas reglas que preferencias. */
  const handleLangSelect = (code: string) => {
    if (!isLangAvailable(code)) {
      toast(LANG_BLOCKED_MESSAGE, 'error');
      return;
    }
    if (code !== langCode) {
      try {
        updatePreferences({ lang: code as Parameters<typeof updatePreferences>[0]['lang'] });
      } catch {
        /* noop */
      }
      document.cookie = `ciszubot_lang=${code}; path=/; max-age=31536000`;
      setLangCode(code);
      setLangOpen(false);
      window.location.reload();
    }
  };

  const selectServer = (id: string | null) => {
    const href = id ? `/dashboard/${id}` : '/dashboard';
    setServersOpen(false);
    setOpen(false);
    if (dashboardGuard.isDirty()) {
      dashboardGuard.requestNav(href);
      return;
    }
    router.push(href);
  };

  /** Intercepta la navegación del sidebar cuando hay cambios sin guardar. */
  const guardNav = (href: string) => (e: React.MouseEvent) => {
    if (dashboardGuard.isDirty()) {
      e.preventDefault();
      dashboardGuard.requestNav(href);
    }
  };

  const itemBase = 'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition';
  const itemIdle = 'border-transparent text-white/70 hover:text-white';
  const sectionTitle = 'flex items-center gap-1.5 px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40';

  const initials = (me?.displayName ?? me?.username ?? 'C').charAt(0).toUpperCase();

  const visibleGuilds = guilds
    .filter((g) => {
      const q = serverQuery.trim().toLowerCase();
      const matchQ = !q || g.name.toLowerCase().includes(q) || g.id.includes(q);
      const matchF =
        serverFilter === 'all' ? true : serverFilter === 'invited' ? g.invited === true : g.invited == null;
      return matchQ && matchF;
    })
    .sort((a, b) => (serverSort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

  const nav = (
    <nav
      className="max-h-[calc(100vh-6rem)] w-full max-w-xs overflow-y-auto rounded-2xl border border-white/10 bg-black/50 p-3 backdrop-blur-xl lg:max-h-none lg:max-w-none lg:overflow-visible"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ─── CUENTA (arriba del todo) ─── */}
      <div className="relative" ref={accountRef}>
        <button
          type="button"
          onClick={() => setAccountOpen((v) => !v)}
          aria-expanded={accountOpen}
          className={`${itemBase} ${accountOpen ? ACCENTS[0].active : itemIdle} ${ACCENTS[0].hover} gap-3`}
        >
          {me?.avatarUrl ? (
            <img src={me.avatarUrl} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full border border-white/15" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-sm font-black text-white">
              {initials}
            </span>
          )}
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-bold text-white">{me?.displayName ?? me?.username ?? t.account}</span>
            <span className="block truncate font-mono text-[10px] normal-case text-white/45">
              {me?.username ? `@${me.username}` : t.accountHint}
            </span>
          </span>
          <Icon name="arrow-right" size={13} className={`shrink-0 text-white/40 transition-transform ${accountOpen ? 'rotate-90' : ''}`} />
        </button>
        {accountOpen && (
          <div className="cz-pop absolute left-0 right-0 top-full z-50 mt-2 space-y-1 rounded-2xl border border-white/15 bg-[#0a0a14]/98 p-2 shadow-2xl backdrop-blur-xl">
            <Link
              href="/settings"
              onClick={() => setAccountOpen(false)}
              className={`${itemBase} ${itemIdle} ${ACCENTS[0].hover} text-xs`}
            >
              <Icon name="settings" size={14} className={ACCENTS[0].icon} />
              {t.settings}
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setAccountOpen(false)}
              className={`${itemBase} ${itemIdle} ${ACCENTS[2].hover} text-xs`}
            >
              <Icon name="server" size={14} className={ACCENTS[2].icon} />
              {t.profile}
            </Link>
            <a
              href="/api/auth/logout"
              className={`${itemBase} ${itemIdle} ${ACCENTS[1].hover} text-xs`}
            >
              <Icon name="logout" size={14} className={ACCENTS[1].icon} />
              {t.signOut}
            </a>
          </div>
        )}
      </div>

      {/* ─── PANEL ─── */}
      <p className={sectionTitle}><Icon name="settings" size={11} /> {t.panel}</p>
      <Link
        href="/dashboard"
        className={`${itemBase} ${!activeId ? ACCENTS[1].active : itemIdle} ${ACCENTS[1].hover}`}
        onClick={(e) => {
          setOpen(false);
          guardNav('/dashboard')(e);
        }}
      >
        <Icon name="chart-bar" size={16} className={!activeId ? ACCENTS[1].icon : ''} />
        {t.overview}
      </Link>
      <Link
        href="/dashboard/bot"
        className={`${itemBase} ${pathname === '/dashboard/bot' ? ACCENTS[5].active : itemIdle} ${ACCENTS[5].hover}`}
        onClick={(e) => {
          setOpen(false);
          guardNav('/dashboard/bot')(e);
        }}
      >
        <Icon name="settings" size={16} className={pathname === '/dashboard/bot' ? ACCENTS[5].icon : ''} />
        {t.botPrefs}
      </Link>

      {/* ─── SERVIDORES (mosaico en popover, selección única) ─── */}
      <p className={sectionTitle}><Icon name="server" size={11} /> {t.servers}</p>
      <div className="relative" ref={serversRef}>
        <button
          type="button"
          onClick={() => setServersOpen((v) => !v)}
          aria-expanded={serversOpen}
          className={`${itemBase} ${serversOpen || activeGuild ? ACCENTS[3].active : itemIdle} ${ACCENTS[3].hover} gap-3 ${serversOpen ? 'ring-1 ring-neon-cyan/40' : ''}`}
        >
          {activeGuild ? (
            <GuildAvatar guild={activeGuild} size={26} />
          ) : (
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <Icon name="globe" size={13} className={ACCENTS[3].icon} />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-left text-sm">
            {activeGuild ? activeGuild.name : t.global}
          </span>
          <Icon name="arrow-right" size={13} className={`shrink-0 text-white/40 transition-transform ${serversOpen ? 'rotate-90' : ''}`} />
        </button>
        {serversOpen && (
          <div className="cz-pop absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-white/15 bg-[#0a0a14]/98 p-3 shadow-2xl backdrop-blur-xl">
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.25em] text-white/40">{t.select}</p>
            {guilds.length === 0 ? (
              <p className="text-xs leading-relaxed text-white/50">{t.noServers}</p>
            ) : (
              <>
              <label className="mb-2 flex items-center gap-2 rounded-lg border border-white/15 bg-black/40 px-3 py-2">
                <Icon name="search" size={12} className="shrink-0 text-white/35" />
                <input
                  value={serverQuery}
                  onChange={(e) => setServerQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                />
              </label>
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {(['all', 'invited', 'unknown'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setServerFilter(f)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition ${
                      serverFilter === f
                        ? 'border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan'
                        : 'border-white/15 text-white/50 hover:text-white'
                    }`}
                  >
                    <Icon name={f === 'all' ? 'menu' : f === 'invited' ? 'check' : 'triangle-exclamation'} size={9} />
                    {f === 'all' ? t.filterAll : f === 'invited' ? t.filterInvited : t.filterUnverified}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setServerSort(serverSort === 'asc' ? 'desc' : 'asc')}
                  className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/50 transition hover:text-white"
                >
                  <Icon name="refresh" size={9} />
                  {serverSort === 'asc' ? t.sortAsc : t.sortDesc}
                </button>
              </div>
              {visibleGuilds.length === 0 ? (
                <p className="text-xs text-white/50">{t.noResults}</p>
              ) : (
              <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1">
                {/* Global */}
                <button
                  type="button"
                  onClick={() => selectServer(null)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${
                    !activeId ? ACCENTS[3].active : `border-white/10 ${ACCENTS[3].hover}`
                  }`}
                  title={t.global}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5">
                    <Icon name="globe" size={16} className={ACCENTS[3].icon} />
                  </span>
                  <span className="w-full truncate text-center text-[9px] font-bold text-white/75">{t.overview}</span>
                </button>
                {visibleGuilds.map((g, index) => {
                  const invited = g.invited !== false;
                  const unknown = g.invited == null;
                  const active = activeId === g.id;
                  return (
                    <div
                      key={g.id}
                      className="animate-fade-in-down relative"
                      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (invited) selectServer(g.id);
                          else setWarnId(warnId === g.id ? null : g.id);
                        }}
                        title={g.name}
                        className={`flex w-full flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${
                          active
                            ? ACCENTS[4].active
                            : invited
                              ? `border-white/10 ${ACCENTS[4].hover}`
                              : 'border-white/5 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <GuildAvatar guild={g} size={40} />
                        <span className="w-full truncate text-center text-[9px] font-bold text-white/75">{g.name}</span>
                        {!invited && (
                          <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-amber-400">
                            {t.notInvited}
                          </span>
                        )}
                        {unknown && (
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest text-white/50">
                            {t.verify}
                          </span>
                        )}
                      </button>
                      {!invited && (
                        <div className="mt-1 grid min-w-0 grid-cols-1 gap-1">
                          <InviteLink
                            href={`${inviteUrl}${inviteUrl.includes('?') ? '&' : '?'}guild_id=${g.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex w-full items-center justify-center gap-1 truncate rounded-lg px-1.5 py-1 text-[8px] font-black uppercase tracking-widest transition hover:scale-[1.03] active:scale-95 ${INVITE_GRADIENT}`}
                          >
                            <Icon name="discord" size={10} className="[&>g]:fill-current" />
                            {t.inviteBtn}
                          </InviteLink>
                          <button
                            type="button"
                            onClick={() => setWarnId(warnId === g.id ? null : g.id)}
                            className="w-full truncate rounded-lg border border-white/15 px-1.5 py-1 text-[8px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-pink/60 hover:text-white"
                          >
                            {t.configure}
                          </button>
                        </div>
                      )}
                      {warnId === g.id && !invited && (
                        <p className="mt-1 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-[9px] font-bold leading-snug text-amber-400">
                          {t.notInvitedMsg}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
              </>
            )}
            <InviteLink
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className={`mt-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition hover:scale-[1.02] active:scale-95 ${INVITE_GRADIENT}`}
            >
              <Icon name="discord" size={13} className="[&>g]:fill-current" />
              {t.invite}
            </InviteLink>
          </div>
        )}
      </div>

      {/* ─── ATAJOS ─── */}
      <p className={sectionTitle}><Icon name="bolt" size={11} /> {t.shortcuts}</p>
      <div className="space-y-1">
        <Link
          href="/faq"
          className={`${itemBase} ${itemIdle} ${ACCENTS[0].hover}`}
          onClick={(e) => {
            setOpen(false);
            guardNav('/faq')(e);
          }}
        >
          <Icon name="help" size={15} className={ACCENTS[0].icon} />
          {t.faq}
        </Link>
        <Link
          href="/help"
          className={`${itemBase} ${itemIdle} ${ACCENTS[2].hover}`}
          onClick={(e) => {
            setOpen(false);
            guardNav('/help')(e);
          }}
        >
          <Icon name="life-ring" size={15} className={ACCENTS[2].icon} />
          {t.help}
        </Link>
        <Link
          href="/support"
          className={`${itemBase} ${itemIdle} ${ACCENTS[4].hover}`}
          onClick={(e) => {
            setOpen(false);
            guardNav('/support')(e);
          }}
        >
          <Icon name="support" size={15} className={ACCENTS[4].icon} />
          {t.support}
        </Link>
        <Link
          href="/changelog"
          className={`${itemBase} ${itemIdle} ${ACCENTS[3].hover}`}
          onClick={(e) => {
            setOpen(false);
            guardNav('/changelog')(e);
          }}
        >
          <Icon name="history" size={15} className={ACCENTS[3].icon} />
          {t.changelog}
        </Link>
        <Link
          href="/stats"
          className={`${itemBase} ${itemIdle} ${ACCENTS[0].hover}`}
          onClick={(e) => {
            setOpen(false);
            guardNav('/stats')(e);
          }}
        >
          <Icon name="chart-bar" size={15} className={ACCENTS[0].icon} />
          {t.stats}
        </Link>
        <a
          href="https://ciszunetwork.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className={`${itemBase} ${itemIdle} ${ACCENTS[4].hover}`}
          onClick={(e) => {
            if (dashboardGuard.isDirty()) {
              e.preventDefault();
              dashboardGuard.requestNav('https://ciszunetwork.vercel.app');
            }
          }}
        >
          <Icon name="globe" size={15} className={ACCENTS[4].icon} />
          {t.news}
        </a>
        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className={`${itemBase} ${itemIdle} ${ACCENTS[3].hover}`}
        >
          <Icon name="globe" size={15} className={ACCENTS[3].icon} />
          {t.language}
          <span className="ml-auto inline-flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full [&>svg]:h-full [&>svg]:w-full">
              {LANGUAGE_OPTIONS.find((o) => o.code === langCode)?.flag ?? LANGUAGE_OPTIONS[0].flag}
            </span>
            <span className="font-mono text-[9px] uppercase text-white/40">{langCode.split('-')[0]}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className={`${itemBase} ${itemIdle} ${ACCENTS[5].hover}`}
        >
          <Icon name="palette" size={15} className={ACCENTS[5].icon} />
          {t.theme}
          <span className="ml-auto inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/40">
            <span className={ACCENTS[5].icon}>{dark ? <ThemeMoon /> : <ThemeSun />}</span>
            {dark ? t.dark : t.light}
          </span>
        </button>
      </div>

      <LanguagesModal
        open={langOpen}
        langs={LANGUAGE_OPTIONS}
        current={langCode}
        onSelect={handleLangSelect}
        onClose={() => setLangOpen(false)}
      />
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-[1500px] gap-4 px-2 pt-28 sm:px-3">
        {!collapsed && (
          <aside className="hidden w-[22rem] shrink-0 lg:block">
            <div className="sticky top-28">
              <div className="mb-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/35 transition hover:text-white"
                  title={t.collapse}
                >
                  <Icon name="arrow-right" size={12} className="rotate-180" />
                  {t.collapse}
                </button>
              </div>
              {nav}
            </div>
          </aside>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="cz-pop hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/60 transition hover:text-white lg:flex"
            title={t.expand}
          >
            <Icon name="menu" size={16} />
          </button>
        )}

        {open && (
          <div
            className="fixed inset-0 z-50 flex bg-black/70 p-4 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            {nav}
          </div>
        )}

        <main className="min-w-0 flex-1 pb-24">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 lg:hidden"
              aria-label={t.menu}
            >
              <Icon name="menu" size={16} />
              {t.menu}
            </button>
          </div>

          {/* Banda superior: hero del dashboard (servidor actual o global) */}
          {activeGuild ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent px-4 py-3">
              <GuildAvatar guild={activeGuild} size={34} />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">{t.configuringIn}</p>
                <p className="truncate font-header text-base font-black text-white">{activeGuild.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setServersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/60 transition hover:border-neon-blue/60 hover:text-white"
              >
                <Icon name="server" size={11} />
                {t.changeServer}
              </button>
              {activeGuild.invited === false && (
                <InviteLink
                  href={`${inviteUrl}${inviteUrl.includes('?') ? '&' : '?'}guild_id=${activeGuild.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition hover:scale-[1.03] active:scale-95 ${INVITE_GRADIENT}`}
                >
                  {t.inviteBtn}
                </InviteLink>
              )}
            </div>
          ) : (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent px-4 py-3">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/15 bg-white/5">
                <Icon name="chart-bar" size={16} className={ACCENTS[1].icon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">{t.panel}</p>
                <p className="truncate font-header text-base font-black text-white">
                  {pathname === '/dashboard/bot' ? t.botPrefs : t.overview}
                </p>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Fuera de la zona de configuración: secciones pre-QuickDocks + docks */}
      <footer className="mx-auto mt-12 w-full max-w-[1500px] px-2 sm:px-3">
        {footer}
      </footer>
      <QuickDocks />
    </div>
  );
}
