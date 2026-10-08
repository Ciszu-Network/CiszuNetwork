'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@ciszu/ui';

export interface ShellGuild {
  id: string;
  name: string;
  icon: string | null;
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
  },
  en: {
    overview: 'Overview',
    servers: 'Servers',
    select: 'Select a server',
    noServers: 'You do not manage any server with CiszuBot yet.',
    invite: 'Invite to my server',
    menu: 'Servers',
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
 * Shell del dashboard de CiszuBot: sidebar con la lista de servidores donde el
 * usuario es admin (selección de servidor) + contenido. Responsive: en móvil la
 * lista se abre como panel superpuesto.
 */
export default function DashboardShell({ guilds, lang, inviteUrl, children }: Props) {
  const t = L[lang];
  const pathname = usePathname() ?? '';
  const activeId = pathname.split('/')[2] || null;
  const [open, setOpen] = useState(false);

  const itemBase =
    'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition border';
  const itemIdle = 'border-transparent text-white/70 hover:bg-white/5 hover:text-white';
  const itemActive = 'border-white/15 bg-white/10 text-white';

  const nav = (
    <nav
      className="h-full w-full max-w-xs overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl lg:max-w-none"
      onClick={(e) => e.stopPropagation()}
    >
      <Link
        href="/dashboard"
        className={`${itemBase} ${!activeId ? itemActive : itemIdle}`}
        onClick={() => setOpen(false)}
      >
        <Icon name="chart-bar" size={16} className={!activeId ? 'text-neon-blue' : ''} />
        {t.overview}
      </Link>

      <p className="px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
        {t.servers}
      </p>
      {guilds.length === 0 ? (
        <p className="px-3 py-2 text-xs leading-relaxed text-white/50">{t.noServers}</p>
      ) : (
        <ul className="space-y-1">
          {guilds.map((g) => {
            const active = activeId === g.id;
            return (
              <li key={g.id}>
                <Link
                  href={`/dashboard/${g.id}`}
                  className={`${itemBase} ${active ? itemActive : itemIdle}`}
                  onClick={() => setOpen(false)}
                  title={g.name}
                >
                  <GuildAvatar guild={g} size={26} />
                  <span className="truncate">{g.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <a
        href={inviteUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center gap-2.5 rounded-xl border border-neon-blue/30 bg-neon-blue/10 px-3 py-2 text-sm font-semibold text-neon-blue transition hover:bg-neon-blue/20"
      >
        <Icon name="discord" size={16} />
        {t.invite}
      </a>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 pt-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6">{nav}</div>
        </aside>

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
