'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@ciszu/ui';
import { useClientI18n } from '@/hooks/useClientI18n';
import type { GuildSummary } from '@/lib/discordGuild';
import LocalDateTime from '@/components/shared/LocalDateTime';
import InviteLink from './InviteLink';

export interface GridGuild {
  id: string;
  name: string;
  icon: string | null;
  invited: boolean | null;
}

const INVITE_GRADIENT = 'bg-gradient-to-r from-neon-blue via-[#6600ff] to-neon-pink text-white';

/**
 * Zona de servidores del resumen global (rediseño 10 oct 2026): tarjetas
 * grandes con quick actions (Configurar / Invitar / aviso de no invitado),
 * animación de entrada escalonada, fondo por servidor (hue estable del id) y
 * el mismo comportamiento que el mosaico del sidebar.
 */
export default function ServersGrid({
  guilds,
  inviteUrl,
  details,
}: {
  guilds: GridGuild[];
  inviteUrl: string;
  details?: Record<string, GuildSummary | null>;
}) {
  const { dict } = useClientI18n();
  const t = dict.dashboardPage;
  const [warnId, setWarnId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'invited' | 'unknown'>('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');

  const visible = guilds
    .filter((g) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || g.name.toLowerCase().includes(q) || g.id.includes(q);
      const matchF = filter === 'all' ? true : filter === 'invited' ? g.invited === true : g.invited == null;
      return matchQ && matchF;
    })
    .sort((a, b) => (sort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchUi.placeholder}
          className="w-full max-w-xs rounded-xl border border-border bg-card px-3 py-2 text-xs text-ink outline-none placeholder:text-muted/60 focus:border-neon-blue/60"
        />
        {(['all', 'invited', 'unknown'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
              filter === f ? 'border-neon-blue/60 bg-neon-blue/10 text-neon-blue' : 'border-border text-muted hover:text-ink'
            }`}
          >
            {f === 'all' ? t.searchUi.all : f === 'invited' ? t.searchUi.invited : t.searchUi.unverified}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
          className="ml-auto rounded-full border border-border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted transition hover:text-ink"
        >
          {sort === 'asc' ? t.searchUi.asc : t.searchUi.desc}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card px-5 py-6 text-center text-sm text-muted">{t.searchUi.noResults}</p>
      ) : (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((guild, index) => {
        const invited = guild.invited !== false;
        const unknown = guild.invited == null;
        const hue = Number.isFinite(parseInt(guild.id.slice(-6), 10)) ? parseInt(guild.id.slice(-6), 10) % 360 : 210;

        let presenceChip: React.ReactNode;
        if (unknown) {
          presenceChip = (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              {t.botUnverified}
            </span>
          );
        } else if (invited) {
          presenceChip = (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {t.botActive}
            </span>
          );
        } else {
          presenceChip = (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {t.botMissing}
            </span>
          );
        }
        return (
          <div
            key={guild.id}
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            className={`animate-fade-in-down group relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
              invited
                ? 'border-border bg-card hover:border-neon-blue/60 hover:shadow-[0_18px_45px_-18px_rgba(0,212,255,0.45)]'
                : 'border-border bg-card opacity-75 hover:opacity-95'
            }`}
          >
            {/* Fondo propio por servidor */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(340px 160px at 10% -10%, hsla(${hue}, 90%, 60%, 0.16), transparent 65%)`,
              }}
            />
            <div className="relative flex items-center gap-3">
              {guild.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-2xl"
                />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple text-lg font-black text-white">
                  {guild.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-header text-base font-black text-ink">{guild.name}</p>
                {presenceChip}
              </div>
            </div>

            {(() => {
              const d = details?.[guild.id];
              if (!d) return null;
              return (
                <div className="relative mt-3 space-y-1 text-[10px] text-muted">
                  {d.description && <p className="line-clamp-2">{d.description}</p>}
                  <p className="font-mono text-[9px] text-muted/70">ID: {guild.id}</p>
                  <p className="flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>
                      {dict.guildPage.membersLabel}: {d.memberCount ?? '—'}
                    </span>
                    <span className="text-emerald-400">
                      {d.presenceCount ?? '—'} {t.presenceOnline}
                    </span>
                    <span className="text-red-400">
                      {d.memberCount != null && d.presenceCount != null ? d.memberCount - d.presenceCount : '—'}{' '}
                      {t.presenceOffline}
                    </span>
                  </p>
                  <p className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {d.createdAt && (
                      <span>
                        {t.createdLabel}: <LocalDateTime value={d.createdAt} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                      </span>
                    )}
                    {d.premiumTier != null && d.premiumTier > 0 && (
                      <span>
                        {t.boostLabel}: {d.premiumTier}
                      </span>
                    )}
                  </p>
                </div>
              );
            })()}

            <div className="relative mt-4 flex flex-wrap gap-2">
              {invited ? (
                <>
                  <Link
                    href={`/dashboard/${guild.id}#config`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neon-blue/50 bg-neon-blue/10 px-4 py-2.5 text-xs font-bold text-neon-blue transition hover:scale-[1.03] hover:bg-neon-blue/20 active:scale-95"
                  >
                    <Icon name="settings" size={14} />
                    {t.configureShort}
                  </Link>
                  <Link
                    href={`/dashboard/${guild.id}#summary`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted transition hover:border-neon-purple/60 hover:text-ink"
                  >
                    <Icon name="chart-bar" size={14} />
                    {t.summaryShort}
                  </Link>
                </>
              ) : (
                <>
                  <InviteLink
                    href={`${inviteUrl}${inviteUrl.includes('?') ? '&' : '?'}guild_id=${guild.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition hover:scale-[1.03] active:scale-95 ${INVITE_GRADIENT}`}
                  >
                    <Icon name="discord" size={14} className="[&>g]:fill-current" />
                    {t.inviteShort}
                  </InviteLink>
                  <button
                    type="button"
                    onClick={() => setWarnId(warnId === guild.id ? null : guild.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-muted transition hover:border-neon-pink/60 hover:text-ink"
                  >
                    {t.configureShort}
                  </button>
                </>
              )}
            </div>
            {!invited && warnId === guild.id && (
              <p className="relative mt-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[11px] font-bold leading-snug text-amber-400">
                {t.notInvitedMsgShort}
              </p>
            )}
          </div>
        );
      })}
    </div>
      )}
    </>
  );
}
