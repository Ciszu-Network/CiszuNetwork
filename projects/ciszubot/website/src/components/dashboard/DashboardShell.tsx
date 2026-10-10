'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon, LANGUAGE_OPTIONS } from '@ciszu/ui';

export interface ShellGuild {
  id: string;
  name: string;
  icon: string | null;
  invited?: boolean;
}

interface Props {
  guilds: ShellGuild[];
  lang: 'es' | 'en';
  inviteUrl: string;
  children: React.ReactNode;
}

const L: Record<'es' | 'en', Record<string, string>> = {
  es: {
    overview: 'Resumen',
    servers: 'Servidores',
    select: 'Selecciona un servidor',
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
    helpSection: 'Ayuda',
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
  },
  en: {
    overview: 'Overview',
    servers: 'Servers',
    select: 'Select a server',
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
    helpSection: 'Help',
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
  },
};

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
 * Shell del dashboard de CiszuBot: sidebar por categorías (Panel, Servidores,
 * Cuenta, Ayuda) con lista de servidores donde el usuario es admin, acciones de
 * invitar/configurar por servidor (los no invitados salen atenuados y no se
 * pueden configurar), accesos directos de cuenta (perfil, idioma, tema) y
 * retracción del panel en escritorio. Responsive: en móvil se abre como panel.
 */
export default function DashboardShell({ guilds, lang, inviteUrl, children }: Props) {
  const t = L[lang];
  const pathname = usePathname() ?? '';
  const activeId = pathname.split('/')[2] || null;
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [warnId, setWarnId] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [langCode, setLangCode] = useState('es-latam');

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

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.toggle('dark', next === 'dark');
    setDark(next === 'dark');
    void (async () => {
      try {
        const mod = (await import('@/lib/preferences')) as unknown as {
          savePreferences?: (patch: Record<string, unknown>) => void;
        };
        mod.savePreferences?.({ theme: next });
      } catch {
        try {
          window.localStorage.setItem('ciszubot-theme', next);
        } catch {
          /* noop */
        }
      }
    })();
  };

  const changeLang = (code: string) => {
    document.cookie = `ciszubot_lang=${code}; path=/; max-age=31536000`;
    setLangCode(code);
    window.location.reload();
  };

  const itemBase =
    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition border';
  const itemIdle = 'border-transparent text-white/70 hover:bg-white/5 hover:text-white';
  const itemActive = 'border-white/15 bg-white/10 text-white';
  const sectionTitle = 'px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40';

  const nav = (
    <nav
      className="h-full w-full max-w-xs overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl lg:max-w-none"
      onClick={(e) => e.stopPropagation()}
    >
      <p className={sectionTitle}>{t.panel}</p>
      <Link
        href="/dashboard"
        className={`${itemBase} ${!activeId ? itemActive : itemIdle}`}
        onClick={() => setOpen(false)}
      >
        <Icon name="chart-bar" size={16} className={!activeId ? 'text-neon-blue' : ''} />
        {t.overview}
      </Link>

      <p className={sectionTitle}>{t.servers}</p>
      {guilds.length === 0 ? (
        <p className="px-3 py-2 text-xs leading-relaxed text-white/50">{t.noServers}</p>
      ) : (
        <ul className="space-y-1">
          {guilds.map((g) => {
            const active = activeId === g.id;
            const invited = g.invited !== false;
            return (
              <li key={g.id}>
                {invited ? (
                  <Link
                    href={`/dashboard/${g.id}`}
                    className={`${itemBase} ${active ? itemActive : itemIdle}`}
                    onClick={() => setOpen(false)}
                    title={g.name}
                  >
                    <GuildAvatar guild={g} size={26} />
                    <span className="truncate">{g.name}</span>
                  </Link>
                ) : (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2 opacity-60 transition hover:opacity-90">
                    <div className="flex items-center gap-2.5 px-1 py-1" title={t.notInvitedMsg}>
                      <GuildAvatar guild={g} size={26} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white/70">{g.name}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/90">
                          {t.notInvited}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 flex gap-1.5">
                      <a
                        href={`${inviteUrl}${inviteUrl.includes('?') ? '&' : '?'}guild_id=${g.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#5865F2]/40 bg-[#5865F2]/15 px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#8ea1ff] transition hover:bg-[#5865F2]/25"
                      >
                        <Icon name="discord" size={12} />
                        {t.inviteBtn}
                      </a>
                      <button
                        type="button"
                        onClick={() => setWarnId(warnId === g.id ? null : g.id)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-amber-400/40 hover:text-amber-400"
                        title={t.notInvitedMsg}
                      >
                        <Icon name="settings" size={12} />
                        {t.configure}
                      </button>
                    </div>
                    {warnId === g.id && (
                      <p className="mt-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-1.5 text-[10px] font-bold text-amber-300">
                        {t.notInvitedMsg}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <a
        href={`${inviteUrl}${inviteUrl.includes('?') ? '&' : '?'}scope=bot%20applications.commands`}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center gap-2.5 rounded-xl border border-neon-blue/30 bg-neon-blue/10 px-3 py-2 text-sm font-semibold text-neon-blue transition hover:bg-neon-blue/20"
      >
        <Icon name="discord" size={16} />
        {t.invite}
      </a>

      <p className={sectionTitle}>{t.account}</p>
      <Link href="/settings" className={`${itemBase} ${itemIdle}`} onClick={() => setOpen(false)}>
        <Icon name="user" size={16} />
        {t.profile}
      </Link>
      <Link href="/settings" className={`${itemBase} ${itemIdle}`} onClick={() => setOpen(false)}>
        <Icon name="settings" size={16} />
        {t.settings}
      </Link>
      <div className={`${itemBase} ${itemIdle} cursor-default`}>
        <Icon name="globe" size={16} />
        <span className="flex-1">{t.language}</span>
        <span className="flex gap-1">
          {LANGUAGE_OPTIONS.slice(0, 4).map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLang(l.code)}
              className={`rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition ${
                langCode === l.code
                  ? 'border-neon-blue/50 bg-neon-blue/15 text-neon-blue'
                  : 'border-white/10 text-white/45 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </span>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className={`${itemBase} ${itemIdle} w-full text-left`}
      >
        <Icon name={dark ? 'moon' : 'sun'} size={16} />
        {t.theme}: <span className="text-white/45">{dark ? t.dark : t.light}</span>
      </button>

      <p className={sectionTitle}>{t.helpSection}</p>
      <Link href="/faq" className={`${itemBase} ${itemIdle}`} onClick={() => setOpen(false)}>
        <Icon name="help" size={16} />
        {t.faq}
      </Link>
      <Link href="/help" className={`${itemBase} ${itemIdle}`} onClick={() => setOpen(false)}>
        <Icon name="life-ring" size={16} />
        {t.help}
      </Link>
      <Link href="/support" className={`${itemBase} ${itemIdle}`} onClick={() => setOpen(false)}>
        <Icon name="support" size={16} />
        {t.support}
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 pt-6">
        {!collapsed && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="mb-2 flex w-full items-center justify-end gap-1 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/35 transition hover:text-white"
                title={t.collapse}
              >
                <Icon name="arrow-right" size={12} className="rotate-180" />
                {t.collapse}
              </button>
              {nav}
            </div>
          </aside>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/60 transition hover:text-white lg:flex"
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
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mb-4 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 lg:hidden"
            aria-label={t.select}
          >
            <Icon name="menu" size={16} />
            {t.menu}
          </button>
          {children}
        </main>
      </div>
    </div>
  );
}
